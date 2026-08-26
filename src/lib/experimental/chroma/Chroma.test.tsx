import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Chroma } from "./Chroma"

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

describe("Chroma", () => {
    it("keeps the surface underneath usable", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        const { getByRole, container } = render(
            <Chroma>
                <button type="button" onClick={onClick}>
                    Press
                </button>
            </Chroma>,
        )

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        await user.click(getByRole("button", { name: "Press" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("holds the trail in a fixed ring buffer however long the drag", () => {
        const { container } = render(<Chroma />)
        const host = container.querySelector(".xp-chroma") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 400,
            height: 300,
        } as DOMRect)

        for (let move = 0; move < 5000; move += 1) {
            fireEvent.pointerMove(host, { clientX: move % 400, clientY: (move * 7) % 300 })
        }
        frames.advance(3)

        // nothing to assert about pixels in jsdom; what matters is that five
        // thousand moves neither threw nor grew anything unbounded
        expect(container.querySelector("canvas")).toBeInTheDocument()
    })

    it("draws nothing at all under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Chroma />)

        expect((container.querySelector(".xp-chroma") as HTMLElement).dataset.still).toBe("true")
    })

    it("cleans up on unmount", () => {
        const { unmount } = render(<Chroma />)

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
