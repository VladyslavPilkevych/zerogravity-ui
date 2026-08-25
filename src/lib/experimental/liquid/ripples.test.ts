import { describe, expect, it } from "vitest"

import {
    RIPPLE_CAPACITY,
    RIPPLE_DEFAULTS,
    coverBox,
    createField,
    edgeAt,
    energy,
    liveCount,
    stepField,
    strike,
    trace,
} from "./ripples"

const RULE = RIPPLE_DEFAULTS

describe("the wave field", () => {
    it("never grows past its pool, however long the pointer drags", () => {
        const field = createField()

        for (let step = 0; step < 4000; step += 1) {
            trace(field, (step % 100) / 100, ((step * 7) % 100) / 100, 1 / 60, RULE)
            stepField(field, 1 / 60, RULE)
        }

        expect(field.drops).toHaveLength(RIPPLE_CAPACITY)
        expect(liveCount(field)).toBeLessThanOrEqual(RIPPLE_CAPACITY)
    })

    it("retires a ripple once it has spent its life", () => {
        const field = createField()
        strike(field, 0.5, 0.5, 1)

        expect(liveCount(field)).toBe(1)
        stepField(field, RULE.life + 0.1, RULE)
        expect(liveCount(field)).toBe(0)
    })

    it("strikes by distance, so a slow drag and a flick leave the same spacing", () => {
        const slow = createField()
        const fast = createField()

        for (let step = 0; step < 60; step += 1) {
            const at = step / 60
            trace(slow, at, 0.5, 1 / 30, RULE)
            trace(fast, at, 0.5, 1 / 240, RULE)
        }

        expect(liveCount(slow)).toBe(liveCount(fast))
    })

    it("carries more power when the pointer moves faster", () => {
        const slow = createField()
        const fast = createField()

        for (let step = 0; step < 40; step += 1) {
            trace(slow, step / 400, 0.5, 1 / 60, RULE)
            trace(fast, step / 40, 0.5, 1 / 60, RULE)
        }

        expect(energy(fast, RULE)).toBeGreaterThan(energy(slow, RULE))
    })

    it("settles back to nothing once the pointer leaves", () => {
        const field = createField()
        for (let step = 0; step < 40; step += 1) {
            trace(field, step / 40, 0.5, 1 / 60, RULE)
        }

        field.over = false
        for (let step = 0; step < 400; step += 1) stepField(field, 1 / 60, RULE)

        expect(liveCount(field)).toBe(0)
        expect(energy(field, RULE)).toBe(0)
        expect(field.speed).toBeLessThan(0.01)
    })

    it("gives a wobbling outline rather than a circle", () => {
        const field = createField()
        const drop = strike(field, 0.5, 0.5, 1)

        const radii = Array.from({ length: 24 }, (_, index) =>
            edgeAt(drop, (index / 24) * Math.PI * 2, 100, 0.5, 0.1),
        )

        expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(8)
    })

    it("relaxes the wobble as a ripple spreads", () => {
        const field = createField()
        const drop = strike(field, 0.5, 0.5, 1)

        const spread = (life: number) => {
            const radii = Array.from({ length: 24 }, (_, index) =>
                edgeAt(drop, (index / 24) * Math.PI * 2, 100, 0.5, life),
            )
            return Math.max(...radii) - Math.min(...radii)
        }

        expect(spread(0.9)).toBeLessThan(spread(0.1))
    })
})

describe("cover geometry", () => {
    it("fills the box and centres the overflow", () => {
        const box = coverBox(200, 100, 100, 100)

        expect(box.h).toBe(100)
        expect(box.w).toBe(200)
        expect(box.x).toBe(-50)
        expect(box.y).toBe(0)
    })

    it("gives two different sources the same box for the same anchor", () => {
        // this is what keeps the two images in the reveal aligned
        const wide = coverBox(1600, 900, 400, 300, 0.5, 0.5)
        const tall = coverBox(900, 1600, 400, 300, 0.5, 0.5)

        expect(wide.h).toBeGreaterThanOrEqual(300)
        expect(tall.w).toBeGreaterThanOrEqual(400)
        expect(wide.x + wide.w).toBeGreaterThanOrEqual(400)
        expect(tall.y + tall.h).toBeGreaterThanOrEqual(300)
    })

    it("honours the anchor", () => {
        const left = coverBox(200, 100, 100, 100, 0, 0)
        const right = coverBox(200, 100, 100, 100, 1, 0)

        expect(left.x).toBeCloseTo(0)
        expect(right.x).toBe(-100)
    })

    it("survives a source with no size yet", () => {
        expect(coverBox(0, 0, 100, 80)).toEqual({ x: 0, y: 0, w: 100, h: 80 })
    })
})
