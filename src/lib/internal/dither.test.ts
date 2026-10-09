import { describe, expect, it } from "vitest"

import { bayer4, quantize } from "./dither"

describe("dither", () => {
    it("spreads sixteen distinct thresholds across one tile", () => {
        const seen = new Set<number>()
        for (let row = 0; row < 4; row += 1) {
            for (let column = 0; column < 4; column += 1) seen.add(bayer4(column, row))
        }

        expect(seen.size).toBe(16)
        for (const value of seen) {
            expect(value).toBeGreaterThan(0)
            expect(value).toBeLessThan(1)
        }
    })

    it("repeats every four cells, negative indices included", () => {
        expect(bayer4(5, 6)).toBe(bayer4(1, 2))
        expect(bayer4(-1, -1)).toBe(bayer4(3, 3))
    })

    it("lets through a share of cells that matches the intensity", () => {
        let lit = 0
        for (let row = 0; row < 4; row += 1) {
            for (let column = 0; column < 4; column += 1) if (0.5 > bayer4(column, row)) lit += 1
        }

        expect(lit).toBe(8)
    })

    it("snaps onto even steps and clamps", () => {
        expect(quantize(0.4, 4)).toBe(0.5)
        expect(quantize(0.1, 4)).toBe(0)
        expect(quantize(3, 4)).toBe(1)
        expect(quantize(-1, 4)).toBe(0)
        expect(quantize(0.7, 0)).toBe(1)
    })
})
