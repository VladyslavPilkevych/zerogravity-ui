import { describe, expect, it } from "vitest"

import { COMPONENTS } from "./registry"
import { scoreEntry, searchComponents } from "./search"

const reel = COMPONENTS.find((entry) => entry.slug === "reel")!

describe("scoreEntry", () => {
    it("ranks an exact name above everything else", () => {
        expect(scoreEntry(reel, "reel")).toBeGreaterThan(scoreEntry(reel, "ree"))
        expect(scoreEntry(reel, "ree")).toBeGreaterThan(scoreEntry(reel, "carousel"))
    })

    it("matches a name prefix above a tag", () => {
        expect(scoreEntry(reel, "re")).toBeGreaterThan(scoreEntry(reel, "drag"))
    })

    it("matches the description last", () => {
        const byTag = scoreEntry(reel, "coverflow")
        const byDescription = scoreEntry(reel, "flick")

        expect(byTag).toBeGreaterThan(byDescription)
        expect(byDescription).toBeGreaterThan(0)
    })

    it("ignores case", () => {
        expect(scoreEntry(reel, "REEL")).toBe(scoreEntry(reel, "reel"))
    })

    it("scores an unrelated term at zero", () => {
        expect(scoreEntry(reel, "zzzz")).toBe(0)
    })
})

describe("searchComponents", () => {
    it("returns everything for an empty query", () => {
        expect(searchComponents(COMPONENTS, "")).toHaveLength(COMPONENTS.length)
        expect(searchComponents(COMPONENTS, "   ")).toHaveLength(COMPONENTS.length)
    })

    it("puts the exact component first", () => {
        expect(searchComponents(COMPONENTS, "reel")[0].slug).toBe("reel")
        expect(searchComponents(COMPONENTS, "meadow")[0].slug).toBe("meadow")
    })

    it("finds components by category", () => {
        const hits = searchComponents(COMPONENTS, "typography")

        expect(hits.length).toBeGreaterThan(1)
        expect(hits.every((entry) => entry.category === "Typography")).toBe(true)
    })

    it("finds components by tag", () => {
        const hits = searchComponents(COMPONENTS, "scroll").map((entry) => entry.slug)

        expect(hits).toContain("scroll-stack")
        expect(hits).toContain("aperture")
    })

    it("returns nothing when nothing matches", () => {
        expect(searchComponents(COMPONENTS, "quantum tunnelling")).toHaveLength(0)
    })

    it("ranks a tag match above a description-only match", () => {
        const hits = searchComponents(COMPONENTS, "pointer").map((entry) => entry.slug)

        expect(hits.indexOf("kern")).toBeLessThan(hits.indexOf("antigravity"))
    })

    it("keeps registry order between equally scored hits", () => {
        const hits = searchComponents(COMPONENTS, "scenes")
        const order = hits.map((entry) => COMPONENTS.indexOf(entry))

        expect(order.length).toBeGreaterThan(1)
        expect(order).toEqual([...order].sort((a, b) => a - b))
    })
})
