"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    onFrame,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
} from "../../internal"
import {
    clearWater,
    createWater,
    paintSurface,
    pixels,
    parseRgb,
    shade,
    sizeWater,
    stamp,
    stampSegment,
    stepWater,
    type Palette,
    type Rgb,
    type WakeSurface,
} from "./waterField"
import "./Wake.css"

export type { WakeSurface } from "./waterField"

export interface WakeProps {
    children?: ReactNode
    /** the built-in floor the water refracts, used when there is no `src` or it fails */
    surface?: WakeSurface
    /** an image to lay under the water instead, cover-fitted */
    src?: string
    /** how hard the pointer pushes the water, 0 to 1 */
    strength?: number
    /** radius of the disturbance, in CSS pixels */
    radius?: number
    /** roughly how long a wave lives, in seconds */
    decay?: number
    /** how far a slope bends what is underneath */
    refraction?: number
    /** how much a slope facing the light brightens */
    light?: number
    /** hard pixel edges instead of a smooth upscale */
    pixelated?: boolean
    /** react to a finger as well as a pointer */
    enableOnTouch?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const CELL_MIN = 2.5
const CELL_CAP = 120_000
const WAVE_SPEED = 240
const STEP_CAP = 6
const SETTLE = 0.004
const SWIFT = 900
const BEND = 95
const GLINT = 5
const PITCH: Record<WakeSurface, number> = { tiles: 30, grid: 30, checker: 40 }

const FALLBACK: Palette = {
    deep: [10, 42, 66],
    shallow: [27, 122, 140],
    line: [168, 232, 240],
}

const STILL_DROPS: ReadonlyArray<readonly [number, number, number]> = [
    [0.3, 0.42, 1],
    [0.66, 0.58, 0.9],
    [0.5, 0.24, 0.6],
]

export function Wake({
    children,
    surface = "tiles",
    src,
    strength = 0.6,
    radius = 14,
    decay = 2.4,
    refraction = 1,
    light = 1,
    pixelated = false,
    enableOnTouch = true,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: WakeProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)
    const live = !still && (fine || enableOnTouch)

    const settings = useLatestRef({ strength, radius, decay, refraction, light, enableOnTouch })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context || typeof context.createImageData !== "function") return

        const water = createWater(3, 3)
        const box = pointerBox(host)
        let cell = CELL_MIN
        let rate = 60
        let image: ImageData | null = null
        let texture = pixels(new Uint8ClampedArray(0))
        let frame = texture
        let picture: HTMLImageElement | null = null
        let stopFrame: (() => void) | null = null
        let seen = true
        let carry = 0
        let last: { x: number; y: number; t: number; id: number } | null = null

        const readPalette = (): Palette => {
            const css = getComputedStyle(host)
            const read = (name: string, fallback: Rgb): Rgb => {
                const value = css.getPropertyValue(name).trim()
                if (!value) return fallback
                context.fillStyle = "#000000"
                context.fillStyle = value
                return parseRgb(String(context.fillStyle)) ?? parseRgb(value) ?? fallback
            }
            return {
                deep: read("--wake-deep", FALLBACK.deep),
                shallow: read("--wake-shallow", FALLBACK.shallow),
                line: read("--wake-line", FALLBACK.line),
            }
        }

        const fitPicture = () => {
            if (!picture || !picture.naturalWidth) return false
            try {
                const scratch = document.createElement("canvas")
                scratch.width = water.cols
                scratch.height = water.rows
                const pen = context2d(scratch)
                if (!pen) return false
                const scale = Math.max(
                    water.cols / picture.naturalWidth,
                    water.rows / picture.naturalHeight,
                )
                const w = picture.naturalWidth * scale
                const h = picture.naturalHeight * scale
                pen.drawImage(picture, (water.cols - w) / 2, (water.rows - h) / 2, w, h)
                texture.bytes.set(pen.getImageData(0, 0, water.cols, water.rows).data)
                return true
            } catch {
                return false
            }
        }

        const paintTexture = () => {
            if (fitPicture()) return
            paintSurface(
                texture.bytes,
                water.cols,
                water.rows,
                surface,
                readPalette(),
                PITCH[surface] / cell,
            )
        }

        const render = (calm: boolean) => {
            if (!image) return
            if (calm) {
                image.data.set(texture.bytes)
            } else {
                const config = settings.current
                const bend = (clamp(config.refraction, 0, 4) * BEND) / (2 * cell * cell)
                const glint = (clamp(config.light, 0, 4) * GLINT) / (2 * cell)
                shade(water, texture, frame, bend, glint)
            }
            context.putImageData(image, 0, 0)
        }

        const measure = () => {
            box.invalidate()
            const { width, height } = box.size()
            const area = Math.max(1, width * height)
            cell = Math.max(CELL_MIN, Math.sqrt(area / CELL_CAP))
            const cols = Math.max(3, Math.round(width / cell))
            const rows = Math.max(3, Math.round(height / cell))
            rate = clamp(WAVE_SPEED / (cell * Math.SQRT1_2), 40, 200)

            if (sizeWater(water, cols, rows) || !image) {
                canvas.width = water.cols
                canvas.height = water.rows
                image = context.createImageData(water.cols, water.rows)
                frame = pixels(image.data)
                texture = pixels(new Uint8ClampedArray(water.cols * water.rows * 4))
                last = null
            }
            paintTexture()
        }

        const damping = () => Math.pow(SETTLE, 1 / (Math.max(0.3, settings.current.decay) * rate))

        const settleStill = () => {
            clearWater(water)
            const r = Math.max(2, (settings.current.radius * 1.4) / cell)
            for (const [fx, fy, power] of STILL_DROPS) {
                stamp(water, fx * water.cols, fy * water.rows, r, -power * 1.2)
            }
            const steps = Math.round(rate * 0.45)
            const d = damping()
            for (let index = 0; index < steps; index += 1) stepWater(water, d)
            render(false)
        }

        const halt = () => {
            stopFrame?.()
            stopFrame = null
        }

        const tick = (dt: number) => {
            carry += dt * rate
            const steps = Math.min(STEP_CAP, Math.floor(carry))
            carry = steps === STEP_CAP ? 0 : carry - steps
            const d = damping()
            for (let index = 0; index < steps; index += 1) stepWater(water, d)

            if (water.peak < SETTLE) {
                clearWater(water)
                render(true)
                halt()
                return
            }
            render(false)
        }

        const wake = () => {
            if (stopFrame || !seen) return
            carry = 0
            stopFrame = onFrame(tick)
        }

        const accepts = (event: PointerEvent) =>
            live && (event.pointerType !== "touch" || settings.current.enableOnTouch)

        const toCells = (event: PointerEvent) => {
            const at = box.px(event)
            return at ? { x: at.x / cell, y: at.y / cell } : null
        }

        const onMove = (event: PointerEvent) => {
            if (!accepts(event)) return
            const at = toCells(event)
            if (!at) return
            const now = event.timeStamp || performance.now()

            if (last && last.id === event.pointerId && now - last.t < 120) {
                const config = settings.current
                const span = Math.hypot(at.x - last.x, at.y - last.y) * cell
                const speed = span / Math.max(0.004, (now - last.t) / 1000)
                const push = clamp(config.strength, 0, 1) * Math.min(1, speed / SWIFT)
                if (push > 0.002) {
                    stampSegment(
                        water,
                        last.x,
                        last.y,
                        at.x,
                        at.y,
                        Math.max(1.5, config.radius / cell),
                        -push * 1.3,
                    )
                    wake()
                }
            }
            last = { x: at.x, y: at.y, t: now, id: event.pointerId }
        }

        const onDown = (event: PointerEvent) => {
            if (!accepts(event)) return
            const at = toCells(event)
            if (!at) return
            const config = settings.current
            stamp(
                water,
                at.x,
                at.y,
                Math.max(2, (config.radius * 1.3) / cell),
                -clamp(config.strength, 0, 1) * 2,
            )
            wake()
        }

        const onLeave = () => {
            last = null
        }

        measure()
        if (still) settleStill()
        else render(true)

        let loading: HTMLImageElement | null = null
        if (src) {
            const next = new Image()
            loading = next
            next.crossOrigin = "anonymous"
            next.decoding = "async"
            next.onload = () => {
                picture = next
                if (!fitPicture()) {
                    picture = null
                    return
                }
                if (still) settleStill()
                else if (!stopFrame) render(true)
            }
            next.onerror = () => {
                picture = null
            }
            next.src = src
        }

        const stopResize = onResize(host, () => {
            measure()
            if (still) settleStill()
            else if (!stopFrame) render(true)
        })

        const release = () => {
            stopResize()
            box.dispose()
            if (loading) {
                loading.onload = null
                loading.onerror = null
            }
        }

        if (!live) return release

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerdown", onDown, { passive: true })
        host.addEventListener("pointerleave", onLeave)
        host.addEventListener("pointercancel", onLeave)

        const stopVisible = onVisible(host, (visible) => {
            seen = visible
            if (!visible) halt()
            else if (water.peak >= SETTLE) wake()
        })

        return () => {
            halt()
            stopVisible()
            release()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerdown", onDown)
            host.removeEventListener("pointerleave", onLeave)
            host.removeEventListener("pointercancel", onLeave)
        }
    }, [settings, surface, src, still, live])

    return (
        <div
            ref={hostRef}
            className={cx("xp-wake", className)}
            data-still={still ? "true" : undefined}
            data-pixelated={pixelated ? "true" : undefined}
            style={style}
        >
            <canvas ref={canvasRef} className="xp-wake-water" aria-hidden="true" />
            <div className="xp-wake-content">{children}</div>
        </div>
    )
}
