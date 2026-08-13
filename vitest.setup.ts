import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

if (!("ResizeObserver" in globalThis)) {
    Object.defineProperty(globalThis, "ResizeObserver", {
        writable: true,
        value: ResizeObserverStub,
    })
}

export interface MediaState {
    fine: boolean
    reducedMotion: boolean
}

export const mediaState: MediaState = { fine: true, reducedMotion: false }

function matches(query: string): boolean {
    if (query.includes("pointer: fine")) return mediaState.fine
    if (query.includes("prefers-reduced-motion")) return mediaState.reducedMotion
    return false
}

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        media: query,
        get matches() {
            return matches(query)
        },
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }),
})

afterEach(() => {
    cleanup()
    mediaState.fine = true
    mediaState.reducedMotion = false
    vi.restoreAllMocks()
})
