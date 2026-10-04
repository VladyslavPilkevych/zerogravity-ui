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

export function onVisible(element: Element, run: (visible: boolean) => void): () => void {
    if (typeof IntersectionObserver !== "function") return () => {}
    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[entries.length - 1]
            if (entry) run(entry.isIntersecting)
        },
        { threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
}
