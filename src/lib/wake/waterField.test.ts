import { describe, expect, it } from "vitest"

import {
    clearWater,
    createWater,
    paintSurface,
    parseRgb,
    pixels,
    shade,
    sizeWater,
    stamp,
    stampSegment,
    stepWater,
    waterEnergy,
    type Palette,
} from "./waterField"

const PALETTE: Palette = { deep: [10, 40, 60], shallow: [30, 120, 140], line: [170, 230, 240] }

describe("water field", () => {
    it("starts flat and gains energy from a stamp", () => {
        const water = createWater(40, 30)

        expect(waterEnergy(water)).toBe(0)
        stamp(water, 20, 15, 4, 1)

        expect(waterEnergy(water)).toBeGreaterThan(0)
        expect(water.current[15 * 40 + 20]).toBeCloseTo(1)
        expect(water.current[15 * 40 + 24]).toBe(0)
        expect(water.current[15 * 40 + 22]).toBeGreaterThan(0)
        expect(water.current[15 * 40 + 22]).toBeLessThan(1)
    })

    it("never writes the edge, so the border stays at rest", () => {
        const water = createWater(20, 20)
        stamp(water, 0, 0, 5, 1)

        expect(water.current[0]).toBe(0)
        expect(water.current[1]).toBe(0)
        expect(water.current[20 + 1]).toBeGreaterThan(0)
    })

    it("spreads a disturbance outward", () => {
        const water = createWater(60, 60)
        stamp(water, 30, 30, 3, 1)
        const far = 30 * 60 + 42

        expect(water.current[far]).toBe(0)
        for (let step = 0; step < 14; step += 1) stepWater(water, 0.99)

        expect(Math.abs(water.current[far])).toBeGreaterThan(0.001)
    })

    it("damps to a settled surface", () => {
        const water = createWater(50, 40)
        stamp(water, 25, 20, 4, 1)

        let peak = water.peak
        for (let step = 0; step < 2000 && peak >= 0.004; step += 1) peak = stepWater(water, 0.97)

        expect(peak).toBeLessThan(0.004)
    })

    it("swaps its two buffers instead of allocating", () => {
        const water = createWater(32, 24)
        const owned = new Set([water.current, water.previous])
        stamp(water, 16, 12, 3, 1)

        for (let step = 0; step < 25; step += 1) {
            stepWater(water, 0.98)
            expect(owned.has(water.current)).toBe(true)
            expect(owned.has(water.previous)).toBe(true)
        }

        expect(sizeWater(water, 32, 24)).toBe(false)
        expect(owned.has(water.current)).toBe(true)
        expect(sizeWater(water, 40, 24)).toBe(true)
        expect(water.current).toHaveLength(40 * 24)
    })

    it("keeps heights bounded however often the same spot is struck", () => {
        const water = createWater(20, 20)
        for (let index = 0; index < 200; index += 1) stamp(water, 10, 10, 3, 1)

        expect(Math.max(...water.current)).toBeLessThanOrEqual(3)
    })

    it("fills a fast stroke end to end, without gaps", () => {
        const water = createWater(120, 40)
        const count = stampSegment(water, 10, 20, 100, 20, 3, -1)

        expect(count).toBeGreaterThanOrEqual(60)
        for (let x = 10; x <= 100; x += 1) {
            expect(water.current[20 * 120 + x]).toBeLessThan(-0.05)
        }
    })

    it("clears back to rest", () => {
        const water = createWater(20, 20)
        stamp(water, 10, 10, 3, 1)
        stepWater(water, 0.99)
        clearWater(water)

        expect(waterEnergy(water)).toBe(0)
        expect(water.peak).toBe(0)
    })
})

describe("shading", () => {
    it("passes the floor through untouched when the water is flat", () => {
        const water = createWater(24, 16)
        const floor = new Uint8ClampedArray(24 * 16 * 4)
        paintSurface(floor, 24, 16, "tiles", PALETTE, 6)
        const out = new Uint8ClampedArray(floor.length)

        shade(water, pixels(floor), pixels(out), 10, 1)

        expect(out).toEqual(floor)
    })

    it("bends and lights the floor where the surface slopes", () => {
        const water = createWater(40, 40)
        const floor = new Uint8ClampedArray(40 * 40 * 4)
        paintSurface(floor, 40, 40, "grid", PALETTE, 5)
        const out = new Uint8ClampedArray(floor.length)
        stamp(water, 20, 20, 6, 1)

        shade(water, pixels(floor), pixels(out), 10, 1)

        expect(out).not.toEqual(floor)
        for (let index = 3; index < out.length; index += 4) expect(out[index]).toBe(255)
    })
})

describe("surfaces", () => {
    it.each(["tiles", "grid", "checker"] as const)("paints %s the same way every time", (kind) => {
        const a = new Uint8ClampedArray(30 * 20 * 4)
        const b = new Uint8ClampedArray(30 * 20 * 4)
        paintSurface(a, 30, 20, kind, PALETTE, 6)
        paintSurface(b, 30, 20, kind, PALETTE, 6)

        expect(a).toEqual(b)
        expect(a[3]).toBe(255)
        expect(new Set(a).size).toBeGreaterThan(4)
    })

    it("reads the colour forms a computed style hands back", () => {
        expect(parseRgb("#0af")).toEqual([0, 170, 255])
        expect(parseRgb("#102030")).toEqual([16, 32, 48])
        expect(parseRgb("rgb(1, 2, 3)")).toEqual([1, 2, 3])
        expect(parseRgb("rgba(4 5 6 / 0.5)")).toEqual([4, 5, 6])
        expect(parseRgb("teal")).toBeNull()
    })
})
