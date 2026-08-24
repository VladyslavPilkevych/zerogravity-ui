import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../test/environment"
import { Aperture } from "./Aperture"

function scrollTo(value: number) {
    Object.defineProperty(window, "scrollY", { value, writable: true, configurable: true })
    act(() => {
        window.dispatchEvent(new Event("scroll"))
    })
}

describe("Aperture", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
        scrollTo(0)
    })

    it("follows a scroll container instead of the page when given one", () => {
        const host = document.createElement("div")
        Object.defineProperty(host, "scrollTop", { value: 0, writable: true, configurable: true })
        Object.defineProperty(host, "clientHeight", { value: 500, configurable: true })
        const ref = { current: host }

        const add = vi.spyOn(host, "addEventListener")
        const onWindow = vi.spyOn(window, "addEventListener")

        const { unmount } = render(
            <Aperture scrollContainer={ref}>
                <p>Panel</p>
            </Aperture>,
        )

        expect(add.mock.calls.some(([type]) => type === "scroll")).toBe(true)
        expect(onWindow.mock.calls.some(([type]) => type === "scroll")).toBe(false)

        const remove = vi.spyOn(host, "removeEventListener")
        unmount()
        expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true)
    })

    it("renders its children inside the frame", () => {
        const { getByText, container } = render(
            <Aperture>
                <p>Panel body</p>
            </Aperture>,
        )

        expect(getByText("Panel body")).toBeTruthy()
        expect(container.querySelector(".aperture-frame")).not.toBeNull()
    })

    it("hides the decorative veil from assistive technology", () => {
        const { container } = render(<Aperture>content</Aperture>)

        expect(container.querySelector(".aperture-veil")?.getAttribute("aria-hidden")).toBe("true")
    })

    it("coalesces a burst of scroll events into a single frame", () => {
        render(<Aperture>content</Aperture>)
        frames.advance()

        scrollTo(100)
        scrollTo(200)
        scrollTo(300)

        expect(frames.pending()).toBe(1)
    })

    it("stays flat when disabled", () => {
        const onProgress = vi.fn()
        render(
            <Aperture disabled onProgress={onProgress}>
                content
            </Aperture>,
        )

        scrollTo(400)
        act(() => {
            frames.advance()
        })

        expect(onProgress.mock.calls.every(([value]) => value === 0)).toBe(true)
    })

    it("stays flat under reduced motion", () => {
        mediaState.reducedMotion = true
        const onProgress = vi.fn()
        render(<Aperture onProgress={onProgress}>content</Aperture>)

        scrollTo(400)
        act(() => {
            frames.advance()
        })

        expect(onProgress.mock.calls.every(([value]) => value === 0)).toBe(true)
    })

    it("removes its listeners and cancels pending frames on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<Aperture>content</Aperture>)

        scrollTo(150)
        unmount()

        expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true)
        expect(frames.pending()).toBe(0)
    })
})
