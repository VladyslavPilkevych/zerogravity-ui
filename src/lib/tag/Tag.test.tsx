import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Tag, TAG_STATUSES } from "./Tag"

describe("Tag", () => {
    it("keeps its text as real text and hides the glyph", () => {
        const { container } = render(<Tag status="success">Passing</Tag>)

        expect(screen.getByText("Passing")).toBeInTheDocument()
        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("draws a different glyph for every status", () => {
        const shapes = TAG_STATUSES.map((status) => {
            const { container, unmount } = render(<Tag status={status}>x</Tag>)
            const cells = [...container.querySelectorAll("rect")]
                .map((rect) => `${rect.getAttribute("x")},${rect.getAttribute("y")}`)
                .join(" ")
            unmount()
            return cells
        })

        expect(new Set(shapes).size).toBe(TAG_STATUSES.length)
    })

    it("only blinks the live ring", () => {
        const { container, rerender } = render(<Tag status="live">On air</Tag>)
        expect(container.querySelectorAll(".zg-tag-ring").length).toBeGreaterThan(0)

        rerender(<Tag status="info">On air</Tag>)
        expect(container.querySelectorAll(".zg-tag-ring")).toHaveLength(0)
    })

    it("is not a live region unless asked to be", () => {
        const { container, rerender } = render(<Tag status="live">On air</Tag>)
        expect(screen.queryByRole("status")).toBeNull()

        rerender(
            <Tag status="live" role="status">
                On air
            </Tag>,
        )
        expect(screen.getByRole("status")).toBe(container.firstElementChild)
    })

    it("accepts a tone override and a solid variant", () => {
        const { container } = render(
            <Tag tone="#9d7bff" variant="solid">
                Beta
            </Tag>,
        )
        const root = container.firstElementChild as HTMLElement

        expect(root.dataset.variant).toBe("solid")
        expect(root.style.getPropertyValue("--zg-tag-tone")).toBe("#9d7bff")
    })

    it("stops blinking under reduced motion", () => {
        const css = readFileSync(join(__dirname, "Tag.css"), "utf8")

        expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/)
    })
})

describe("Tag entry point", () => {
    it("exports the component and the status list", async () => {
        const entry = await import("./index")

        expect(entry.Tag).toBe(Tag)
        expect(entry.TAG_STATUSES).toEqual([
            "neutral",
            "info",
            "success",
            "warning",
            "danger",
            "live",
        ])
    })
})
