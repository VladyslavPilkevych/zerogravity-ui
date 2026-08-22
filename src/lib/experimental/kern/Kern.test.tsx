import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Kern } from "./Kern"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.fine = true
})

describe("Kern", () => {
    it("exposes the word once and hides the per-glyph copies", () => {
        const { container, getByText } = render(<Kern text="TYPE" />)

        expect(getByText("TYPE")).toHaveClass("xp-kern-label")
        const glyphs = container.querySelectorAll(".xp-kern-glyph")
        expect(glyphs).toHaveLength(4)
        glyphs.forEach((glyph) => expect(glyph).toHaveAttribute("aria-hidden", "true"))
    })

    it("preserves spaces as their own glyph slots", () => {
        const { container } = render(<Kern text="A B" />)
        expect(container.querySelectorAll(".xp-kern-glyph")).toHaveLength(2)
        expect(container.querySelectorAll(".xp-kern-space")).toHaveLength(1)
    })

    it("removes its pointer listeners on unmount", () => {
        const { container, unmount } = render(<Kern text="TYPE" />)
        const root = container.querySelector(".xp-kern") as HTMLElement
        const remove = vi.spyOn(root, "removeEventListener")

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })

    it("still renders readable text when disabled", () => {
        const { getByText } = render(<Kern text="TYPE" disabled />)
        expect(getByText("TYPE")).toBeInTheDocument()
    })
})
