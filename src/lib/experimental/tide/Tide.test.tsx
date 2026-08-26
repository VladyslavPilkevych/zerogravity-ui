import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Tide } from "./Tide"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Tide", () => {
    it("is decoration, and says so", () => {
        const { container } = render(<Tide />)

        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("draws a closed body of water", () => {
        const { container } = render(<Tide layers={1} />)
        const path = container.querySelector("path") as SVGPathElement

        const d = path.getAttribute("d") ?? ""
        expect(d.startsWith("M0 120")).toBe(true)
        expect(d.endsWith("Z")).toBe(true)
    })

    it("draws a second, slower wave when asked", () => {
        const one = render(<Tide layers={1} />)
        const two = render(<Tide layers={2} />)

        expect(one.container.querySelectorAll("path")).toHaveLength(1)
        expect(two.container.querySelectorAll("path")).toHaveLength(2)
    })

    it("gives each instance its own gradient", () => {
        const { container } = render(
            <>
                <Tide colorTo="#fff" />
                <Tide colorTo="#000" />
            </>,
        )
        const ids = [...container.querySelectorAll("linearGradient")].map((node) => node.id)

        expect(new Set(ids).size).toBe(2)
    })

    it("flips toward the section above when asked", () => {
        const { container } = render(<Tide flip />)

        expect((container.querySelector(".xp-tide") as HTMLElement).dataset.flip).toBe("true")
    })

    it("holds a flat wave under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Tide />)

        expect((container.querySelector(".xp-tide") as HTMLElement).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })
})
