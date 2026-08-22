import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Louvre } from "./Louvre"

afterEach(() => {
    mediaState.reducedMotion = false
})

const sections = {
    front: <h2>Section A</h2>,
    back: <h2>Section B</h2>,
}

describe("Louvre", () => {
    it("follows a scroll container instead of the page when given one", () => {
        const host = document.createElement("div")
        Object.defineProperty(host, "scrollTop", { value: 0, writable: true, configurable: true })
        Object.defineProperty(host, "clientHeight", { value: 500, configurable: true })
        const ref = { current: host }

        const add = vi.spyOn(host, "addEventListener")
        const onWindow = vi.spyOn(window, "addEventListener")

        const { unmount } = render(
            <Louvre scrollContainer={ref} front={<p>A</p>} back={<p>B</p>} />,
        )

        expect(add.mock.calls.some(([type]) => type === "scroll")).toBe(true)
        expect(onWindow.mock.calls.some(([type]) => type === "scroll")).toBe(false)

        const remove = vi.spyOn(host, "removeEventListener")
        unmount()
        expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true)
    })

    it("renders one slat per configured blind", () => {
        const { container } = render(<Louvre {...sections} slats={6} />)
        expect(container.querySelectorAll(".xp-louvre-slat")).toHaveLength(6)
    })

    it("keeps only one focusable copy of the front section", () => {
        const { container } = render(
            <Louvre
                slats={4}
                front={<button type="button">Front action</button>}
                back={<p>B</p>}
            />,
        )

        const copies = container.querySelectorAll(".xp-louvre-front")
        expect(copies).toHaveLength(4)
        expect(copies[0].hasAttribute("inert")).toBe(false)
        expect(copies[1].hasAttribute("inert")).toBe(true)
        expect(copies[3].hasAttribute("inert")).toBe(true)
    })

    it("marks the back section inert until it is revealed", () => {
        const { container } = render(<Louvre {...sections} />)
        expect(container.querySelector(".xp-louvre-back")?.hasAttribute("inert")).toBe(true)
    })

    it("tracks scroll progress on a custom property", () => {
        const { container } = render(<Louvre {...sections} />)
        const root = container.querySelector(".xp-louvre") as HTMLElement

        expect(root.style.getPropertyValue("--louvre-progress")).not.toBe("")
    })

    it("falls back to a plain reveal under reduced motion", () => {
        mediaState.reducedMotion = true
        const add = vi.spyOn(window, "addEventListener")
        const { container } = render(<Louvre {...sections} />)

        expect(container.querySelector(".xp-louvre")).toHaveClass("xp-louvre-still")
        expect(container.querySelector(".xp-louvre-back")?.hasAttribute("inert")).toBe(false)
        expect(add.mock.calls.filter(([type]) => type === "scroll")).toHaveLength(0)
    })

    it("releases its scroll listener on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<Louvre {...sections} />)

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "scroll").length).toBeGreaterThan(0)
    })
})
