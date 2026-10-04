import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { PixelWord } from "./PixelWord"
import { SiteFooter } from "./SiteFooter"
import { pixelCells, PIXEL_GLYPH_HEIGHT, PIXEL_GLYPH_WIDTH } from "./pixelFont"

const pathname = vi.hoisted(() => ({ value: "/" }))

vi.mock("next/navigation", () => ({
    usePathname: () => pathname.value,
}))

vi.mock("next/link", () => ({
    default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}))

describe("pixelCells", () => {
    it("lays each letter out on its own five-column slot", () => {
        const { width } = pixelCells("AB")

        expect(width).toBe(PIXEL_GLYPH_WIDTH * 2 + 1)
    })

    it("keeps every cell inside the glyph box", () => {
        const { cells, width } = pixelCells("ZEROGRAVITY")

        expect(cells.length).toBeGreaterThan(100)
        for (const cell of cells) {
            expect(cell.x).toBeGreaterThanOrEqual(0)
            expect(cell.x).toBeLessThan(width)
            expect(cell.y).toBeLessThan(PIXEL_GLYPH_HEIGHT)
        }
    })

    it("draws nothing for a space, and falls back for anything unknown", () => {
        expect(pixelCells(" ").cells).toHaveLength(0)
        expect(pixelCells("€").cells).toHaveLength(0)
    })

    it("is case-insensitive", () => {
        expect(pixelCells("zero").cells).toEqual(pixelCells("ZERO").cells)
    })
})

describe("PixelWord", () => {
    it("reads as one image with a name when it carries the brand", () => {
        const { getByRole } = render(<PixelWord text="ZEROGRAVITY" label="ZeroGravity" />)

        expect(getByRole("img", { name: "ZeroGravity" })).toBeInTheDocument()
    })

    it("is decoration when it has nothing to say", () => {
        const { container } = render(<PixelWord text="ZG" />)

        expect(container.querySelector(".pz-word")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".pz-word")).not.toHaveAttribute("role")
    })

    it("draws one block per lit cell", () => {
        const { container } = render(<PixelWord text="I" />)

        expect(container.querySelectorAll("rect")).toHaveLength(pixelCells("I").cells.length)
    })
})

describe("SiteFooter", () => {
    it("signs off with the wordmark on the marketing page", () => {
        pathname.value = "/"
        const { getByRole } = render(<SiteFooter />)

        expect(getByRole("img", { name: "ZeroGravity" })).toBeInTheDocument()
    })

    it("leaves the signature out of the docs, where it is only scrolling", () => {
        pathname.value = "/docs/reel"
        const { queryByRole } = render(<SiteFooter />)

        expect(queryByRole("img", { name: "ZeroGravity" })).toBeNull()
    })

    it("always offers the three ways out", () => {
        pathname.value = "/docs"
        const { getByRole } = render(<SiteFooter />)

        expect(getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs")
        expect(getByRole("link", { name: "npm" })).toHaveAttribute(
            "href",
            "https://www.npmjs.com/package/zerogravity",
        )
        expect(getByRole("link", { name: "GitHub" })).toHaveAttribute(
            "href",
            expect.stringContaining("github.com"),
        )
    })

    it("opens the outside links safely", () => {
        pathname.value = "/docs"
        const { getByRole } = render(<SiteFooter />)

        expect(getByRole("link", { name: "GitHub" })).toHaveAttribute("rel", "noreferrer noopener")
    })
})
