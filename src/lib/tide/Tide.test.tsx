import { act, fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
import { frameCount } from "../internal"
import { Tide } from "./Tide"
import type { TideEdge } from "./contour"

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

    it.each<TideEdge>(["all", "top", "bottom", "left", "right", "x", "y"])(
        "clips the box for edge=%s, inside its own size",
        (edge) => {
            const { container } = render(
                <Tide edge={edge}>
                    <p>Card</p>
                </Tide>,
            )
            const clip = host(container).style.clipPath
            const values = clip.match(/-?[\d.]+/g)!.map(Number)

            expect(host(container).dataset.edge).toBe(edge)
            expect(clip).toMatch(/^path\("M.+ Z"\)$/)
            for (let index = 0; index < values.length; index += 2) {
                expect(values[index]).toBeGreaterThanOrEqual(0)
                expect(values[index]).toBeLessThanOrEqual(320)
                expect(values[index + 1]).toBeGreaterThanOrEqual(0)
                expect(values[index + 1]).toBeLessThanOrEqual(200)
            }
        },
    )

    it("renders the same markup on the server, with the contour left to the client", () => {
        const html = renderToString(
            <Tide edge="x" amplitude={10}>
                <p>Card</p>
            </Tide>,
        )

        expect(html).toContain('data-edge="x"')
        expect(html).toContain("--tide-band:10px")
        expect(html).not.toContain("clip-path")
        expect(html).toContain("<p>Card</p>")
    })

    it("holds no frame at a speed of 0", () => {
        const { container } = render(<Tide speed={0} />)

        expect(frameCount()).toBe(0)
        expect(host(container).dataset.animated).toBeUndefined()
        expect(host(container).style.clipPath).toMatch(/^path\(/)
    })

    it("redraws for a new size and lets go of the observer on unmount", () => {
        const watchers: (() => void)[] = []
        const disconnect = vi.fn()
        const original = globalThis.ResizeObserver
        globalThis.ResizeObserver = class {
            constructor(run: () => void) {
                watchers.push(run)
            }
            observe() {}
            unobserve() {}
            disconnect = disconnect
        } as unknown as typeof ResizeObserver

        const { container, unmount } = render(<Tide edge="bottom" paused />)
        const right = () =>
            Math.max(
                ...host(container)
                    .style.clipPath.match(/[\d.]+(?= )/g)!
                    .map(Number),
            )
        expect(right()).toBe(320)

        vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(500)
        act(() => watchers.forEach((run) => run()))
        expect(right()).toBe(500)

        unmount()
        expect(disconnect).toHaveBeenCalled()
        globalThis.ResizeObserver = original
    })
})
