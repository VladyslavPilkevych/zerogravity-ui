import { rangeProgress } from "../internal"

/**
 * How far a card is covered by the one after it. Covering starts when the next
 * card's top reaches the bottom of this card, or the bottom of the viewport if
 * that comes first, and completes when the next card docks.
 */
export function coverProgress(
    nextTop: number,
    stickyTop: number,
    height: number,
    nextSticky: number,
    viewport: number,
): number {
    const start = Math.min(viewport, stickyTop + height)
    return rangeProgress(start - nextTop, 0, start - nextSticky)
}

/**
 * The space a stack needs below its last card. Sticky cards only stay pinned
 * while their container reaches past them, so without this the stack starts to
 * leave the moment the last card docks, and any card taller than the last one
 * is pushed out before it has even arrived.
 */
export function releaseSpace(
    stickyTops: readonly number[],
    heights: readonly number[],
    holdPx: number,
): number {
    const last = heights.length - 1
    if (last < 0) return 0

    let reach = 0
    for (let i = 0; i <= last; i += 1) reach = Math.max(reach, stickyTops[i] + heights[i])

    return Math.max(0, reach - (stickyTops[last] + heights[last])) + Math.max(0, holdPx)
}
