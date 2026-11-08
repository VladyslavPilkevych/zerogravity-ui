import { act } from "@testing-library/react"

export interface FakeIntersection {
    options: IntersectionObserverInit | undefined
    targets: Element[]
    disconnected: boolean
}

export interface IntersectionHarness {
    readonly observers: FakeIntersection[]
    /** observers still connected */
    live(): FakeIntersection[]
    /** report every live observer's targets as in or out of view */
    report(visible: boolean): void
    restore(): void
}

export function installIntersectionHarness(): IntersectionHarness {
    const original = globalThis.IntersectionObserver
    const observers: (FakeIntersection & { callback: IntersectionObserverCallback })[] = []

    globalThis.IntersectionObserver = class {
        record: (typeof observers)[number]
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            this.record = { callback, options, targets: [], disconnected: false }
            observers.push(this.record)
        }
        observe(target: Element) {
            this.record.targets.push(target)
        }
        unobserve() {}
        disconnect() {
            this.record.disconnected = true
        }
        takeRecords() {
            return []
        }
    } as unknown as typeof IntersectionObserver

    const live = () => observers.filter((observer) => !observer.disconnected)

    return {
        observers,
        live,
        report(visible) {
            act(() => {
                for (const observer of live()) {
                    const entries = observer.targets.map(
                        (target) =>
                            ({ target, isIntersecting: visible }) as IntersectionObserverEntry,
                    )
                    observer.callback(entries, observer as unknown as IntersectionObserver)
                }
            })
        },
        restore() {
            globalThis.IntersectionObserver = original
        },
    }
}
