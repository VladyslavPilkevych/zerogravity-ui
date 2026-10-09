import { act, fireEvent, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
import { Lenticular } from "./Lenticular"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

const pair = { frontSrc: "/day.png", backSrc: "/night.png", alt: "Day and night" }

describe("Lenticular", () => {
    it("describes the pair once instead of announcing two pictures", () => {
        const { container, getByRole } = render(<Lenticular {...pair} />)

        expect(getByRole("img", { name: "Day and night" })).toBeInTheDocument()
        for (const plate of container.querySelectorAll("img")) {
            expect(plate).toHaveAttribute("alt", "")
            expect(plate).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("carries the lens pitch into CSS, clamped", () => {
        const { container } = render(<Lenticular {...pair} strips={9999} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement

        expect(host.style.getPropertyValue("--le-strips")).toBe("200")
    })

    it("swings the print with the pointer", () => {
        const { container } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 290, clientY: 100 })
        frames.advance(60)

        expect(Number(host.style.getPropertyValue("--le-at"))).toBeGreaterThan(0.95)
        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(1)
        expect(Number(host.style.getPropertyValue("--le-front"))).toBe(0)

        fireEvent.pointerMove(host, { clientX: 9, clientY: 100 })
        frames.advance(60)
        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(0)
        expect(Number(host.style.getPropertyValue("--le-hold"))).toBe(1)
    })

    it("keeps the side the pointer left it on and goes idle", () => {
        const { container } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)

        expect(frames.pending()).toBe(0)
        fireEvent.pointerMove(host, { clientX: 295, clientY: 100 })
        expect(frames.pending()).toBe(1)
        fireEvent.pointerLeave(host)
        frames.advance(120)

        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(1)
        expect(frames.pending()).toBe(0)
    })

    it("holds a controlled position and ignores the pointer", () => {
        const { container, rerender } = render(<Lenticular {...pair} position={0.03} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement

        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(0)
        fireEvent.pointerMove(host, { clientX: 290, clientY: 100 })
        expect(frames.pending()).toBe(0)

        rerender(<Lenticular {...pair} position={0.97} />)
        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(1)
    })

    it("lets go of the pointer and the frame on unmount", () => {
        const { container, unmount } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)
        const remove = vi.spyOn(host, "removeEventListener")

        fireEvent.pointerMove(host, { clientX: 10, clientY: 100 })
        expect(frames.pending()).toBe(1)
        unmount()

        expect(frames.pending()).toBe(0)
        expect(remove.mock.calls.map(([type]) => type).sort()).toEqual([
            "pointerdown",
            "pointermove",
        ])
    })

    it("marks a broken source instead of showing nothing", () => {
        const { container } = render(<Lenticular {...pair} />)
        const plate = container.querySelector("img") as HTMLImageElement

        fireEvent.error(plate)
        expect((container.querySelector(".xp-lenticular") as HTMLElement).dataset.failed).toBe(
            "true",
        )
    })

    it("swaps without easing or tilt under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)

        expect(host.dataset.still).toBe("true")
        expect(host.style.getPropertyValue("--le-at")).toBe("0.5000")

        fireEvent.pointerMove(host, { clientX: 295, clientY: 100 })
        expect(frames.pending()).toBe(0)
        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(1)
    })

    it("renders on the server with the print head-on", () => {
        const html = renderToString(<Lenticular {...pair} />)

        expect(html).toContain('role="img"')
        expect(html).toContain('aria-label="Day and night"')
        expect(html).toContain("--le-at:0.5000")
    })

    it("pins the pointer to the edges, even past them", () => {
        const { container } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 40, clientY: 100 })
        frames.advance(120)
        expect(host.style.getPropertyValue("--le-at")).toBe("0.0000")

        fireEvent.pointerMove(host, { clientX: 250, clientY: 100 })
        frames.advance(120)
        expect(host.style.getPropertyValue("--le-at")).toBe("0.5000")

        fireEvent.pointerMove(host, { clientX: 999, clientY: 100 })
        frames.advance(120)
        expect(host.style.getPropertyValue("--le-at")).toBe("1.0000")
    })

    it("returns to head-on when motion is switched off mid-swing", () => {
        const { container, rerender } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 295, clientY: 100 })
        frames.advance(120)
        rerender(<Lenticular {...pair} disabled />)

        expect(host.style.getPropertyValue("--le-at")).toBe("0.5000")
        expect(frames.pending()).toBe(0)
        fireEvent.pointerMove(host, { clientX: 5, clientY: 100 })
        expect(frames.pending()).toBe(0)
    })

    it("measures the card again after it resizes", () => {
        const scope = globalThis as Record<string, unknown>
        const original = scope.ResizeObserver
        let resized = () => {}
        scope.ResizeObserver = class {
            constructor(run: () => void) {
                resized = run
            }
            observe() {}
            disconnect() {}
        }
        try {
            const { container } = render(<Lenticular {...pair} />)
            const host = container.querySelector(".xp-lenticular") as HTMLElement
            const rect = vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
                left: 0,
                top: 0,
                width: 300,
                height: 200,
            } as DOMRect)

            fireEvent.pointerMove(host, { clientX: 150, clientY: 100 })
            rect.mockReturnValue({ left: 0, top: 0, width: 600, height: 400 } as DOMRect)
            act(() => resized())
            fireEvent.pointerMove(host, { clientX: 150, clientY: 100 })
            frames.advance(120)

            expect(host.style.getPropertyValue("--le-at")).toBe("0.2500")
        } finally {
            scope.ResizeObserver = original
        }
    })

    it("lets a finger scrub sideways while the page still scrolls vertically", () => {
        mediaState.fine = false
        const { container } = render(<Lenticular {...pair} />)
        const host = container.querySelector(".xp-lenticular") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 300,
            height: 200,
        } as DOMRect)

        expect(host.dataset.touch).toBe("true")
        fireEvent.pointerDown(host, { clientX: 290, clientY: 100, pointerType: "touch" })
        frames.advance(120)
        expect(Number(host.style.getPropertyValue("--le-mix"))).toBe(1)
    })
})
