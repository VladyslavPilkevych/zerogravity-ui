import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Sonar } from "./Sonar"

/** Counts arcs, so one arc is one dot drawn this frame. */
function countingCanvas() {
    let arcs = 0
    const context = {
        globalAlpha: 1,
        fillStyle: "",
        setTransform: () => {},
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {
            arcs += 1
        },
        fill: () => {},
    }
    const spy = vi
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockImplementation(() => context as unknown as CanvasRenderingContext2D)

    return {
        take() {
            const total = arcs
            arcs = 0
            return total
        },
        restore: () => spy.mockRestore(),
    }
}

let field: ReturnType<typeof countingCanvas>
let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    field = countingCanvas()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    field.restore()
})

describe("Sonar", () => {
    it("hides the field and keeps its content readable", () => {
        const { container, getByText } = render(<Sonar>press me</Sonar>)

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(getByText("press me")).toBeInTheDocument()
    })

    it("holds the dot count under its ceiling however tight the gap", () => {
        const { container } = render(<Sonar gap={1} />)
        const host = container.querySelector(".xp-sonar") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 4000,
            height: 4000,
        } as DOMRect)

        field.take()
        fireEvent.pointerDown(host, { clientX: 10, clientY: 10 })
        frames.advance(1)

        expect(field.take()).toBeLessThanOrEqual(2400)
    })

    it("sits idle until something presses it", () => {
        render(<Sonar />)

        field.take()
        frames.advance(4)
        expect(field.take()).toBe(0)
    })

    it("draws once a press sends a wave", () => {
        // jsdom measures everything as zero, and a wave crosses a zero-sized
        // field before the first frame lands; give the whole tree a size first
        const measure = vi
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockReturnValue({ left: 0, top: 0, width: 600, height: 400 } as DOMRect)

        const { container } = render(<Sonar />)
        const host = container.querySelector(".xp-sonar") as HTMLElement

        field.take()
        fireEvent.pointerDown(host, { clientX: 100, clientY: 100 })
        frames.advance(1)

        expect(field.take()).toBeGreaterThan(0)
        measure.mockRestore()
    })

    it("holds a still field under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Sonar />)

        expect((container.querySelector(".xp-sonar") as HTMLElement).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })
})
