import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Palimpsest } from "./Palimpsest"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Palimpsest", () => {
    it("announces the word once, whatever is stacked behind it", () => {
        const { container, getByRole } = render(<Palimpsest text="Draft" as="h2" layers={5} />)

        expect(getByRole("heading", { name: "Draft" })).toBeInTheDocument()
        expect(container.querySelector(".xp-palimpsest-stack")).toHaveAttribute(
            "aria-hidden",
            "true",
        )
    })

    it("draws the layers it was asked for, clamped", () => {
        const few = render(<Palimpsest text="A" layers={3} />)
        const many = render(<Palimpsest text="A" layers={99} />)

        expect(few.container.querySelectorAll(".xp-palimpsest-ghost")).toHaveLength(3)
        expect(many.container.querySelectorAll(".xp-palimpsest-ghost")).toHaveLength(8)
    })

    it("places the same layers for the same seed", () => {
        const first = render(<Palimpsest text="A" seed={7} />)
        const second = render(<Palimpsest text="A" seed={7} />)

        const read = (view: typeof first) =>
            [...view.container.querySelectorAll<HTMLElement>(".xp-palimpsest-ghost")].map((node) =>
                node.style.getPropertyValue("--pa-dx"),
            )

        expect(read(first)).toEqual(read(second))
    })

    it("renders the tag it was given", () => {
        const { container } = render(<Palimpsest text="A" as="h3" />)

        expect(container.querySelector("h3")).toBeInTheDocument()
    })

    it("settles into a fixed offset under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Palimpsest text="A" />)

        expect((container.querySelector(".xp-palimpsest") as HTMLElement).dataset.still).toBe(
            "true",
        )
    })
})
