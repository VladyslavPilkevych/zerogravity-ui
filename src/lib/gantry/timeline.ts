import {
    clamp,
    finite,
    mix,
    pinProgress,
    rangeProgress,
    smoothstep,
    type PinPhase,
} from "../internal"

export type GantryEasing = "smooth" | "linear"

export interface GantryTiming {
    pace: number
    transition: number
    hold: number
    easing: GantryEasing
}

export const GANTRY_TIMING: GantryTiming = {
    pace: 0.7,
    transition: 0.55,
    hold: 0.4,
    easing: "smooth",
}

export function gantryTiming(
    pace: unknown,
    transition: unknown,
    hold: unknown,
    easing: unknown,
): GantryTiming {
    return {
        pace: clamp(finite(pace, GANTRY_TIMING.pace), 0.2, 3),
        transition: clamp(finite(transition, GANTRY_TIMING.transition), 0.1, 1),
        hold: clamp(finite(hold, GANTRY_TIMING.hold), 0, 3),
        easing: easing === "linear" ? "linear" : "smooth",
    }
}

export interface GantryState {
    phase: PinPhase
    /** which stop the rail is at, fractional while it moves between two */
    position: number
}

/**
 * Each stop gets `pace` stage heights of scroll: the rail rests for part of it
 * and moves for the `transition` share, centred, so the first and last stop
 * rest too. `scrolled` is how far the track has gone past its pin point.
 */
export function gantryState(
    scrolled: number,
    stage: number,
    steps: number,
    timing: GantryTiming,
): GantryState {
    const { phase, progress } = pinProgress(scrolled / Math.max(1, stage), {
        lead: 0,
        travel: steps * timing.pace,
        hold: timing.hold,
    })
    if (steps <= 0) return { phase, position: 0 }

    const along = progress * steps
    const index = Math.min(Math.floor(along), steps - 1)
    const rest = (1 - timing.transition) / 2
    const local = rangeProgress(along - index, rest, timing.transition)

    return {
        phase,
        position: index + (timing.easing === "smooth" ? smoothstep(local) : local),
    }
}

/** Pixel offset of the rail at a (fractional) stop. */
export function railOffset(position: number, stops: readonly number[]): number {
    if (stops.length === 0) return 0
    const last = stops.length - 1
    const at = clamp(position, 0, last)
    const index = Math.min(Math.floor(at), Math.max(0, last - 1))
    return mix(stops[index], stops[Math.min(index + 1, last)], at - index)
}

/**
 * The offsets at which each car lines up with the start of the window, cut
 * off where the rail runs out, so the last stop is the end of the rail. A
 * last step shorter than half a car is folded into the one before it, so no
 * stop costs a full `pace` for a nudge.
 */
export function railStops(lefts: readonly number[], distance: number): number[] {
    const stops = [0]
    const base = lefts[0] ?? 0
    const pitch = lefts.length > 1 ? lefts[1] - base : distance

    for (const left of lefts) {
        const stop = Math.min(left - base, distance)
        if (stop > stops[stops.length - 1] + 1) stops.push(stop)
    }

    if (distance > stops[stops.length - 1] + 1) stops.push(distance)

    const last = stops.length - 1
    if (last >= 2 && stops[last] - stops[last - 1] < pitch / 2) stops.splice(last - 1, 1)
    return stops
}
