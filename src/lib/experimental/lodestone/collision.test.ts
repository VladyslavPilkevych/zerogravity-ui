import { describe, expect, it } from "vitest"

import { allowedTravel, constrainDisplacement, inflate, type Bounds } from "./collision"

const rect = (left: number, top: number, width = 100, height = 40): Bounds => ({
    left,
    top,
    right: left + width,
    bottom: top + height,
})

describe("collision", () => {
    it("inflates bounds on every edge", () => {
        expect(inflate(rect(0, 0), 10)).toEqual({ left: -10, top: -10, right: 110, bottom: 50 })
    })

    it("allows the full move when nothing is in the way", () => {
        expect(allowedTravel(rect(0, 0), rect(400, 0), 20, 0)).toBe(1)
    })

    it("allows the full move when travelling away from a neighbour", () => {
        expect(allowedTravel(rect(200, 0), rect(0, 0), 30, 0)).toBe(1)
    })

    it("stops travel at the point of contact", () => {
        const travel = allowedTravel(rect(0, 0), rect(150, 0), 100, 0)
        expect(travel).toBeCloseTo(0.5, 5)
    })

    it("keeps the minimum gap between neighbours", () => {
        const rest = rect(0, 0)
        const neighbour = rect(150, 0)

        const moved = constrainDisplacement(rest, [neighbour], 100, 0, 20)
        const gap = neighbour.left - (rest.right + moved.x)

        expect(gap).toBeGreaterThanOrEqual(20)
    })

    it("never lets a button cross into a neighbour from either side", () => {
        const rest = rect(200, 0)
        const blockers = [rect(0, 0), rect(400, 0)]

        for (const dx of [-500, -80, -12, 12, 80, 500]) {
            const moved = constrainDisplacement(rest, blockers, dx, 0, 16)
            const left = rest.left + moved.x
            const right = rest.right + moved.x

            expect(left).toBeGreaterThanOrEqual(blockers[0].right + 16 - 0.01)
            expect(right).toBeLessThanOrEqual(blockers[1].left - 16 + 0.01)
        }
    })

    it("returns the desired displacement when there are no blockers", () => {
        expect(constrainDisplacement(rect(0, 0), [], 12, -8, 10)).toEqual({ x: 12, y: -8 })
    })

    it("permits diagonal travel that clears a neighbour vertically", () => {
        const moved = constrainDisplacement(rect(0, 0), [rect(120, 0)], 40, 90, 8)
        expect(moved.y).toBeGreaterThan(0)
    })
})
