import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { Vellum } from "./Vellum"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.fine = true
})

describe("Vellum", () => {
    it("renders children inside the sheet", () => {
        const { container, getByText } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        expect(container.querySelector(".xp-vellum-sheet")).not.toBeNull()
        expect(getByText("surface")).toBeInTheDocument()
    })

    it("draws the highlight layers by default and hides them from assistive tech", () => {
        const { container } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        expect(container.querySelector(".xp-vellum-dent")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".xp-vellum-sheen")).toHaveAttribute("aria-hidden", "true")
    })

    it("removes the highlight entirely when it is switched off", () => {
        const { container } = render(
            <Vellum highlight={false}>
                <p>surface</p>
            </Vellum>,
        )

        expect(container.querySelector(".xp-vellum-dent")).toBeNull()
        expect(container.querySelector(".xp-vellum-sheen")).toBeNull()
    })

    it("keeps the tilt working while the highlight is off", () => {
        const { container } = render(
            <Vellum highlight={false} tilt={20}>
                <p>surface</p>
            </Vellum>,
        )
        const root = container.querySelector(".xp-vellum") as HTMLElement

        expect(root.style.getPropertyValue("--vellum-tilt")).toBe("20deg")
        expect(container.querySelector(".xp-vellum-sheet")).not.toBeNull()
    })

    it("applies a custom highlight configuration", () => {
        const { container } = render(
            <Vellum highlight={{ dent: 0.8, sheen: 0.2, sheenColor: "#ffcc00" }}>
                <p>surface</p>
            </Vellum>,
        )
        const root = container.querySelector(".xp-vellum") as HTMLElement

        expect(root.style.getPropertyValue("--vellum-dent")).toBe("0.8")
        expect(root.style.getPropertyValue("--vellum-sheen")).toBe("0.2")
        expect(root.style.getPropertyValue("--vellum-sheen-color")).toBe("#ffcc00")
    })

    it("removes its pointer listeners on unmount", () => {
        const { container, unmount } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        const root = container.querySelector(".xp-vellum") as HTMLElement
        const remove = vi.spyOn(root, "removeEventListener")

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })
})
