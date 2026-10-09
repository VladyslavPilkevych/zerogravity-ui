import { fireEvent, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../test/frames"
import { Lattice } from "./Lattice"

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

describe("Lattice", () => {
    it("hides the mesh and keeps its content readable", () => {
        const { container, getByText } = render(<Lattice>over the mesh</Lattice>)

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(getByText("over the mesh")).toBeInTheDocument()
    })

    it("runs one loop however many meshes are on the page", () => {
        render(
            <>
                <Lattice />
                <Lattice />
                <Lattice />
            </>,
        )

        expect(frames.pending()).toBe(1)
    })

    it("stops drawing entirely under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Lattice />)

        expect((container.querySelector(".xp-lattice") as HTMLElement).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })

    it("leaves the shared loop when the last mesh goes", () => {
        const first = render(<Lattice />)
        const second = render(<Lattice />)

        first.unmount()
        expect(frames.pending()).toBe(1)
        second.unmount()
        expect(frames.pending()).toBe(0)
    })

    it("goes idle when nothing drifts and nothing pushes", () => {
        const { unmount } = render(<Lattice speed={0} />)

        frames.advance(3)
        expect(frames.pending()).toBe(0)
        unmount()
    })

    it("wakes on a fine pointer and settles back to idle after it leaves", () => {
        const measure = vi
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockReturnValue({ left: 0, top: 0, width: 600, height: 400 } as DOMRect)
        const { container } = render(<Lattice speed={0} />)
        const host = container.querySelector(".xp-lattice") as HTMLElement
        frames.advance(3)

        fireEvent.pointerMove(host, { clientX: 300, clientY: 200 })
        expect(frames.pending()).toBe(1)
        frames.advance(10)
        expect(frames.pending()).toBe(1)

        fireEvent.pointerLeave(host)
        frames.advance(200)
        expect(frames.pending()).toBe(0)
        measure.mockRestore()
    })

    it("does not react to a coarse pointer unless asked to", () => {
        mediaState.fine = false
        const measure = vi
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockReturnValue({ left: 0, top: 0, width: 600, height: 400 } as DOMRect)

        const touch = render(<Lattice speed={0} />)
        frames.advance(3)
        fireEvent.pointerMove(touch.container.querySelector(".xp-lattice") as HTMLElement, {
            clientX: 300,
            clientY: 200,
        })
        expect(frames.pending()).toBe(0)
        touch.unmount()

        const opted = render(<Lattice speed={0} enableOnTouch />)
        frames.advance(3)
        fireEvent.pointerMove(opted.container.querySelector(".xp-lattice") as HTMLElement, {
            clientX: 300,
            clientY: 200,
        })
        expect(frames.pending()).toBe(1)
        opted.unmount()
        measure.mockRestore()
    })

    it("rebuilds the mesh when the gap changes", () => {
        const measure = vi
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockReturnValue({ left: 0, top: 0, width: 600, height: 400 } as DOMRect)
        const strokes = vi.fn()
        const context = HTMLCanvasElement.prototype.getContext.call(
            document.createElement("canvas"),
            "2d",
        ) as CanvasRenderingContext2D
        context.stroke = strokes

        const { rerender } = render(<Lattice gap={100} speed={0} disabled />)
        strokes.mockClear()
        rerender(<Lattice gap={30} speed={0} disabled />)
        const fine = strokes.mock.calls.length
        strokes.mockClear()
        rerender(<Lattice gap={100} speed={0} disabled />)
        const coarse = strokes.mock.calls.length

        expect(fine).toBeGreaterThan(coarse)
        expect(coarse).toBeGreaterThan(0)
        measure.mockRestore()
    })

    it("renders on the server", () => {
        expect(renderToString(<Lattice>over</Lattice>)).toContain("over")
    })
})
