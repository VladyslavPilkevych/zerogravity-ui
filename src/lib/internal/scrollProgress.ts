import { clamp01 } from "./num"
import type { ScrollPort } from "./scrollPort"
import { wakeLoop } from "./wakeLoop"

/**
 * Where `value` sits inside `[start, start + length]`, as 0 to 1. A range of no
 * length is a step, so a zero-length transition still completes.
 */
export function rangeProgress(value: number, start: number, length: number): number {
    if (!(length > 0)) return value >= start ? 1 : 0
    return clamp01((value - start) / length)
}

export function smoothstep(value: number): number {
    const t = clamp01(value)
    return t * t * (3 - 2 * t)
}

export type PinPhase = "before" | "moving" | "holding" | "after"

export interface PinTimeline {
    /** scroll spent pinned before the transition starts */
    lead: number
    /** scroll the transition itself takes */
    travel: number
    /** scroll spent pinned on the finished state before release */
    hold: number
}

export interface PinState {
    phase: PinPhase
    progress: number
}

/**
 * Maps how far a pinned stage has been scrolled past its pin point onto the
 * lead, travel and hold of its timeline. Every length is in the same unit.
 */
export function pinProgress(offset: number, { lead, travel, hold }: PinTimeline): PinState {
    const progress = rangeProgress(offset, lead, travel)

    if (offset < lead) return { phase: "before", progress: 0 }
    if (offset < lead + travel) return { phase: "moving", progress }
    if (offset <= lead + travel + hold) return { phase: "holding", progress: 1 }
    return { phase: "after", progress: 1 }
}

export interface ScrollDriver {
    /** run a frame now-ish, as if the port had scrolled */
    wake(): void
    dispose(): void
}

/**
 * Runs `step` on the shared frame clock after a scroll or resize, and keeps
 * running it for as long as it returns true, so smoothing can land after the
 * last scroll event. A burst of events costs one frame; a settled step costs
 * nothing.
 */
export function driveScroll(port: ScrollPort, step: (dt: number) => boolean): ScrollDriver {
    const loop = wakeLoop((dt) => step(dt))
    const wake = () => loop.wake()

    port.target.addEventListener("scroll", wake, { passive: true })
    if (typeof window !== "undefined") window.addEventListener("resize", wake)

    return {
        wake,
        dispose() {
            port.target.removeEventListener("scroll", wake)
            if (typeof window !== "undefined") window.removeEventListener("resize", wake)
            loop.sleep()
        },
    }
}
