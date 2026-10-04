"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onFrame,
    pointerBox,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Anaglyph.css"

export type AnaglyphMode = "converge" | "parallax"

export interface AnaglyphProps {
    src: string
    alt: string
    /**
     * `converge` splits the channels and pulls them back together under the
     * pointer; `parallax` keeps the split and slides the layers past each other.
     */
    mode?: AnaglyphMode
    /** how far the channels separate, in px */
    separation?: number
    /** how far the picture scales into depth, 0 to 1 */
    depth?: number
    aspect?: string
    objectFit?: "cover" | "contain"
    objectPosition?: string
    radius?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Anaglyph({
    src,
    alt,
    mode = "converge",
    separation = 14,
    depth = 0.4,
    aspect = "3 / 2",
    objectFit = "cover",
    objectPosition = "50% 50%",
    radius = 14,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: AnaglyphProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const [failed, setFailed] = useState(false)
    const [lastSrc, setLastSrc] = useState(src)

    // a new source deserves a fresh attempt: the sanctioned way to reset state
    // from a prop is during render, not from an effect
    if (src !== lastSrc) {
        setLastSrc(src)
        setFailed(false)
    }

    const filterId = `${useId().replace(/:/g, "")}a`
    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const settings = useLatestRef({ mode, still })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        const aim = { x: 0.5, y: 0.5, near: 0 }
        const at = { x: 0.5, y: 0.5, near: 0 }

        const write = () => {
            host.style.setProperty("--an-x", (at.x - 0.5).toFixed(4))
            host.style.setProperty("--an-y", (at.y - 0.5).toFixed(4))
            host.style.setProperty("--an-near", at.near.toFixed(4))
        }
        write()

        const stop = onFrame((dt) => {
            if (settings.current.still) return
            if (
                Math.abs(aim.x - at.x) < 0.0008 &&
                Math.abs(aim.y - at.y) < 0.0008 &&
                Math.abs(aim.near - at.near) < 0.0008
            ) {
                return
            }
            at.x = damp(at.x, aim.x, 11, dt)
            at.y = damp(at.y, aim.y, 11, dt)
            at.near = damp(at.near, aim.near, 9, dt)
            write()
        })

        const onMove = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.at(event)
            if (!point) return
            aim.x = clamp(point.x, 0, 1)
            aim.y = clamp(point.y, 0, 1)
            aim.near = 1
        }

        const onLeave = () => {
            aim.x = 0.5
            aim.y = 0.5
            aim.near = 0
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
        <figure
            ref={hostRef}
            className={cx("xp-anaglyph", className)}
            data-mode={mode}
            data-still={still ? "true" : undefined}
            data-failed={failed ? "true" : undefined}
            style={
                {
                    ...style,
                    aspectRatio: aspect,
                    "--an-split": `${clamp(finite(separation, 14), 0, 90)}px`,
                    "--an-depth": clamp(finite(depth, 0.4), 0, 1),
                    "--an-radius": `${clamp(finite(radius, 14), 0, 96)}px`,
                    "--an-fit": objectFit,
                    "--an-at": objectPosition,
                } as CSSProperties
            }
        >
            {/* two colour matrices, one per eye: an exact channel split, where a
                chain of hue-rotate filters only washes the picture out */}
            <svg className="xp-anaglyph-defs" aria-hidden="true" focusable="false">
                <filter id={`${filterId}l`} colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    />
                </filter>
                <filter id={`${filterId}r`} colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                    />
                </filter>
            </svg>

            <img
                className="xp-anaglyph-plate"
                src={src}
                alt={alt}
                onError={() => setFailed(true)}
                onLoad={() => setFailed(false)}
            />
            {failed ? null : (
                <>
                    <img
                        className="xp-anaglyph-eye xp-anaglyph-left"
                        src={src}
                        alt=""
                        aria-hidden="true"
                        style={{ filter: `url(#${filterId}l)` }}
                    />
                    <img
                        className="xp-anaglyph-eye xp-anaglyph-right"
                        src={src}
                        alt=""
                        aria-hidden="true"
                        style={{ filter: `url(#${filterId}r)` }}
                    />
                </>
            )}
        </figure>
    )
}
