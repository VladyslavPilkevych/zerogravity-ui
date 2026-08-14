import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { SplitFlap } from "./SplitFlap"

describe("SplitFlap", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("exposes the value as a single accessible label", () => {
        const { container } = render(<SplitFlap value="HI" />)

        expect(container.querySelector(".split-flap")?.getAttribute("aria-label")).toBe("HI")
        expect(container.querySelectorAll(".split-flap-cell")).toHaveLength(2)
    })

    it("pads and truncates to the requested length", () => {
        const { container } = render(<SplitFlap value="ABCDE" length={3} />)

        expect(container.querySelectorAll(".split-flap-cell")).toHaveLength(3)
        expect(container.querySelector(".split-flap")?.getAttribute("aria-label")).toBe("ABC")
    })

    it("renders both halves of each cell so the glyph is complete", () => {
        const { container } = render(<SplitFlap value="A" />)
        const cell = container.querySelector(".split-flap-cell")

        expect(cell?.querySelector(".split-flap-top .split-flap-face")?.textContent).toBe("A")
        expect(cell?.querySelector(".split-flap-bottom .split-flap-face")?.textContent).toBe("A")
    })

    it("settles on the target after stepping through the alphabet", () => {
        const { container, rerender } = render(
            <SplitFlap value="A" length={1} stepDuration={10} stagger={0} />,
        )

        rerender(<SplitFlap value="C" length={1} stepDuration={10} stagger={0} />)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(container.querySelector(".split-flap")?.getAttribute("aria-label")).toBe("C")
        expect(container.querySelectorAll('[data-flipping="true"]')).toHaveLength(0)
    })

    it("jumps straight to the target under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container, rerender } = render(<SplitFlap value="A" length={1} />)
        rerender(<SplitFlap value="Z" length={1} />)

        expect(container.querySelector(".split-flap-face")?.textContent).toBe("Z")
        expect(container.querySelectorAll('[data-flipping="true"]')).toHaveLength(0)
    })

    it("clears its timers on unmount", () => {
        const clear = vi.spyOn(globalThis, "clearTimeout")
        const { rerender, unmount } = render(
            <SplitFlap value="A" length={1} stepDuration={10} stagger={0} />,
        )

        rerender(<SplitFlap value="M" length={1} stepDuration={10} stagger={0} />)
        unmount()

        expect(clear).toHaveBeenCalled()
    })
})
