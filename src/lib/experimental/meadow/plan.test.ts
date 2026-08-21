import { describe, expect, it, vi } from "vitest"

import { MEADOW_CAST } from "./art"
import { MEADOW_DENSITY, planCast, type MeadowSpec } from "./plan"

const SPECS: MeadowSpec[] = [
    { motion: "bob", x: 12, y: 24, size: 90, depth: 0.8 },
    { motion: "float", x: 86, y: 44, size: 64, depth: 0.7 },
    { motion: "flit", x: 24, y: 68, size: 52 },
    { motion: "glide", x: 0, y: 14, size: 44 },
]

describe("planCast", () => {
    it("plans one entry per requested character", () => {
        expect(planCast(SPECS, 2, 5)).toHaveLength(2)
        expect(planCast(SPECS, 4, 5)).toHaveLength(4)
        expect(planCast(SPECS, 0, 5)).toHaveLength(0)
        expect(planCast([], 4, 5)).toHaveLength(0)
    })

    it("never asks for more characters than the cast holds", () => {
        expect(planCast(SPECS, 40, 5)).toHaveLength(4)
    })

    it("is deterministic for a given seed", () => {
        expect(planCast(SPECS, 4, 5)).toEqual(planCast(SPECS, 4, 5))
    })

    it("retimes the scene for a different seed without moving anyone", () => {
        const first = planCast(SPECS, 4, 5)
        const second = planCast(SPECS, 4, 9)

        expect(second.map((entry) => [entry.x, entry.y])).toEqual(
            first.map((entry) => [entry.x, entry.y]),
        )
        expect(second.map((entry) => entry.duration)).not.toEqual(
            first.map((entry) => entry.duration),
        )
    })

    it("never calls the global random source", () => {
        const random = vi.spyOn(Math, "random")

        planCast(SPECS, 4, 5)

        expect(random).not.toHaveBeenCalled()
        random.mockRestore()
    })

    it("keeps the characters already on stage when the density grows", () => {
        expect(planCast(SPECS, 4, 5).slice(0, 2)).toEqual(planCast(SPECS, 2, 5))
    })

    it("gives everyone a different rhythm so nothing moves in lockstep", () => {
        const entries = planCast(SPECS, 4, 5)
        const beats = entries.map((entry) => entry.duration)

        expect(new Set(beats).size).toBe(4)
        for (const entry of entries) {
            expect(entry.delay).toBeLessThanOrEqual(0)
            expect(entry.duration).toBeGreaterThan(0)
        }
    })

    it("scales a character with its depth", () => {
        const [near] = planCast([{ motion: "bob", x: 0, y: 0, size: 100, depth: 1 }], 1, 5)
        const [far] = planCast([{ motion: "bob", x: 0, y: 0, size: 100, depth: 0 }], 1, 5)

        expect(near.size).toBeGreaterThan(far.size)
    })

    it("gives glide characters a resting spot inside the frame", () => {
        for (const entry of planCast(MEADOW_CAST, MEADOW_CAST.length, 5)) {
            expect(entry.rest).toBeGreaterThan(0)
            expect(entry.rest).toBeLessThan(100)
        }
    })
})

describe("the built-in cast", () => {
    it("stays clear of the central reading area", () => {
        for (const [index, member] of MEADOW_CAST.entries()) {
            const asideX = member.x <= 30 || member.x >= 70
            const asideY = member.y <= 25 || member.y >= 75
            expect(asideX || asideY, `cast member ${index} at ${member.x},${member.y}`).toBe(true)
        }
    })

    it("moves to the corners on narrow screens, where copy fills the middle", () => {
        for (const [index, member] of MEADOW_CAST.entries()) {
            if (!member.compact) continue
            const spot = member.compact
            expect(spot.y <= 12 || spot.y >= 82, `compact member ${index} at y ${spot.y}`).toBe(
                true,
            )
        }
    })

    it("uses the compact arrangement only when asked", () => {
        const wide = planCast(MEADOW_CAST, 3, 5, false)
        const narrow = planCast(MEADOW_CAST, 3, 5, true)

        expect(narrow.map((entry) => entry.y)).not.toEqual(wide.map((entry) => entry.y))
        for (const entry of narrow) {
            expect(entry.y <= 12 || entry.y >= 82).toBe(true)
        }
    })

    it("shrinks the cast on narrow screens", () => {
        const wide = planCast(MEADOW_CAST, 3, 5, false)
        const narrow = planCast(MEADOW_CAST, 3, 5, true)

        for (let index = 0; index < wide.length; index += 1) {
            expect(narrow[index].size).toBeLessThan(wide[index].size)
        }
    })

    it("swings every horizontal wander away from the centre", () => {
        for (const entry of planCast(MEADOW_CAST, MEADOW_CAST.length, 5)) {
            expect(entry.swing).toBe(entry.x < 50 ? -1 : 1)
        }
    })

    it("balances the stage at every density", () => {
        for (const count of Object.values(MEADOW_DENSITY)) {
            const cast = planCast(MEADOW_CAST, count, 5)
            const left = cast.filter((entry) => entry.x < 50 && entry.motion !== "glide")
            const right = cast.filter((entry) => entry.x > 50 && entry.motion !== "glide")

            expect(Math.abs(left.length - right.length)).toBeLessThanOrEqual(1)
        }
    })

    it("mixes several motion styles rather than repeating one", () => {
        const cast = planCast(MEADOW_CAST, MEADOW_DENSITY.cosy, 5)

        expect(new Set(cast.map((entry) => entry.motion)).size).toBeGreaterThanOrEqual(3)
    })

    it("keeps the cast small enough to stay calm", () => {
        expect(MEADOW_DENSITY.calm).toBeLessThanOrEqual(3)
        expect(MEADOW_DENSITY.lively).toBeLessThanOrEqual(7)
    })
})
