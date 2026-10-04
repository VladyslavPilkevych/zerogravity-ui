import { describe, expect, it } from "vitest"

import { clamp, clamp01, damp, finite, mix } from "./num"

describe("num", () => {
    it("clamps to the given range", () => {
        expect(clamp(5, 0, 1)).toBe(1)
        expect(clamp(-5, 0, 1)).toBe(0)
        expect(clamp(0.4, 0, 1)).toBe(0.4)
        expect(clamp01(2)).toBe(1)
    })

    it("interpolates", () => {
        expect(mix(0, 10, 0.25)).toBe(2.5)
        expect(mix(4, 4, 0.9)).toBe(4)
    })

    it("lands the same way whatever the frame rate", () => {
        const rate = 6

        let slow = 0
        for (let step = 0; step < 30; step += 1) slow = damp(slow, 1, rate, 1 / 30)

        let fast = 0
        for (let step = 0; step < 120; step += 1) fast = damp(fast, 1, rate, 1 / 120)

        expect(Math.abs(slow - fast)).toBeLessThan(0.001)
    })

    it("never lets a bad number through", () => {
        expect(finite(Number.NaN, 3)).toBe(3)
        expect(finite(Number.POSITIVE_INFINITY, 3)).toBe(3)
        expect(finite(undefined, 3)).toBe(3)
        expect(finite("8" as unknown, 3)).toBe(3)
        expect(finite(0, 3)).toBe(0)
    })
})
