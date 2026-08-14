import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { Reel } from "./Reel"

function slides(count = 4) {
    return Array.from({ length: count }, (_, index) => <div key={index}>Slide {index + 1}</div>)
}

describe("Reel", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
    })

    it("labels the carousel and every slide", () => {
        const { container } = render(<Reel label="Products">{slides(3)}</Reel>)
        const root = container.querySelector(".reel")

        expect(root?.getAttribute("aria-roledescription")).toBe("carousel")
        expect(root?.getAttribute("aria-label")).toBe("Products")
        expect(container.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(3)
        expect(container.querySelector(".reel-item")?.getAttribute("aria-label")).toBe("1 of 3")
    })

    it("moves with the arrow buttons when uncontrolled", () => {
        const onIndexChange = vi.fn()
        const { container } = render(<Reel onIndexChange={onIndexChange}>{slides()}</Reel>)

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)
        expect(onIndexChange).toHaveBeenLastCalledWith(1)
    })

    it("respects the keyboard", () => {
        const onIndexChange = vi.fn()
        const { container } = render(<Reel onIndexChange={onIndexChange}>{slides()}</Reel>)
        const viewport = container.querySelector(".reel-viewport") as HTMLElement

        fireEvent.keyDown(viewport, { key: "ArrowRight" })
        expect(onIndexChange).toHaveBeenLastCalledWith(1)

        fireEvent.keyDown(viewport, { key: "End" })
        expect(onIndexChange).toHaveBeenLastCalledWith(3)

        fireEvent.keyDown(viewport, { key: "Home" })
        expect(onIndexChange).toHaveBeenLastCalledWith(0)
    })

    it("stays put when controlled and the parent ignores the change", () => {
        const onIndexChange = vi.fn()
        const { container } = render(
            <Reel index={0} onIndexChange={onIndexChange}>
                {slides()}
            </Reel>,
        )

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)

        expect(onIndexChange).toHaveBeenCalledWith(1)
        expect(container.querySelector(".reel-dot-active")).toBe(
            container.querySelectorAll(".reel-dot")[0],
        )
    })

    it("disables the edge arrows when not looping", () => {
        const { container } = render(<Reel>{slides()}</Reel>)

        expect((container.querySelector(".reel-arrow-prev") as HTMLButtonElement).disabled).toBe(
            true,
        )
        expect((container.querySelector(".reel-arrow-next") as HTMLButtonElement).disabled).toBe(
            false,
        )
    })

    it("keeps the arrows enabled when looping", () => {
        const { container } = render(<Reel loop>{slides()}</Reel>)

        expect((container.querySelector(".reel-arrow-prev") as HTMLButtonElement).disabled).toBe(
            false,
        )
    })

    it("hides the arrows and dots when asked", () => {
        const { container } = render(
            <Reel arrows={false} dots={false}>
                {slides()}
            </Reel>,
        )

        expect(container.querySelectorAll(".reel-arrow")).toHaveLength(0)
        expect(container.querySelectorAll(".reel-dot")).toHaveLength(0)
    })

    it("ignores neighbour clicks when clickToSelect is off", () => {
        const onIndexChange = vi.fn()
        const { container } = render(
            <Reel clickToSelect={false} onIndexChange={onIndexChange}>
                {slides()}
            </Reel>,
        )

        fireEvent.click(container.querySelectorAll(".reel-item")[2] as HTMLElement)
        expect(onIndexChange).not.toHaveBeenCalled()
    })

    it("settles its animation loop and cancels frames on unmount", () => {
        const { container, unmount } = render(<Reel stiffness={20}>{slides()}</Reel>)

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)
        act(() => {
            frames.advance(90, 32)
        })

        expect(frames.pending()).toBe(0)

        unmount()
        expect(frames.pending()).toBe(0)
    })
})
