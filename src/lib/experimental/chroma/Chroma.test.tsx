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

function sized(ui: React.ReactElement) {
    const view = render(ui)
    const host = view.container.querySelector(".xp-chroma") as HTMLElement
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
    } as DOMRect)
    return { ...view, host }
}

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

    it("sleeps until the pointer moves, and wakes only once however many moves", () => {
        const { host } = sized(<Chroma />)
        expect(frames.pending()).toBe(0)

        for (let move = 0; move < 500; move += 1) {
            fireEvent.pointerMove(host, { clientX: move % 400, clientY: (move * 7) % 300 })
        }
        expect(frames.pending()).toBe(1)
    })

    it("leaves no stale trail: it decays out and the loop goes idle", () => {
        const { host } = sized(<Chroma decay={0.3} />)

        for (let move = 0; move < 40; move += 1) {
            fireEvent.pointerMove(host, { clientX: 20 + move * 8, clientY: 150 })
            frames.advance(1)
        }
        fireEvent.pointerLeave(host)
        expect(frames.pending()).toBe(1)

        frames.advance(30)
        expect(frames.pending()).toBe(0)
    })

    it("draws a static glow under reduced motion and never animates", () => {
        mediaState.reducedMotion = true
        const { host } = sized(<Chroma />)

        fireEvent.pointerMove(host, { clientX: 100, clientY: 100 })
        fireEvent.pointerMove(host, { clientX: 140, clientY: 100 })
        expect(frames.pending()).toBe(0)
        expect(host.dataset.still).toBeUndefined()
    })

    it("ignores the pointer entirely when disabled", () => {
        const { host } = sized(<Chroma disabled />)

        fireEvent.pointerMove(host, { clientX: 100, clientY: 100 })
        expect(frames.pending()).toBe(0)
        expect(host.dataset.still).toBe("true")
    })

    it("lets go of its frame and its listeners on unmount", () => {
        const { host, unmount } = sized(<Chroma />)
        const remove = vi.spyOn(host, "removeEventListener")

        fireEvent.pointerMove(host, { clientX: 100, clientY: 100 })
        expect(frames.pending()).toBe(1)

        unmount()
        expect(frames.pending()).toBe(0)
        expect(remove.mock.calls.map(([type]) => type).sort()).toEqual([
            "pointerleave",
            "pointermove",
        ])
    })
})
