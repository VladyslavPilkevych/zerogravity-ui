import { describe, expect, it } from "vitest"

import { PEEL_TIMING, peelState, peelTiming } from "./timeline"

const timing = { lead: 0.5, travel: 2, hold: 1 }
const stage = 600

describe("peelState", () => {
    it("keeps the cover down before the section pins and through the lead", () => {
        expect(peelState(-300, stage, timing)).toEqual({ phase: "before", lift: 0 })
        expect(peelState(0, stage, timing)).toEqual({ phase: "before", lift: 0 })
        expect(peelState(0.49 * stage, stage, timing)).toEqual({ phase: "before", lift: 0 })
    })

    it("lifts gradually through the travel, gently at both ends", () => {
        const early = peelState(0.7 * stage, stage, timing)
        const middle = peelState(1.5 * stage, stage, timing)

        expect(early.phase).toBe("moving")
        expect(early.lift).toBeGreaterThan(0)
        expect(early.lift).toBeLessThan(0.1)
        expect(middle.lift).toBeCloseTo(0.5)
    })

    it("holds the reveal fully uncovered and pinned", () => {
        expect(peelState(2.5 * stage, stage, timing)).toEqual({ phase: "holding", lift: 1 })
        expect(peelState(3.5 * stage, stage, timing)).toEqual({ phase: "holding", lift: 1 })
    })

    it("releases once the hold is over", () => {
        expect(peelState(3.6 * stage, stage, timing)).toEqual({ phase: "after", lift: 1 })
    })
})

describe("peelTiming", () => {
    it("falls back to the defaults and clamps nonsense", () => {
        expect(peelTiming(undefined, undefined, undefined)).toEqual(PEEL_TIMING)
        expect(peelTiming(-1, 0, Number.NaN)).toEqual({
            lead: 0,
            travel: 0.2,
            hold: PEEL_TIMING.hold,
        })
    })
})
