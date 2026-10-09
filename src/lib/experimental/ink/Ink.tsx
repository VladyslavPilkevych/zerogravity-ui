"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    fitCanvas,
    noiseTile,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    usePrefersReducedMotion,
    wakeLoop,
} from "../../internal"
import {
    createPaper,
    dab,
    dryOut,
    paint,
    soak,
    step,
    stepsFor,
    wipe,
    type Charge,
    type InkFlow,
    type Paper,
} from "./paper"
import "./Ink.css"

export interface InkProps {
    text: string
    /** the ink */
    color?: string
    /** the sheet under it */
    paper?: string
    /** how much water the stroke carries, so how far it runs, 0 to 1 */
    bleed?: number
    /** how readily the fibres wick it out ahead of the edge, 0 to 1 */
    feather?: number
    /** how dark the ink is, 0 to 1 */
    pigment?: number
    /** how much the drying edge darkens into a tide line, 0 to 1 */
    rim?: number
    /** how long the stroke keeps soaking out, in seconds */
    duration?: number
    /** soak again this many seconds after it has dried; 0 soaks once */
    repeat?: number
    /** drawing on the paper with the pointer */
    interactive?: boolean
    /** nib radius in px */
    nib?: number
    /** hold the soak at this many seconds in, for stills and snapshots */
    time?: number
    fontFamily?: string
    fontWeight?: number
    seed?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** The paper never has more cells than this, whatever the element's size. */
export const INK_MAX_CELLS = 90_000
/** The finest cell, in CSS px; small elements stop here rather than over-resolve. */
export const INK_MIN_CELL = 1.6

/** the cell size, in CSS px, the paper's constants were tuned at */
const REFERENCE_CELL = 2.2
/** steps per second of soak at the reference cell */
const REFERENCE_RATE = 180
const MAX_STEPS_PER_FRAME = 10
const STILL_STEPS_PER_FRAME = 40
/** past this, whatever is still wet simply dries where it is */
const DRYING_LIMIT = 9

export function Ink({
    text,
    color = "#1b2a4a",
    paper = "#f4eee0",
    bleed = 0.5,
    feather = 0.6,
    pigment = 0.7,
    rim = 0.6,
    duration = 2.6,
    repeat = 0,
    interactive = true,
    nib = 6,
    time,
    fontFamily = "Georgia, 'Times New Roman', serif",
    fontWeight = 700,
    seed = 12,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: InkProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const frozen = typeof time === "number" && Number.isFinite(time)
    const still = disabled || (respectReducedMotion && reduced)
    const drawing = interactive && !disabled && !frozen

    const wetness = clamp(finite(bleed, 0.5), 0, 1)
    const fibres = clamp(finite(feather, 0.6), 0, 1)
    const depth = clamp(finite(pigment, 0.7), 0, 1)
    const edge = clamp(finite(rim, 0.6), 0, 1)
    const soakFor = clamp(finite(duration, 2.6), 0.3, 20)
    const hold = frozen ? clamp(time, 0, 60) : -1
    const live = useLatestRef({
        repeat: clamp(finite(repeat, 0), 0, 600),
        nib: clamp(finite(nib, 6), 1, 40),
        drawing,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const surface = document.createElement("canvas")
        const surfaceContext = context2d(surface, { willReadFrequently: true })
        // one bilinear pass from a coarse grid shows its cells; two passes,
        // through a sheet at twice the grid, round them off
        const smooth = document.createElement("canvas")
        const smoothContext = context2d(smooth)
        if (!surfaceContext || !smoothContext) return

        const tile = noiseTile(document.createElement("canvas"), { size: 128, seed })
        if (tile) host.style.setProperty("--xp-ink-grain", `url(${tile})`)

        const rgb = parseColor(surfaceContext, color)
        const charge: Charge = {
            water: 1.2 + wetness * 1.6,
            held: 1 + wetness * 4,
            core: 0.5 + depth * 1.1,
            tint: 0.07 + depth * 0.1,
        }
        const flow: InkFlow = {
            mobility: 1,
            rim: edge * 28,
            release: 0,
            sink: 0,
            tint: charge.tint,
        }
        const nibCharge: Charge = {
            water: 1 + wetness * 0.8,
            held: 0.3 + wetness * 0.8,
            core: 0.35 + depth * 0.5,
            tint: charge.tint * 1.3,
        }
        // reused for every dab of a stroke, and for a nib held still, which
        // keeps feeding the same spot, slowly
        const strokeCharge: Charge = { ...nibCharge }
        const holdCharge: Charge = { water: 0.3, held: 0.12, core: 0.04, tint: nibCharge.tint }
        const density = 1.3 + depth * 0.8

        let size = fitCanvas(canvas, host)
        let sheet: Paper | null = null
        let image: ImageData | null = null
        let cell = INK_MIN_CELL
        let rate = REFERENCE_RATE
        let visible = true
        let budget = 0
        let steps = 0
        let resting = 0
        let settled = false
        let pen = false
        let rush = false
        let lastX = 0
        let lastY = 0

        const lay = () => {
            const box = host.getBoundingClientRect()
            const cssWidth = Math.max(1, box.width)
            const cssHeight = Math.max(1, box.height)
            cell = Math.max(INK_MIN_CELL, Math.sqrt((cssWidth * cssHeight) / INK_MAX_CELLS))
            const width = Math.max(8, Math.floor(cssWidth / cell))
            const height = Math.max(8, Math.floor(cssHeight / cell))
            const scale = cell / REFERENCE_CELL
            rate = stepsFor(scale, REFERENCE_RATE)
            flow.release = 1 - Math.exp(-4 / (soakFor * rate))
            flow.sink = 1 - Math.exp(-2.5 / (soakFor * rate))

            sheet = createPaper(width, height, { seed, feather: fibres, scale })
            surface.width = width
            surface.height = height
            smooth.width = width * 2
            smooth.height = height * 2
            image = surfaceContext.createImageData(width, height)
            stamp()
        }

        // the word, set at paper resolution and pressed in wet
        const stamp = () => {
            if (!sheet) return
            const { width, height } = sheet
            surfaceContext.setTransform(1, 0, 0, 1, 0, 0)
            surfaceContext.clearRect(0, 0, width, height)
            surfaceContext.textAlign = "center"
            surfaceContext.textBaseline = "middle"
            surfaceContext.fillStyle = "#000"

            let face = height * 0.56
            for (let attempt = 0; attempt < 24; attempt += 1) {
                surfaceContext.font = `${fontWeight} ${face}px ${fontFamily}`
                if (surfaceContext.measureText(text).width <= width * 0.78) break
                face *= 0.92
            }
            surfaceContext.fillText(text, width / 2, height / 2)

            let mask: Uint8ClampedArray | null = null
            try {
                mask = surfaceContext.getImageData(0, 0, width, height).data
            } catch {
                mask = null
            }
            wipe(sheet)
            image?.data.fill(0)
            if (mask && mask.length === width * height * 4) soak(sheet, mask, charge)
            steps = 0
            budget = 0
            resting = 0
            settled = false
        }

        const render = () => {
            if (!sheet || !image) return
            paint(sheet, image.data, rgb, density)
            surfaceContext.putImageData(image, 0, 0)
            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            context.imageSmoothingEnabled = true
            context.imageSmoothingQuality = "high"
            smoothContext.clearRect(0, 0, smooth.width, smooth.height)
            smoothContext.imageSmoothingEnabled = true
            smoothContext.imageSmoothingQuality = "high"
            smoothContext.drawImage(surface, 0, 0, smooth.width, smooth.height)
            context.drawImage(smooth, 0, 0, size.width, size.height)
        }

        const advance = (count: number) => {
            if (!sheet) return
            for (let k = 0; k < count; k += 1) {
                steps += 1
                if (step(sheet, flow) === 0) break
            }
            if (steps > (soakFor + DRYING_LIMIT) * rate && sheet.wet > 0) {
                dryOut(sheet)
            }
            settled = sheet.wet === 0
        }

        // a held moment of the soak, computed outright
        const settle = (limit: number) => {
            while (!settled && steps < limit) advance(Math.min(64, limit - steps))
            render()
            mark()
        }

        const mark = () => {
            if (settled) host.dataset.settled = "true"
            else delete host.dataset.settled
        }

        const loop = wakeLoop((dt) => {
            if (!visible || !sheet) return false
            // reduced motion: the soak runs out of sight, a slice per frame, and
            // only its dried result is ever drawn
            if (rush) {
                advance(STILL_STEPS_PER_FRAME)
                if (!settled) return true
                rush = false
                render()
                mark()
                return false
            }
            if (settled && !pen) {
                const wait = live.current.repeat
                if (wait <= 0) return false
                resting += dt
                if (resting < wait) return true
                stamp()
                mark()
            }
            budget += dt * rate
            const count = Math.min(MAX_STEPS_PER_FRAME, Math.floor(budget))
            budget -= count
            if (budget > 1) budget = 1
            if (count > 0) {
                advance(count)
                if (pen) dab(sheet, lastX, lastY, live.current.nib / cell, holdCharge)
                render()
                mark()
            }
            return !settled || pen || live.current.repeat > 0
        })

        const begin = () => {
            lay()
            rush = false
            mark()
            if (frozen) {
                settle(Math.round(hold * rate))
            } else if (live.current.still) {
                if (typeof requestAnimationFrame !== "function") {
                    settle(Number.POSITIVE_INFINITY)
                    return
                }
                rush = true
                context.clearRect(0, 0, size.width, size.height)
                loop.wake()
            } else {
                render()
                loop.wake()
            }
        }

        begin()

        const box = pointerBox(host)

        const press = (event: PointerEvent) => {
            const config = live.current
            if (!config.drawing || !sheet) return
            const point = box.px(event)
            if (!point) return
            pen = true
            lastX = point.x / cell
            lastY = point.y / cell
            dab(sheet, lastX, lastY, config.nib / cell, nibCharge)
            touched()
        }

        // without motion the ink is simply there, dried where the nib went
        const touched = () => {
            if (!sheet) return
            if (rush) return
            if (live.current.still) {
                dryOut(sheet)
                settled = true
                render()
                mark()
                return
            }
            settled = false
            loop.wake()
        }

        const move = (event: PointerEvent) => {
            if (!pen || !sheet) return
            const point = box.px(event)
            if (!point) return
            const x = point.x / cell
            const y = point.y / cell
            const radius = live.current.nib / cell
            // a continuous stroke: dabs every half radius between samples, so
            // a fast flick lays a thinner line and a slow drag pools
            const gap = Math.max(0.5, radius * 0.5)
            const span = Math.hypot(x - lastX, y - lastY)
            const count = Math.max(1, Math.min(64, Math.ceil(span / gap)))
            const load = 0.55 + 0.45 * Math.min(1, 1.5 / count)
            strokeCharge.water = nibCharge.water * load
            strokeCharge.held = nibCharge.held * load
            strokeCharge.core = nibCharge.core * load
            for (let k = 1; k <= count; k += 1) {
                const t = k / count
                dab(sheet, lastX + (x - lastX) * t, lastY + (y - lastY) * t, radius, strokeCharge)
            }
            lastX = x
            lastY = y
            touched()
        }

        const lift = () => {
            pen = false
        }

        if (drawing) {
            host.addEventListener("pointerdown", press)
            host.addEventListener("pointermove", move, { passive: true })
            host.addEventListener("pointerup", lift)
            host.addEventListener("pointercancel", lift)
            host.addEventListener("pointerleave", lift)
        }

        const stopResize = onResize(host, () => {
            const next = fitCanvas(canvas, host)
            if (next.width === size.width && next.height === size.height) return
            size = next
            box.invalidate()
            pen = false
            begin()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
            if (seen && (rush || (!settled && !frozen))) loop.wake()
        })

        return () => {
            loop.sleep()
            stopResize()
            stopVisible()
            box.dispose()
            host.removeEventListener("pointerdown", press)
            host.removeEventListener("pointermove", move)
            host.removeEventListener("pointerup", lift)
            host.removeEventListener("pointercancel", lift)
            host.removeEventListener("pointerleave", lift)
            surface.width = 0
            surface.height = 0
            smooth.width = 0
            smooth.height = 0
            sheet = null
            image = null
        }
    }, [
        live,
        text,
        color,
        wetness,
        fibres,
        depth,
        edge,
        soakFor,
        hold,
        frozen,
        still,
        drawing,
        fontFamily,
        fontWeight,
        seed,
    ])

    return (
        <div
            ref={hostRef}
            className={cx("xp-ink", className)}
            data-still={still || frozen ? "true" : undefined}
            data-drawing={drawing ? "true" : undefined}
            style={{ ...style, "--xp-ink-paper": paper } as CSSProperties}
        >
            {/* the word stays real text; the canvas is only how it is drawn */}
            <span className="xp-ink-word">{text}</span>
            <canvas ref={canvasRef} className="xp-ink-paper" aria-hidden="true" />
        </div>
    )
}

/** Any CSS colour as RGB, by letting a canvas normalise it. */
function parseColor(
    context: CanvasRenderingContext2D,
    value: string,
): readonly [number, number, number] {
    const fallback = [27, 42, 74] as const
    context.fillStyle = "#1b2a4a"
    context.fillStyle = value
    const parsed = String(context.fillStyle)
    const hex = /^#([\da-f]{6})$/i.exec(parsed)
    if (hex) {
        const n = parseInt(hex[1], 16)
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(parsed)
    return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : fallback
}
