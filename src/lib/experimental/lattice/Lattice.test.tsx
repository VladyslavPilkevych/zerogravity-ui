import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
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
})
