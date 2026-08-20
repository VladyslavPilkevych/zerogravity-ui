import { describe, expect, it } from "vitest"

import { buildTiles, delayFactors } from "./sequence"

describe("delayFactors", () => {
    it("walks row by row for the row sequence", () => {
        const factors = delayFactors(2, 3, "row")

        expect(factors).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    })

    it("walks column by column for the column sequence", () => {
        const factors = delayFactors(2, 3, "column")

        expect(factors[0]).toBe(0)
        expect(factors[3]).toBeCloseTo(0.2)
        expect(factors[1]).toBeCloseTo(0.4)
        expect(factors[5]).toBe(1)
    })

    it("mirrors the row order for the reverse sequence", () => {
        expect(delayFactors(2, 3, "reverse")).toEqual([1, 0.8, 0.6, 0.4, 0.2, 0])
    })

    it("starts at the centre and ends at the corners for the center sequence", () => {
        const factors = delayFactors(3, 3, "center")

        expect(factors[4]).toBe(0)
        expect(factors[0]).toBe(1)
        expect(factors[8]).toBe(1)
        expect(factors[1]).toBeLessThan(factors[0])
    })

    it("scrambles deterministically for a given seed", () => {
        const first = delayFactors(4, 6, "random", 3)
        const second = delayFactors(4, 6, "random", 3)

        expect(first).toEqual(second)
        expect(first).not.toEqual(delayFactors(4, 6, "row"))
    })

    it("scatters the tiles differently on each navigation", () => {
        const first = delayFactors(4, 6, "random", 1)
        const second = delayFactors(4, 6, "random", 2)

        expect(first).not.toEqual(second)
    })

    it("spreads the scatter over the whole grid rather than clustering", () => {
        const factors = delayFactors(4, 6, "random", 7)
        const earliest = factors.indexOf(0)
        const latest = factors.indexOf(1)

        expect(Math.abs(earliest - latest)).toBeGreaterThan(1)
        expect(factors.filter((factor) => factor < 0.5)).toHaveLength(12)
    })

    it("covers the whole 0 to 1 range exactly once per tile", () => {
        const factors = delayFactors(3, 4, "random", 5)
        const sorted = [...factors].sort((a, b) => a - b)

        expect(factors).toHaveLength(12)
        expect(sorted[0]).toBe(0)
        expect(sorted[11]).toBe(1)
        expect(new Set(factors).size).toBe(12)
    })

    it("keeps a single tile at zero instead of dividing by an empty range", () => {
        expect(delayFactors(1, 1, "center")).toEqual([0])
        expect(delayFactors(1, 1, "row")).toEqual([0])
    })
})

describe("buildTiles", () => {
    it("produces one tile per grid cell", () => {
        expect(buildTiles(4, 6, "row", "row")).toHaveLength(24)
        expect(buildTiles(2, 2, "row", "row")).toHaveLength(4)
    })

    it("reuses the cover order when the reveal order matches", () => {
        const tiles = buildTiles(2, 3, "row", "row")

        expect(tiles.map((tile) => tile.reveal)).toEqual(tiles.map((tile) => tile.cover))
    })

    it("keeps independent delays when the reveal order differs", () => {
        const tiles = buildTiles(2, 3, "row", "reverse")

        expect(tiles[0].cover).toBe(0)
        expect(tiles[0].reveal).toBe(1)
        expect(tiles[5].cover).toBe(1)
        expect(tiles[5].reveal).toBe(0)
    })
})
