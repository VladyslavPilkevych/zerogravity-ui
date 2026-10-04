import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Meniscus } from "./Meniscus"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Meniscus", () => {
    it("reports a known value as a progress bar", () => {
        const { getByRole } = render(<Meniscus value={0.4} label="Upload" />)
        const bar = getByRole("progressbar", { name: "Upload" })

        expect(bar).toHaveAttribute("aria-valuenow", "40")
        expect(bar).toHaveAttribute("aria-valuemin", "0")
        expect(bar).toHaveAttribute("aria-valuemax", "100")
    })

    it("says it is busy when there is no value to report", () => {
        const { getByRole } = render(<Meniscus label="Working" />)
        const bar = getByRole("progressbar", { name: "Working" })

        expect(bar).toHaveAttribute("aria-busy", "true")
        expect(bar).not.toHaveAttribute("aria-valuenow")
    })

    it("clamps a value outside the range", () => {
        const { getByRole } = render(<Meniscus value={9} label="Upload" />)

        expect(getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    })

    it("keeps the vessel decoration out of the tree", () => {
        const { container } = render(<Meniscus value={0.5} />)

        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".xp-meniscus-glass")).toHaveAttribute("aria-hidden", "true")
    })

    it("takes its own content instead of the number", () => {
        const { getByText, container } = render(<Meniscus value={0.5}>Almost</Meniscus>)

        expect(getByText("Almost")).toBeInTheDocument()
        expect(container.querySelector(".xp-meniscus-read")).toBeNull()
    })

    it("stops sloshing under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Meniscus value={0.5} />)

        expect((container.querySelector(".xp-meniscus") as HTMLElement).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })
})
