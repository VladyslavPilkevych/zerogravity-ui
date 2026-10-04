import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Quiver } from "./Quiver"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Quiver", () => {
    it("reads as one word, not as a pile of letters", () => {
        const { container, getByLabelText } = render(<Quiver text="Quiver" />)

        expect(getByLabelText("Quiver")).toBeInTheDocument()
        for (const glyph of container.querySelectorAll(".xp-quiver-glyph")) {
            expect(glyph).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("splits into one span per character", () => {
        const { container } = render(<Quiver text="abc de" />)

        expect(container.querySelectorAll(".xp-quiver-glyph")).toHaveLength(6)
    })

    it("moves the crest with the pointer, and only writes one property", () => {
        const { container } = render(<Quiver text="Quiver" ambient={false} />)
        const host = container.querySelector(".xp-quiver") as HTMLElement
        vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 200,
            height: 40,
        } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 180, clientY: 20 })
        frames.advance(30)

        expect(Number(host.style.getPropertyValue("--qv-at"))).toBeGreaterThan(0.7)
    })

    it("renders the tag it was given", () => {
        const { container } = render(<Quiver text="A" as="h2" />)

        expect(container.querySelector("h2")).toBeInTheDocument()
    })

    it("stands still under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Quiver text="A" />)

        expect((container.querySelector(".xp-quiver") as HTMLElement).dataset.still).toBe("true")
    })
})
