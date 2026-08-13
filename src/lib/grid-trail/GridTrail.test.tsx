import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"

import { installCanvasHarness, installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../../vitest.setup"
import { GridTrail } from "./GridTrail"

function movePointer(x: number, y: number) {
    const event = new Event("pointermove") as PointerEvent
    Object.defineProperty(event, "clientX", { value: x })
    Object.defineProperty(event, "clientY", { value: y })
    Object.defineProperty(event, "pointerType", { value: "mouse" })
    act(() => {
        window.dispatchEvent(event)
    })
}

describe("GridTrail", () => {
    let frames: FrameHarness
    let canvas: ReturnType<typeof installCanvasHarness>

    beforeEach(() => {
        frames = installFrameHarness()
        canvas = installCanvasHarness()
    })

    afterEach(() => {
        frames.restore()
        canvas.restore()
    })

    it("renders a canvas hidden from the accessibility tree", () => {
        const { container } = render(<GridTrail />)
        const node = container.querySelector("canvas")

        expect(node).not.toBeNull()
        expect(node?.getAttribute("aria-hidden")).toBe("true")
    })

    it("renders nothing and attaches no listeners when disabled", () => {
        const listen = vi.spyOn(window, "addEventListener")
        const { container } = render(<GridTrail disabled />)

        expect(container.querySelector("canvas")).toBeNull()
        expect(listen.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("renders nothing and attaches no listeners under reduced motion", () => {
        mediaState.reducedMotion = true
        const listen = vi.spyOn(window, "addEventListener")
        const { container } = render(<GridTrail />)

        expect(container.querySelector("canvas")).toBeNull()
        expect(listen.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("renders nothing on a coarse pointer unless enableOnTouch is set", () => {
        mediaState.fine = false
        const { container, rerender } = render(<GridTrail />)
        expect(container.querySelector("canvas")).toBeNull()

        rerender(<GridTrail enableOnTouch />)
        expect(container.querySelector("canvas")).not.toBeNull()
    })

    it("stays idle until the pointer moves, then stops again once cells fade", () => {
        render(<GridTrail fadeDuration={100} />)

        expect(frames.pending()).toBe(0)

        movePointer(120, 80)
        expect(frames.pending()).toBe(1)

        act(() => {
            frames.advance(4, 16)
        })
        expect(frames.pending()).toBe(1)

        act(() => {
            frames.advance(6, 32)
        })
        expect(frames.pending()).toBe(0)
    })

    it("restarts the loop after it has gone idle", () => {
        render(<GridTrail fadeDuration={50} />)

        movePointer(10, 10)
        act(() => {
            frames.advance(8, 32)
        })
        expect(frames.pending()).toBe(0)

        movePointer(200, 200)
        expect(frames.pending()).toBe(1)
    })

    it("removes its listeners on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<GridTrail />)

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(0)
    })
})
