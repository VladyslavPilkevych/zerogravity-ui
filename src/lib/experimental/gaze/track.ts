import { clamp, damp } from "../../internal"

const DEG = Math.PI / 180

/** Eyes aim past the head's limit, but never so far the pupil leaves the socket. */
export const EYE_GAIN = 1.4
export const EYE_LIMIT = 30 * DEG

/** Settled once every axis is this close to where it is going. */
const REST = 0.0005

export interface Aim {
    x: number
    y: number
}

export interface GazeState {
    aim: Aim
    eye: Aim
    head: Aim
}

export function gazeState(): GazeState {
    return { aim: { x: 0, y: 0 }, eye: { x: 0, y: 0 }, head: { x: 0, y: 0 } }
}

/**
 * A point inside the host, 0..1 on both axes, as an aim of -1..1 from the
 * centre. Sensitivity scales the travel; the result is always clamped, so a
 * high sensitivity reaches the limit sooner rather than passing it.
 */
export function aimAt(nx: number, ny: number, sensitivity: number, out: Aim): Aim {
    const gain = clamp(sensitivity, 0.2, 3)
    out.x = clamp((nx - 0.5) * 2 * gain, -1, 1)
    out.y = clamp((ny - 0.5) * 2 * gain, -1, 1)
    return out
}

/**
 * The old per-frame `damping` (0.02..1 of the gap at 60 Hz) as a per-second
 * rate, so the same prop lands the same way at 60 and 120 Hz.
 */
export function rateFor(damping: number): number {
    const ease = clamp(damping, 0.02, 0.98)
    return -Math.log(1 - ease) * 60
}

/**
 * Eyes ease at the full rate, the head at a fraction of it: that lag is what
 * reads as a creature noticing you. Returns true once everything has arrived.
 */
export function stepGaze(
    state: GazeState,
    damping: number,
    headDelay: number,
    dt: number,
): boolean {
    const rate = rateFor(damping)
    const slow = rate * clamp(1 - headDelay, 0.05, 1)
    const { aim, eye, head } = state

    eye.x = damp(eye.x, aim.x, rate, dt)
    eye.y = damp(eye.y, aim.y, rate, dt)
    head.x = damp(head.x, aim.x, slow, dt)
    head.y = damp(head.y, aim.y, slow, dt)

    return (
        Math.abs(aim.x - eye.x) < REST &&
        Math.abs(aim.y - eye.y) < REST &&
        Math.abs(aim.x - head.x) < REST &&
        Math.abs(aim.y - head.y) < REST
    )
}

/** Head angles in radians, never past the configured limits. */
export function headAngles(at: Aim, maxYaw: number, maxPitch: number, out: Aim): Aim {
    const yaw = clamp(maxYaw, 0, 90) * DEG
    const pitch = clamp(maxPitch, 0, 90) * DEG
    out.x = clamp(at.x, -1, 1) * yaw
    out.y = clamp(at.y, -1, 1) * pitch
    return out
}

/**
 * Eye angles relative to the head they sit in. The eyes aim at the target in
 * the world, so they swing out first and drift back as the head catches up,
 * which is what makes the lead visible. Capped so the pupil stays in view.
 */
export function eyeAngles(at: Aim, head: Aim, maxYaw: number, maxPitch: number, out: Aim): Aim {
    headAngles(at, maxYaw, maxPitch, out)
    out.x = clamp(out.x * EYE_GAIN - head.x, -EYE_LIMIT, EYE_LIMIT)
    out.y = clamp(out.y * EYE_GAIN - head.y, -EYE_LIMIT, EYE_LIMIT)
    return out
}
