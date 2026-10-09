import { describe, expect, it } from "vitest"

import { rngFor } from "../../internal"
import { createPaper, dab, dryOut, soak, step, WATER_CAP, wipe, type InkFlow } from "./paper"

const FLOW: InkFlow = { mobility: 1, rim: 16, release: 0.02, sink: 0.012, tint: 0.15 }
const CHARGE = { water: 2, held: 3, core: 1, tint: 0.15 }

/** A filled rectangle as an RGBA mask, standing in for a set word. */
function block(width: number, height: number): Uint8ClampedArray {
    const mask = new Uint8ClampedArray(width * height * 4)
    for (let y = Math.floor(height * 0.35); y < Math.floor(height * 0.65); y += 1) {
        for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x += 1) {
            mask[(y * width + x) * 4 + 3] = 255
        }
    }
    return mask
}

function run(seed: number, limit = 5000) {
    const paper = createPaper(80, 40, { seed, feather: 0.6 })
    soak(paper, block(80, 40), CHARGE)
    let steps = 0
    while (step(paper, FLOW) > 0 && steps < limit) steps += 1
    return { paper, steps }
}

describe("paper", () => {
    it("is the same sheet for the same seed, and a different one for another", () => {
        const a = createPaper(64, 32, { seed: 7, feather: 0.6 })
        const b = createPaper(64, 32, { seed: 7, feather: 0.6 })
        const c = createPaper(64, 32, { seed: 8, feather: 0.6 })

        expect(a.threshold).toEqual(b.threshold)
        expect(a.ex).toEqual(b.ex)
        expect(a.threshold).not.toEqual(c.threshold)
    })

    it("soaks the same way every time for the same seed", () => {
        const first = run(12)
        const second = run(12)

        expect(first.steps).toBe(second.steps)
        expect(first.paper.stain).toEqual(second.paper.stain)
    })

    it("spreads past the stroke, then dries and stops on its own", () => {
        const { paper, steps } = run(12)

        expect(steps).toBeLessThan(5000)
        expect(paper.wet).toBe(0)
        expect(paper.box[2]).toBeLessThan(paper.box[0])

        // ink reached cells outside the original block
        const row = 20 * 80
        const outside = paper.stain[row + Math.floor(80 * 0.3) - 2]
        expect(outside).toBeGreaterThan(0)
        // and the stroke itself holds the most
        expect(paper.stain[row + 40]).toBeGreaterThan(outside)
    })

    it("conserves water while it flows", () => {
        const paper = createPaper(48, 24, { seed: 3, feather: 0.6 })
        soak(paper, block(48, 24), { ...CHARGE, held: 0 })
        const total = () => paper.water.reduce((sum, value) => sum + value, 0)
        const before = total()
        step(paper, { ...FLOW, rim: 0 })

        // only evaporation leaves; flow between cells moves water, never makes it
        expect(total()).toBeLessThanOrEqual(before)
        expect(total()).toBeGreaterThan(before - paper.evaporation * 48 * 24)
    })

    it("keeps every buffer it started with, however long the nib is dragged", () => {
        const paper = createPaper(60, 30, { seed: 5, feather: 0.8 })
        const buffers = new Set([paper.water, paper.nextWater, paper.dye, paper.nextDye])
        const random = rngFor(9)

        for (let k = 0; k < 4000; k += 1) {
            dab(paper, random() * 60, random() * 30, 2.5, CHARGE)
            if (k % 4 === 0) step(paper, FLOW)
        }

        expect(buffers.has(paper.water)).toBe(true)
        expect(buffers.has(paper.nextWater)).toBe(true)
        expect(buffers.has(paper.dye)).toBe(true)
        expect(buffers.has(paper.nextDye)).toBe(true)
        expect(paper.water.length).toBe(60 * 30)
        expect(paper.stain.length).toBe(60 * 30)
        for (const value of paper.water) {
            expect(Number.isFinite(value)).toBe(true)
            expect(value).toBeLessThanOrEqual(WATER_CAP)
        }
    })

    it("dries out where it lies, and wipes back to blank paper", () => {
        const paper = createPaper(40, 20, { seed: 2, feather: 0.5 })
        soak(paper, block(40, 20), CHARGE)
        dryOut(paper)

        expect(paper.wet).toBe(0)
        expect(paper.water.every((value) => value === 0)).toBe(true)
        expect(paper.stain.some((value) => value > 0)).toBe(true)

        wipe(paper)
        expect(paper.stain.every((value) => value === 0)).toBe(true)
        expect(paper.inked[2]).toBeLessThan(paper.inked[0])
    })
})
