import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Pip, PIP_STATUSES } from "./Pip"

describe("Pip", () => {
    it("keeps its text as real text and hides the glyph", () => {
        const { container } = render(<Pip status="success">Passing</Pip>)

        expect(screen.getByText("Passing")).toBeInTheDocument()
        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("draws a different glyph for every status", () => {
        const shapes = PIP_STATUSES.map((status) => {
            const { container, unmount } = render(<Pip status={status}>x</Pip>)
            const cells = [...container.querySelectorAll("rect")]
                .map((rect) => `${rect.getAttribute("x")},${rect.getAttribute("y")}`)
                .join(" ")
            unmount()
            return cells
        })

        expect(new Set(shapes).size).toBe(PIP_STATUSES.length)
    })

    it("only blinks the live ring", () => {
        const { container, rerender } = render(<Pip status="live">On air</Pip>)
        expect(container.querySelectorAll(".zg-pip-ring").length).toBeGreaterThan(0)

        rerender(<Pip status="info">On air</Pip>)
        expect(container.querySelectorAll(".zg-pip-ring")).toHaveLength(0)
    })

    it("is not a live region unless asked to be", () => {
        const { container, rerender } = render(<Pip status="live">On air</Pip>)
        expect(screen.queryByRole("status")).toBeNull()

        rerender(
            <Pip status="live" role="status">
                On air
            </Pip>,
        )
        expect(screen.getByRole("status")).toBe(container.firstElementChild)
    })

    it("accepts a tone override and a solid variant", () => {
        const { container } = render(
            <Pip tone="#9d7bff" variant="solid">
                Beta
            </Pip>,
        )
        const root = container.firstElementChild as HTMLElement

        expect(root.dataset.variant).toBe("solid")
        expect(root.style.getPropertyValue("--zg-pip-tone")).toBe("#9d7bff")
    })

    it("stops blinking under reduced motion", () => {
        const css = readFileSync(join(__dirname, "Pip.css"), "utf8")

        expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/)
    })
})
