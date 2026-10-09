import { describe, expect, it } from "vitest"

import { GANTRY_TIMING, gantryState, gantryTiming, railOffset, railStops } from "./timeline"

const stage = 500
const timing = { pace: 1, transition: 0.5, hold: 0.5, easing: "linear" as const }

describe("gantryState", () => {
    it("rests on the first car before the stage pins and for the first part of the first stop", () => {
        expect(gantryState(-200, stage, 3, timing)).toEqual({ phase: "before", position: 0 })
        expect(gantryState(0.2 * stage, stage, 3, timing)).toEqual({ phase: "moving", position: 0 })
    })

    it("moves between two cars only in the middle share of a stop", () => {
        expect(gantryState(0.5 * stage, stage, 3, timing).position).toBeCloseTo(0.5)
        expect(gantryState(0.8 * stage, stage, 3, timing).position).toBe(1)
        expect(gantryState(1.2 * stage, stage, 3, timing).position).toBe(1)
        expect(gantryState(1.5 * stage, stage, 3, timing).position).toBeCloseTo(1.5)
    })

    it("holds on the last car, pinned, then releases", () => {
        expect(gantryState(3 * stage, stage, 3, timing)).toEqual({ phase: "holding", position: 3 })
        expect(gantryState(3.4 * stage, stage, 3, timing)).toEqual({
            phase: "holding",
            position: 3,
        })
        expect(gantryState(3.6 * stage, stage, 3, timing)).toEqual({ phase: "after", position: 3 })
    })

    it("eases each move when asked to", () => {
        const smooth = { ...timing, easing: "smooth" as const }
        expect(gantryState(0.3 * stage, stage, 3, smooth).position).toBeLessThan(
            gantryState(0.3 * stage, stage, 3, timing).position,
        )
        expect(gantryState(0.5 * stage, stage, 3, smooth).position).toBeCloseTo(0.5)
    })

    it("stays put when the rail has nowhere to go", () => {
        expect(gantryState(0.4 * stage, stage, 0, timing)).toEqual({
            phase: "holding",
            position: 0,
        })
    })
})

describe("railStops and railOffset", () => {
    it("lines each car up with the start of the window until the rail runs out", () => {
        expect(railStops([24, 368, 712, 1056, 1400], 900)).toEqual([0, 344, 688, 900])
    })

    it("folds a last step shorter than half a car into the one before", () => {
        expect(railStops([24, 368, 712, 1056, 1400], 1118)).toEqual([0, 344, 688, 1118])
    })

    it("interpolates between stops", () => {
        expect(railOffset(0, [0, 300, 500])).toBe(0)
        expect(railOffset(1.5, [0, 300, 500])).toBe(400)
        expect(railOffset(2, [0, 300, 500])).toBe(500)
        expect(railOffset(9, [0, 300, 500])).toBe(500)
    })
})

describe("gantryTiming", () => {
    it("falls back to the defaults and clamps nonsense", () => {
        expect(gantryTiming(undefined, undefined, undefined, undefined)).toEqual(GANTRY_TIMING)
        expect(gantryTiming(0, 5, -1, "bouncy")).toEqual({
            pace: 0.2,
            transition: 1,
            hold: 0,
            easing: "smooth",
        })
    })
})
