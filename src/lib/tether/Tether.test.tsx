import { act, render } from "@testing-library/react"
import { StrictMode, createRef } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { frameCount } from "../internal/frames"
import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../test/environment"
import { Tether, tetherProgress } from "./Tether"

const LENGTH = 300

function geometry() {
    const proto = SVGElement.prototype as unknown as Record<string, unknown>
    const identity = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
    proto.getTotalLength = () => 100
    proto.getScreenCTM = () => identity
    proto.getPointAtLength = (at: number) => ({
        x: at,
        y: 5,
        matrixTransform: () => ({ x: (at / 100) * LENGTH, y: 0 }),
    })
    return () => {
        delete proto.getTotalLength
        delete proto.getScreenCTM
        delete proto.getPointAtLength
    }
}

function line(container: HTMLElement) {
    return container.querySelector(".zg-tether-line") as SVGPathElement
}

function placeHost(top: number, height: number) {
    return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement,
    ) {
        return { top, height, left: 0, width: 400, right: 400, bottom: top + height } as DOMRect
    })
}

describe("Tether", () => {
    let frames: FrameHarness
    let restoreGeometry: () => void

    beforeEach(() => {
        frames = installFrameHarness()
        restoreGeometry = geometry()
    })

    afterEach(() => {
        frames.restore()
        restoreGeometry()
    })

    it("maps the box's journey through the viewport onto 0..1", () => {
        expect(tetherProgress(900, 200, 1000, 0.9, 0.5)).toBe(0)
        expect(tetherProgress(300, 200, 1000, 0.9, 0.5)).toBe(1)
        expect(tetherProgress(600, 200, 1000, 0.9, 0.5)).toBeCloseTo(0.5)
    })

    it("sizes the dash from the measured on-screen length", () => {
        const { container } = render(<Tether d="M0 0 L100 0" progress={0.25} />)

        expect(line(container).style.strokeDasharray).toBe(`${LENGTH} ${LENGTH}`)
        expect(parseFloat(line(container).style.strokeDashoffset)).toBeCloseTo(LENGTH * 0.75)
        expect((container.querySelector(".zg-tether") as HTMLElement).dataset.measured).toBe("")
    })

    it("follows a controlled progress without listening to scroll", () => {
        const listen = vi.spyOn(window, "addEventListener")
        const progress = vi.fn()
        const { container, rerender } = render(
            <Tether d="M0 0 L100 0" progress={0} onProgress={progress} />,
        )

        rerender(<Tether d="M0 0 L100 0" progress={1} onProgress={progress} />)
        expect(parseFloat(line(container).style.strokeDashoffset)).toBe(0)
        expect(progress).toHaveBeenLastCalledWith(1)
        expect(listen.mock.calls.filter(([type]) => type === "scroll")).toHaveLength(0)
    })

    it("draws on scroll in a container, one frame per burst, then sleeps", () => {
        const scroller = document.createElement("div")
        document.body.append(scroller)
        Object.defineProperty(scroller, "clientHeight", { value: 1000 })
        const ref = createRef<HTMLDivElement>()
        Object.defineProperty(ref, "current", { value: scroller })
        const hostBox = placeHost(600, 200)
        const progress = vi.fn()

        const { container, unmount } = render(
            <Tether d="M0 0 L100 0" scrollContainer={ref} onProgress={progress} />,
        )
        hostBox.mockRestore()

        act(() => {
            scroller.dispatchEvent(new Event("scroll"))
            scroller.dispatchEvent(new Event("scroll"))
        })
        expect(frames.pending()).toBe(1)
        act(() => frames.advance())
        expect(frames.pending()).toBe(0)
        expect(line(container).style.strokeDasharray).toBe(`${LENGTH} ${LENGTH}`)
        expect(progress).toHaveBeenCalled()

        unmount()
        expect(frameCount()).toBe(0)
        scroller.remove()
    })

    it("draws the whole path and attaches nothing under reduced motion", () => {
        mediaState.reducedMotion = true
        const listen = vi.spyOn(window, "addEventListener")
        const progress = vi.fn()
        const { container } = render(<Tether d="M0 0 L100 0" onProgress={progress} />)

        expect((container.querySelector(".zg-tether") as HTMLElement).dataset.complete).toBe("")
        expect(line(container).style.strokeDasharray).toBe("")
        expect(progress).toHaveBeenCalledWith(1)
        expect(listen.mock.calls.filter(([type]) => type === "scroll")).toHaveLength(0)
    })

    it("still respects a controlled progress under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Tether d="M0 0 L100 0" progress={0.5} />)

        expect((container.querySelector(".zg-tether") as HTMLElement).dataset.complete).toBe(
            undefined,
        )
        expect(parseFloat(line(container).style.strokeDashoffset)).toBeCloseTo(LENGTH / 2)
    })

    it("keeps the stroke width in pixels and hides the SVG from assistive tech", () => {
        const { container } = render(<Tether d="M0 0 L100 0" strokeWidth={4} track={false} />)
        const svg = container.querySelector("svg") as SVGSVGElement

        expect(svg).toHaveAttribute("aria-hidden", "true")
        expect(line(container)).toHaveAttribute("vector-effect", "non-scaling-stroke")
        expect(container.querySelector(".zg-tether-track")).toBeNull()
        expect(
            (container.querySelector(".zg-tether") as HTMLElement).style.getPropertyValue(
                "--zg-tether-width",
            ),
        ).toBe("4px")
    })

    it("stretches only when asked", () => {
        const contain = render(<Tether d="M0 0 L100 0" />)
        expect(contain.container.querySelector("svg")).toHaveAttribute(
            "preserveAspectRatio",
            "xMidYMid meet",
        )
        const stretch = render(<Tether d="M0 0 L100 0" fit="stretch" />)
        expect(stretch.container.querySelector("svg")).toHaveAttribute(
            "preserveAspectRatio",
            "none",
        )
    })

    it("cleans up after a StrictMode remount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(
            <StrictMode>
                <Tether d="M0 0 L100 0" />
            </StrictMode>,
        )

        unmount()
        expect(remove.mock.calls.filter(([type]) => type === "scroll").length).toBeGreaterThan(0)
        expect(frameCount()).toBe(0)
    })

    it("renders on the server with the line hidden until measured", () => {
        const html = renderToString(<Tether d="M0 0 L100 0" />)

        expect(html).toContain('data-mode="scroll"')
        expect(html).not.toContain("data-measured")
        expect(renderToString(<Tether d="M0 0 L100 0" />)).toBe(html)
    })

    it("draws square caps, a dotted track and a block head at the tip in the pixel style", () => {
        const { container } = render(<Tether d="M0 0 L100 0" progress={0.4} />)
        const head = container.querySelector(".zg-tether-head") as SVGPathElement

        expect(line(container)).toHaveAttribute("stroke-linecap", "square")
        expect(container.querySelector(".zg-tether-track")).toHaveAttribute(
            "stroke-dasharray",
            "2 6",
        )
        expect(head.getAttribute("d")).toBe("M 40 5 h 0.001")
        expect(head).toHaveAttribute("data-on")
    })

    it("keeps round caps, a solid track and no head in the classic style", () => {
        const { container } = render(<Tether d="M0 0 L100 0" progress={0.4} variant="classic" />)

        expect(line(container)).toHaveAttribute("stroke-linecap", "round")
        expect(container.querySelector(".zg-tether-track")).not.toHaveAttribute("stroke-dasharray")
        expect(container.querySelector(".zg-tether-head")).toBeNull()
    })

    it("lets explicit caps and dashes override the style", () => {
        const { container } = render(
            <Tether d="M0 0 L100 0" progress={0.4} linecap="butt" trackDash="1 1" />,
        )

        expect(line(container)).toHaveAttribute("stroke-linecap", "butt")
        expect(container.querySelector(".zg-tether-track")).toHaveAttribute(
            "stroke-dasharray",
            "1 1",
        )
    })
})
