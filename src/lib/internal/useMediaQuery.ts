"use client"

import { useCallback, useSyncExternalStore } from "react"

function canMatch(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
}

export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onChange: () => void) => {
            if (!canMatch()) return () => {}

            const list = window.matchMedia(query)

            if (typeof list.addEventListener === "function") {
                list.addEventListener("change", onChange)
                return () => list.removeEventListener("change", onChange)
            }

            list.addListener(onChange)
            return () => list.removeListener(onChange)
        },
        [query],
    )

    const getSnapshot = useCallback(() => canMatch() && window.matchMedia(query).matches, [query])

    return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function usePrefersReducedMotion(): boolean {
    return useMediaQuery("(prefers-reduced-motion: reduce)")
}
