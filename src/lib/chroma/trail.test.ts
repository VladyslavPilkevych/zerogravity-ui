import { describe, expect, it } from "vitest"

import { createTrail, traceCapacity, traceTrail, TRACE_STEP } from "./trail"

function trace(trail: ReturnType<typeof createTrail>, now: number, life: number) {
    const out = new Float32Array(traceCapacity(trail) * 3)
    const count = traceTrail(trail, now, life, out)
    const points: { x: number; y: number; life: number }[] = []
    for (let i = 0; i < count; i += 1) {
        points.push({ x: out[i * 3], y: out[i * 3 + 1], life: out[i * 3 + 2] })
    }
    return points
}

describe("trail", () => {
    it("never holds more than its capacity", () => {
        const trail = createTrail(16)

        for (let i = 0; i < 5000; i += 1) {
            trail.push(i, (i * 7) % 300, i / 60)
            expect(trail.size).toBeLessThanOrEqual(16)
        }
        expect(trail.size).toBe(16)
        expect(trace(trail, 5000 / 60, 10).length).toBeLessThanOrEqual(traceCapacity(trail))
    })

    it("keeps a fast flick continuous: no gap wider than two trace steps", () => {
        const trail = createTrail(16)
        trail.push(0, 0, 0)
        trail.push(400, 20, 0.016)
        trail.push(380, 300, 0.032)
        trail.push(0, 260, 0.048)

        const points = trace(trail, 0.05, 1)
        for (let i = 1; i < points.length; i += 1) {
            const gap = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
            expect(gap).toBeLessThan(TRACE_STEP * 2)
        }
        expect(points.at(-1)).toMatchObject({ x: 0, y: 260 })
    })

    it("fades from the head to the tail", () => {
        const trail = createTrail(8)
        for (let i = 0; i < 5; i += 1) trail.push(i * 20, 0, i * 0.1)

        const points = trace(trail, 0.4, 1)
        for (let i = 1; i < points.length; i += 1) {
            expect(points[i].life).toBeGreaterThanOrEqual(points[i - 1].life - 1e-6)
        }
        expect(points.at(-1)?.life).toBeCloseTo(1)
    })

    it("does not join two strokes across a cut", () => {
        const trail = createTrail(8)
        trail.push(0, 0, 0)
        trail.push(10, 0, 0)
        trail.push(300, 300, 0, true)
        trail.push(310, 300, 0)

        const points = trace(trail, 0, 1)
        expect(points.filter((p) => Number.isNaN(p.x))).toHaveLength(1)
    })

    it("empties once every sample has outlived its life", () => {
        const trail = createTrail(8)
        for (let i = 0; i < 6; i += 1) trail.push(i * 10, 0, i * 0.01)

        expect(trail.prune(0.3, 0.5)).toBe(6)
        // three have expired; the youngest of them stays as the faded tail
        expect(trail.prune(0.52, 0.5)).toBe(4)
        expect(trail.prune(0.56, 0.5)).toBe(0)
        expect(trace(trail, 0.56, 0.5)).toHaveLength(0)
    })
})
