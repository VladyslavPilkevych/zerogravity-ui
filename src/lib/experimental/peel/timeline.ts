import { clamp, finite, pinProgress, smoothstep, type PinPhase } from "../../internal"

export interface PeelTiming {
    lead: number
    travel: number
    hold: number
}

export const PEEL_TIMING: PeelTiming = { lead: 0.25, travel: 1.5, hold: 0.5 }

export function peelTiming(lead: unknown, travel: unknown, hold: unknown): PeelTiming {
    return {
        lead: clamp(finite(lead, PEEL_TIMING.lead), 0, 3),
        travel: clamp(finite(travel, PEEL_TIMING.travel), 0.2, 5),
        hold: clamp(finite(hold, PEEL_TIMING.hold), 0, 3),
    }
}

export interface PeelState {
    phase: PinPhase
    lift: number
}

/** `scrolled` is how far the track has gone past its pin point, `stage` its pinned height. */
export function peelState(scrolled: number, stage: number, timing: PeelTiming): PeelState {
    const { phase, progress } = pinProgress(scrolled / Math.max(1, stage), timing)
    return { phase, lift: smoothstep(progress) }
}
