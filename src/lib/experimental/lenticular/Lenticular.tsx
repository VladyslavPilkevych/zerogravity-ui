"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

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
import "./Lenticular.css"

export interface LenticularProps {
    /** the image seen from the left */
    frontSrc: string
    /** the image seen from the right */
    backSrc: string
    /** describes the pair; one card, one description */
    alt: string
    /** how many lens strips run across the card */
    strips?: number
    /** how far the card leans, in degrees */
    tilt?: number
    /** how bright the lens sheen is, 0 to 1 */
    sheen?: number
    aspect?: string
    objectPosition?: string
    radius?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Lenticular({
    frontSrc,
    backSrc,
    alt,
    strips = 46,
    tilt = 7,
    sheen = 0.5,
    aspect = "4 / 3",
    objectPosition = "50% 50%",
    radius = 16,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: LenticularProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const [failed, setFailed] = useState(false)
    const [lastPair, setLastPair] = useState(`${frontSrc}|${backSrc}`)

    // a new pair deserves a fresh attempt: the sanctioned way to reset state
    // from a prop is during render, not from an effect
    if (`${frontSrc}|${backSrc}` !== lastPair) {
        setLastPair(`${frontSrc}|${backSrc}`)
        setFailed(false)
    }

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({ still })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        let aim = 0.5
        let at = 0.5

        const write = () => host.style.setProperty("--le-at", at.toFixed(4))
        write()

        const stop = onFrame((dt) => {
            if (settings.current.still || Math.abs(aim - at) < 0.0008) return
            at = damp(at, aim, 12, dt)
            write()
        })

        const onMove = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.at(event)
            if (point) aim = clamp(point.x, 0, 1)
        }

        const onLeave = () => {
            aim = 0.5
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

    const pitch = Math.round(clamp(finite(strips, 46), 6, 200))

    return (
        <div
            ref={hostRef}
            className={cx("xp-lenticular", className)}
            role="img"
            aria-label={alt}
            data-still={still ? "true" : undefined}
            data-touch={!fine ? "true" : undefined}
            data-failed={failed ? "true" : undefined}
            style={
                {
                    ...style,
                    aspectRatio: aspect,
                    "--le-strips": pitch,
                    "--le-tilt": `${clamp(finite(tilt, 7), 0, 30)}deg`,
                    "--le-sheen": clamp(finite(sheen, 0.5), 0, 1),
                    "--le-radius": `${clamp(finite(radius, 16), 0, 96)}px`,
                    "--le-plate-at": objectPosition,
                } as CSSProperties
            }
        >
            <div className="xp-lenticular-card">
                <img
                    className="xp-lenticular-plate xp-lenticular-back"
                    src={backSrc}
                    alt=""
                    aria-hidden="true"
                    onError={() => setFailed(true)}
                />
                <img
                    className="xp-lenticular-plate xp-lenticular-front"
                    src={frontSrc}
                    alt=""
                    aria-hidden="true"
                    onError={() => setFailed(true)}
                />
                <span className="xp-lenticular-lens" aria-hidden="true" />
                <span className="xp-lenticular-sheen" aria-hidden="true" />
            </div>
        </div>
    )
}
