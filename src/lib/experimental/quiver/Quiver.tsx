"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onFrame,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
} from "../../internal"
import "./Quiver.css"

export interface QuiverProps {
    text: string
    /** how far a letter is lifted at the crest, in px */
    lift?: number
    /** how wide the wave is, as a share of the line */
    width?: number
    /** how far a letter turns at the crest, in degrees */
    twist?: number
    /** a wave that travels on its own when nothing is pointing */
    ambient?: boolean
    /** the tag the text is rendered as */
    as?: "span" | "h1" | "h2" | "h3" | "p"
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Quiver({
    text,
    lift = 18,
    width = 0.22,
    twist = 12,
    ambient = true,
    as: Tag = "span",
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: QuiverProps) {
    const hostRef = useRef<HTMLDivElement>(null)

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)

    const letters = [...text]
    const settings = useLatestRef({ ambient, still })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        let aim = 0.5
        let at = 0.5
        let hovered = false
        let drift = 0

        const stop = onFrame((dt) => {
            const config = settings.current
            if (config.still) return

            if (!hovered && config.ambient) {
                drift += dt * 0.35
                aim = 0.5 + Math.sin(drift) * 0.7
            }

            if (Math.abs(aim - at) < 0.0005) return
            at = damp(at, aim, 11, dt)
            host.style.setProperty("--qv-at", at.toFixed(4))
        })

        const onMove = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.at(event)
            if (!point) return
            hovered = true
            aim = point.x
        }

        const onLeave = () => {
            hovered = false
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)

        return () => {
            stop()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            box.dispose()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-quiver", className)}
            data-still={still ? "true" : undefined}
            data-touch={!fine ? "true" : undefined}
            style={
                {
                    ...style,
                    "--qv-lift": `${clamp(finite(lift, 18), 0, 200)}px`,
                    "--qv-width": clamp(finite(width, 0.22), 0.02, 1),
                    "--qv-twist": `${clamp(finite(twist, 12), 0, 90)}deg`,
                } as CSSProperties
            }
        >
            {/* one accessible string; the per-letter spans are decoration */}
            <Tag className="xp-quiver-line" aria-label={text}>
                {letters.map((letter, index) => (
                    <span
                        key={index}
                        className="xp-quiver-glyph"
                        aria-hidden="true"
                        style={
                            {
                                "--qv-i": (index / Math.max(1, letters.length - 1)).toFixed(4),
                            } as CSSProperties
                        }
                    >
                        {letter === " " ? " " : letter}
                    </span>
                ))}
            </Tag>
        </div>
    )
}
