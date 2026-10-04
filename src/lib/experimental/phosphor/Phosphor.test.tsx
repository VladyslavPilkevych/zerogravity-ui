import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { mediaState } from "../../../test/environment"
import { Phosphor } from "./Phosphor"

describe("Phosphor", () => {
    it("announces the text once and hides both ghost guns", () => {
        const { container, getByRole } = render(<Phosphor text="READY" as="h2" />)

        expect(getByRole("heading", { name: "READY" })).toBeInTheDocument()
        const ghosts = container.querySelectorAll(".xp-phosphor-ghost")
        expect(ghosts).toHaveLength(2)
        for (const ghost of ghosts) expect(ghost).toHaveAttribute("aria-hidden", "true")
    })

    it("drops the shadow mask when the pitch is zero", () => {
        const on = render(<Phosphor text="A" scanline={4} />)
        const off = render(<Phosphor text="A" scanline={0} />)

        expect(on.container.querySelector(".xp-phosphor-mask")).not.toBeNull()
        expect(off.container.querySelector(".xp-phosphor-mask")).toBeNull()
    })

    it("clamps what it writes into CSS", () => {
        const { container } = render(<Phosphor text="A" bloom={9} fringe={-2} jitter={4} />)
        const host = container.querySelector(".xp-phosphor") as HTMLElement

        expect(host.style.getPropertyValue("--ph-bloom")).toBe("1")
        expect(host.style.getPropertyValue("--ph-fringe")).toBe("0px")
        expect(host.style.getPropertyValue("--ph-jitter")).toBe("1")
    })

    it("stops rolling under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Phosphor text="A" />)

        expect((container.querySelector(".xp-phosphor") as HTMLElement).dataset.still).toBe("true")
    })

    it("needs no frame loop at all", () => {
        // it is CSS from end to end; nothing here should ask for a frame
        const { container } = render(<Phosphor text="A" />)

        expect(container.querySelector("canvas")).toBeNull()
    })
})
