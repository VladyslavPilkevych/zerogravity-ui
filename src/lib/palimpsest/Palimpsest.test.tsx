import { fireEvent, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
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

    it("asks for no frames until the pointer arrives, and none once it settles", () => {
        const { container, unmount } = render(<Palimpsest text="A" />)
        const host = container.querySelector(".xp-palimpsest") as HTMLElement

        expect(frames.pending()).toBe(0)
        fireEvent.pointerEnter(host)
        expect(frames.pending()).toBe(1)

        frames.advance(200)
        expect(frames.pending()).toBe(0)
        expect(host.style.getPropertyValue("--pa-open")).toBe("1.0000")

        fireEvent.pointerLeave(host)
        frames.advance(200)
        expect(frames.pending()).toBe(0)
        expect(host.style.getPropertyValue("--pa-open")).toBe("0.0000")
        unmount()
    })

    it("cancels a running ease on unmount", () => {
        const { container, unmount } = render(<Palimpsest text="A" />)
        fireEvent.pointerEnter(container.querySelector(".xp-palimpsest") as HTMLElement)

        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("opens without a pointer when the trigger becomes always", () => {
        const { container, rerender } = render(<Palimpsest text="A" />)
        const host = container.querySelector(".xp-palimpsest") as HTMLElement

        rerender(<Palimpsest text="A" trigger="always" />)
        frames.advance(200)
        expect(host.style.getPropertyValue("--pa-open")).toBe("1.0000")
    })

    it("runs no loop at all under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Palimpsest text="A" />)

        fireEvent.pointerEnter(container.querySelector(".xp-palimpsest") as HTMLElement)
        expect(frames.pending()).toBe(0)
    })

    it("renders on the server", () => {
        expect(renderToString(<Palimpsest text="Draft" as="h2" />)).toContain("Draft</h2>")
    })
})
