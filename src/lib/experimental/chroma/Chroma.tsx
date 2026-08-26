"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    fitCanvas,
    onFrame,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
} from "../../internal"
import "./Chroma.css"

export interface ChromaProps {
    children?: ReactNode
    /** how far the channels separate at speed, in px */
    split?: number
    /** how wide the smear is, in px */
    width?: number
    /** how long a trail survives, in seconds */
    linger?: number
    /** the three channels, drawn additively */
    colors?: readonly [string, string, string]
    enableOnTouch?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** The trail is a ring buffer, so a pointer held down for an hour costs this. */
const SAMPLES = 90

export const CHROMA_COLORS: readonly [string, string, string] = ["#ff2f6d", "#41ff9e", "#3aa0ff"]

export function Chroma({
    children,
    split = 16,
    width = 26,
    linger = 0.7,
    colors = CHROMA_COLORS,
    enableOnTouch = true,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: ChromaProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)
    const live = !still && (fine || enableOnTouch)

    const settings = useLatestRef({
        split: clamp(finite(split, 16), 0, 80),
        width: clamp(finite(width, 26), 2, 160),
        linger: clamp(finite(linger, 0.7), 0.1, 6),
        colors,
        live,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const box = pointerBox(host)
        const px = new Float32Array(SAMPLES)
        const py = new Float32Array(SAMPLES)
        const born = new Float32Array(SAMPLES)
        const speed = new Float32Array(SAMPLES)
        let head = 0
        let filled = 0
        let clock = 0
        let last: { x: number; y: number } | null = null
        let size = fitCanvas(canvas, host)
        let visible = true

        const push = (x: number, y: number) => {
            const pace = last ? Math.hypot(x - last.x, y - last.y) : 0
            last = { x, y }

            px[head] = x
            py[head] = y
            born[head] = clock
            speed[head] = pace
            head = (head + 1) % SAMPLES
            filled = Math.min(filled + 1, SAMPLES)
        }

        const paint = () => {
            const config = settings.current

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            if (filled < 2) return

            context.globalCompositeOperation = "lighter"
            context.lineCap = "round"
            context.lineJoin = "round"

            // one continuous ribbon per channel, each pushed sideways off the
            // path and read a couple of samples behind the others, so the three
            // separate whichever way the pointer is travelling
            const jump = Math.min(size.width, size.height) * 0.5

            for (let channel = 0; channel < 3; channel += 1) {
                const side = channel - 1
                // every channel reads behind the head, never ahead of it, or
                // the slots it wants have not been written yet
                const lag = channel * 2

                context.beginPath()
                let started = false
                let headX = 0
                let headY = 0
                let tailX = 0
                let tailY = 0

                for (let step = 0; step < filled - 3; step += 1) {
                    const index = (head - 1 - step - lag + SAMPLES * 3) % SAMPLES
                    const life = (clock - born[index]) / config.linger
                    if (life >= 1 || life < 0) break

                    // the neighbour one step further back, never one step
                    // ahead: ahead of the head is the slot about to be reused
                    const older = (index - 1 + SAMPLES) % SAMPLES
                    const dx = px[index] - px[older]
                    const dy = py[index] - py[older]
                    const length = Math.hypot(dx, dy)
                    // a pointer that re-enters the box leaves one enormous gap;
                    // that is a jump, not a stroke
                    if (length > jump) break

                    const pace = Math.min(1, speed[index] / (26 * size.dpr))
                    const push = side * config.split * size.dpr * (0.3 + pace * 0.7)
                    const offX = length > 0.001 ? (-dy / length) * push : 0
                    const offY = length > 0.001 ? (dx / length) * push : 0
                    const x = px[index] + offX
                    const y = py[index] + offY

                    if (!started) {
                        context.moveTo(x, y)
                        headX = x
                        headY = y
                        started = true
                    } else {
                        context.lineTo(x, y)
                    }
                    tailX = x
                    tailY = y
                }

                if (!started) continue

                const smear = context.createLinearGradient(headX, headY, tailX, tailY)
                const tint = config.colors[channel] ?? CHROMA_COLORS[channel]
                smear.addColorStop(0, tint)
                smear.addColorStop(1, "rgba(0,0,0,0)")
                context.strokeStyle = smear
                context.globalAlpha = 0.9
                context.lineWidth = config.width * size.dpr
                context.stroke()
            }

            context.globalAlpha = 1
            context.globalCompositeOperation = "source-over"
        }

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            box.invalidate()
            filled = 0
            last = null
            paint()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = onFrame((dt) => {
            if (!visible) return
            clock += dt
            if (filled === 0) return
            paint()
            // once every sample has expired the canvas is already clear
            const oldest = (head - filled + SAMPLES) % SAMPLES
            if (clock - born[oldest] > settings.current.linger) filled = Math.max(0, filled - 1)
        })

        const onMove = (event: PointerEvent) => {
            if (!settings.current.live) return
            const point = box.px(event)
            if (!point) return
            push(point.x * size.dpr, point.y * size.dpr)
        }

        const onLeave = () => {
            last = null
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)

        return () => {
            stopFrame()
            stopResize()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            box.dispose()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-chroma", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            {children ? <div className="xp-chroma-content">{children}</div> : null}
            <canvas ref={canvasRef} className="xp-chroma-trail" aria-hidden="true" />
        </div>
    )
}
