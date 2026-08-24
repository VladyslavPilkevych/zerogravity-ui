/**
 * The window and a scrollable element answer the same three questions, so a
 * scroll-driven component can read either without knowing which it has.
 */
export interface ScrollPort {
    /** how far the port has scrolled */
    scroll(): number
    /** the visible height of the port */
    height(): number
    /** top of an element relative to the port's visible box */
    top(element: Element): number
    /** where scroll and resize events come from */
    target: EventTarget
}

const WINDOW_PORT: ScrollPort = {
    scroll: () => window.scrollY,
    height: () => window.innerHeight,
    top: (element) => element.getBoundingClientRect().top,
    target: typeof window === "undefined" ? ({} as EventTarget) : window,
}

export function scrollPort(container?: Element | null): ScrollPort {
    if (!container) return WINDOW_PORT

    return {
        scroll: () => container.scrollTop,
        height: () => container.clientHeight,
        top: (element) =>
            element.getBoundingClientRect().top - container.getBoundingClientRect().top,
        target: container,
    }
}
