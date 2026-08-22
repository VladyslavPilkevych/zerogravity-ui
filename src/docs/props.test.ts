import { describe, expect, it } from "vitest"

import { formatValue, propsFor } from "./props"
import { COMPONENTS, findComponent } from "./registry"

describe("formatValue", () => {
    it("quotes strings and leaves numbers bare", () => {
        expect(formatValue("pixel")).toBe('"pixel"')
        expect(formatValue(0.28)).toBe("0.28")
        expect(formatValue(true)).toBe("true")
        expect(formatValue(null)).toBe("null")
        expect(formatValue(undefined)).toBe("—")
    })

    it("renders arrays and objects readably", () => {
        expect(formatValue(["#fff", "#000"])).toBe('["#fff", "#000"]')
        expect(formatValue({ dent: 0.3 })).toBe("{ dent: 0.3 }")
    })
})

describe("propsFor", () => {
    it("derives a row per control", () => {
        const rows = propsFor(findComponent("raster")!)

        expect(rows.find((row) => row.name === "pixelSize")?.type).toBe("number")
        expect(rows.find((row) => row.name === "pixelSize")?.default).toBe("18")
    })

    it("spells a select out as a union", () => {
        const mode = propsFor(findComponent("raster")!).find((row) => row.name === "mode")

        expect(mode?.type).toBe('"blur" | "glass" | "glyph" | "pixel"')
    })

    it("leaves demo-only knobs out", () => {
        const rows = propsFor(findComponent("reel")!).map((row) => row.name)

        expect(rows).not.toContain("items")
        expect(rows).toContain("spacing")
    })

    it("appends props that have no control", () => {
        const rows = propsFor(findComponent("reel")!).map((row) => row.name)

        expect(rows).toContain("children")
        expect(rows).toContain("onIndexChange")
    })

    it("carries the range into the description", () => {
        const row = propsFor(findComponent("raster")!).find((item) => item.name === "blurStrength")

        expect(row?.description).toContain("Range 4 to 60")
    })

    it("gives every component at least one documented prop, except the gallery", () => {
        for (const entry of COMPONENTS) {
            const rows = propsFor(entry)
            if (entry.slug === "meadow-assets") expect(rows).toHaveLength(0)
            else expect(rows.length, entry.slug).toBeGreaterThan(0)
        }
    })

    it("never repeats a prop name", () => {
        for (const entry of COMPONENTS) {
            const names = propsFor(entry).map((row) => row.name)
            expect(new Set(names).size, entry.slug).toBe(names.length)
        }
    })
})
