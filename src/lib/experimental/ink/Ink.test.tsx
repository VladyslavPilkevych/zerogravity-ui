import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Ink } from "./Ink"

let canvas: ReturnType<typeof installCanvasHarness>
let frames: ReturnType<typeof installFrameHarness>
let context: CanvasRenderingContext2D

beforeEach(() => {
    canvas = installCanvasHarness()
    frames = installFrameHarness()
    context = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D
    // the stencil reads back as solid ink, so the paper really has a word to soak
    vi.spyOn(context, "getImageData").mockImplementation(
        (_x, _y, width, height) =>
            ({ data: new Uint8ClampedArray(width * height * 4).fill(255) }) as ImageData,
    )
})

afterEach(() => {
    frames.restore()
    canvas.restore()
})

function host(container: HTMLElement): HTMLElement {
    return container.querySelector(".xp-ink") as HTMLElement
}

/** Runs frames until the shared loop has nothing left to drive. */
function drain(limit = 5000): number {
    let count = 0
    while (frames.pending() > 0 && count < limit) {
        frames.advance()
        count += 1
    }
    return count
}

describe("Ink", () => {
    it("keeps the word as real text, whatever the ink is doing", () => {
        const { container, getByText } = render(<Ink text="Ink" />)

        expect(getByText("Ink")).toBeInTheDocument()
        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelectorAll("canvas")).toHaveLength(1)
    })

    it("soaks, settles, and stops asking for frames", () => {
        const { container } = render(<Ink text="Ink" />)

        expect(frames.pending()).toBe(1)
        const used = drain()
        expect(used).toBeLessThan(5000)
        expect(frames.pending()).toBe(0)
        expect(host(container).dataset.settled).toBe("true")
    })

    it("shows only the settled state under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container, getByText } = render(<Ink text="Ink" />)

        expect(host(container).dataset.still).toBe("true")
        expect(host(container).dataset.settled).toBeUndefined()
        drain()
        expect(frames.pending()).toBe(0)
        expect(host(container).dataset.settled).toBe("true")
        expect(getByText("Ink")).toBeInTheDocument()
    })

    it("holds a moment of the soak without a loop when given a time", () => {
        const { container } = render(<Ink text="Ink" time={0.5} />)

        expect(frames.pending()).toBe(0)
        expect(host(container).dataset.still).toBe("true")
    })

    it("draws with the pointer without allocating per move", () => {
        const { container } = render(<Ink text="Ink" />)
        drain()
        const allocate = vi.spyOn(context, "createImageData")
        const element = host(container)
        vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 300, 200))

        fireEvent.pointerDown(element, { clientX: 1, clientY: 1 })
        for (let k = 0; k < 500; k += 1) {
            fireEvent.pointerMove(element, { clientX: (k * 7) % 300, clientY: (k * 3) % 200 })
        }
        fireEvent.pointerUp(element)

        expect(allocate).not.toHaveBeenCalled()
        expect(frames.pending()).toBe(1)
        drain()
        expect(frames.pending()).toBe(0)
    })

    it("ignores the pointer when not interactive", () => {
        const { container } = render(<Ink text="Ink" interactive={false} />)
        drain()

        fireEvent.pointerDown(host(container), { clientX: 1, clientY: 1 })
        expect(frames.pending()).toBe(0)
        expect(host(container).dataset.drawing).toBeUndefined()
    })

    it("cleans up on unmount", () => {
        const { unmount } = render(<Ink text="Ink" />)

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
