import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Drench } from "./Drench"

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

describe("Drench", () => {
    it("keeps the word as real text, whatever the water is doing", () => {
        const { getByText, container } = render(<Drench text="ZERO" />)

        expect(getByText("ZERO")).toBeInTheDocument()
        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
    })

    it("builds the glyph stencil and the wet layer offscreen", () => {
        const made: string[] = []
        const real = document.createElement.bind(document)
        const spy = vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
            made.push(tag)
            return real(tag)
        }) as never)

        const { container } = render(<Drench text="ZERO" />)

        // one on screen, plus the stencil and the wet layer that never mount
        expect(made.filter((tag) => tag === "canvas")).toHaveLength(3)
        expect(container.querySelectorAll("canvas")).toHaveLength(1)
        spy.mockRestore()
    })

    it("stencils the word as an outline and never as a solid", () => {
        const calls: string[] = []
        const context = {
            globalAlpha: 1,
            globalCompositeOperation: "source-over" as GlobalCompositeOperation,
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 1,
            lineJoin: "round" as CanvasLineJoin,
            lineCap: "butt" as CanvasLineCap,
            font: "",
            textAlign: "start" as CanvasTextAlign,
            textBaseline: "alphabetic" as CanvasTextBaseline,
            save: () => {},
            restore: () => {},
            setTransform: () => {},
            clearRect: () => {},
            fillRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            closePath: () => {},
            fill: () => {},
            stroke: () => {},
            drawImage: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} }),
            createLinearGradient: () => ({ addColorStop: () => {} }),
            measureText: () => ({ width: 0 }),
            getImageData: () => ({ data: new Uint8ClampedArray(4) }),
            fillText: () => calls.push("fill"),
            strokeText: () => calls.push("stroke"),
        }
        const spy = vi
            .spyOn(HTMLCanvasElement.prototype, "getContext")
            .mockImplementation(() => context as unknown as CanvasRenderingContext2D)

        render(<Drench text="ZERO" />)

        expect(calls).toContain("stroke")
        expect(calls).not.toContain("fill")
        spy.mockRestore()
    })

    it("holds a readable soaked word and no loop under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container, getByText } = render(<Drench text="ZERO" />)

        expect((container.querySelector(".xp-drench") as HTMLElement).dataset.still).toBe("true")
        expect(getByText("ZERO")).toBeInTheDocument()
        expect(frames.pending()).toBe(0)
    })

    it("keeps its loop to one frame at a time and gives it back on unmount", () => {
        const { unmount } = render(<Drench text="ZERO" />)

        expect(frames.pending()).toBe(1)
        frames.advance(5)
        expect(frames.pending()).toBe(1)

        unmount()
        expect(frames.pending()).toBe(0)
    })
})
