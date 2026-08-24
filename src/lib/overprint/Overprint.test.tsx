import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { Overprint } from "./Overprint"

afterEach(() => {
    mediaState.reducedMotion = false
})

describe("Overprint", () => {
    it("renders one readable text node and hides the ink plates", () => {
        const { container } = render(<Overprint text="PRESS" />)

        expect(container.querySelector(".xp-overprint-text")?.textContent).toBe("PRESS")
        const plates = container.querySelectorAll(".xp-overprint-plate")
        expect(plates).toHaveLength(3)
        plates.forEach((plate) => expect(plate).toHaveAttribute("aria-hidden", "true"))
    })

    it("renders one plate per ink", () => {
        const { container } = render(<Overprint text="PRESS" inks={["#f00", "#0f0"]} />)
        expect(container.querySelectorAll(".xp-overprint-plate")).toHaveLength(2)
    })

    it("releases its scroll listener on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<Overprint text="PRESS" />)

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "scroll").length).toBeGreaterThan(0)
    })

    it("attaches no scroll listener under reduced motion", () => {
        mediaState.reducedMotion = true
        const add = vi.spyOn(window, "addEventListener")

        render(<Overprint text="PRESS" />)

        expect(add.mock.calls.filter(([type]) => type === "scroll")).toHaveLength(0)
    })
})
