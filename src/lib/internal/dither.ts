/**
 * Ordered dithering on a 4×4 Bayer matrix. A fade drawn through it breaks into
 * a fixed pattern of whole cells instead of a soft gradient, which is what keeps
 * a pixel effect pixel-edged while it fades.
 */
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

/** The threshold for one cell, strictly between 0 and 1 */
export function bayer4(column: number, row: number): number {
    return (BAYER_4[(row & 3) * 4 + (column & 3)] + 0.5) / 16
}

/** Snaps 0..1 onto `steps` even levels; anything outside is clamped first */
export function quantize(value: number, steps: number): number {
    const levels = Math.max(1, Math.round(steps))
    const clamped = value < 0 ? 0 : value > 1 ? 1 : value
    return Math.round(clamped * levels) / levels
}
