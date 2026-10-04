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
        frames.advance(30)

        expect(Number(host.style.getPropertyValue("--le-at"))).toBeGreaterThan(0.8)
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
