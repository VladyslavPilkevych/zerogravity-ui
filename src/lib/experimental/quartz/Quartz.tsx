"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import { clamp, cssUrl, cx, finite, noiseTile, usePrefersReducedMotion } from "../../internal"
import "./Quartz.css"

export type QuartzBlend = "soft-light" | "overlay" | "screen" | "multiply"

export interface QuartzProps {
    children?: ReactNode
    /** how visible the grain is, 0 to 1 */
    intensity?: number
    /** tile size in px; larger reads as coarser film */
    scale?: number
    /** how fast the field shifts, 0.2 to 3 */
    speed?: number
    /** 0 monochrome, 1 coloured speckle */
    colour?: number
    blend?: QuartzBlend
    seed?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Quartz({
    children,
    intensity = 0.35,
    scale = 128,
    speed = 1,
    colour = 0,
    blend = "soft-light",
    seed = 1,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: QuartzProps) {
    const grainRef = useRef<HTMLSpanElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const size = Math.round(clamp(finite(scale, 128), 16, 256))
    const grit = clamp(finite(colour, 0), 0, 1)

    useEffect(() => {
        const grain = grainRef.current
        if (!grain) return

        // rendered once and written straight to the node: a live turbulence
        // filter would cost a paint every frame for the same result, and the
        // URL is of no interest to React
        const canvas = document.createElement("canvas")
        const tile = noiseTile(canvas, { size, seed, colour: grit })
        grain.style.backgroundImage = tile ? cssUrl(tile) : ""
        canvas.width = 0
        canvas.height = 0

        return () => {
            grain.style.backgroundImage = ""
        }
    }, [size, seed, grit])

    return (
        <div
            className={cx("xp-quartz", className)}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--qz-alpha": clamp(finite(intensity, 0.35), 0, 1),
                    "--qz-size": `${size}px`,
                    "--qz-beat": `${(1.6 / clamp(finite(speed, 1), 0.2, 3)).toFixed(2)}s`,
                } as CSSProperties
            }
        >
            {children}
            <span
                ref={grainRef}
                className="xp-quartz-grain"
                aria-hidden="true"
                style={{ mixBlendMode: blend } as CSSProperties}
            />
        </div>
    )
}
