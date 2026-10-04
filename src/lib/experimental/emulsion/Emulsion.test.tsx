import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { Emulsion } from "./Emulsion"

describe("Emulsion", () => {
    it("keeps one described picture and one silent bloom copy", () => {
        const { container, getByAltText } = render(<Emulsion src="/a.png" alt="A hillside" />)

        expect(getByAltText("A hillside")).toBeInTheDocument()
        const bloom = container.querySelector(".xp-emulsion-bloom") as HTMLImageElement
        expect(bloom).toHaveAttribute("alt", "")
        expect(bloom).toHaveAttribute("aria-hidden", "true")
    })

    it("drops every treatment layer when the source fails", () => {
        const { container } = render(<Emulsion src="/a.png" alt="a" />)
        const plate = container.querySelector(".xp-emulsion-plate") as HTMLImageElement

        fireEvent.error(plate)

        expect((container.querySelector(".xp-emulsion") as HTMLElement).dataset.failed).toBe("true")
        expect(container.querySelector(".xp-emulsion-bloom")).toBeNull()
        expect(container.querySelector(".xp-emulsion-leak")).toBeNull()
    })

    it("gives a new source a fresh attempt", () => {
        const { container, rerender } = render(<Emulsion src="/a.png" alt="a" />)

        fireEvent.error(container.querySelector(".xp-emulsion-plate") as HTMLImageElement)
        expect((container.querySelector(".xp-emulsion") as HTMLElement).dataset.failed).toBe("true")

        rerender(<Emulsion src="/b.png" alt="a" />)
        expect(
            (container.querySelector(".xp-emulsion") as HTMLElement).dataset.failed,
        ).toBeUndefined()
    })

    it("clamps the stock it writes into CSS", () => {
        const { container } = render(
            <Emulsion src="/a.png" alt="a" halation={4} warmth={-9} radius={9999} />,
        )
        const host = container.querySelector(".xp-emulsion") as HTMLElement

        expect(host.style.getPropertyValue("--em-bloom")).toBe("1")
        expect(host.style.getPropertyValue("--em-warm")).toBe("-1")
        expect(host.style.getPropertyValue("--em-radius")).toBe("96px")
    })

    it("stops the grain shifting under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Emulsion src="/a.png" alt="a" />)
        const grain = container.querySelector(".xp-emulsion-grain") as HTMLElement

        expect(grain.dataset.still).toBe("true")
    })
})
