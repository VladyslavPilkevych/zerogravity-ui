import { describe, expect, it } from "vitest"

import { dayFrom } from "./dates"
import { compareItems, layoutSegments, place, segmentOn, type Segment } from "./layout"

const at = (h: number, m = 0) => h * 60 + m
const byId = (slots: ReturnType<typeof layoutSegments>) =>
    Object.fromEntries(slots.map((slot) => [slot.id, slot]))

describe("calendar layout", () => {
    it("gives a lone item the full width", () => {
        const [slot] = layoutSegments([{ id: "a", from: at(9), to: at(10) }])
        expect(slot).toMatchObject({ column: 0, columns: 1, span: 1 })
    })

    it("puts partly overlapping items side by side", () => {
        const slots = byId(
            layoutSegments([
                { id: "a", from: at(9), to: at(11) },
                { id: "b", from: at(10), to: at(12) },
            ]),
        )
        expect(slots.a).toMatchObject({ column: 0, columns: 2 })
        expect(slots.b).toMatchObject({ column: 1, columns: 2 })
    })

    it("splits fully overlapping items evenly, longest first", () => {
        const slots = byId(
            layoutSegments([
                { id: "short", from: at(9), to: at(10) },
                { id: "long", from: at(9), to: at(12) },
                { id: "mid", from: at(9), to: at(11) },
            ]),
        )
        expect([slots.long.column, slots.mid.column, slots.short.column]).toEqual([0, 1, 2])
        expect(slots.short.columns).toBe(3)
    })

    it("does not treat touching items as overlapping", () => {
        const slots = byId(
            layoutSegments([
                { id: "a", from: at(9), to: at(10) },
                { id: "b", from: at(10), to: at(11) },
            ]),
        )
        expect(slots.a.columns).toBe(1)
        expect(slots.b.columns).toBe(1)
    })

    it("draws very short items tall enough to keep them out from under a neighbour", () => {
        const slots = byId(
            layoutSegments(
                [
                    { id: "blip", from: at(9), to: at(9, 5) },
                    { id: "next", from: at(9, 10), to: at(10) },
                ],
                30,
            ),
        )
        expect(slots.blip.columns).toBe(2)
        expect(slots.next.column).toBe(1)
    })

    it("lets an item stretch into columns that stay free beside it", () => {
        const slots = byId(
            layoutSegments([
                { id: "a", from: at(9), to: at(12) },
                { id: "b", from: at(9), to: at(10) },
                { id: "c", from: at(9), to: at(10) },
                { id: "d", from: at(10, 30), to: at(11) },
            ]),
        )
        expect(slots.a).toMatchObject({ column: 0, columns: 3, span: 1 })
        expect(slots.d).toMatchObject({ column: 1, span: 2 })
    })

    it("is stable: the same input lays out the same way in any order", () => {
        const input: Segment[] = [
            { id: "x", from: at(9), to: at(10) },
            { id: "y", from: at(9), to: at(10) },
            { id: "z", from: at(9, 30), to: at(11) },
        ]
        expect(byId(layoutSegments([...input].reverse()))).toEqual(byId(layoutSegments(input)))
    })

    it("closes a group once nothing in it is still running", () => {
        const slots = byId(
            layoutSegments([
                { id: "a", from: at(9), to: at(10) },
                { id: "b", from: at(9, 30), to: at(10, 30) },
                { id: "c", from: at(11), to: at(12) },
            ]),
        )
        expect(slots.c).toMatchObject({ column: 0, columns: 1 })
    })

    it("places items on days and splits overnight items into per-day segments", () => {
        const [overnight] = place([
            {
                id: "o",
                title: "Night",
                start: new Date(2026, 2, 9, 22),
                end: new Date(2026, 2, 10, 2),
            },
        ])
        const monday = dayFrom(2026, 3, 9)
        expect(segmentOn(overnight, monday)).toEqual({ id: "o", from: at(22), to: 1440 })
        expect(segmentOn(overnight, monday + 1)).toEqual({ id: "o", from: 0, to: at(2) })
        expect(segmentOn(overnight, monday + 2)).toBeNull()
    })

    it("sends all-day and day-long items to the banner row and treats an all-day end as exclusive", () => {
        const placed = place([
            {
                id: "a",
                title: "Trip",
                start: new Date(2026, 2, 9),
                end: new Date(2026, 2, 11),
                allDay: true,
            },
            {
                id: "b",
                title: "Long",
                start: new Date(2026, 2, 9, 9),
                end: new Date(2026, 2, 10, 9),
            },
            {
                id: "c",
                title: "Short",
                start: new Date(2026, 2, 9, 9),
                end: new Date(2026, 2, 9, 10),
            },
        ])
        expect(placed.map((p) => p.banner)).toEqual([true, true, false])
        expect(placed[0].endDay - placed[0].startDay).toBe(1)
        expect([...placed].sort(compareItems).map((p) => p.item.id)).toEqual(["a", "b", "c"])
    })
})
