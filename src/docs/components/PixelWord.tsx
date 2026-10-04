import type { CSSProperties } from "react"

import { PIXEL_GLYPH_HEIGHT, pixelCells } from "./pixelFont"

export interface PixelWordProps {
    text: string
    /** read out by assistive technology; the blocks themselves are decoration */
    label?: string
    /** cells light up in a slow sweep across the word */
    glow?: boolean
    className?: string
    style?: CSSProperties
}

/**
 * A word built out of blocks. It scales with its container rather than with a
 * font size, so the same mark works as a 12px badge and as a hero signature.
 */
export function PixelWord({ text, label, glow = false, className, style }: PixelWordProps) {
    const { cells, width } = pixelCells(text)
    const height = PIXEL_GLYPH_HEIGHT

    return (
        <span
            className={["pz-word", glow ? "pz-word-glow" : "", className].filter(Boolean).join(" ")}
            style={style}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                focusable="false"
                aria-hidden="true"
            >
                {cells.map((cell) => (
                    <rect
                        key={`${cell.x}-${cell.y}`}
                        x={cell.x}
                        y={cell.y}
                        width={1}
                        height={1}
                        style={
                            {
                                // the sweep runs along the diagonal, so the light
                                // crosses the word instead of blinking at it
                                "--pz-step": `${(cell.x + cell.y) * 55}ms`,
                            } as CSSProperties
                        }
                    />
                ))}
            </svg>
        </span>
    )
}
