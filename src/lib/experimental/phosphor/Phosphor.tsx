"use client"

import { type CSSProperties } from "react"

import { clamp, cx, finite, usePrefersReducedMotion } from "../../internal"
import "./Phosphor.css"

export interface PhosphorProps {
    text: string
    /** the colour the tube burns in */
    color?: string
    /** how hard it glows, 0 to 1 */
    bloom?: number
    /** scanline pitch in px; 0 turns them off */
    scanline?: number
    /** how far the beam misaligns, in px */
    fringe?: number
    /** how much the picture rolls and flickers, 0 to 1 */
    jitter?: number
    /** the tag the text is rendered as */
    as?: "span" | "h1" | "h2" | "h3" | "p"
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Phosphor({
    text,
    color = "#54ffbe",
    bloom = 0.6,
    scanline = 4,
    fringe = 2,
    jitter = 0.4,
    as: Tag = "span",
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PhosphorProps) {
    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const pitch = clamp(finite(scanline, 4), 0, 40)

    return (
        <div
            className={cx("xp-phosphor", className)}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--ph-ink": color,
                    "--ph-bloom": clamp(finite(bloom, 0.6), 0, 1),
                    "--ph-pitch": `${pitch}px`,
                    "--ph-fringe": `${clamp(finite(fringe, 2), 0, 12)}px`,
                    "--ph-jitter": clamp(finite(jitter, 0.4), 0, 1),
                } as CSSProperties
            }
        >
            <span className="xp-phosphor-tube">
                <Tag className="xp-phosphor-line">{text}</Tag>

                {/* the beam's two misaligned guns, and the mask in front */}
                <span className="xp-phosphor-ghost xp-phosphor-red" aria-hidden="true">
                    {text}
                </span>
                <span className="xp-phosphor-ghost xp-phosphor-blue" aria-hidden="true">
                    {text}
                </span>
                {pitch > 0 ? <span className="xp-phosphor-mask" aria-hidden="true" /> : null}
            </span>
        </div>
    )
}
