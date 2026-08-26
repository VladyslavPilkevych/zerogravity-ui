import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Nimbus } from "./Nimbus"

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

describe("Nimbus", () => {
    it("hides the fog and keeps its content readable", () => {
        const { container, getByText } = render(<Nimbus>Nimbus</Nimbus>)

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(getByText("Nimbus")).toBeInTheDocument()
    })

    it("survives a count far past its ceiling", () => {
        const { container } = render(<Nimbus count={5000} />)

        frames.advance(4)
        expect(container.querySelector("canvas")).toBeInTheDocument()
    })

    it("holds still under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Nimbus />)

        expect((container.querySelector(".xp-nimbus") as HTMLElement).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })

    it("cleans up on unmount", () => {
        const { unmount } = render(<Nimbus />)

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
