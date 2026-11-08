/**
 * Resize and visibility, guarded for environments without the observers and
 * always returning a disposer, so a component's cleanup is one call either way.
 */
export function onResize(element: Element, run: () => void): () => void {
    if (typeof ResizeObserver !== "function") return () => {}
    const observer = new ResizeObserver(run)
    observer.observe(element)
    return () => observer.disconnect()
}

export interface VisibleOptions {
    rootMargin?: string
    threshold?: number
}

export function onVisible(
    element: Element,
    run: (visible: boolean) => void,
    { rootMargin, threshold = 0 }: VisibleOptions = {},
): () => void {
    if (typeof IntersectionObserver !== "function") return () => {}
    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[entries.length - 1]
            if (entry) run(entry.isIntersecting)
        },
        { rootMargin, threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
}

export const OFFSCREEN_ATTRIBUTE = "data-zg-offscreen"

/**
 * Marks an element while it is out of view, so `offscreen.css` can hold every
 * CSS animation inside it, pseudo-elements included. The mark is removed on
 * dispose, so a remount never inherits a stale paused state.
 */
export function pauseOffscreen(element: Element): () => void {
    const stop = onVisible(element, (visible) => {
        element.toggleAttribute(OFFSCREEN_ATTRIBUTE, !visible)
    })

    return () => {
        stop()
        element.removeAttribute(OFFSCREEN_ATTRIBUTE)
    }
}
