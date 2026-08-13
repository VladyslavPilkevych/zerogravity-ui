import { describe, expect, it } from "vitest"

import { resolveColor } from "./colors"

describe("resolveColor", () => {
    it("passes hex through untouched", () => {
        expect(resolveColor("#f5ae20")).toBe("#f5ae20")
        expect(resolveColor("  #fff  ")).toBe("#fff")
    })

    it("passes rgb() through untouched", () => {
        expect(resolveColor("rgb(245, 174, 32)")).toBe("rgb(245, 174, 32)")
        expect(resolveColor("rgba(245, 174, 32, 0.4)")).toBe("rgba(245, 174, 32, 0.4)")
    })

    it("passes hsl() through untouched", () => {
        expect(resolveColor("hsl(38 92% 54%)")).toBe("hsl(38 92% 54%)")
    })

    it("passes oklch() through untouched", () => {
        expect(resolveColor("oklch(0.79 0.16 78)")).toBe("oklch(0.79 0.16 78)")
    })

    it("passes a named colour through untouched", () => {
        expect(resolveColor("rebeccapurple")).toBe("rebeccapurple")
    })

    it("reads a custom property off the element", () => {
        const host = document.createElement("div")
        host.style.setProperty("--accent", "#22d3ee")
        document.body.append(host)

        expect(resolveColor("var(--accent)", host)).toBe("#22d3ee")

        host.remove()
    })

    it("uses the fallback when the token is not defined", () => {
        const host = document.createElement("div")
        document.body.append(host)

        expect(resolveColor("var(--missing, #34d399)", host)).toBe("#34d399")

        host.remove()
    })

    it("resolves a token that points at another token", () => {
        const host = document.createElement("div")
        host.style.setProperty("--brand", "oklch(0.7 0.2 20)")
        host.style.setProperty("--accent", "var(--brand)")
        document.body.append(host)

        expect(resolveColor("var(--accent)", host)).toBe("oklch(0.7 0.2 20)")

        host.remove()
    })

    it("returns the raw value when there is no element to read from", () => {
        expect(resolveColor("var(--accent)")).toBe("var(--accent)")
    })

    it("falls back without an element when a fallback is present", () => {
        expect(resolveColor("var(--accent, #fb7185)")).toBe("#fb7185")
    })
})
