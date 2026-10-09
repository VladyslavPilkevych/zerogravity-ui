import { act, render } from "@testing-library/react"
import { useRef } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
import { Louvre } from "./Louvre"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
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

    it("keeps exactly one live copy of the front section", () => {
        const { container, getAllByRole } = render(
            <Louvre
                slats={4}
                front={<button type="button">Front action</button>}
                back={<p>B</p>}
            />,
        )

        expect(container.querySelectorAll(".xp-louvre-front")).toHaveLength(4)
        const blinds = container.querySelector(".xp-louvre-blinds")
        expect(blinds).toHaveAttribute("aria-hidden", "true")
        expect(blinds?.hasAttribute("inert")).toBe(true)
        expect(container.querySelector(".xp-louvre-live")?.hasAttribute("inert")).toBe(false)
        expect(getAllByRole("button", { name: "Front action" })).toHaveLength(1)
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

    it("finds a scroll container that mounts around it", () => {
        function Scroller() {
            const port = useRef<HTMLDivElement>(null)
            return (
                <div ref={port} data-testid="port">
                    <Louvre scrollContainer={port} {...sections} />
                </div>
            )
        }

        const onWindow = vi.spyOn(window, "addEventListener")
        const { container, getByTestId } = render(<Scroller />)
        const port = getByTestId("port")
        const root = container.querySelector(".xp-louvre") as HTMLElement
        Object.defineProperty(port, "clientHeight", { value: 600, configurable: true })
        vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
            top: -700,
            height: 2000,
        } as DOMRect)

        act(() => {
            port.dispatchEvent(new Event("scroll"))
            frames.advance()
        })

        expect(onWindow.mock.calls.some(([type]) => type === "scroll")).toBe(false)
        expect(root.style.getPropertyValue("--louvre-progress")).toBe("0.5000")
    })

    it("lifts the live front off the blinds once they start to turn, and reveals the back", () => {
        const { container } = render(<Louvre {...sections} />)
        const root = container.querySelector(".xp-louvre") as HTMLElement
        vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
            top: -700,
            height: 2000,
        } as DOMRect)
        Object.defineProperty(window, "innerHeight", { value: 600, configurable: true })

        act(() => {
            window.dispatchEvent(new Event("scroll"))
            frames.advance()
        })

        expect(root.hasAttribute("data-moving")).toBe(true)
        expect(root.style.getPropertyValue("--louvre-progress")).toBe("0.5000")
        expect(container.querySelector(".xp-louvre-back")?.hasAttribute("inert")).toBe(true)

        vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
            top: -1200,
            height: 2000,
        } as DOMRect)
        act(() => {
            window.dispatchEvent(new Event("scroll"))
            frames.advance()
        })

        expect(container.querySelector(".xp-louvre-back")?.hasAttribute("inert")).toBe(false)
        expect(container.querySelector(".xp-louvre-live")?.hasAttribute("inert")).toBe(true)
    })

    it("cancels a pending frame on unmount", () => {
        const { unmount } = render(<Louvre {...sections} />)

        window.dispatchEvent(new Event("scroll"))
        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("keeps the blinds under reduced motion when told to ignore it", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Louvre {...sections} respectReducedMotion={false} />)

        expect(container.querySelector(".xp-louvre")).not.toHaveClass("xp-louvre-still")
    })

    it("renders on the server", () => {
        const markup = renderToString(<Louvre {...sections} slats={3} />)

        expect(markup).toContain("Section A")
        expect(markup).toContain("Section B")
    })
})
