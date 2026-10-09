import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../test/frames"
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
            "pointercancel",
            "pointerleave",
            "pointermove",
        ])
    })

    it("renders on the server without touching the DOM", () => {
        const html = renderToString(
            <Chroma colors={["var(--a, red)", "rebeccapurple", "#0ff"]}>
                <p>Surface</p>
            </Chroma>,
        )

        expect(html).toContain("Surface")
        expect(html).toContain('aria-hidden="true"')
    })

    it("leaves a finger alone by default, as a cursor effect", () => {
        const { host } = sized(<Chroma />)

        fireEvent.pointerMove(host, { clientX: 100, clientY: 100, pointerType: "touch" })
        fireEvent.pointerMove(host, { clientX: 200, clientY: 120, pointerType: "touch" })
        expect(frames.pending()).toBe(0)
        expect(host.dataset.touch).toBeUndefined()
    })

    it("draws under a finger when asked, without taking vertical scrolling", () => {
        const { host } = sized(<Chroma enableOnTouch />)

        fireEvent.pointerMove(host, { clientX: 100, clientY: 100, pointerType: "touch" })
        expect(frames.pending()).toBe(1)
        expect(host.dataset.touch).toBe("true")
    })

    it("still fades out after the browser takes the pointer for scrolling", () => {
        const { host } = sized(<Chroma enableOnTouch decay={0.2} />)

        fireEvent.pointerMove(host, { clientX: 100, clientY: 100, pointerType: "touch" })
        fireEvent.pointerCancel(host, { pointerType: "touch" })
        frames.advance(40)

        expect(frames.pending()).toBe(0)
    })
})
