import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
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

    it("holds the print flat under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Lenticular {...pair} />)

        expect((container.querySelector(".xp-lenticular") as HTMLElement).dataset.still).toBe(
            "true",
        )
    })
})
