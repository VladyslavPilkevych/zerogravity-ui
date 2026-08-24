import { describe, expect, it } from "vitest"

import { COMPONENTS, findComponent } from "./registry"
import { snippetFor } from "./snippet"

const reel = findComponent("reel")!
const meadow = findComponent("meadow")!
const raster = findComponent("raster")!

describe("snippetFor", () => {
    it("is a bare tag when nothing was changed", () => {
        expect(snippetFor(raster, raster.defaults)).toBe("<Raster />")
    })

    it("shows only what differs from the defaults", () => {
        const code = snippetFor(raster, { ...raster.defaults, pixelSize: 32 })

        expect(code).toContain("pixelSize={32}")
        expect(code).not.toContain("gridGap")
        expect(code).not.toContain("cellSize")
    })

    it("adds an import line for published components", () => {
        const code = snippetFor(reel, { ...reel.defaults, radius: 40 })

        expect(code.startsWith('import { Reel } from "zerogravity-ui"')).toBe(true)
    })

    it("leaves the import out of experimental components", () => {
        expect(snippetFor(raster, raster.defaults)).not.toContain("import")
    })

    it("never emits a demo-only prop", () => {
        const code = snippetFor(reel, { ...reel.defaults, items: 4, radius: 40 })

        expect(code).toContain("radius={40}")
        expect(code).not.toContain("items")
    })

    it("writes strings, numbers and booleans in valid TSX", () => {
        const code = snippetFor(raster, {
            ...raster.defaults,
            glyphSet: "dots",
            cellSize: 14,
            animated: false,
            interactive: true,
        })

        expect(code).toContain('glyphSet="dots"')
        expect(code).toContain("cellSize={14}")
        expect(code).toContain("animated={false}")
        // true against a false default shortens to the bare prop
        expect(code).toContain("\n    interactive\n")
        // untouched props stay out entirely
        expect(code).not.toContain("pixelSize")
    })

    it("shortens a true boolean to the bare prop", () => {
        const code = snippetFor(meadow, { ...meadow.defaults, timeAware: true })

        expect(code).toContain("\n    timeAware\n")
        expect(code).not.toContain("timeAware={true}")
    })

    it("wraps children when the component needs them", () => {
        const code = snippetFor(meadow, { ...meadow.defaults, seed: 9 })

        expect(code).toContain("<Meadow\n")
        expect(code).toContain("seed={9}")
        expect(code).toContain("    <div>Hero copy</div>")
        expect(code).toContain("</Meadow>")
    })

    it("keeps the children even with no changed props", () => {
        expect(snippetFor(meadow, meadow.defaults)).toBe(
            'import { Meadow } from "zerogravity-ui"\n\n<Meadow>\n    <div>Hero copy</div>\n</Meadow>',
        )
    })

    it("omits the import for a component that is not published yet", () => {
        const raster = findComponent("raster")!

        // experimental components have no entry point to import them from
        expect(snippetFor(raster, raster.defaults)).not.toContain("import")
        expect(snippetFor(meadow, meadow.defaults)).toContain(
            'import { Meadow } from "zerogravity-ui"',
        )
    })

    it("uses the JSX tag when it differs from the display name", () => {
        const tessera = findComponent("tessera")!

        expect(snippetFor(tessera, tessera.defaults)).toContain("<TesseraProvider>")
    })

    it("only emits changed fields of a nested object", () => {
        const antigravity = findComponent("antigravity")!
        const config = {
            ...antigravity.defaults,
            formation: {
                ...(antigravity.defaults.formation as Record<string, unknown>),
                shape: "heart",
            },
        }

        const code = snippetFor(antigravity, config)

        expect(code).toContain('formation={{ shape: "heart" }}')
    })

    it("produces balanced JSX for every component at its defaults", () => {
        for (const entry of COMPONENTS) {
            const code = snippetFor(entry, entry.defaults)
            const opens = (code.match(/</g) ?? []).length
            const closes = (code.match(/>/g) ?? []).length

            expect(opens, entry.slug).toBe(closes)
        }
    })
})
