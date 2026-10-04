/**
 * Pointer coordinates in an element's own space, without measuring on every
 * move. The rect is read once and invalidated by scroll and resize, which is
 * what keeps a pointer hot path free of layout reads.
 */
export interface PointerBox {
    /** 0..1 inside the element; null while the element has no size */
    at(event: { clientX: number; clientY: number }): { x: number; y: number } | null
    /** the same point in CSS pixels */
    px(event: { clientX: number; clientY: number }): { x: number; y: number } | null
    size(): { width: number; height: number }
    invalidate(): void
    dispose(): void
}

export function pointerBox(element: HTMLElement): PointerBox {
    let rect: DOMRect | null = null

    const read = () => {
        if (!rect) rect = element.getBoundingClientRect()
        return rect
    }

    const invalidate = () => {
        rect = null
    }

    if (typeof window !== "undefined") {
        window.addEventListener("resize", invalidate)
        window.addEventListener("scroll", invalidate, { passive: true, capture: true })
    }

    return {
        at(event) {
            const box = read()
            if (box.width === 0 || box.height === 0) return null
            return {
                x: (event.clientX - box.left) / box.width,
                y: (event.clientY - box.top) / box.height,
            }
        },
        px(event) {
            const box = read()
            if (box.width === 0 || box.height === 0) return null
            return { x: event.clientX - box.left, y: event.clientY - box.top }
        },
        size() {
            const box = read()
            return { width: box.width, height: box.height }
        },
        invalidate,
        dispose() {
            if (typeof window === "undefined") return
            window.removeEventListener("resize", invalidate)
            window.removeEventListener("scroll", invalidate, { capture: true })
        },
    }
}
