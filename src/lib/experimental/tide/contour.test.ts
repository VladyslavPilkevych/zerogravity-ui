import { describe, expect, it } from "vitest"

import { contourPath, TIDE_MAX_SAMPLES, type TideEdge } from "./contour"

const W = 400
const H = 240
const A = 16

function points(d: string): [number, number][] {
    return d
        .replace(/^M/, "")
        .replace(/ Z$/, "")
        .split(" L")
        .map((pair) => pair.split(" ").map(Number) as [number, number])
}

const EDGES: TideEdge[] = ["top", "bottom", "left", "right", "x", "y", "all"]

describe("contourPath", () => {
    it.each(EDGES)("closes the %s contour inside the box", (edge) => {
        for (const phase of [0, 1.3, 7.9]) {
            const d = contourPath(W, H, edge, A, 120, phase)

            expect(d.startsWith("M")).toBe(true)
            expect(d.endsWith(" Z")).toBe(true)
            for (const [x, y] of points(d)) {
                expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
                expect(x).toBeGreaterThanOrEqual(0)
                expect(x).toBeLessThanOrEqual(W)
                expect(y).toBeGreaterThanOrEqual(0)
                expect(y).toBeLessThanOrEqual(H)
            }
        }
    })

    it.each(EDGES)("keeps every %s point within the band of a wavy edge", (edge) => {
        const wavy =
            edge === "all"
                ? ["top", "bottom", "left", "right"]
                : edge === "x"
                  ? ["left", "right"]
                  : edge === "y"
                    ? ["top", "bottom"]
                    : [edge]

        for (const [x, y] of points(contourPath(W, H, edge, A, 90, 2.4))) {
            const near =
                (wavy.includes("top") && y <= A) ||
                (wavy.includes("bottom") && y >= H - A) ||
                (wavy.includes("left") && x <= A) ||
                (wavy.includes("right") && x >= W - A)
            const corner = (x === 0 || x === W) && (y === 0 || y === H)
            expect(near || corner).toBe(true)
        }
    })

    it("leaves the sides it was not asked for straight", () => {
        const top = points(contourPath(W, H, "top", A, 120, 0.7))
        const below = top.filter(([, y]) => y > A)
        expect(below).toEqual([
            [W, H],
            [0, H],
        ])

        const sides = points(contourPath(W, H, "x", A, 120, 0.7))
        expect(sides.every(([x]) => x <= A || x >= W - A)).toBe(true)
        expect(sides.some(([x]) => x > 0 && x < A)).toBe(true)
        expect(sides.some(([x]) => x < W && x > W - A)).toBe(true)
    })

    it("actually ripples the chosen edge", () => {
        const depths = points(contourPath(W, H, "bottom", A, 120, 0)).map(([, y]) => H - y)
        const wavy = depths.filter((depth) => depth > 0)

        expect(Math.max(...wavy) - Math.min(...wavy)).toBeGreaterThan(A * 0.3)
    })

    it("moves as the phase drifts", () => {
        expect(contourPath(W, H, "all", A, 120, 0)).not.toBe(contourPath(W, H, "all", A, 120, 0.5))
    })

    it("bounds the sample count however large the box", () => {
        for (const edge of EDGES) {
            expect(points(contourPath(20000, 20000, edge, A, 24, 0)).length).toBeLessThanOrEqual(
                TIDE_MAX_SAMPLES + 4,
            )
        }
    })

    it("shrinks the band to fit a small box rather than crossing itself", () => {
        for (const [x, y] of points(contourPath(30, 30, "y", 40, 60, 1))) {
            expect(y).toBeGreaterThanOrEqual(0)
            expect(y).toBeLessThanOrEqual(30)
            expect(x).toBeGreaterThanOrEqual(0)
        }
        expect(points(contourPath(30, 30, "all", 40, 60, 1)).length).toBeGreaterThan(3)
    })

    it("holds a straight box when the amplitude is zero", () => {
        const flat = points(contourPath(W, H, "top", 0, 120, 3))

        expect(flat.every(([, y]) => y === 0 || y === H)).toBe(true)
    })
})
