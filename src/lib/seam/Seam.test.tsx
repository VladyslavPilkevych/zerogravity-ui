import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Seam } from "./Seam"

describe("Seam", () => {
    it("is a horizontal separator by default", () => {
        render(<Seam />)
        const separator = screen.getByRole("separator")

        expect(separator).toHaveAttribute("aria-orientation", "horizontal")
        expect(separator.dataset.pattern).toBe("dash")
    })

    it("names the separator after a string label and shows it", () => {
        render(<Seam label="Section two" />)

        expect(screen.getByRole("separator", { name: "Section two" })).toBeInTheDocument()
        expect(screen.getByText("Section two")).toHaveClass("zg-seam-label")
    })

    it("can be purely decorative", () => {
        const { container } = render(<Seam decorative />)
        const root = container.firstElementChild as HTMLElement

        expect(screen.queryByRole("separator")).toBeNull()
        expect(root).toHaveAttribute("aria-hidden", "true")
    })

    it("animates the pulse pattern unless told otherwise", () => {
        const { container, rerender } = render(<Seam pattern="pulse" />)
        const root = container.firstElementChild as HTMLElement
        expect(root).toHaveAttribute("data-animated")

        rerender(<Seam pattern="pulse" animated={false} />)
        expect(root).not.toHaveAttribute("data-animated")

        rerender(<Seam pattern="stair" animated />)
        expect(root).toHaveAttribute("data-animated")
    })

    it("writes cell, tone and speed as tokens", () => {
        const { container } = render(<Seam cell={6} tone="#c6f24e" speed={2} />)
        const root = container.firstElementChild as HTMLElement

        expect(root.style.getPropertyValue("--zg-seam-cell")).toBe("6px")
        expect(root.style.getPropertyValue("--zg-seam-tone")).toBe("#c6f24e")
        expect(root.style.getPropertyValue("--zg-seam-speed")).toBe("2s")
    })

    it("stops the travelling pulse under reduced motion", () => {
        const css = readFileSync(join(__dirname, "Seam.css"), "utf8")

        expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/)
    })
})
