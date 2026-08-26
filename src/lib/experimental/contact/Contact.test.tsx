import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Contact } from "./Contact"

const frames = ["/1.png", "/2.png", "/3.png", "/4.png"]

describe("Contact", () => {
    it("is a slider, and says where it is", () => {
        const { getByRole } = render(<Contact frames={frames} alt="A sequence" />)
        const slider = getByRole("slider", { name: "A sequence" })

        expect(slider).toHaveAttribute("aria-valuemin", "1")
        expect(slider).toHaveAttribute("aria-valuemax", "4")
        expect(slider).toHaveAttribute("aria-valuenow", "1")
    })

    it("steps with the arrow keys", async () => {
        const user = userEvent.setup()
        const onFrameChange = vi.fn()
        const { getByRole } = render(
            <Contact frames={frames} alt="A sequence" onFrameChange={onFrameChange} />,
        )
        const slider = getByRole("slider")

        slider.focus()
        await user.keyboard("{ArrowRight}{ArrowRight}")
        expect(slider).toHaveAttribute("aria-valuenow", "3")

        await user.keyboard("{ArrowLeft}")
        expect(slider).toHaveAttribute("aria-valuenow", "2")
        expect(onFrameChange).toHaveBeenLastCalledWith(1)
    })

    it("jumps to either end", async () => {
        const user = userEvent.setup()
        const { getByRole } = render(<Contact frames={frames} alt="A sequence" />)
        const slider = getByRole("slider")

        slider.focus()
        await user.keyboard("{End}")
        expect(slider).toHaveAttribute("aria-valuenow", "4")
        await user.keyboard("{Home}")
        expect(slider).toHaveAttribute("aria-valuenow", "1")
    })

    it("never steps past either end", async () => {
        const user = userEvent.setup()
        const { getByRole } = render(<Contact frames={frames} alt="A sequence" />)
        const slider = getByRole("slider")

        slider.focus()
        await user.keyboard("{ArrowLeft}{ArrowLeft}")
        expect(slider).toHaveAttribute("aria-valuenow", "1")
    })

    it("reads out the label for the frame it is on", () => {
        const { getByRole } = render(
            <Contact
                frames={frames}
                labels={["Dawn", "Sunrise", "Morning", "Noon"]}
                alt="A sequence"
                defaultFrame={2}
            />,
        )

        expect(getByRole("slider")).toHaveAttribute("aria-valuetext", "Morning")
    })

    it("scrubs to a frame index rather than to a pixel", () => {
        const onFrameChange = vi.fn()
        const { container } = render(
            <Contact frames={frames} alt="A sequence" onFrameChange={onFrameChange} />,
        )
        const plate = container.querySelector(".xp-contact-plate") as HTMLElement
        vi.spyOn(plate, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 400,
            height: 200,
        } as DOMRect)

        fireEvent.pointerMove(plate, { clientX: 210, clientY: 100 })
        fireEvent.pointerMove(plate, { clientX: 220, clientY: 100 })

        // both moves land inside frame three, so only one change is reported
        expect(onFrameChange).toHaveBeenCalledTimes(1)
        expect(onFrameChange).toHaveBeenCalledWith(2)
    })

    it("takes itself out of the tab order when disabled", () => {
        const { getByRole } = render(<Contact frames={frames} alt="A sequence" disabled />)

        expect(getByRole("slider")).toHaveAttribute("tabindex", "-1")
    })
})
