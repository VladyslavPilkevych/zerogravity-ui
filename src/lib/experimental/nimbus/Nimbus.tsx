"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    onFrame,
    onResize,
    onVisible,
    rngFor,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Nimbus.css"

export interface NimbusProps {
    children?: ReactNode
    /** the clouds it is built from */
    colors?: readonly string[]
    /** how many bodies drift, clamped to 12 */
    count?: number
    /** how fast they move, 0.1 to 3 */
    speed?: number
    /** how strongly they read, 0 to 1 */
    intensity?: number
    seed?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export const NIMBUS_COLORS: readonly string[] = ["#3b1d6e", "#0e4f6b", "#7a1f5c", "#123a7a"]

const LIMIT = 12
/**
 * The field is drawn small and stretched back up. Upscaling a quarter-size
 * buffer gives the same softness a large blur filter would, for a sixteenth of
 * the pixels and no filter at all.
 */
const SCALE = 0.25

export function Nimbus({
    children,
    colors = NIMBUS_COLORS,
    count = 6,
    speed = 1,
    intensity = 0.75,
    seed = 9,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: NimbusProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        colors: colors.length > 0 ? colors : NIMBUS_COLORS,
        count: Math.round(clamp(finite(count, 6), 0, LIMIT)),
        speed: clamp(finite(speed, 1), 0.1, 3),
        intensity: clamp(finite(intensity, 0.75), 0, 1),
        seed,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const bodies = Array.from({ length: LIMIT }, (_, index) => {
            const random = rngFor(settings.current.seed + 31, index)
            return {
                x: random(),
                y: random(),
                reach: 0.28 + random() * 0.42,
                driftX: (random() - 0.5) * 0.06,
                driftY: (random() - 0.5) * 0.05,
                phase: random() * Math.PI * 2,
                pulse: 0.5 + random() * 0.9,
            }
        })

        let width = 1
        let height = 1
        let visible = true
        let time = 0

        const measure = () => {
            const box = host.getBoundingClientRect()
            width = Math.max(1, Math.round(box.width * SCALE))
            height = Math.max(1, Math.round(box.height * SCALE))
            canvas.width = width
            canvas.height = height
        }

        const paint = () => {
            const config = settings.current

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, width, height)
            context.globalCompositeOperation = "lighter"

            const span = Math.max(width, height)

            for (let index = 0; index < config.count; index += 1) {
                const body = bodies[index]
                const swell = 1 + Math.sin(time * body.pulse + body.phase) * 0.18
                const reach = body.reach * span * swell
                const x = (((body.x + body.driftX * time) % 1) + 1) % 1
                const y = (((body.y + body.driftY * time) % 1) + 1) % 1
                const cx_ = x * width
                const cy = y * height

                const cloud = context.createRadialGradient(cx_, cy, 0, cx_, cy, reach)
                const tone = config.colors[index % config.colors.length]
                cloud.addColorStop(0, tone)
                cloud.addColorStop(1, "rgba(0,0,0,0)")
                context.globalAlpha = config.intensity * 0.55
                context.fillStyle = cloud
                context.beginPath()
                context.arc(cx_, cy, reach, 0, Math.PI * 2)
                context.fill()
            }

            context.globalAlpha = 1
            context.globalCompositeOperation = "source-over"
        }

        measure()
        paint()

        const stopResize = onResize(host, () => {
            measure()
            paint()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = settings.current.still
            ? () => {}
            : onFrame((dt) => {
                  if (!visible) return
                  time += dt * settings.current.speed
                  paint()
              })

        return () => {
            stopFrame()
            stopResize()
            stopVisible()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-nimbus", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            <canvas ref={canvasRef} className="xp-nimbus-sky" aria-hidden="true" />
            {children ? <div className="xp-nimbus-content">{children}</div> : null}
        </div>
    )
}
