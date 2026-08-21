import { describe, expect, it } from "vitest"

import {
    RASTER_GLYPH_SETS,
    cellsFrom,
    edgeMap,
    glyphFor,
    gridFor,
    inkFor,
    resolveGlyphs,
} from "./sample"

function pixels(values: readonly [number, number, number][]): Uint8ClampedArray {
    const data = new Uint8ClampedArray(values.length * 4)
    values.forEach(([r, g, b], index) => {
        data[index * 4] = r
        data[index * 4 + 1] = g
        data[index * 4 + 2] = b
        data[index * 4 + 3] = 255
    })
    return data
}

describe("gridFor", () => {
    it("fills a frame with square cells", () => {
        expect(gridFor(240, 120, 12)).toEqual({ cols: 20, rows: 10 })
    })

    it("widens the cells when the glyph advance is narrower than the line", () => {
        const square = gridFor(240, 120, 12)
        const typed = gridFor(240, 120, 12, 0.6)

        expect(typed.cols).toBeGreaterThan(square.cols)
        expect(typed.rows).toBe(square.rows)
    })

    it("never drops below a single cell", () => {
        expect(gridFor(4, 4, 200)).toEqual({ cols: 1, rows: 1 })
        expect(gridFor(0, 0, 12)).toEqual({ cols: 1, rows: 1 })
    })

    it("refuses a degenerate cell size", () => {
        expect(gridFor(100, 100, 0).cols).toBeLessThanOrEqual(50)
        expect(gridFor(100, 100, -8).cols).toBeLessThanOrEqual(50)
    })
})

describe("cellsFrom", () => {
    it("reads a row-major grid back into cells", () => {
        const cells = cellsFrom(
            pixels([
                [255, 255, 255],
                [0, 0, 0],
                [255, 0, 0],
                [0, 0, 255],
            ]),
            2,
            2,
        )

        expect(cells).toHaveLength(4)
        expect(cells[0]).toMatchObject({ col: 0, row: 0, r: 255 })
        expect(cells[1]).toMatchObject({ col: 1, row: 0, r: 0 })
        expect(cells[2]).toMatchObject({ col: 0, row: 1, r: 255 })
        expect(cells[3]).toMatchObject({ col: 1, row: 1, b: 255 })
    })

    it("weights luminance the way eyes do", () => {
        const [white, black, green, blue] = cellsFrom(
            pixels([
                [255, 255, 255],
                [0, 0, 0],
                [0, 255, 0],
                [0, 0, 255],
            ]),
            4,
            1,
        )

        expect(white.lum).toBeCloseTo(1)
        expect(black.lum).toBe(0)
        expect(green.lum).toBeGreaterThan(blue.lum)
    })

    it("tolerates a short buffer instead of producing NaN", () => {
        const cells = cellsFrom(new Uint8ClampedArray(4), 2, 1)

        expect(cells).toHaveLength(2)
        for (const cell of cells) expect(Number.isNaN(cell.lum)).toBe(false)
    })
})

describe("edgeMap", () => {
    it("reports nothing on a flat field", () => {
        const cells = cellsFrom(
            pixels(Array.from({ length: 9 }, () => [120, 120, 120] as const)),
            3,
            3,
        )

        for (const edge of edgeMap(cells, 3, 3)) expect(edge).toBeCloseTo(0)
    })

    it("lights up along a hard boundary", () => {
        const cells = cellsFrom(
            pixels([
                [0, 0, 0],
                [0, 0, 0],
                [255, 255, 255],
                [255, 255, 255],
            ]),
            4,
            1,
        )
        const edges = edgeMap(cells, 4, 1)

        expect(edges[1]).toBeGreaterThan(0.5)
        expect(edges[0]).toBeLessThan(edges[1])
    })

    it("stays within zero and one", () => {
        const cells = cellsFrom(
            pixels([
                [255, 255, 255],
                [0, 0, 0],
                [255, 255, 255],
                [0, 0, 0],
            ]),
            2,
            2,
        )

        for (const edge of edgeMap(cells, 2, 2)) {
            expect(edge).toBeGreaterThanOrEqual(0)
            expect(edge).toBeLessThanOrEqual(1)
        }
    })
})

describe("glyphFor", () => {
    const set = " .:-=+*#%@"

    it("gives bright cells the densest glyph and dark cells the sparsest", () => {
        expect(glyphFor(1, 0, set)).toBe("@")
        expect(glyphFor(0, 0, set)).toBe(" ")
    })

    it("walks the set monotonically with brightness", () => {
        const seen = [0, 0.25, 0.5, 0.75, 1].map((lum) => set.indexOf(glyphFor(lum, 0, set)))

        for (let index = 1; index < seen.length; index += 1) {
            expect(seen[index]).toBeGreaterThanOrEqual(seen[index - 1])
        }
    })

    it("pushes a contour one step denser", () => {
        const plain = set.indexOf(glyphFor(0.5, 0, set))
        const edged = set.indexOf(glyphFor(0.5, 1, set))

        expect(edged).toBeGreaterThan(plain)
    })

    it("spreads the midtones further apart as contrast rises", () => {
        const flat = set.indexOf(glyphFor(0.7, 0, set, 1))
        const punchy = set.indexOf(glyphFor(0.7, 0, set, 2))

        expect(punchy).toBeGreaterThan(flat)
    })

    it("survives an empty set and out-of-range input", () => {
        expect(glyphFor(0.5, 0, "")).toBe(" ")
        expect(glyphFor(4, 4, set)).toBe("@")
        expect(glyphFor(-4, -4, set)).toBe(" ")
    })
})

describe("inkFor", () => {
    it("lifts dark ink so it stays readable on the board", () => {
        const ink = inkFor({ col: 0, row: 0, r: 0, g: 0, b: 0, lum: 0 })

        expect(ink).toBe("rgb(40,40,40)")
    })

    it("clamps at full brightness", () => {
        expect(inkFor({ col: 0, row: 0, r: 255, g: 255, b: 255, lum: 1 })).toBe("rgb(255,255,255)")
    })
})

describe("resolveGlyphs", () => {
    it("looks up the named sets", () => {
        expect(resolveGlyphs("ascii")).toBe(RASTER_GLYPH_SETS.ascii)
        expect(resolveGlyphs("dots")).toBe(RASTER_GLYPH_SETS.dots)
    })

    it("passes a custom set straight through", () => {
        expect(resolveGlyphs(" ab")).toBe(" ab")
    })

    it("falls back to blocks", () => {
        expect(resolveGlyphs(undefined)).toBe(RASTER_GLYPH_SETS.blocks)
    })

    it("orders every built-in set from sparse to dense", () => {
        for (const [name, set] of Object.entries(RASTER_GLYPH_SETS)) {
            expect(set[0], name).toBe(" ")
            expect(set.length, name).toBeGreaterThan(2)
        }
    })
})
