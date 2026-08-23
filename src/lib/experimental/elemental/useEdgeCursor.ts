"use client"

import { useEffect, type RefObject } from "react"

const EASE = 0.22
const SETTLED = 0.2

/**
 * A pointer follower scoped to one element. Everything lives on the node the
 * ref points at, so nothing global is touched and the native cursor comes back
 * the moment the pointer leaves or the component unmounts.
 */
export function useEdgeCursor(
    root: RefObject<HTMLElement | null>,
    dot: RefObject<HTMLElement | null>,
    active: boolean,
): void {
    useEffect(() => {
        const host = root.current
        const node = dot.current
        if (!active || !host || !node) return

        let targetX = 0
        let targetY = 0
        let x = 0
        let y = 0
        let frame = 0
        let placed = false

        const render = () => {
            x += (targetX - x) * EASE
            y += (targetY - y) * EASE
            node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`

            frame =
                Math.abs(targetX - x) < SETTLED && Math.abs(targetY - y) < SETTLED
                    ? 0
                    : requestAnimationFrame(render)
        }

        const wake = () => {
            if (frame === 0) frame = requestAnimationFrame(render)
        }

        const onMove = (event: PointerEvent) => {
            const box = host.getBoundingClientRect()
            targetX = event.clientX - box.left
            targetY = event.clientY - box.top

            if (!placed) {
                placed = true
                x = targetX
                y = targetY
                node.dataset.on = "true"
            }
            wake()
        }

        const onLeave = () => {
            placed = false
            node.dataset.on = "false"
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave, { passive: true })
        host.addEventListener("pointercancel", onLeave, { passive: true })

        return () => {
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            host.removeEventListener("pointercancel", onLeave)
            if (frame !== 0) cancelAnimationFrame(frame)
            node.dataset.on = "false"
        }
    }, [root, dot, active])
}
