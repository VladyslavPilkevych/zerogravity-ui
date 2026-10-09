import { smoothstep } from "../internal"

/**
 * How a pointer position across the print becomes what the lens shows. The
 * outer fifths are owned outright by one picture; only the middle band
 * interlaces, eased with a smoothstep so the handover never snaps.
 */
export const LENS_HOLD = 0.2

export interface LensState {
    /** share of the second picture, 0 to 1 */
    mix: number
    /** fraction of each strip the first picture keeps */
    open: number
    /** how opaque the first picture's gaps are; 1 leaves no seams at all */
    hold: number
    /** the first picture's overall opacity */
    front: number
    /** how strongly the lens ribbing shows, strongest mid-swap */
    ribs: number
}

function band(from: number, to: number, value: number): number {
    return smoothstep((value - from) / (to - from))
}

export function lensMix(position: number): number {
    const x = Number.isFinite(position) ? position : 0.5
    return band(LENS_HOLD, 1 - LENS_HOLD, x)
}

export function lensState(position: number): LensState {
    const mix = lensMix(position)
    return {
        mix,
        open: 1 - mix,
        hold: 1 - band(0, 0.12, mix),
        front: 1 - band(0.88, 1, mix),
        ribs: 0.3 + 0.7 * 4 * mix * (1 - mix),
    }
}

/** How much of the first picture is visible at a position, 0 to 1. */
export function lensShare(position: number): number {
    const { open, hold, front } = lensState(position)
    return front * (open + (1 - open) * hold)
}
