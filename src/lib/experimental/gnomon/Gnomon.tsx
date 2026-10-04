"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onFrame,
    onResize,
    pointerBox,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Gnomon.css"

export interface GnomonProps {
    children?: ReactNode
    /** how far a shadow is thrown at the edge of the box, in px */
    distance?: number
    /** how soft it is, in px */
    softness?: number
    /** how dark it is, 0 to 1 */
    depth?: number
    color?: string
    /** children lift slightly toward the light */
    lift?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** Past this many children the per-child cast stops being worth the writes. */
const CAST_LIMIT = 60

export function Gnomon({
    children,
    distance = 28,
    softness = 30,
    depth = 0.55,
    color = "#05070f",
    lift = true,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: GnomonProps) {
    const hostRef = useRef<HTMLDivElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const settings = useLatestRef({ still })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        // the light starts above and slightly left, the way a room usually is
        const aim = { x: 0.35, y: -0.4 }
        const at = { x: 0.35, y: -0.4 }

        // each child's own centre, so every one of them can work out where the
        // light is relative to itself instead of sharing one direction
        let cast: { node: HTMLElement; x: number; y: number }[] = []

        const measure = () => {
            const frame = host.getBoundingClientRect()
            if (frame.width === 0 || frame.height === 0) {
                cast = []
                return
            }

            cast = [...host.children]
                .filter((node): node is HTMLElement => node instanceof HTMLElement)
                .slice(0, CAST_LIMIT)
                .map((node) => {
                    const spot = node.getBoundingClientRect()
                    return {
                        node,
                        x: (spot.left + spot.width / 2 - frame.left) / frame.width,
                        y: (spot.top + spot.height / 2 - frame.top) / frame.height,
                    }
                })
        }

        const write = () => {
            host.style.setProperty("--gn-lx", `${(at.x * 100).toFixed(2)}%`)
            host.style.setProperty("--gn-ly", `${(at.y * 100).toFixed(2)}%`)

            for (const child of cast) {
                const dx = child.x - at.x
                const dy = child.y - at.y
                const distance = Math.hypot(dx, dy) || 1
                // further from the lamp means a longer, softer shadow
                const reach = clamp(0.55 + distance * 1.5, 0.55, 2.2)
                child.node.style.setProperty("--gn-dx", (dx / distance).toFixed(4))
                child.node.style.setProperty("--gn-dy", (dy / distance).toFixed(4))
                child.node.style.setProperty("--gn-far", reach.toFixed(3))
            }
        }

        measure()
        write()

        const stopResize = onResize(host, () => {
            box.invalidate()
            measure()
            write()
        })

        const stop = onFrame((dt) => {
            if (Math.abs(aim.x - at.x) < 0.0008 && Math.abs(aim.y - at.y) < 0.0008) return
            at.x = damp(at.x, aim.x, 8, dt)
            at.y = damp(at.y, aim.y, 8, dt)
            write()
        })

        const onMove = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.at(event)
            if (!point) return
            aim.x = clamp(point.x, -0.6, 1.6)
            aim.y = clamp(point.y, -0.6, 1.6)
        }

        const onLeave = () => {
            aim.x = 0.35
            aim.y = -0.4
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)

        return () => {
            stop()
            stopResize()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            box.dispose()
        }
    }, [settings, children])

    return (
        <div
            ref={hostRef}
            className={cx("xp-gnomon", lift && "xp-gnomon-lift", className)}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--gn-reach": `${clamp(finite(distance, 28), 0, 200)}px`,
                    "--gn-blur": `${clamp(finite(softness, 30), 0, 200)}px`,
                    "--gn-depth": clamp(finite(depth, 0.55), 0, 1),
                    "--gn-ink": color,
                } as CSSProperties
            }
        >
            {children}
        </div>
    )
}
