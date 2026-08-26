import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Ink } from "./Ink"

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

describe("Ink", () => {
    it("keeps the word as real text, whatever the ink is doing", () => {
        const { container, getByText } = render(<Ink text="Ink" />)

        expect(getByText("Ink")).toBeInTheDocument()
        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
    })

    it("keeps the stencil off screen", () => {
        const made: string[] = []
        const { container } = render(<Ink text="Ink" />)

        for (const node of container.querySelectorAll("canvas")) made.push(node.className)
        expect(made).toEqual(["xp-ink-paper"])
    })

    it("soaks once and holds under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container, getByText } = render(<Ink text="Ink" />)

        expect((container.querySelector(".xp-ink") as HTMLElement).dataset.still).toBe("true")
        expect(getByText("Ink")).toBeInTheDocument()
        expect(frames.pending()).toBe(0)
    })

    it("cleans up on unmount", () => {
        const { unmount } = render(<Ink text="Ink" />)

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
