import { act, fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../test/frames"
import { frameCount } from "../internal"
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

let restoreObservers = () => {}

function captureObservers() {
    const resized: Array<() => void> = []
    const seen: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = []
    const scope = globalThis as Record<string, unknown>
    const original = { resize: scope.ResizeObserver, visible: scope.IntersectionObserver }
    restoreObservers = () => {
        scope.ResizeObserver = original.resize
        scope.IntersectionObserver = original.visible
    }
    scope.ResizeObserver = class {
        constructor(run: () => void) {
            resized.push(run)
        }
        observe() {}
        unobserve() {}
        disconnect() {}
    }
    scope.IntersectionObserver = class {
        constructor(run: (entries: Array<{ isIntersecting: boolean }>) => void) {
            seen.push(run)
        }
        observe() {}
        unobserve() {}
        disconnect() {}
    }
    return {
        resize: () => act(() => resized.forEach((run) => run())),
        visible: (isIntersecting: boolean) =>
            act(() => seen.forEach((run) => run([{ isIntersecting }]))),
    }
}

beforeEach(() => {
    canvas = installCanvasHarness()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
    restoreObservers()
    restoreObservers = () => {}
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

    it("renders on the server without touching the DOM", () => {
        const html = renderToString(
            <Wake src="/floor.png">
                <p>Above the water</p>
            </Wake>,
        )

        expect(html).toContain("Above the water")
        expect(html).toContain('aria-hidden="true"')
    })

    it("lets a finger stir the water without taking vertical scrolling", () => {
        const { container, rerender } = render(<Wake />)
        expect(host(container).dataset.touch).toBe("true")

        rerender(<Wake enableOnTouch={false} />)
        expect(host(container).dataset.touch).toBeUndefined()

        rerender(<Wake disabled />)
        expect(host(container).dataset.touch).toBeUndefined()
    })

    it("answers a tap and a sideways drag from a finger", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const { container } = render(<Wake />)
        const element = host(container)

        fireEvent.pointerDown(element, { clientX: 60, clientY: 100, pointerType: "touch" })
        fireEvent.pointerMove(element, { clientX: 70, clientY: 100, pointerType: "touch" })
        fireEvent.pointerMove(element, { clientX: 200, clientY: 104, pointerType: "touch" })
        expect(frameCount()).toBe(1)
    })

    it("reallocates its buffers once per new size, never for the same size", () => {
        const observers = captureObservers()
        const box = { ...BOX }
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
            () => ({ ...box }) as DOMRect,
        )
        const context = document.createElement("canvas").getContext("2d")!
        const allocate = vi.spyOn(context, "createImageData")
        const { container } = render(<Wake />)
        const water = container.querySelector("canvas") as HTMLCanvasElement
        expect(allocate).toHaveBeenCalledTimes(1)

        observers.resize()
        observers.resize()
        expect(allocate).toHaveBeenCalledTimes(1)

        box.width = 600
        box.right = box.left + 600
        observers.resize()
        observers.resize()
        expect(allocate).toHaveBeenCalledTimes(2)
        expect(water.width).toBe(240)
    })

    it("lets go of the frame clock offscreen and picks the water up again in view", () => {
        const observers = captureObservers()
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(BOX)
        const { container } = render(<Wake decay={4} />)

        stroke(host(container))
        expect(frameCount()).toBe(1)

        observers.visible(false)
        expect(frameCount()).toBe(0)
        stroke(host(container))
        expect(frameCount()).toBe(0)

        observers.visible(true)
        expect(frameCount()).toBe(1)
    })

    it("removes its pointer listeners on unmount", () => {
        const { container, unmount } = render(<Wake />)
        const element = host(container)
        const remove = vi.spyOn(element, "removeEventListener")

        unmount()

        const types = remove.mock.calls.map(([type]) => type)
        expect(types).toEqual(
            expect.arrayContaining(["pointermove", "pointerdown", "pointerleave", "pointercancel"]),
        )
    })
})
