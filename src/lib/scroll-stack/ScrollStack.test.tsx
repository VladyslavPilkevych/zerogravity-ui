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

    it("follows a scroll container instead of the page when given one", () => {
        const host = document.createElement("div")
        Object.defineProperty(host, "scrollTop", { value: 0, writable: true, configurable: true })
        Object.defineProperty(host, "clientHeight", { value: 500, configurable: true })
        const ref = { current: host }

        const add = vi.spyOn(host, "addEventListener")
        const onWindow = vi.spyOn(window, "addEventListener")

        const { unmount } = render(<ScrollStack scrollContainer={ref}>{cards()}</ScrollStack>)

        expect(add.mock.calls.some(([type]) => type === "scroll")).toBe(true)
        expect(onWindow.mock.calls.some(([type]) => type === "scroll")).toBe(false)

        const remove = vi.spyOn(host, "removeEventListener")
        unmount()
        expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true)
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

    describe("the last card", () => {
        let restoreHeight: () => void

        beforeEach(() => {
            const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")
            Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
                configurable: true,
                get(this: HTMLElement) {
                    return Number.parseFloat(this.style.height) || 0
                },
            })
            restoreHeight = () => {
                if (original) Object.defineProperty(HTMLElement.prototype, "offsetHeight", original)
            }
        })

        afterEach(() => {
            restoreHeight()
        })

        function stack(hold?: number) {
            return render(
                <ScrollStack
                    heights={["900px", "500px", "900px", "400px"]}
                    top={10}
                    peek={20}
                    scaleTo={0.8}
                    hold={hold}
                >
                    {cards(4)}
                </ScrollStack>,
            )
        }

        it("leaves room below it so the stack stays pinned until it has docked, and then holds", () => {
            const { container } = stack(0.5)
            const space = container.querySelector<HTMLElement>(".scroll-stack-hold")!

            expect(Number.parseFloat(space.style.height)).toBeCloseTo(
                950 - 470 + window.innerHeight * 0.5,
                0,
            )
            expect(space).toHaveAttribute("aria-hidden", "true")
        })

        it("can release the moment it docks", () => {
            const { container } = stack(0)

            expect(container.querySelector<HTMLElement>(".scroll-stack-hold")!.style.height).toBe(
                "480px",
            )
        })

        it("fully covers the card before it exactly when it docks, with no extra scroll", () => {
            const onActiveChange = vi.fn()
            const { container } = render(
                <ScrollStack
                    heights={["900px", "500px", "900px", "400px"]}
                    top={10}
                    peek={20}
                    scaleTo={0.8}
                    onActiveChange={onActiveChange}
                >
                    {cards(4)}
                </ScrollStack>,
            )
            const all = container.querySelectorAll<HTMLElement>(".scroll-stack-card")
            const dock = 900 + 500 + 900 - (10 + 3 * 20)

            scrollTo(dock - 40)
            frames.advance()
            expect(all[2].style.transform).not.toContain("scale(0.8000)")
            expect(all[2].style.transform).toContain("scale(")

            scrollTo(dock)
            frames.advance()
            expect(all[2].style.transform).toContain("scale(0.8000)")
            expect(all[3].style.transform).toBe("")
            expect(onActiveChange).toHaveBeenLastCalledWith(3)
        })
    })

    it("removes its scroll listener on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<ScrollStack>{cards()}</ScrollStack>)

        unmount()

        expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true)
    })
})
