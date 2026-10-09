import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

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
    it("keeps the words as real, semantic text and hides the canvas", () => {
        const { getByRole, container } = render(<Drench text="RAIN" as="h2" />)

        expect(getByRole("heading", { level: 2, name: "RAIN" })).toBeInTheDocument()
        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
    })

    it("holds a soaked, still state and no loop under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container, getByText } = render(<Drench text="RAIN" />)

        expect((container.querySelector(".xp-drench") as HTMLElement).dataset.still).toBe("true")
        expect(getByText("RAIN")).toBeInTheDocument()
        expect(frames.pending()).toBe(0)
    })

    it("simulates a frozen frame without starting a loop", () => {
        render(<Drench text="RAIN" seed={4} freezeAt={120} />)

        expect(frames.pending()).toBe(0)
    })

    it("survives a long downpour on one frame subscription", () => {
        const { unmount } = render(<Drench text="RAIN" rain={1} wetness={1} fall={3} />)

        frames.advance(600)
        expect(frames.pending()).toBe(1)

        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("stops its loop once nothing falls and nothing is wet, and wakes for rain", () => {
        const { rerender } = render(<Drench text="RAIN" rain={0} />)

        frames.advance(3)
        expect(frames.pending()).toBe(0)

        rerender(<Drench text="RAIN" rain={0.5} />)
        expect(frames.pending()).toBe(1)
    })
})
