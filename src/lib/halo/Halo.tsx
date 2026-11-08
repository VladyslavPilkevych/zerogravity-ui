import type { CSSProperties, ReactNode } from "react"

import { clamp, cx, finite } from "../internal"
import "./Halo.css"

export type HaloDirection = "clockwise" | "counterclockwise"

export interface HaloProps {
    text: string
    repeat?: number
    separator?: string
    size?: number
    fontSize?: number
    spin?: boolean
    duration?: number
    direction?: HaloDirection
    paused?: boolean
    pauseOnHover?: boolean
    children?: ReactNode
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export const HALO_GLYPH_LIMIT = 240

/** Every glyph gets an equal slice of the turn, so the ring always closes. */
export function haloGlyphs(text: string, repeat: number, separator: string): string[] {
    const copies = clamp(Math.round(finite(repeat, 2)), 1, 12)
    return Array.from(`${text}${separator}`.repeat(copies)).slice(0, HALO_GLYPH_LIMIT)
}

/** A type size that fills each glyph's slice of the ring without crowding it. */
export function haloFontSize(diameter: number, glyphs: number): number {
    const slot = (Math.PI * diameter * 0.86) / Math.max(glyphs, 1)
    return clamp(slot / 0.8, 6, diameter / 7)
}

export function Halo({
    text,
    repeat = 2,
    separator = " • ",
    size = 200,
    fontSize,
    spin = true,
    duration = 20,
    direction = "clockwise",
    paused = false,
    pauseOnHover = false,
    children,
    respectReducedMotion = true,
    className,
    style,
}: HaloProps) {
    const glyphs = haloGlyphs(text, repeat, separator)
    const diameter = clamp(finite(size, 200), 48, 2000)
    const fitted = haloFontSize(diameter, glyphs.length)
    const glyph = clamp(finite(fontSize, fitted), 6, diameter / 6)
    const step = 360 / Math.max(glyphs.length, 1)

    const vars = {
        "--zg-halo-size": `${diameter}px`,
        "--zg-halo-font": `${glyph}px`,
        "--zg-halo-font-ratio": glyph / diameter,
        "--zg-halo-duration": `${clamp(finite(duration, 20), 2, 600)}s`,
    } as CSSProperties

    return (
        <div
            className={cx("zg-halo", className)}
            data-spin={spin ? "" : undefined}
            data-direction={direction}
            data-paused={paused ? "" : undefined}
            data-hover-pause={pauseOnHover ? "" : undefined}
            data-motion={respectReducedMotion ? undefined : "always"}
            style={{ ...style, ...vars }}
        >
            <div className="zg-halo-ring" role="img" aria-label={text}>
                {glyphs.map((character, index) => (
                    <span
                        key={index}
                        className="zg-halo-glyph"
                        aria-hidden="true"
                        style={{ "--zg-halo-angle": `${index * step}deg` } as CSSProperties}
                    >
                        <span>{character}</span>
                    </span>
                ))}
            </div>
            {children !== undefined && <div className="zg-halo-centre">{children}</div>}
        </div>
    )
}
