"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    fitCanvas,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    usePrefersReducedMotion,
    wakeLoop,
} from "../internal"
import { toRgb, type Rgb } from "./tone"
import { createTrail, traceCapacity, traceTrail } from "./trail"
import "./Chroma.css"

export interface ChromaProps {
    children?: ReactNode
    /** how wide the trail is at the pointer, in px */
    width?: number
    /** how soft its edges are, in px */
    blur?: number
    /** how long a point of the trail takes to fade, in seconds */
    decay?: number
    /** the trail's colour when fresh, halfway and nearly gone */
    colors?: readonly [string, string, string]
    /** time advances one frame per pointer sample and never on its own */
    paused?: boolean
    /** let a finger draw the trail too; off by default, as a cursor effect */
    enableOnTouch?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** The history is a ring of this many samples, however long the pointer moves. */
export const CHROMA_SAMPLES = 64

export const CHROMA_COLORS: readonly [string, string, string] = ["#ff3d7f", "#8f5bff", "#22d3ff"]

const SHADES = 48
const MIN_SPACING = 4
const PAUSED_STEP = 1 / 60

export function Chroma({
    children,
    width = 24,
    blur = 12,
    decay = 0.6,
    colors = CHROMA_COLORS,
    paused = false,
    enableOnTouch = false,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: ChromaProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const prefersReduced = usePrefersReducedMotion()
    const reduced = respectReducedMotion && prefersReduced
    const [fresh, middle, faded] = colors
    const settings = useLatestRef({
        width: clamp(finite(width, 24), 2, 120),
        decay: clamp(finite(decay, 0.6), 0.08, 3),
        reduced,
        paused,
        disabled,
        enableOnTouch,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const box = pointerBox(host)
        const trail = createTrail(CHROMA_SAMPLES)
        const points = new Float32Array(traceCapacity(trail) * 3)
        const tones = [fresh, middle, faded].map((value, index) =>
            toRgb(value, TONE_FALLBACKS[index], host),
        ) as Tones
        const shades = shadeTable(tones, 0)
        const cores = shadeTable(tones, 0.55)
        let size = fitCanvas(canvas, host)
        let clock = 0
        let cut = true
        let visible = true

        const clear = () => {
            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
        }

        const paint = () => {
            clear()
            const count = traceTrail(trail, clock, settings.current.decay, points)
            if (count === 0) return
            const half = (settings.current.width * size.dpr) / 2
            paintRibbon(context, points, count, half, shades)
            context.globalCompositeOperation = "lighter"
            paintRibbon(context, points, count, half * 0.38, cores)
            context.globalCompositeOperation = "source-over"
        }

        const paintDot = (x: number, y: number) => {
            clear()
            const radius = settings.current.width * size.dpr
            const glow = context.createRadialGradient(x, y, 0, x, y, radius)
            glow.addColorStop(0, shades[SHADES - 1])
            glow.addColorStop(1, shades[0])
            context.fillStyle = glow
            context.beginPath()
            context.arc(x, y, radius, 0, Math.PI * 2)
            context.fill()
        }

        // runs only while some of the trail is still fading
        const loop = wakeLoop((dt) => {
            clock += dt
            const left = trail.prune(clock, settings.current.decay)
            if (left === 0 || !visible) {
                trail.clear()
                clear()
                return false
            }
            paint()
            return true
        })

        const onMove = (event: PointerEvent) => {
            const config = settings.current
            if (config.disabled) return
            if (event.pointerType === "touch" && !config.enableOnTouch) return
            const point = box.px(event)
            if (!point) return
            const x = point.x * size.dpr
            const y = point.y * size.dpr

            if (config.reduced) {
                paintDot(x, y)
                return
            }

            if (config.paused) clock += PAUSED_STEP

            const count = trail.size
            const previous = count > 1 ? trail.slot(count - 2) : -1
            const near =
                !cut &&
                previous !== -1 &&
                Math.hypot(x - trail.xs[previous], y - trail.ys[previous]) < MIN_SPACING * size.dpr
            if (near) trail.nudge(x, y, clock)
            else trail.push(x, y, clock, cut)
            cut = false

            if (config.paused) paint()
            else loop.wake()
        }

        const onLeave = () => {
            cut = true
            if (settings.current.reduced) clear()
        }

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            box.invalidate()
            trail.clear()
            cut = true
            clear()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)
        // the browser taking a finger over for scrolling ends the stroke too
        host.addEventListener("pointercancel", onLeave)

        return () => {
            loop.sleep()
            stopResize()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            host.removeEventListener("pointercancel", onLeave)
            box.dispose()
        }
    }, [settings, fresh, middle, faded])

    return (
        <div
            ref={hostRef}
            className={cx("xp-chroma", className)}
            data-still={disabled ? "true" : undefined}
            data-touch={enableOnTouch && !disabled ? "true" : undefined}
            style={
                {
                    ...style,
                    "--ch-blur": `${clamp(finite(blur, 12), 0, 60)}px`,
                } as CSSProperties
            }
        >
            {children ? <div className="xp-chroma-content">{children}</div> : null}
            <canvas ref={canvasRef} className="xp-chroma-trail" aria-hidden="true" />
        </div>
    )
}

/**
 * The ribbon is one quad per pair of neighbouring points, sharing edges so it
 * never breaks, tapering and fading with each point's age. Colour and alpha
 * come from a precomputed table, so a frame builds no strings.
 */
function paintRibbon(
    context: CanvasRenderingContext2D,
    points: Float32Array,
    count: number,
    half: number,
    shades: readonly string[],
): void {
    let lx = NaN
    let ly = NaN
    let rx = NaN
    let ry = NaN

    for (let i = 0; i < count; i += 1) {
        const x = points[i * 3]
        const y = points[i * 3 + 1]
        const life = points[i * 3 + 2]
        if (Number.isNaN(x)) {
            lx = NaN
            continue
        }

        const prev = i > 0 && !Number.isNaN(points[(i - 1) * 3]) ? i - 1 : i
        const next = i + 1 < count && !Number.isNaN(points[(i + 1) * 3]) ? i + 1 : i
        let nx = -(points[next * 3 + 1] - points[prev * 3 + 1])
        let ny = points[next * 3] - points[prev * 3]
        const length = Math.hypot(nx, ny)
        if (length < 1e-3) {
            nx = 0
            ny = 0
        } else {
            nx /= length
            ny /= length
        }

        const eased = life * life * (3 - 2 * life)
        const reach = half * (0.18 + 0.82 * eased)
        const ax = x + nx * reach
        const ay = y + ny * reach
        const bx = x - nx * reach
        const by = y - ny * reach

        if (!Number.isNaN(lx)) {
            context.fillStyle = shades[Math.min(SHADES - 1, Math.round(eased * (SHADES - 1)))]
            context.beginPath()
            context.moveTo(lx, ly)
            context.lineTo(ax, ay)
            context.lineTo(bx, by)
            context.lineTo(rx, ry)
            context.closePath()
            context.fill()
        }

        lx = ax
        ly = ay
        rx = bx
        ry = by

        const ends = next === i
        if (ends && life > 0.02) {
            context.fillStyle = shades[Math.min(SHADES - 1, Math.round(eased * (SHADES - 1)))]
            context.beginPath()
            context.arc(x, y, reach, 0, Math.PI * 2)
            context.fill()
        }
    }
}

type Tones = [Rgb, Rgb, Rgb]

const TONE_FALLBACKS: Tones = [
    [255, 61, 127],
    [143, 91, 255],
    [34, 211, 255],
]

/** fresh → middle → faded, with alpha falling to nothing as the point ages */
function shadeTable([a, b, c]: Tones, white: number): string[] {
    const table: string[] = []

    for (let i = 0; i < SHADES; i += 1) {
        const life = i / (SHADES - 1)
        const from = life > 0.5 ? b : c
        const to = life > 0.5 ? a : b
        const t = life > 0.5 ? (life - 0.5) * 2 : life * 2
        const tint = (k: number) => {
            const base = from[k] + (to[k] - from[k]) * t
            return Math.round(base + (255 - base) * white)
        }
        const alpha = ((white > 0 ? 0.55 : 0.95) * Math.pow(life, 0.7)).toFixed(3)
        table.push(`rgba(${tint(0)},${tint(1)},${tint(2)},${alpha})`)
    }

    return table
}
