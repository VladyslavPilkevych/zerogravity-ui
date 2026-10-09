"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onResize,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
    wakeLoop,
} from "../internal"
import { lensState } from "./lens"
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
    /** holds the print at this position, 0 (first picture) to 1 (second); the pointer is ignored */
    position?: number
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
    position,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: LenticularProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const holdRef = useRef<(at: number) => void>(() => {})
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

    const held = position === undefined ? undefined : clamp(finite(position, 0.5), 0, 1)
    const settings = useLatestRef({ disabled, still, held })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        let aim = settings.current.held ?? 0.5
        let at = aim
        const write = () => writeLens(host.style, at)

        const loop = wakeLoop((dt) => {
            at = damp(at, aim, 12, dt)
            const settled = Math.abs(aim - at) < 0.0008
            if (settled) at = aim
            write()
            return !settled
        })

        holdRef.current = (next) => {
            aim = next
            at = next
            loop.sleep()
            write()
        }

        // the print keeps whichever side the pointer left it on, like a
        // lenticular card you have walked past
        const follow = (event: PointerEvent) => {
            const config = settings.current
            if (config.disabled || config.held !== undefined) return
            const point = box.at(event)
            if (!point) return
            // under reduced motion the swap answers the pointer directly:
            // no easing, no tilt, nothing moving on its own
            if (config.still) {
                holdRef.current(clamp(point.x, 0, 1))
                return
            }
            aim = clamp(point.x, 0, 1)
            loop.wake()
        }

        host.addEventListener("pointermove", follow, { passive: true })
        host.addEventListener("pointerdown", follow, { passive: true })
        // the page can move the card without a window resize or a scroll
        const stopResize = onResize(host, box.invalidate)

        return () => {
            holdRef.current = () => {}
            loop.sleep()
            stopResize()
            host.removeEventListener("pointermove", follow)
            host.removeEventListener("pointerdown", follow)
            box.dispose()
        }
    }, [settings])

    // a held position wins; otherwise a print that stops moving faces you head-on
    useEffect(() => {
        if (held !== undefined) holdRef.current(held)
        else if (still) holdRef.current(0.5)
    }, [held, still])

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
                    ...lensStyle(held ?? 0.5),
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

function lensStyle(at: number): Record<string, string> {
    const lens = lensState(at)
    return {
        "--le-at": at.toFixed(4),
        "--le-mix": lens.mix.toFixed(4),
        "--le-hold": lens.hold.toFixed(4),
        "--le-front": lens.front.toFixed(4),
        "--le-ribs": lens.ribs.toFixed(4),
    }
}

function writeLens(style: CSSStyleDeclaration, at: number): void {
    const lens = lensState(at)
    style.setProperty("--le-at", at.toFixed(4))
    style.setProperty("--le-mix", lens.mix.toFixed(4))
    style.setProperty("--le-hold", lens.hold.toFixed(4))
    style.setProperty("--le-front", lens.front.toFixed(4))
    style.setProperty("--le-ribs", lens.ribs.toFixed(4))
}
