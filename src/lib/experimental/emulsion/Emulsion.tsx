"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import { clamp, cssUrl, cx, finite, noiseTile, usePrefersReducedMotion } from "../../internal"
import "./Emulsion.css"

export interface EmulsionProps {
    src: string
    alt: string
    /** how far the highlights bloom into their surroundings, 0 to 1 */
    halation?: number
    /** film grain, 0 to 1 */
    grain?: number
    /** how warm the stock is, -1 cool to 1 warm */
    warmth?: number
    /** a light leak across one corner, 0 to 1 */
    leak?: number
    /** how far the shadows lift, 0 to 1 */
    fade?: number
    aspect?: string
    objectFit?: "cover" | "contain"
    objectPosition?: string
    radius?: number
    seed?: number
    className?: string
    style?: CSSProperties
}

export function Emulsion({
    src,
    alt,
    halation = 0.45,
    grain = 0.3,
    warmth = 0.25,
    leak = 0.3,
    fade = 0.18,
    aspect = "3 / 2",
    objectFit = "cover",
    objectPosition = "50% 50%",
    radius = 14,
    seed = 4,
    className,
    style,
}: EmulsionProps) {
    const grainRef = useRef<HTMLSpanElement>(null)
    const [failed, setFailed] = useState(false)
    const [lastSrc, setLastSrc] = useState(src)

    // a new source deserves a fresh attempt: the sanctioned way to reset state
    // from a prop is during render, not from an effect
    if (src !== lastSrc) {
        setLastSrc(src)
        setFailed(false)
    }
    const reduced = usePrefersReducedMotion()

    const dust = clamp(finite(grain, 0.3), 0, 1)

    useEffect(() => {
        const grain = grainRef.current
        if (!grain) return

        const canvas = document.createElement("canvas")
        const tile = dust > 0 ? noiseTile(canvas, { size: 128, seed, colour: 0.12 }) : null
        grain.style.backgroundImage = tile ? cssUrl(tile) : ""
        canvas.width = 0
        canvas.height = 0

        return () => {
            grain.style.backgroundImage = ""
        }
    }, [dust, seed])

    const heat = clamp(finite(warmth, 0.25), -1, 1)

    return (
        <figure
            className={cx("xp-emulsion", className)}
            data-failed={failed ? "true" : undefined}
            style={
                {
                    ...style,
                    aspectRatio: aspect,
                    "--em-radius": `${clamp(finite(radius, 14), 0, 96)}px`,
                    "--em-bloom": clamp(finite(halation, 0.45), 0, 1),
                    "--em-grain": dust,
                    "--em-leak": clamp(finite(leak, 0.3), 0, 1),
                    "--em-fade": clamp(finite(fade, 0.18), 0, 1),
                    "--em-warm": heat,
                    "--em-fit": objectFit,
                    "--em-at": objectPosition,
                } as CSSProperties
            }
        >
            <img
                className="xp-emulsion-plate"
                src={src}
                alt={alt}
                onError={() => setFailed(true)}
            />

            {failed ? null : (
                <>
                    {/* the same picture, blown out and blurred: halation is the
                        highlight bleeding back into the emulsion around it */}
                    <img
                        className="xp-emulsion-bloom"
                        src={src}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                    />
                    <span className="xp-emulsion-tone" aria-hidden="true" />
                    <span className="xp-emulsion-leak" aria-hidden="true" />
                    <span
                        ref={grainRef}
                        className="xp-emulsion-grain"
                        aria-hidden="true"
                        data-still={reduced ? "true" : undefined}
                    />
                </>
            )}
        </figure>
    )
}
