"use client"

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onFrame,
    onVisible,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Meniscus.css"

export type MeniscusShape = "circle" | "pill" | "square"

export interface MeniscusProps {
    /** 0 to 1; leave it out for an indeterminate fill that keeps sloshing */
    value?: number
    label?: string
    /** the liquid */
    color?: string
    /** a second colour makes the liquid a gradient */
    colorTo?: string
    /** how tall the surface waves are, 0 to 1 */
    swell?: number
    /** how fast they travel, 0.2 to 3 */
    speed?: number
    shape?: MeniscusShape
    size?: number
    /** show the percentage inside the vessel */
    showValue?: boolean
    children?: ReactNode
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** The surface, as a path across a 0..100 box at a given level. */
function surface(level: number, phase: number, swell: number): string {
    const points: string[] = []
    const steps = 26
    const top = 100 - level * 100

    for (let index = 0; index <= steps; index += 1) {
        const x = (index / steps) * 100
        const angle = (index / steps) * Math.PI * 4 + phase
        const y = top + Math.sin(angle) * swell + Math.sin(angle * 1.7 + 0.8) * swell * 0.45
        points.push(`${x.toFixed(1)} ${y.toFixed(2)}`)
    }

    return `M0 110 L0 ${points[0].split(" ")[1]} L${points.join(" L")} L100 110 Z`
}

export function Meniscus({
    value,
    label = "Loading",
    color = "#2f8bff",
    colorTo,
    swell = 0.5,
    speed = 1,
    shape = "circle",
    size = 128,
    showValue = true,
    children,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: MeniscusProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const waveRef = useRef<SVGPathElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const gradientId = `${useId().replace(/:/g, "")}m`
    const known = typeof value === "number" && Number.isFinite(value)
    const level = known ? clamp(value, 0, 1) : 0

    const settings = useLatestRef({
        level,
        known,
        swell: clamp(finite(swell, 0.5), 0, 1) * 7,
        speed: clamp(finite(speed, 1), 0.2, 3),
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const wave = waveRef.current
        if (!host || !wave) return

        let phase = 0
        let at = settings.current.known ? settings.current.level : 0.5
        let visible = true

        const draw = () => {
            const config = settings.current
            wave.setAttribute("d", surface(at, phase, config.still ? 0 : config.swell))
        }

        draw()

        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = settings.current.still
            ? () => {}
            : onFrame((dt) => {
                  if (!visible) return
                  const config = settings.current
                  phase += dt * config.speed * 2.4
                  // an unknown value keeps the vessel half full and moving, so
                  // the loader still reads as working
                  const target = config.known ? config.level : 0.5 + Math.sin(phase * 0.35) * 0.16
                  at = damp(at, target, 6, dt)
                  draw()
              })

        return () => {
            stopFrame()
            stopVisible()
        }
    }, [settings])

    const percent = Math.round(level * 100)

    return (
        <div
            ref={hostRef}
            className={cx("xp-meniscus", className)}
            data-shape={shape}
            data-still={still ? "true" : undefined}
            style={
                { ...style, "--me-size": `${clamp(finite(size, 128), 24, 480)}px` } as CSSProperties
            }
            role="progressbar"
            aria-label={label}
            aria-valuemin={known ? 0 : undefined}
            aria-valuemax={known ? 100 : undefined}
            aria-valuenow={known ? percent : undefined}
            aria-busy={known ? undefined : true}
        >
            <svg
                className="xp-meniscus-vessel"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                {colorTo ? (
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={colorTo} />
                        </linearGradient>
                    </defs>
                ) : null}
                <path ref={waveRef} fill={colorTo ? `url(#${gradientId})` : color} />
            </svg>

            <span className="xp-meniscus-glass" aria-hidden="true" />

            {children ??
                (showValue ? (
                    <span className="xp-meniscus-read" aria-hidden="true">
                        {known ? `${percent}%` : "…"}
                    </span>
                ) : null)}
        </div>
    )
}
