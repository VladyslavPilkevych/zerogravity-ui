import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { frameCount } from "../../internal"
import { Wake } from "./Wake"

let canvas: ReturnType<typeof installCanvasHarness>
let frames: ReturnType<typeof installFrameHarness>

const BOX = { left: 10, top: 20, width: 300, height: 200, right: 310, bottom: 220 } as DOMRect

function host(container: HTMLElement): HTMLElement {
    return container.querySelector(".xp-wake") as HTMLElement
}

function stroke(element: HTMLElement) {
    fireEvent.pointerMove(element, { clientX: 60, clientY: 100 })
    fireEvent.pointerMove(element, { clientX: 200, clientY: 120 })
}

beforeEach(() => {
    canvas = installCanvasHarness()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
})

describe("Wake", () => {
    it("keeps its content above the water and interactive", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        const { getByRole, container } = render(
            <Wake>
                <button type="button" onClick={onClick}>
                    Press
                </button>
            </Wake>,
        )

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        await user.click(getByRole("button", { name: "Press" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("holds no frame subscription while the water is at rest", () => {
        render(<Wake />)

        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("starts the loop on a stroke and lets go once the water settles", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const { container } = render(<Wake decay={0.5} />)

        stroke(host(container))
        expect(frameCount()).toBe(1)

        for (let index = 0; index < 400 && frameCount() > 0; index += 1) frames.advance()

        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("lets go of the frame clock on unmount", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const { container, unmount } = render(<Wake />)

        fireEvent.pointerDown(host(container), { clientX: 100, clientY: 100 })
        expect(frameCount()).toBe(1)

        unmount()
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("measures its box once, not on every pointer move", () => {
        const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const { container } = render(<Wake />)
        const before = rect.mock.calls.length

        for (let index = 0; index < 20; index += 1) {
            fireEvent.pointerMove(host(container), { clientX: 20 + index * 10, clientY: 100 })
        }

        expect(rect.mock.calls.length).toBe(before)
        expect(frameCount()).toBe(1)
    })

    it("ignores a pointer that is outside its own box", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            ...BOX,
            width: 0,
            height: 0,
        })
        const { container } = render(<Wake />)

        stroke(host(container))
        expect(frameCount()).toBe(0)
    })

    it("ignores a finger when touch is turned off", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const { container } = render(<Wake enableOnTouch={false} />)

        fireEvent.pointerDown(host(container), {
            clientX: 100,
            clientY: 100,
            pointerType: "touch",
        })
        expect(frameCount()).toBe(0)
    })

    it("paints one still, refracted frame under reduced motion and never animates", () => {
        mediaState.reducedMotion = true
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const put = vi.spyOn(document.createElement("canvas").getContext("2d")!, "putImageData")
        const { container } = render(<Wake />)
        const element = host(container)

        expect(element.dataset.still).toBe("true")
        expect(put).toHaveBeenCalled()

        stroke(element)
        fireEvent.pointerDown(element, { clientX: 100, clientY: 100 })
        expect(frameCount()).toBe(0)
    })

    it("treats disabled as still, and still renders its content", () => {
        const { container, getByText } = render(<Wake disabled>surface</Wake>)

        expect(host(container).dataset.still).toBe("true")
        expect(getByText("surface")).toBeInTheDocument()
    })

    it("disconnects its observers on unmount", () => {
        const resize = vi.spyOn(ResizeObserver.prototype, "disconnect")
        const visible = vi.spyOn(IntersectionObserver.prototype, "disconnect")
        const { unmount } = render(<Wake />)

        unmount()

        expect(resize).toHaveBeenCalled()
        expect(visible).toHaveBeenCalled()
    })

    it("degrades quietly without a 2D context", () => {
        canvas.restore()
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)

        expect(() => {
            const { container } = render(<Wake>content</Wake>)
            stroke(host(container))
        }).not.toThrow()
        expect(frameCount()).toBe(0)
    })

    it("marks a pixelated surface for the stylesheet", () => {
        const { container } = render(<Wake pixelated />)

        expect(host(container).dataset.pixelated).toBe("true")
    })
})
