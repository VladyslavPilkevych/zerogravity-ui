"use client"

import { useEffect, useId, useRef, type CSSProperties } from "react"

import {
    clamp,
    cx,
    finite,
    onFrame,
    onVisible,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Tide.css"

export interface TideProps {
    /** the body of water: one colour, or a pair for a gradient */
    color?: string
    /** a second colour makes the fill a gradient */
    colorTo?: string
    /** how tall the band is, in px */
    height?: number
    /** how tall the waves are, 0 to 1 */
    amplitude?: number
    /** how many crests fit across the band */
    crests?: number
    /** how fast it travels, 0.1 to 3 */
    speed?: number
    /** point the water at the section above instead of the one below */
    flip?: boolean
    /** a second, slower wave behind the first */
    layers?: 1 | 2
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** One period of a smooth wave, as a path across a 0..1200 by 0..100 box. */
function wave(phase: number, crests: number, lift: number, depth: number): string {
    const points: string[] = []
    const steps = 48

    for (let index = 0; index <= steps; index += 1) {
        const x = (index / steps) * 1200
        const angle = (index / steps) * Math.PI * 2 * crests + phase
        const y = 50 - Math.sin(angle) * lift - Math.sin(angle * 2.3 + 1.1) * lift * 0.35 + depth
        points.push(`${x.toFixed(1)} ${y.toFixed(2)}`)
    }

    return `M0 120 L0 ${points[0].split(" ")[1]} L${points.join(" L")} L1200 120 Z`
}

export function Tide({
    color = "#1d5cff",
    colorTo,
    height = 120,
    amplitude = 0.45,
    crests = 2,
    speed = 1,
    flip = false,
    layers = 2,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: TideProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const frontRef = useRef<SVGPathElement>(null)
    const backRef = useRef<SVGPathElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const gradientId = `${useId().replace(/:/g, "")}t`
    const settings = useLatestRef({
        amplitude: clamp(finite(amplitude, 0.45), 0, 1) * 34,
        crests: clamp(finite(crests, 2), 0.5, 8),
        speed: clamp(finite(speed, 1), 0.1, 3),
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const front = frontRef.current
        if (!host || !front) return

        let phase = 0
        let visible = true

        const draw = () => {
            const config = settings.current
            front.setAttribute("d", wave(phase, config.crests, config.amplitude, 0))
            backRef.current?.setAttribute(
                "d",
                wave(-phase * 0.6 + 1.9, config.crests * 0.7, config.amplitude * 0.7, 12),
            )
        }

        draw()

        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = settings.current.still
            ? () => {}
            : onFrame((dt) => {
                  if (!visible) return
                  phase += dt * settings.current.speed
                  draw()
              })

        return () => {
            stopFrame()
            stopVisible()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-tide", className)}
            data-flip={flip ? "true" : undefined}
            data-still={still ? "true" : undefined}
            style={
                { ...style, height: `${clamp(finite(height, 120), 20, 480)}px` } as CSSProperties
            }
        >
            <svg
                className="xp-tide-body"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                {colorTo ? (
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={colorTo} />
                        </linearGradient>
                    </defs>
                ) : null}

                {layers === 2 ? (
                    <path ref={backRef} className="xp-tide-back" fill={color} opacity={0.42} />
                ) : null}
                <path ref={frontRef} fill={colorTo ? `url(#${gradientId})` : color} />
            </svg>
        </div>
    )
}
