import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../../vitest.setup"
import { TrailingCursor } from "./TrailingCursor"

function movePointer(x: number, y: number) {
    const event = new Event("pointermove") as PointerEvent
    Object.defineProperty(event, "clientX", { value: x })
    Object.defineProperty(event, "clientY", { value: y })
    Object.defineProperty(event, "pointerType", { value: "mouse" })
    act(() => {
        window.dispatchEvent(event)
    })
}

function pointerOver(target: Element) {
    const event = new Event("pointerover", { bubbles: true }) as PointerEvent
    Object.defineProperty(event, "target", { value: target })
    Object.defineProperty(event, "pointerType", { value: "mouse" })
    act(() => {
        window.dispatchEvent(event)
    })
}

describe("TrailingCursor", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
    })

    it("renders both layers hidden from the accessibility tree", () => {
        const { container } = render(<TrailingCursor />)
        const root = container.querySelector(".trailing-cursor")

        expect(root?.getAttribute("aria-hidden")).toBe("true")
        expect(container.querySelector(".trailing-cursor-dot")).not.toBeNull()
        expect(container.querySelector(".trailing-cursor-ring")).not.toBeNull()
    })

    it("renders nothing and attaches no listeners when disabled", () => {
        const listen = vi.spyOn(window, "addEventListener")
        const { container } = render(<TrailingCursor disabled />)

        expect(container.querySelector(".trailing-cursor")).toBeNull()
        expect(listen.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("never hides the native cursor under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<TrailingCursor />)

        expect(container.querySelector(".trailing-cursor")).toBeNull()
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
    })

    it("hides the native cursor while mounted and restores it on unmount", () => {
        const { unmount } = render(<TrailingCursor />)
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(true)

        unmount()
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
    })

    it("leaves the native cursor alone when hideNativeCursor is false", () => {
        render(<TrailingCursor hideNativeCursor={false} />)
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
    })

    it("stops the loop once the ring converges and restarts on the next move", () => {
        render(<TrailingCursor ease={0.5} />)

        expect(frames.pending()).toBe(0)

        movePointer(400, 300)
        expect(frames.pending()).toBe(1)

        act(() => {
            frames.advance(60)
        })
        expect(frames.pending()).toBe(0)

        movePointer(10, 10)
        expect(frames.pending()).toBe(1)
    })

    it("applies data-cursor overrides from the hovered element", () => {
        const { container } = render(<TrailingCursor />)
        const root = container.querySelector(".trailing-cursor") as HTMLElement

        const target = document.createElement("button")
        target.setAttribute("data-cursor-label", "Open")
        target.setAttribute("data-cursor-color", "#22d3ee")
        target.setAttribute("data-cursor-scale", "2")
        document.body.append(target)

        pointerOver(target)

        expect(root.dataset.labelled).toBe("true")
        expect(container.querySelector(".trailing-cursor-label")?.textContent).toBe("Open")
        expect(root.style.getPropertyValue("--tc-dot")).toBe("#22d3ee")

        const shape = container.querySelector(".trailing-cursor-ring-shape") as HTMLElement
        expect(shape.style.width).toBe("104px")

        target.remove()
    })

    it("hides both layers over data-cursor='hidden'", () => {
        const { container } = render(<TrailingCursor />)
        const root = container.querySelector(".trailing-cursor") as HTMLElement

        const target = document.createElement("div")
        target.setAttribute("data-cursor", "hidden")
        document.body.append(target)

        pointerOver(target)
        expect(root.dataset.hidden).toBe("true")

        target.remove()
    })
})
