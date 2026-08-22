export interface MediaState {
    fine: boolean
    reducedMotion: boolean
    narrow: boolean
}

export const mediaState: MediaState = { fine: true, reducedMotion: false, narrow: false }

export function resetMediaState(): void {
    mediaState.fine = true
    mediaState.reducedMotion = false
    mediaState.narrow = false
}

class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

class IntersectionObserverStub {
    readonly root = null
    readonly rootMargin = ""
    readonly thresholds: readonly number[] = []
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
        return []
    }
}

function matchesQuery(query: string): boolean {
    if (query.includes("pointer: fine")) return mediaState.fine
    if (query.includes("prefers-reduced-motion")) return mediaState.reducedMotion
    if (query.includes("max-width")) return mediaState.narrow
    return false
}

export function installBrowserStubs(): void {
    if (!("ResizeObserver" in globalThis)) {
        Object.defineProperty(globalThis, "ResizeObserver", {
            writable: true,
            value: ResizeObserverStub,
        })
    }

    if (!("IntersectionObserver" in globalThis)) {
        Object.defineProperty(globalThis, "IntersectionObserver", {
            writable: true,
            value: IntersectionObserverStub,
        })
    }

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string): MediaQueryList =>
            ({
                media: query,
                get matches() {
                    return matchesQuery(query)
                },
                onchange: null,
                addEventListener: () => {},
                removeEventListener: () => {},
                addListener: () => {},
                removeListener: () => {},
                dispatchEvent: () => false,
            }) as unknown as MediaQueryList,
    })
}
