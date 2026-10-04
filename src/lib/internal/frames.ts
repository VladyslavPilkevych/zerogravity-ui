/**
 * One rAF loop for the whole page. Every animated component subscribes to it
 * instead of starting a loop of its own, so ten effects on one screen still
 * cost one callback per frame. The loop starts with the first subscriber, stops
 * with the last, and holds while the tab is hidden.
 */
export type FrameTick = (dt: number, now: number) => void

const FRAME_CAP = 0.05

const ticks = new Set<FrameTick>()
let handle = 0
let last = 0
let watching = false

function stop(): void {
    if (handle !== 0) cancelAnimationFrame(handle)
    handle = 0
    last = 0
}

function run(now: number): void {
    handle = requestAnimationFrame(run)
    const dt = last === 0 ? 0.016 : Math.min((now - last) / 1000, FRAME_CAP)
    last = now

    // a copy, so unsubscribing inside a tick cannot skip the next one
    for (const tick of [...ticks]) tick(dt, now)
}

function start(): void {
    if (handle !== 0 || ticks.size === 0) return
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return
    last = 0
    handle = requestAnimationFrame(run)
}

function onVisibility(): void {
    if (document.visibilityState === "hidden") stop()
    else start()
}

export function onFrame(tick: FrameTick): () => void {
    if (typeof requestAnimationFrame !== "function") return () => {}

    ticks.add(tick)

    if (!watching && typeof document !== "undefined") {
        document.addEventListener("visibilitychange", onVisibility)
        watching = true
    }
    start()

    return () => {
        ticks.delete(tick)
        if (ticks.size > 0) return
        stop()
        if (watching && typeof document !== "undefined") {
            document.removeEventListener("visibilitychange", onVisibility)
            watching = false
        }
    }
}

/** Test seam: how many subscribers the shared loop is currently driving. */
export function frameCount(): number {
    return ticks.size
}
