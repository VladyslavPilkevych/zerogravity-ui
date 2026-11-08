import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { installFrameHarness } from "../../test/frames"
import { HALO_GLYPH_LIMIT, Halo, haloFontSize, haloGlyphs } from "./Halo"

function angles(container: HTMLElement): number[] {
    return [...container.querySelectorAll<HTMLElement>(".zg-halo-glyph")].map((glyph) =>
        parseFloat(glyph.style.getPropertyValue("--zg-halo-angle")),
    )
}

describe("Halo", () => {
    it("repeats the phrase with a trailing separator so the seam reads naturally", () => {
        expect(haloGlyphs("AB", 2, " • ").join("")).toBe("AB • AB • ")
        expect(haloGlyphs("x".repeat(500), 3, "").length).toBe(HALO_GLYPH_LIMIT)
        expect(haloGlyphs("AB", 99, "").length).toBe(24)
    })

    it("spreads every glyph evenly over the full turn", () => {
        const { container } = render(<Halo text="ABCD" separator="" repeat={2} />)
        expect(angles(container)).toEqual([0, 45, 90, 135, 180, 225, 270, 315])
    })

    it("names the ring once, however many copies are drawn", () => {
        render(<Halo text="Scroll to explore" repeat={4} />)

        expect(screen.getByRole("img", { name: "Scroll to explore" })).toBeInTheDocument()
        expect(screen.getAllByRole("img")).toHaveLength(1)
    })

    it("keeps the centre outside the image so it keeps its own role", () => {
        render(
            <Halo text="Open">
                <button type="button">Go</button>
            </Halo>,
        )

        expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument()
        expect(screen.getByRole("img").contains(screen.getByRole("button"))).toBe(false)
    })

    it("fits the type to the ring unless a size is given", () => {
        const fitted = haloFontSize(200, 32)
        expect(fitted).toBeGreaterThan(13)
        expect(fitted).toBeLessThanOrEqual(200 / 7)

        const { container } = render(<Halo text="Sized" fontSize={12} />)
        const root = container.querySelector(".zg-halo") as HTMLElement
        expect(root.style.getPropertyValue("--zg-halo-font")).toBe("12px")
    })

    it("exposes spin, direction, pause and the reduced-motion opt-out to CSS", () => {
        const { container } = render(
            <Halo
                text="Flags"
                direction="counterclockwise"
                paused
                pauseOnHover
                respectReducedMotion={false}
            />,
        )
        const root = container.querySelector(".zg-halo") as HTMLElement

        expect(root.dataset.spin).toBe("")
        expect(root.dataset.direction).toBe("counterclockwise")
        expect(root.dataset.paused).toBe("")
        expect(root.dataset.hoverPause).toBe("")
        expect(root.dataset.motion).toBe("always")

        const still = render(<Halo text="Still" spin={false} />)
        expect((still.container.querySelector(".zg-halo") as HTMLElement).dataset.spin).toBe(
            undefined,
        )
    })

    it("runs no JavaScript animation", () => {
        const frames = installFrameHarness()
        render(<Halo text="Turning" />)
        expect(frames.pending()).toBe(0)
        frames.restore()
    })

    it("is a server component that renders identically every time", () => {
        const source = readFileSync(
            path.join(path.dirname(fileURLToPath(import.meta.url)), "Halo.tsx"),
            "utf8",
        )
        expect(source.startsWith('"use client"')).toBe(false)

        const html = renderToString(<Halo text="Same every time" />)
        expect(renderToString(<Halo text="Same every time" />)).toBe(html)
        expect(html).toContain('aria-label="Same every time"')
    })

    it("draws only glyphs, with a round separator by default", () => {
        const { container } = render(<Halo text="AB" repeat={1} />)

        expect(
            [...container.querySelectorAll(".zg-halo-glyph")].map((g) => g.textContent).join(""),
        ).toBe("AB • ")
    })
})
