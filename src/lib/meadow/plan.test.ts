import { describe, expect, it, vi } from "vitest"

import { MEADOW_CAST, MEADOW_PLANETS, MEADOW_SPACE_CAST } from "./art"
import { MEADOW_DENSITY, MEADOW_THEMES, planCast, planStars, type MeadowSpec } from "./plan"

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

describe("gliding characters", () => {
    it("cross only the top or the bottom strip, never the copy", () => {
        for (const cast of [MEADOW_CAST, MEADOW_SPACE_CAST]) {
            for (const [index, member] of cast.entries()) {
                if (member.motion !== "glide") continue
                expect(
                    member.y <= 16 || member.y >= 88,
                    `glide member ${index} at y ${member.y}`,
                ).toBe(true)

                const spot = member.compact
                if (spot) {
                    expect(
                        spot.y <= 12 || spot.y >= 88,
                        `compact glide member ${index} at y ${spot.y}`,
                    ).toBe(true)
                }
            }
        }
    })
})

describe("planStars", () => {
    it("hangs the requested number of stars", () => {
        expect(planStars(18, 5)).toHaveLength(18)
        expect(planStars(0, 5)).toHaveLength(0)
    })

    it("is deterministic for a given seed", () => {
        expect(planStars(18, 5)).toEqual(planStars(18, 5))
    })

    it("gives a different sky for a different seed", () => {
        expect(planStars(18, 5)).not.toEqual(planStars(18, 6))
    })

    it("never calls the global random source", () => {
        const random = vi.spyOn(Math, "random")

        planStars(18, 5)

        expect(random).not.toHaveBeenCalled()
        random.mockRestore()
    })

    it("keeps stars in the sky, above the hills, and never twice as bright", () => {
        for (const star of planStars(30, 5)) {
            expect(star.x).toBeGreaterThanOrEqual(2)
            expect(star.x).toBeLessThanOrEqual(98)
            expect(star.y).toBeGreaterThanOrEqual(2)
            expect(star.y).toBeLessThanOrEqual(58)
            expect(star.tone).toBeLessThanOrEqual(0.85)
            expect(star.beat).toBeGreaterThan(2)
        }
    })

    it("keeps the first stars in place when the count grows", () => {
        expect(planStars(18, 5).slice(0, 11)).toEqual(planStars(11, 5))
    })
})

describe("MEADOW_THEMES", () => {
    it("keeps day as the untouched baseline", () => {
        const day = MEADOW_THEMES.day

        expect(day.surface).toBe("")
        expect(day.orb).toBe("sun")
        expect(day.stars).toBe(0)
        expect(day.glow).toBe(false)
        expect(day.quiet).not.toContain("butterflies")
        expect(day.quiet).not.toContain("birds")
        expect(day.forbid).toContain("planets")
    })

    it("gives night a moon, stars and glowing mascots but no birds", () => {
        const night = MEADOW_THEMES.night

        expect(night.orb).toBe("moon")
        expect(night.stars).toBeGreaterThan(0)
        expect(night.glow).toBe(true)
        expect(night.quiet).toContain("birds")
        expect(night.quiet).toContain("butterflies")
    })

    it("gives space no orb, no landscape and the deepest star field", () => {
        const space = MEADOW_THEMES.space

        expect(space.orb).toBeNull()
        expect(space.stars).toBeGreaterThan(MEADOW_THEMES.night.stars)
        expect(space.starSize).toBeGreaterThan(MEADOW_THEMES.night.starSize)
        for (const part of ["sun", "clouds", "hills", "flowers", "balloon"] as const) {
            expect(space.forbid).toContain(part)
        }
        expect(space.quiet).toHaveLength(0)
    })

    it("only lets space show planets, rockets and ufos", () => {
        for (const part of ["planets", "rockets", "ufos"] as const) {
            expect(MEADOW_THEMES.day.forbid).toContain(part)
            expect(MEADOW_THEMES.night.forbid).toContain(part)
            expect(MEADOW_THEMES.space.forbid).not.toContain(part)
            expect(MEADOW_THEMES.space.quiet).not.toContain(part)
        }
    })

    it("keeps quiet and forbid from disagreeing with each other", () => {
        for (const look of Object.values(MEADOW_THEMES)) {
            for (const part of look.quiet) {
                expect(look.forbid).not.toContain(part)
            }
        }
    })
})

describe("the space cast", () => {
    it("stays clear of the central reading area", () => {
        for (const [index, member] of MEADOW_SPACE_CAST.entries()) {
            const asideX = member.x <= 30 || member.x >= 70
            const asideY = member.y <= 25 || member.y >= 75
            expect(asideX || asideY, `space member ${index} at ${member.x},${member.y}`).toBe(true)
        }
    })

    it("moves to the corners on narrow screens", () => {
        for (const member of MEADOW_SPACE_CAST) {
            expect(member.compact).toBeDefined()
            const spot = member.compact
            expect(spot && (spot.y <= 12 || spot.y >= 82)).toBe(true)
        }
    })

    it("balances the stage at every density", () => {
        for (const count of Object.values(MEADOW_DENSITY)) {
            const cast = planCast(MEADOW_SPACE_CAST, count, 5)
            const left = cast.filter((entry) => entry.x < 50 && entry.motion !== "glide")
            const right = cast.filter((entry) => entry.x > 50 && entry.motion !== "glide")

            expect(Math.abs(left.length - right.length)).toBeLessThanOrEqual(1)
        }
    })

    it("mixes rockets, ufos and mascots rather than repeating one kind", () => {
        const cast = planCast(MEADOW_SPACE_CAST, MEADOW_DENSITY.cosy, 5)

        expect(new Set(cast.map((entry) => entry.kind)).size).toBeGreaterThanOrEqual(3)
        expect(cast.map((entry) => entry.kind)).toContain("rocket")
        expect(cast.map((entry) => entry.kind)).toContain("ufo")
    })

    it("sends more than one ufo across the scene", () => {
        expect(MEADOW_SPACE_CAST.filter((member) => member.kind === "ufo")).toHaveLength(2)
    })

    it("carries a robot and an astronaut among the mascots", () => {
        expect(
            MEADOW_SPACE_CAST.filter((member) => member.kind === "mascot").length,
        ).toBeGreaterThanOrEqual(4)
    })

    it("holds nothing from the meadow", () => {
        for (const member of MEADOW_SPACE_CAST) {
            expect(["balloon", "butterfly", "bird", "plane"]).not.toContain(member.kind)
        }
    })
})

describe("planStars scale", () => {
    it("spreads stars over a wider size range when asked", () => {
        const near = planStars(40, 5, 3.8)
        const tight = planStars(40, 5, 2.4)
        const spread = (list: { size: number }[]) =>
            Math.max(...list.map((s) => s.size)) - Math.min(...list.map((s) => s.size))

        expect(spread(near)).toBeGreaterThan(spread(tight))
    })
})

describe("the planets", () => {
    it("gives every planet that survives a narrow screen a smaller compact spot", () => {
        for (const planet of MEADOW_PLANETS) {
            if (planet.dense) continue
            expect(planet.compact).toBeDefined()
            expect(planet.compact && planet.compact.size).toBeLessThan(planet.size)
        }
    })

    it("keeps the compact planets out of the middle of the frame", () => {
        for (const planet of MEADOW_PLANETS) {
            const spot = planet.compact
            if (!spot) continue
            expect(spot.y <= 10 || spot.y >= 70).toBe(true)
        }
    })

    it("puts an orbit on exactly one planet", () => {
        expect(MEADOW_PLANETS.filter((planet) => planet.orbit).length).toBe(1)
    })

    it("hangs exactly one black hole and keeps it faint", () => {
        const voids = MEADOW_PLANETS.filter((planet) => planet.art === "void")

        expect(voids).toHaveLength(1)
        expect(voids[0].faint).toBe(true)
    })
})
