import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Wake } from "./Wake"

let canvas: ReturnType<typeof installCanvasHarness>
let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    canvas = installCanvasHarness()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
})

describe("Wake", () => {
    it("keeps its content interactive under the light", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        const { getByRole, container } = render(
            <Wake>
                <button type="button" onClick={onClick}>
                    Press
                </button>
            </Wake>,
        )

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        await user.click(getByRole("button", { name: "Press" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("only builds the warp filter in distortion mode", () => {
        const light = render(<Wake mode="highlight" />)
        const bent = render(<Wake mode="distortion" />)

        expect(light.container.querySelector("feDisplacementMap")).toBeNull()
        expect(bent.container.querySelector("feDisplacementMap")).not.toBeNull()
    })

    it("gives each instance its own filter, so two never collide", () => {
        const { container } = render(
            <>
                <Wake mode="distortion" />
                <Wake mode="distortion" />
            </>,
        )
        const ids = [...container.querySelectorAll("filter")].map((node) => node.id)

        expect(ids).toHaveLength(2)
        expect(new Set(ids).size).toBe(2)
    })

    it("answers a pointer against its own box", () => {
        const { container } = render(<Wake />)
        const host = container.querySelector(".xp-wake") as HTMLElement
        const box = vi
            .spyOn(host, "getBoundingClientRect")
            .mockReturnValue({ left: 10, top: 10, width: 300, height: 200 } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 160, clientY: 110 })
        fireEvent.pointerDown(host, { clientX: 160, clientY: 110 })
        fireEvent.pointerLeave(host)

        expect(box).toHaveBeenCalled()
        box.mockRestore()
    })

    it("drops the warp and marks itself still under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container } = render(<Wake mode="distortion" />)

        expect((container.querySelector(".xp-wake") as HTMLElement).dataset.still).toBe("true")
        expect(container.querySelector("feDisplacementMap")).toBeNull()
    })

    it("stays quiet when disabled, and still renders its content", () => {
        const { container, getByText } = render(<Wake disabled>surface</Wake>)

        expect((container.querySelector(".xp-wake") as HTMLElement).dataset.still).toBe("true")
        expect(getByText("surface")).toBeInTheDocument()
    })

    it("cleans up its loop on unmount", () => {
        const { unmount } = render(<Wake />)

        expect(frames.pending()).toBeGreaterThan(0)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
