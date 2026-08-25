import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { PERSEID_LIMIT, Perseid } from "./Perseid"

/** Counts strokes, so one stroke is one meteor drawn this frame. */
function countingCanvas() {
    let strokes = 0
    const context = {
        globalAlpha: 1,
        globalCompositeOperation: "source-over" as GlobalCompositeOperation,
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        lineCap: "butt" as CanvasLineCap,
        setTransform: () => {},
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {
            strokes += 1
        },
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
    }

    const spy = vi
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockImplementation(() => context as unknown as CanvasRenderingContext2D)

    return {
        take() {
            const total = strokes
            strokes = 0
            return total
        },
        restore: () => spy.mockRestore(),
    }
}

let sky: ReturnType<typeof countingCanvas>
let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    sky = countingCanvas()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    sky.restore()
})

describe("Perseid", () => {
    it("hides the sky and keeps its content readable", () => {
        const { container, getByText } = render(<Perseid>over the field</Perseid>)

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(getByText("over the field")).toBeInTheDocument()
    })

    it("never draws more meteors than the pool holds, however high the count", () => {
        render(<Perseid count={5000} />)

        for (let round = 0; round < 40; round += 1) {
            frames.advance(1, 120)
            expect(sky.take()).toBeLessThanOrEqual(PERSEID_LIMIT)
        }
    })

    it("draws nothing at all at a count of zero", () => {
        render(<Perseid count={0} />)

        frames.advance(10, 120)
        expect(sky.take()).toBe(0)
    })

    it("keeps drawing after long runs, so slots are reused rather than spent", () => {
        render(<Perseid count={12} speed={2} />)

        frames.advance(300, 120)
        sky.take()
        frames.advance(1, 120)
        expect(sky.take()).toBeGreaterThan(0)
    })

    it("holds a still sky under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container } = render(<Perseid count={10} />)

        expect((container.querySelector(".xp-perseid") as HTMLElement).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
        expect(sky.take()).toBeGreaterThan(0)
    })

    it("gives its frame back on unmount", () => {
        const { unmount } = render(<Perseid />)

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
