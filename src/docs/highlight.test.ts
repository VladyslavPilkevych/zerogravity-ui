import { describe, expect, it } from "vitest"

import { tokenize } from "./highlight"

function types(code: string) {
    return tokenize(code).map((token) => `${token.type}:${token.text}`)
}

describe("tokenize", () => {
    it("keeps the source intact", () => {
        const code = 'import { Reel } from "zerogravity"\n\n<Reel radius={20} loop />'

        expect(
            tokenize(code)
                .map((token) => token.text)
                .join(""),
        ).toBe(code)
    })

    it("marks import keywords", () => {
        expect(types('import { Reel } from "x"')).toContain("keyword:import")
        expect(types('import { Reel } from "x"')).toContain("keyword:from")
    })

    it("keeps a hyphenated subpath specifier in one string token", () => {
        expect(types('from "zerogravity/grid-trail"')).toContain('string:"zerogravity/grid-trail"')
    })

    it("marks tags and attributes", () => {
        const found = types("<Reel radius={20} />")

        expect(found).toContain("tag:<Reel")
        expect(found).toContain("attr:radius")
        expect(found).toContain("number:20")
    })

    it("marks a bare boolean prop as an attribute", () => {
        expect(types("<Reel loop />")).toContain("attr:loop")
    })

    it("stops treating text as attributes after the tag closes", () => {
        const found = types("<p>hello</p>")

        expect(found).toContain("plain:hello")
        expect(found).not.toContain("attr:hello")
    })

    it("marks literals", () => {
        const found = types("<X a={true} b={null} c={-1.5} />")

        expect(found).toContain("boolean:true")
        expect(found).toContain("boolean:null")
        expect(found).toContain("number:-1.5")
    })

    it("survives an empty string", () => {
        expect(tokenize("")).toEqual([])
    })
})
