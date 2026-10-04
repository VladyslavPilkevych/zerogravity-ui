import { render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Gaze } from "./Gaze"

// jsdom has no WebGL; returning null is the same answer a machine without it
// gives, and it keeps three from logging its way through the failure
beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe("Gaze", () => {
    it("says it is loading before the model arrives", () => {
        const { getByRole, getByText } = render(<Gaze label="A watchful head" />)

        expect(getByRole("img", { name: "A watchful head" })).toBeInTheDocument()
        expect(getByText("Loading…")).toBeInTheDocument()
    })

    it("falls back to an announced error where there is no 3D context", async () => {
        const { container, getByRole } = render(<Gaze />)

        await waitFor(() =>
            expect((container.querySelector(".xp-gaze") as HTMLElement).dataset.phase).toBe(
                "error",
            ),
        )
        expect(getByRole("status")).toHaveTextContent("The model could not be loaded")
    })

    it("stays out of the accessibility tree when it is only decoration", () => {
        const { container, queryByRole } = render(<Gaze decorative />)

        expect(queryByRole("img")).toBeNull()
        expect(container.querySelector(".xp-gaze")).toHaveAttribute("aria-hidden", "true")
    })

    it("marks itself still under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container } = render(<Gaze />)

        expect((container.querySelector(".xp-gaze") as HTMLElement).dataset.still).toBe("true")
    })

    it("survives an unmount while the model is still loading", () => {
        const { unmount } = render(<Gaze src="/missing.glb" />)

        expect(() => unmount()).not.toThrow()
    })
})
