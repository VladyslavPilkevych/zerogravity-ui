/** Small numeric helpers shared by anything that animates or clamps input. */

export function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

export function clamp01(value: number): number {
    return clamp(value, 0, 1)
}

export function mix(from: number, to: number, amount: number): number {
    return from + (to - from) * amount
}

/**
 * Frame-rate independent easing. `rate` is roughly how much of the gap is
 * closed per second, so the same motion lands the same way at 60 and 120 Hz.
 */
export function damp(current: number, target: number, rate: number, dt: number): number {
    return mix(target, current, Math.exp(-rate * dt))
}

/** A finite number, or the fallback. Guards every public numeric prop. */
export function finite(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}
