"use client"

import { useEffect, useState, type RefObject } from "react"

export interface EdgeBox {
    /** Corner radius the stroke and the content can agree on. */
    r: number
    w: number
    h: number
}

/**
 * SVG clamps rx and ry independently while CSS clamps a border radius to the
 * shorter side, so the stroke and the content would disagree on a pill. The
 * measured size also anchors the sheets, which have to sit on an edge rather
 * than at a percentage. The observer reports the first size on its own, which
 * is what sets the value.
 */
export function useEdgeBox(root: RefObject<HTMLElement | null>, radius: number): EdgeBox {
    const [box, setBox] = useState<EdgeBox>({ r: radius, w: 0, h: 0 })

    useEffect(() => {
        const node = root.current
        if (!node || typeof ResizeObserver !== "function") return

        const watcher = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            const limit = Math.min(width, height) / 2

            setBox({
                r: limit > 0 ? Math.min(radius, limit) : radius,
                w: width,
                h: height,
            })
        })

        watcher.observe(node)
        return () => watcher.disconnect()
    }, [root, radius])

    return box
}
