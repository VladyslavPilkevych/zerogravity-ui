import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { ScrollStack } from "./ScrollStack"

function scrollTo(value: number) {
    Object.defineProperty(window, "scrollY", { value, writable: true, configurable: true })
    act(() => {
        window.dispatchEvent(new Event("scroll"))
    })
}

function cards(count = 3) {
    return Array.from({ length: count }, (_, index) => (
        <section key={index}>Card {index + 1}</section>
    ))
}

describe("ScrollStack", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
        scrollTo(0)
    })

    it("wraps every child in its own sticky card", () => {
        const { container, getByText } = render(<ScrollStack>{cards()}</ScrollStack>)

        expect(container.querySelectorAll(".scroll-stack-card")).toHaveLength(3)
        expect(getByText("Card 2")).toBeTruthy()
    })

    it("stacks cards in source order", () => {
        const { container } = render(<ScrollStack>{cards()}</ScrollStack>)
        const zIndexes = Array.from(
            container.querySelectorAll<HTMLElement>(".scroll-stack-card"),
        ).map((card) => card.style.zIndex)

        expect(zIndexes).toEqual(["1", "2", "3"])
    })

    it("applies per-card heights and falls back to the shared height", () => {
        const { container } = render(
            <ScrollStack height="100vh" heights={["80vh", undefined, "40vh"]}>
                {cards()}
            </ScrollStack>,
        )
        const heights = Array.from(
            container.querySelectorAll<HTMLElement>(".scroll-stack-card"),
        ).map((card) => card.style.height)

        expect(heights).toEqual(["80vh", "100vh", "40vh"])
    })

    it("offsets each sticky card by the peek amount", () => {
        const { container } = render(
            <ScrollStack top={10} peek={20}>
                {cards()}
            </ScrollStack>,
        )
        const tops = Array.from(container.querySelectorAll<HTMLElement>(".scroll-stack-card")).map(
            (card) => card.style.top,
        )

        expect(tops).toEqual(["10px", "30px", "50px"])
    })

    it("coalesces scroll events into a single frame", () => {
        render(<ScrollStack>{cards()}</ScrollStack>)
        frames.advance()

        scrollTo(50)
        scrollTo(120)

        expect(frames.pending()).toBe(1)
    })

    it("removes its scroll listener on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<ScrollStack>{cards()}</ScrollStack>)

        unmount()

        expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true)
    })
})
