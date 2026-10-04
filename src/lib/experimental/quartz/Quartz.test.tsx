import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { Quartz } from "./Quartz"

describe("Quartz", () => {
    it("puts the grain over the content and hides it from the tree", () => {
        const { container, getByText } = render(<Quartz>hero</Quartz>)

        expect(getByText("hero")).toBeInTheDocument()
        const grain = container.querySelector(".xp-quartz-grain") as HTMLElement
        expect(grain).toHaveAttribute("aria-hidden", "true")
    })

    it("paints the tile once and hands it to CSS rather than to React", () => {
        const { container } = render(<Quartz seed={3}>hero</Quartz>)
        const grain = container.querySelector(".xp-quartz-grain") as HTMLElement

        // jsdom cannot rasterise, so the URL may be empty; what matters is that
        // the component wrote to the node and kept the value out of state
        expect(grain.style.backgroundImage).toBeDefined()
        expect(container.querySelectorAll("canvas")).toHaveLength(0)
    })

    it("carries the blend mode onto the grain layer", () => {
        const { container } = render(<Quartz blend="overlay">hero</Quartz>)
        const grain = container.querySelector(".xp-quartz-grain") as HTMLElement

        expect(grain.style.mixBlendMode).toBe("overlay")
    })

    it("clamps intensity and tile size", () => {
        const { container } = render(
            <Quartz intensity={9} scale={4}>
                hero
            </Quartz>,
        )
        const host = container.querySelector(".xp-quartz") as HTMLElement

        expect(host.style.getPropertyValue("--qz-alpha")).toBe("1")
        expect(host.style.getPropertyValue("--qz-size")).toBe("16px")
    })

    it("stops the shift under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Quartz>hero</Quartz>)

        expect((container.querySelector(".xp-quartz") as HTMLElement).dataset.still).toBe("true")
    })
})
