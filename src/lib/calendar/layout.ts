import type { Day } from "./dates"
import { zoned } from "./dates"

export interface CalendarItemBase {
    id: string
    title: string
    start: Date
    end: Date
    allDay?: boolean
}

/** An item reduced to calendar coordinates, computed once per items array. */
export interface Placed<T extends CalendarItemBase> {
    item: T
    startDay: Day
    startMinutes: number
    /** last day the item touches, inclusive */
    endDay: Day
    endMinutes: number
    /** belongs in the all-day row: flagged all-day, or a day or longer */
    banner: boolean
}

const DAY_MS = 86_400_000

export function place<T extends CalendarItemBase>(
    items: readonly T[],
    timeZone?: string,
): Placed<T>[] {
    const placed: Placed<T>[] = []
    for (const item of items) {
        const start = item.start.getTime()
        const end = Math.max(item.end.getTime(), start)
        if (!Number.isFinite(start) || !Number.isFinite(end)) continue
        const from = zoned(item.start, timeZone)
        const last = end > start ? zoned(new Date(end - 1), timeZone) : from
        const to = zoned(new Date(end), timeZone)
        placed.push({
            item,
            startDay: from.day,
            startMinutes: from.minutes,
            endDay: last.day,
            endMinutes: to.day === last.day ? to.minutes : 1440,
            banner: Boolean(item.allDay) || end - start >= DAY_MS,
        })
    }
    return placed
}

export function onDay<T extends CalendarItemBase>(item: Placed<T>, day: Day): boolean {
    return item.startDay <= day && item.endDay >= day
}

/** Banners first, then earlier starts, longer before shorter, then by title. */
export function compareItems<T extends CalendarItemBase>(a: Placed<T>, b: Placed<T>): number {
    if (a.banner !== b.banner) return a.banner ? -1 : 1
    const start = a.item.start.getTime() - b.item.start.getTime()
    if (start !== 0) return start
    const length =
        b.item.end.getTime() -
        b.item.start.getTime() -
        (a.item.end.getTime() - a.item.start.getTime())
    if (length !== 0) return length
    return a.item.title.localeCompare(b.item.title) || a.item.id.localeCompare(b.item.id)
}

export interface Segment {
    id: string
    /** minutes past midnight on this day */
    from: number
    to: number
}

export interface Slot {
    id: string
    from: number
    to: number
    /** 0-based column inside its overlap group */
    column: number
    /** columns in the group */
    columns: number
    /** columns this item may stretch across without covering another */
    span: number
}

/** The part of a timed item that falls on one day, in minutes past midnight. */
export function segmentOn<T extends CalendarItemBase>(item: Placed<T>, day: Day): Segment | null {
    if (item.banner || !onDay(item, day)) return null
    const from = item.startDay === day ? item.startMinutes : 0
    const to = item.endDay === day ? item.endMinutes : 1440
    return { id: item.item.id, from, to: Math.max(to, from) }
}

/**
 * Side-by-side columns for overlapping timed segments. Items that touch end to
 * start do not overlap. Every item is drawn at least `minLength` minutes tall,
 * and that drawn length is what counts for overlap, so a five-minute item never
 * hides under its neighbour. Groups are chains of overlap: an item joins the
 * first column whose last item has ended, and after a group closes each item
 * stretches right into columns that stay free beside it.
 */
export function layoutSegments(segments: readonly Segment[], minLength = 0): Slot[] {
    const sorted = [...segments]
        .map((segment) => ({ ...segment, drawnTo: Math.max(segment.to, segment.from + minLength) }))
        .sort((a, b) => a.from - b.from || b.drawnTo - a.drawnTo || a.id.localeCompare(b.id))

    const slots: Slot[] = []
    let group: { segment: (typeof sorted)[number]; column: number }[] = []
    let columnEnds: number[] = []
    let groupEnd = -Infinity

    const close = () => {
        const columns = columnEnds.length
        for (const entry of group) {
            let span = 1
            for (let next = entry.column + 1; next < columns; next++) {
                const blocked = group.some(
                    (other) =>
                        other.column === next &&
                        other.segment.from < entry.segment.drawnTo &&
                        entry.segment.from < other.segment.drawnTo,
                )
                if (blocked) break
                span++
            }
            slots.push({
                id: entry.segment.id,
                from: entry.segment.from,
                to: entry.segment.to,
                column: entry.column,
                columns,
                span,
            })
        }
        group = []
        columnEnds = []
        groupEnd = -Infinity
    }

    for (const segment of sorted) {
        if (segment.from >= groupEnd && group.length) close()
        let column = columnEnds.findIndex((end) => end <= segment.from)
        if (column === -1) {
            column = columnEnds.length
            columnEnds.push(segment.drawnTo)
        } else {
            columnEnds[column] = segment.drawnTo
        }
        group.push({ segment, column })
        groupEnd = Math.max(groupEnd, segment.drawnTo)
    }
    if (group.length) close()

    return slots
}
