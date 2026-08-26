import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Anaglyph } from "./Anaglyph"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Anaglyph", () => {
    it("describes the picture once, on the plate that holds the layout", () => {
        const { container, getByAltText } = render(<Anaglyph src="/a.png" alt="A hillside" />)

        expect(getByAltText("A hillside")).toBeInTheDocument()
        for (const eye of container.querySelectorAll(".xp-anaglyph-eye")) {
            expect(eye).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("gives each instance its own pair of colour matrices", () => {
        const { container } = render(
            <>
                <Anaglyph src="/a.png" alt="one" />
                <Anaglyph src="/b.png" alt="two" />
            </>,
        )
        const ids = [...container.querySelectorAll("filter")].map((node) => node.id)

        expect(ids).toHaveLength(4)
        expect(new Set(ids).size).toBe(4)
    })

    it("carries the mode onto the figure", () => {
        const { container } = render(<Anaglyph src="/a.png" alt="a" mode="parallax" />)

        expect((container.querySelector(".xp-anaglyph") as HTMLElement).dataset.mode).toBe(
            "parallax",
        )
    })

    it("shows the plain picture when the source fails", () => {
        const { container } = render(<Anaglyph src="/a.png" alt="a" />)
        const plate = container.querySelector(".xp-anaglyph-plate") as HTMLImageElement

        fireEvent.error(plate)

        expect((container.querySelector(".xp-anaglyph") as HTMLElement).dataset.failed).toBe("true")
        expect(container.querySelectorAll(".xp-anaglyph-eye")).toHaveLength(0)
    })

    it("converges and holds under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Anaglyph src="/a.png" alt="a" />)

        expect((container.querySelector(".xp-anaglyph") as HTMLElement).dataset.still).toBe("true")
    })
})
