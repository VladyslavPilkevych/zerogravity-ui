/**
 * Calendar days as whole numbers: days since 1970-01-01 on the civil calendar.
 * Arithmetic on them never meets a DST gap, because no wall clock is involved
 * until a day is turned back into a Date for the consumer.
 */
export type Day = number

const DAY_MS = 86_400_000

export interface Civil {
    year: number
    month: number
    day: number
    weekday: number
}

export interface Zoned {
    day: Day
    minutes: number
}

export function dayFrom(year: number, month: number, day: number): Day {
    return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS)
}

export function civil(day: Day): Civil {
    const date = new Date(day * DAY_MS)
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        weekday: date.getUTCDay(),
    }
}

const zoneFormats = new Map<string, Intl.DateTimeFormat>()

function zoneFormat(timeZone: string): Intl.DateTimeFormat {
    let format = zoneFormats.get(timeZone)
    if (!format) {
        format = new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hourCycle: "h23",
        })
        zoneFormats.set(timeZone, format)
    }
    return format
}

/** The calendar day and minutes past midnight of an instant, on a zone's wall clock. */
export function zoned(date: Date, timeZone?: string): Zoned {
    if (!timeZone) {
        return {
            day: dayFrom(date.getFullYear(), date.getMonth() + 1, date.getDate()),
            minutes: date.getHours() * 60 + date.getMinutes(),
        }
    }
    const parts: Record<string, number> = {}
    for (const part of zoneFormat(timeZone).formatToParts(date)) {
        if (part.type !== "literal") parts[part.type] = Number(part.value)
    }
    return {
        day: dayFrom(parts.year, parts.month, parts.day),
        minutes: (parts.hour % 24) * 60 + parts.minute,
    }
}

/** Local midnight of a calendar day: the Date handed back to consumers. */
export function toDate(day: Day): Date {
    const { year, month, day: date } = civil(day)
    return new Date(year, month - 1, date)
}

export function weekStart(day: Day, weekStartsOn: number): Day {
    return day - ((civil(day).weekday - weekStartsOn + 7) % 7)
}

export function monthStart(day: Day): Day {
    const { year, month } = civil(day)
    return dayFrom(year, month, 1)
}

/** The same day of another month, clamped to that month's length. */
export function addMonths(day: Day, months: number): Day {
    const { year, month, day: date } = civil(day)
    const target = new Date(Date.UTC(year, month - 1 + months, 1))
    const length = new Date(
        Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
    ).getUTCDate()
    return dayFrom(target.getUTCFullYear(), target.getUTCMonth() + 1, Math.min(date, length))
}

/** Six full weeks around a month, so the grid never changes height between months. */
export function monthGrid(day: Day, weekStartsOn: number): Day[] {
    const first = weekStart(monthStart(day), weekStartsOn)
    return Array.from({ length: 42 }, (_, index) => first + index)
}

export function sameMonth(a: Day, b: Day): boolean {
    const x = civil(a)
    const y = civil(b)
    return x.year === y.year && x.month === y.month
}

/** "YYYY-MM-DD", for keys and data attributes. */
export function iso(day: Day): string {
    const { year, month, day: date } = civil(day)
    return `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`
}
