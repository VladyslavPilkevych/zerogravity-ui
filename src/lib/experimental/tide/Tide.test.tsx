import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { frameCount } from "../../internal"
import { Tide } from "./Tide"

let frames: ReturnType<typeof installFrameHarness>
let visibility: ((visible: boolean) => void)[] = []
const NativeIntersectionObserver = globalThis.IntersectionObserver

class ControlledIntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
        visibility.push((visible) =>
            this.callback(
                [{ isIntersecting: visible } as IntersectionObserverEntry],
                this as unknown as IntersectionObserver,
            ),
        )
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return []
    }
}

beforeEach(() => {
    frames = installFrameHarness()
    visibility = []
    globalThis.IntersectionObserver =
        ControlledIntersectionObserver as unknown as typeof IntersectionObserver
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(320)
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(200)
})

afterEach(() => {
    frames.restore()
    globalThis.IntersectionObserver = NativeIntersectionObserver
    vi.restoreAllMocks()
})

const host = (container: HTMLElement) => container.querySelector(".xp-tide") as HTMLElement

describe("Tide", () => {
    it("gives its box a wavy contour from the first paint", () => {
        const { container } = render(
            <Tide>
                <p>Card</p>
            </Tide>,
        )

        expect(host(container).style.clipPath).toMatch(/^path\("M.+ Z"\)$/)
        expect(host(container).dataset.edge).toBe("all")
    })

    it("drifts on the shared clock only while it is on screen", () => {
        const { container, unmount } = render(<Tide edge="bottom" />)
        const before = host(container).style.clipPath

        expect(frameCount()).toBe(1)
        frames.advance(3)
        expect(host(container).style.clipPath).not.toBe(before)

        visibility.forEach((report) => report(false))
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)

        visibility.forEach((report) => report(true))
        expect(frameCount()).toBe(1)

        unmount()
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("does not subscribe while paused, and resumes when released", () => {
        const { rerender } = render(<Tide paused />)
        expect(frameCount()).toBe(0)

        rerender(<Tide />)
        expect(frameCount()).toBe(1)

        rerender(<Tide paused />)
        expect(frameCount()).toBe(0)
    })

    it("holds a static wavy contour under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Tide edge="top" />)

        expect(host(container).dataset.still).toBe("true")
        expect(host(container).style.clipPath).toMatch(/^path\(/)
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("holds the same static contour when disabled", () => {
        const one = render(<Tide disabled edge="y" />)
        const two = render(<Tide disabled edge="y" />)

        expect(host(one.container).style.clipPath).toBe(host(two.container).style.clipPath)
        expect(frameCount()).toBe(0)
    })

    it("keeps the children interactive", () => {
        const onClick = vi.fn()
        render(
            <Tide>
                <button type="button" onClick={onClick}>
                    Open
                </button>
            </Tide>,
        )
        const button = screen.getByRole("button", { name: "Open" })

        button.focus()
        expect(button).toHaveFocus()
        fireEvent.click(button)
        expect(onClick).toHaveBeenCalledOnce()
    })

    it("draws an optional decorative line along the contour", () => {
        const plain = render(<Tide />)
        expect(plain.container.querySelector("svg")).toBeNull()

        const { container } = render(<Tide stroke="#fff" />)
        const svg = container.querySelector("svg") as SVGSVGElement
        expect(svg).toHaveAttribute("aria-hidden", "true")
        expect(svg.querySelector("path")?.getAttribute("d")).toMatch(/^M.+ Z$/)
    })

    it("exposes the band depth so children can pad around it", () => {
        const { container } = render(<Tide amplitude={20} />)

        expect(host(container).style.getPropertyValue("--tide-band")).toBe("20px")
    })
})
