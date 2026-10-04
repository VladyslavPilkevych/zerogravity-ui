import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Prism } from "./Prism"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Prism", () => {
    it("keeps its content interactive under the glass", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        const { getByRole } = render(
            <Prism>
                <button type="button" onClick={onClick}>
                    Press
                </button>
            </Prism>,
        )

        await user.click(getByRole("button", { name: "Press" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("hides every decorative layer from the accessibility tree", () => {
        const { container } = render(<Prism>card</Prism>)
        const layers = container.querySelectorAll(".xp-prism-split, .xp-prism-sheen, .xp-prism-rim")

        expect(layers).toHaveLength(3)
        for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true")
    })

    it("clamps the values it writes into CSS", () => {
        const { container } = render(
            <Prism radius={9999} dispersion={5} sheen={-3}>
                card
            </Prism>,
        )
        const host = container.querySelector(".xp-prism") as HTMLElement

        expect(host.style.getPropertyValue("--pr-radius")).toBe("96px")
        expect(host.style.getPropertyValue("--pr-split")).toBe("1")
        expect(host.style.getPropertyValue("--pr-sheen")).toBe("0")
    })

    it("answers the pointer against its own box", () => {
        const { container } = render(<Prism>card</Prism>)
        const host = container.querySelector(".xp-prism") as HTMLElement
        const box = vi
            .spyOn(host, "getBoundingClientRect")
            .mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 150, clientY: 25 })
        frames.advance(20)

        expect(Number(host.style.getPropertyValue("--pr-ry"))).toBeGreaterThan(0)
        expect(Number(host.style.getPropertyValue("--pr-rx"))).toBeGreaterThan(0)
        box.mockRestore()
    })

    it("holds the slab flat under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Prism>card</Prism>)
        const host = container.querySelector(".xp-prism") as HTMLElement

        fireEvent.pointerMove(host, { clientX: 10, clientY: 10 })
        frames.advance(10)

        expect(host.dataset.still).toBe("true")
        expect(host.style.getPropertyValue("--pr-rx")).toBe("0.000")
    })

    it("gives its frame back on unmount", () => {
        const { unmount } = render(<Prism>card</Prism>)

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
