import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Undertow } from "./Undertow"
import { UNDERTOW_DEMO_BACK, UNDERTOW_DEMO_FRONT } from "./demoImages"

const pair = {
    frontSrc: UNDERTOW_DEMO_FRONT,
    backSrc: UNDERTOW_DEMO_BACK,
    alt: "Noon over midnight",
}

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

describe("Undertow", () => {
    it("describes the pair once instead of announcing two images", () => {
        const { getByRole, container } = render(<Undertow {...pair} />)

        expect(getByRole("img", { name: "Noon over midnight" })).toBeInTheDocument()
        expect(container.querySelectorAll("img")).toHaveLength(0)
        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
    })

    it("draws both images through one canvas, so they cannot drift apart", () => {
        const { container } = render(<Undertow {...pair} />)

        expect(container.querySelectorAll("canvas")).toHaveLength(1)
        expect((container.querySelector(".xp-undertow") as HTMLElement).dataset.ready).toBe("false")
    })

    it("keeps the opening on a layer of its own, so a trail can outlive its ripple", () => {
        const made: string[] = []
        const real = document.createElement.bind(document)
        const spy = vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
            made.push(tag)
            return real(tag)
        }) as never)

        const { container } = render(<Undertow {...pair} />)

        // one on screen, plus the front-image veil and the accumulating mask
        expect(made.filter((tag) => tag === "canvas")).toHaveLength(3)
        expect(container.querySelectorAll("canvas")).toHaveLength(1)
        spy.mockRestore()
    })

    it("holds the box to a ratio when asked", () => {
        const { container } = render(<Undertow {...pair} aspect="16 / 9" />)

        expect((container.querySelector(".xp-undertow") as HTMLElement).style.aspectRatio).toBe(
            "16 / 9",
        )
    })

    it("reads the pointer against its own box rather than the page", () => {
        const { container } = render(<Undertow {...pair} />)
        const host = container.querySelector(".xp-undertow") as HTMLElement

        const box = vi
            .spyOn(host, "getBoundingClientRect")
            .mockReturnValue({ left: 120, top: 40, width: 400, height: 300 } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 320, clientY: 190 })

        expect(box).toHaveBeenCalled()
        box.mockRestore()
    })

    it("ignores a pointer while the box has no size", () => {
        const { container } = render(<Undertow {...pair} />)
        const host = container.querySelector(".xp-undertow") as HTMLElement

        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        } as DOMRect)

        expect(() => fireEvent.pointerMove(host, { clientX: 10, clientY: 10 })).not.toThrow()
    })

    it("re-measures the canvas on resize so the cover geometry stays exact", () => {
        const observers: (() => void)[] = []
        const original = globalThis.ResizeObserver
        class Capture {
            constructor(callback: () => void) {
                observers.push(callback)
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        Object.defineProperty(globalThis, "ResizeObserver", { writable: true, value: Capture })

        const { container } = render(<Undertow {...pair} />)
        const host = container.querySelector(".xp-undertow") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 640,
            height: 360,
        } as DOMRect)

        observers.forEach((run) => run())

        const node = container.querySelector("canvas") as HTMLCanvasElement
        expect(node.style.width).toBe("640px")
        expect(node.style.height).toBe("360px")

        Object.defineProperty(globalThis, "ResizeObserver", { writable: true, value: original })
    })

    it("takes its frame back on unmount", () => {
        const { unmount } = render(<Undertow {...pair} />)

        expect(frames.pending()).toBeGreaterThan(0)
        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("runs no frame loop under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container } = render(<Undertow {...pair} />)

        expect(frames.pending()).toBe(0)
        expect((container.querySelector(".xp-undertow") as HTMLElement).dataset.still).toBe("true")
    })
})
