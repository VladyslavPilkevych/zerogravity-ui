"use client"

import { useMemo, useState, type ReactNode, type RefObject } from "react"

/** The only copy most previews need: what to do with the pointer. */
export function Hint({ children }: { children: ReactNode }) {
    return (
        <span className="pg-hint" aria-hidden="true">
            {children}
        </span>
    )
}

/**
 * A bounded scroller for the scroll-driven components, so the whole effect can
 * be seen without moving the documentation page.
 */
export function ScrollPort({
    children,
}: {
    children: (ref: RefObject<HTMLDivElement | null>) => ReactNode
}) {
    const [node, setNode] = useState<HTMLDivElement | null>(null)

    // a fresh holder once the element exists, so a child layout effect that read
    // it too early re-runs with the real scroller
    const holder = useMemo(() => ({ current: node }), [node])

    return (
        <div className="pg-port" ref={setNode}>
            {children(holder)}
        </div>
    )
}
