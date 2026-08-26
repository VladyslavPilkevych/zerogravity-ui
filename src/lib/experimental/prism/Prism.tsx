"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

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
import "./Prism.css"

export interface PrismProps {
    children?: ReactNode
    /** how far the slab leans, in degrees */
    tilt?: number
    /** how far the colours separate at the edges, 0 to 1 */
    dispersion?: number
    /** how bright the specular sweep is, 0 to 1 */
    sheen?: number
    /** corner radius in px; every layer shares it */
    radius?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Prism({
    children,
    tilt = 12,
    dispersion = 0.6,
    sheen = 0.7,
    radius = 20,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PrismProps) {
    const hostRef = useRef<HTMLDivElement>(null)

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({ tilt: finite(tilt, 8), still, fine })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        const aim = { x: 0.5, y: 0.5 }
        const at = { x: 0.5, y: 0.5 }
        let active = false

        const write = () => {
            const config = settings.current
            const lean = config.still ? 0 : config.tilt
            host.style.setProperty("--pr-x", at.x.toFixed(4))
            host.style.setProperty("--pr-y", at.y.toFixed(4))
            host.style.setProperty("--pr-rx", (-(at.y - 0.5) * 2 * lean).toFixed(3))
            host.style.setProperty("--pr-ry", ((at.x - 0.5) * 2 * lean).toFixed(3))
        }

        write()

        const stop = onFrame((dt) => {
            if (!active && Math.abs(aim.x - at.x) < 0.001 && Math.abs(aim.y - at.y) < 0.001) return
            at.x = damp(at.x, aim.x, 9, dt)
            at.y = damp(at.y, aim.y, 9, dt)
            write()
        })

        const onMove = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.at(event)
            if (!point) return
            aim.x = clamp(point.x, 0, 1)
            aim.y = clamp(point.y, 0, 1)
            active = true
        }

        const onLeave = () => {
            aim.x = 0.5
            aim.y = 0.5
            active = false
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
            className={cx("xp-prism", className)}
            data-still={still ? "true" : undefined}
            data-touch={!fine ? "true" : undefined}
            style={
                {
                    ...style,
                    "--pr-radius": `${clamp(finite(radius, 20), 0, 96)}px`,
                    "--pr-split": clamp(finite(dispersion, 0.6), 0, 1),
                    "--pr-sheen": clamp(finite(sheen, 0.7), 0, 1),
                } as CSSProperties
            }
        >
            <div className="xp-prism-slab">
                <div className="xp-prism-body">{children}</div>
                <span className="xp-prism-split" aria-hidden="true" />
                <span className="xp-prism-sheen" aria-hidden="true" />
                <span className="xp-prism-rim" aria-hidden="true" />
            </div>
        </div>
    )
}
