import { describe, expect, it } from "vitest"

import { GLYPH_COLS, GLYPH_GAP, GLYPH_ROWS, SUPPORTED_CHARACTERS, supports, textGrid } from "./font"

describe("textGrid", () => {
    it("lays one glyph out on a 5 by 7 grid", () => {
        const grid = textGrid("1")

        expect(grid.cols).toBe(GLYPH_COLS)
        expect(grid.rows).toBe(GLYPH_ROWS)
        expect(grid.cells.length).toBeGreaterThan(6)
        for (const cell of grid.cells) {
            expect(cell.col).toBeLessThan(GLYPH_COLS)
            expect(cell.row).toBeLessThan(GLYPH_ROWS)
        }
    })

    it("puts one blank column between glyphs", () => {
        const grid = textGrid("11")

        expect(grid.cols).toBe(GLYPH_COLS * 2 + GLYPH_GAP)
        expect(grid.cells.some((cell) => cell.col === GLYPH_COLS)).toBe(false)
    })

    it("builds 404 from three glyphs", () => {
        const grid = textGrid("404")
        const single = textGrid("4")

        expect(grid.cols).toBe(GLYPH_COLS * 3 + GLYPH_GAP * 2)
        expect(grid.cells.length).toBe(single.cells.length * 2 + textGrid("0").cells.length)
    })

    it("is case insensitive", () => {
        expect(textGrid("lost")).toEqual(textGrid("LOST"))
    })

    it("covers every digit and every letter", () => {
        for (const character of "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
            expect(supports(character), character).toBe(true)
            expect(textGrid(character).cells.length, character).toBeGreaterThan(4)
        }
    })

    it("leaves a space empty but keeps its width", () => {
        const grid = textGrid(" ")

        expect(grid.cells).toHaveLength(0)
        expect(grid.cols).toBe(GLYPH_COLS)
    })

    it("falls back to a blank slot for anything unsupported", () => {
        const grid = textGrid("4§4")

        expect(grid.cols).toBe(GLYPH_COLS * 3 + GLYPH_GAP * 2)
        expect(grid.cells.length).toBe(textGrid("4").cells.length * 2)
        expect(supports("§")).toBe(false)
    })

    it("handles an empty string without collapsing", () => {
        const grid = textGrid("")

        expect(grid.cols).toBe(0)
        expect(grid.rows).toBe(GLYPH_ROWS)
        expect(grid.cells).toHaveLength(0)
    })

    it("is deterministic", () => {
        expect(textGrid("OOPS")).toEqual(textGrid("OOPS"))
    })

    it("advertises what it supports", () => {
        expect(SUPPORTED_CHARACTERS).toContain("Z")
        expect(SUPPORTED_CHARACTERS).toContain("9")
        expect(SUPPORTED_CHARACTERS).toContain("?")
    })
})
