import { describe, expect, it } from "vitest"

import { pick, rngFor } from "./rng"

describe("rngFor", () => {
    it("gives the same stream for the same seed, which is what SSR needs", () => {
        const first = rngFor(7, 3)
        const second = rngFor(7, 3)

        for (let step = 0; step < 20; step += 1) expect(first()).toBe(second())
    })

    it("gives different streams for different seeds and slots", () => {
        expect(rngFor(7, 3)()).not.toBe(rngFor(8, 3)())
        expect(rngFor(7, 3)()).not.toBe(rngFor(7, 4)())
    })

    it("stays inside the unit range", () => {
        const random = rngFor(21)
        for (let step = 0; step < 500; step += 1) {
            const value = random()
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThan(1)
        }
    })

    it("spreads across the range rather than clustering", () => {
        const random = rngFor(3)
        const buckets = new Array(10).fill(0)
        for (let step = 0; step < 2000; step += 1) buckets[Math.floor(random() * 10)] += 1

        for (const count of buckets) expect(count).toBeGreaterThan(120)
    })

    it("maps into a range with pick", () => {
        const random = rngFor(5)
        for (let step = 0; step < 100; step += 1) {
            const value = pick(random, -4, 6)
            expect(value).toBeGreaterThanOrEqual(-4)
            expect(value).toBeLessThanOrEqual(6)
        }
    })
})
