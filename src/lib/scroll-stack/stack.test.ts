import { describe, expect, it } from "vitest"

import { coverProgress, releaseSpace } from "./stack"

describe("coverProgress", () => {
    it("starts when the next card reaches the bottom of this one and ends when it docks", () => {
        expect(coverProgress(500, 0, 400, 20, 800)).toBe(0)
        expect(coverProgress(400, 0, 400, 20, 800)).toBe(0)
        expect(coverProgress(210, 0, 400, 20, 800)).toBe(0.5)
        expect(coverProgress(20, 0, 400, 20, 800)).toBe(1)
    })

    it("starts at the bottom of the viewport for cards taller than it", () => {
        expect(coverProgress(800, 0, 1200, 0, 800)).toBe(0)
        expect(coverProgress(400, 0, 1200, 0, 800)).toBe(0.5)
        expect(coverProgress(0, 0, 1200, 0, 800)).toBe(1)
    })
})

describe("releaseSpace", () => {
    it("is only the hold when every card ends level with the last one", () => {
        expect(releaseSpace([0, 0, 0], [800, 800, 800], 0)).toBe(0)
        expect(releaseSpace([0, 0, 0], [800, 800, 800], 240)).toBe(240)
    })

    it("keeps a taller earlier card pinned until the last card has docked", () => {
        expect(releaseSpace([0, 20, 40], [800, 500, 600], 0)).toBe(160)
    })

    it("needs nothing extra when the last card reaches furthest", () => {
        expect(releaseSpace([0, 20, 40], [400, 400, 600], 0)).toBe(0)
    })

    it("is empty for an empty stack", () => {
        expect(releaseSpace([], [], 100)).toBe(0)
    })
})
