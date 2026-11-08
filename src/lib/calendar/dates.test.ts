import { describe, expect, it } from "vitest"

import {
    addMonths,
    civil,
    dayFrom,
    iso,
    monthGrid,
    sameMonth,
    toDate,
    weekStart,
    zoned,
} from "./dates"

describe("calendar dates", () => {
    it("round-trips civil dates, leap days included", () => {
        const leap = dayFrom(2028, 2, 29)
        expect(civil(leap)).toMatchObject({ year: 2028, month: 2, day: 29 })
        expect(iso(leap + 1)).toBe("2028-03-01")
        expect(iso(dayFrom(2027, 2, 28) + 1)).toBe("2027-03-01")
    })

    it("adds months clamped to the target month's length", () => {
        expect(iso(addMonths(dayFrom(2026, 1, 31), 1))).toBe("2026-02-28")
        expect(iso(addMonths(dayFrom(2028, 1, 31), 1))).toBe("2028-02-29")
        expect(iso(addMonths(dayFrom(2026, 12, 15), 1))).toBe("2027-01-15")
        expect(iso(addMonths(dayFrom(2026, 1, 15), -1))).toBe("2025-12-15")
    })

    it("finds the week start for any first weekday", () => {
        const thursday = dayFrom(2026, 3, 12)
        expect(iso(weekStart(thursday, 1))).toBe("2026-03-09")
        expect(iso(weekStart(thursday, 0))).toBe("2026-03-08")
        expect(iso(weekStart(thursday, 6))).toBe("2026-03-07")
    })

    it("lays out six full weeks around a month", () => {
        const grid = monthGrid(dayFrom(2026, 2, 10), 1)
        expect(grid).toHaveLength(42)
        expect(iso(grid[0])).toBe("2026-01-26")
        expect(civil(grid[0]).weekday).toBe(1)
        expect(grid.filter((day) => sameMonth(day, dayFrom(2026, 2, 1)))).toHaveLength(28)
    })

    it("keeps day arithmetic free of DST: consecutive day numbers across a change", () => {
        const before = zoned(new Date(2026, 2, 28, 12))
        const after = zoned(new Date(2026, 2, 30, 12))
        expect(after.day - before.day).toBe(2)
        expect(toDate(before.day).getDate()).toBe(28)
    })

    it("reads the wall clock of another time zone", () => {
        const instant = new Date(Date.UTC(2026, 2, 9, 23, 30))
        expect(zoned(instant, "UTC")).toEqual({ day: dayFrom(2026, 3, 9), minutes: 23 * 60 + 30 })
        expect(zoned(instant, "Asia/Tokyo")).toEqual({
            day: dayFrom(2026, 3, 10),
            minutes: 8 * 60 + 30,
        })
        expect(zoned(instant, "America/Los_Angeles")).toEqual({
            day: dayFrom(2026, 3, 9),
            minutes: 16 * 60 + 30,
        })
    })
})
