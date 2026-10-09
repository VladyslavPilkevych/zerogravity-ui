import { describe, expect, it } from "vitest"

import { lensMix, lensShare, lensState } from "./lens"

describe("lens mapping", () => {
    it("gives the outer fifths to one picture outright", () => {
        for (const x of [0, 0.05, 0.1, 0.19]) expect(lensShare(x)).toBeGreaterThanOrEqual(0.97)
        for (const x of [0.81, 0.9, 0.95, 1]) expect(lensShare(x)).toBeLessThanOrEqual(0.03)
    })

    it("interlaces the two evenly in the middle", () => {
        expect(lensShare(0.5)).toBeCloseTo(0.5)
        expect(lensState(0.5).open).toBeCloseTo(0.5)
        expect(lensShare(0.35)).toBeGreaterThan(0.6)
        expect(lensShare(0.65)).toBeLessThan(0.4)
    })

    it("only ever moves one way, without a jump", () => {
        let previous = lensShare(0)
        for (let i = 1; i <= 400; i += 1) {
            const share = lensShare(i / 400)
            expect(share).toBeLessThanOrEqual(previous + 1e-9)
            expect(previous - share).toBeLessThan(0.02)
            previous = share
        }
    })

    it("treats a nonsense position as head-on", () => {
        expect(lensMix(Number.NaN)).toBeCloseTo(0.5)
        expect(lensMix(-4)).toBe(0)
        expect(lensMix(9)).toBe(1)
    })
})
