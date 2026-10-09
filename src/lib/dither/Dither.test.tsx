import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../test/frames"
import { frameCount } from "../internal"
import { Dither } from "./Dither"
import { aim, cellAlpha, makeGrid } from "./engine"

let canvas: ReturnType<typeof installCanvasHarness>
let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    canvas = installCanvasHarness()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
})

function pointer(type: "pointerenter" | "pointerleave", target: Element, pointerType = "mouse") {
    const event = new MouseEvent(type, { clientX: 4, clientY: 4 })
    Object.defineProperty(event, "pointerType", { value: pointerType })
    act(() => {
        target.dispatchEvent(event)
    })
}

function settle() {
    act(() => frames.advance(80))
}

describe("Dither", () => {
    it("renders any element around arbitrary children with a hidden pixel layer", () => {
        render(
            <Dither as="a" href="/docs">
                <span>Start here</span>
            </Dither>,
        )
        const link = screen.getByRole("link", { name: "Start here" })

        expect(link).toHaveAttribute("href", "/docs")
        expect(link).toHaveClass("zg-dither")
        expect(link.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(link).toHaveAttribute("data-state", "idle")
    })

    it("keeps a list host valid by drawing from a hidden trailing item", () => {
        const { container } = render(
            <Dither as="ul">
                <li>Docs</li>
                <li>Components</li>
            </Dither>,
        )

        const list = container.querySelector("ul")!
        const children = [...list.children]
        expect(children.every((child) => child.tagName === "LI")).toBe(true)
        expect(children[0]).toHaveTextContent("Docs")

        const slot = children[children.length - 1]
        expect(slot).toHaveClass("zg-dither-slot")
        expect(slot).toHaveAttribute("aria-hidden", "true")
        expect(slot.querySelector("canvas.zg-dither-canvas")).not.toBeNull()
        expect(screen.getAllByRole("listitem")).toHaveLength(2)

        pointer("pointerenter", list)
        expect(list).toHaveAttribute("data-state", "enter")
    })

    it("sweeps in on hover and goes idle once settled", () => {
        const { container } = render(<Dither>Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        pointer("pointerenter", root)
        expect(root.dataset.state).toBe("enter")
        expect(frameCount()).toBe(1)

        settle()
        expect(root.dataset.state).toBe("on")
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("retracts on leave and stops the loop", () => {
        const { container } = render(<Dither>Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        pointer("pointerenter", root)
        settle()
        pointer("pointerleave", root)
        expect(root.dataset.state).toBe("exit")

        settle()
        expect(root.dataset.state).toBe("idle")
        expect(frameCount()).toBe(0)
    })

    it("activates from keyboard focus and releases on blur", () => {
        render(
            <Dither as="button" type="button">
                Open
            </Dither>,
        )
        const button = screen.getByRole("button", { name: "Open" })

        act(() => button.focus())
        expect(button.dataset.state).toBe("enter")

        act(() => button.blur())
        expect(button.dataset.state).toBe("exit")
        settle()
        expect(button.dataset.state).toBe("idle")
    })

    it("ignores touch hover so a tap never leaves it stuck on", () => {
        const { container } = render(<Dither>Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        pointer("pointerenter", root, "touch")
        expect(root.dataset.state).toBe("idle")
        expect(frameCount()).toBe(0)
    })

    it("can be forced on through the active prop", () => {
        const { container, rerender } = render(<Dither active>Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        expect(root.dataset.state).toBe("enter")
        settle()
        expect(root.dataset.state).toBe("on")

        rerender(<Dither active={false}>Card</Dither>)
        expect(root.dataset.state).toBe("exit")
    })

    it("unsubscribes and removes its listeners on unmount", () => {
        const { container, unmount } = render(<Dither>Card</Dither>)
        const root = container.firstElementChild as HTMLElement
        const remove = vi.spyOn(root, "removeEventListener")

        pointer("pointerenter", root)
        expect(frameCount()).toBe(1)
        unmount()

        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
        const removed = remove.mock.calls.map(([type]) => type)
        expect(removed).toEqual(
            expect.arrayContaining(["pointerenter", "pointerleave", "focusin", "focusout"]),
        )
    })

    it("shows the settled texture at once under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Dither>Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        pointer("pointerenter", root)
        expect(root.dataset.state).toBe("on")
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)

        pointer("pointerleave", root)
        expect(root.dataset.state).toBe("idle")
    })

    it("renders plain content without a layer when disabled", () => {
        const { container } = render(<Dither disabled>Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        expect(root.querySelector("canvas")).toBeNull()
        pointer("pointerenter", root)
        expect(frameCount()).toBe(0)
    })
})

describe("Dither edge variant", () => {
    it("marks the variant and draws a hidden span instead of a canvas", () => {
        const { container, rerender } = render(<Dither>Card</Dither>)
        const root = container.firstElementChild as HTMLElement
        expect(root.dataset.variant).toBe("sweep")

        rerender(<Dither variant="edge">Card</Dither>)
        expect(root.dataset.variant).toBe("edge")
        expect(root.querySelector("canvas")).toBeNull()
        expect(root.querySelector(".zg-dither-edge")).toHaveAttribute("aria-hidden", "true")
    })

    it("turns on with hover and off on leave without a frame loop", () => {
        const { container } = render(<Dither variant="edge">Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        pointer("pointerenter", root)
        expect(root.dataset.state).toBe("on")
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)

        pointer("pointerleave", root)
        expect(root.dataset.state).toBe("idle")
    })

    it("turns on for keyboard focus inside, like hover", () => {
        render(
            <Dither variant="edge" as="label">
                <input type="radio" name="plan" aria-label="Plan" />
            </Dither>,
        )
        const input = screen.getByRole("radio", { name: "Plan" })
        const root = input.parentElement!

        act(() => input.focus())
        expect(root.dataset.state).toBe("on")

        act(() => input.blur())
        expect(root.dataset.state).toBe("idle")
    })

    it("ignores touch and follows the active prop", () => {
        const { container, rerender } = render(<Dither variant="edge">Card</Dither>)
        const root = container.firstElementChild as HTMLElement

        pointer("pointerenter", root, "touch")
        expect(root.dataset.state).toBe("idle")

        rerender(
            <Dither variant="edge" active>
                Card
            </Dither>,
        )
        expect(root.dataset.state).toBe("on")
    })

    it("flags reduced motion so CSS drops the stepping and the lift", () => {
        mediaState.reducedMotion = true
        const { container, rerender } = render(<Dither variant="edge">Card</Dither>)
        const root = container.firstElementChild as HTMLElement
        expect(root).toHaveAttribute("data-still")

        rerender(
            <Dither variant="edge" respectReducedMotion={false}>
                Card
            </Dither>,
        )
        expect(root).not.toHaveAttribute("data-still")
    })

    it("keeps a list host valid", () => {
        const { container } = render(
            <Dither as="ol" variant="edge">
                <li>One</li>
            </Dither>,
        )
        const list = container.querySelector("ol")!

        expect([...list.children].every((child) => child.tagName === "LI")).toBe(true)
        expect(list.lastElementChild).toHaveClass("zg-dither-slot")
        expect(list.lastElementChild!.querySelector(".zg-dither-edge")).not.toBeNull()
        expect(screen.getAllByRole("listitem")).toHaveLength(1)
    })

    it("passes the cell size and a matching gap to CSS", () => {
        const { container } = render(
            <Dither variant="edge" cell={16}>
                Card
            </Dither>,
        )
        const root = container.firstElementChild as HTMLElement

        expect(root.style.getPropertyValue("--zg-dither-cell")).toBe("16px")
        expect(root.style.getPropertyValue("--zg-dither-gap")).toBe("2px")
    })
})

describe("Dither engine", () => {
    it("reaches cells near the origin first", () => {
        const grid = makeGrid(160, 16, 8, 0.3, 1)
        aim(grid, "left", 0, 0)

        expect(grid.keys[0]).toBeLessThan(grid.keys[grid.cols - 1])
    })

    it("lights the front brightly and settles to the resting texture", () => {
        expect(cellAlpha(0.5, 0.12, 0.4)).toBe(0)
        expect(cellAlpha(0.5, 0.12, 0.5)).toBeGreaterThan(0.5)
        expect(cellAlpha(0.2, 0.12, 1.2)).toBe(0.12)
    })
})
