import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Contact } from "./Contact"
import { CONTACT_DEMO_FRAMES, CONTACT_DEMO_LABELS } from "./demoFrames"

const meta = {
    title: "Experimental/Contact",
    component: Contact,
    parameters: { surface: { padding: 32 } },
    args: {
        frames: CONTACT_DEMO_FRAMES,
        labels: CONTACT_DEMO_LABELS,
        alt: "A sunrise sequence, scrubbed frame by frame",
        aspect: "16 / 10",
    },
} satisfies Meta<typeof Contact>

export default meta
type Story = StoryObj<typeof meta>

export const FirstFrame: Story = {}

export const MidSequence: Story = { args: { defaultFrame: 4 } }

export const LastFrame: Story = { args: { defaultFrame: 7 } }

export const NoStrip: Story = { args: { strip: false } }

export const SquareCorners: Story = { args: { radius: 0 } }

export const Disabled: Story = { args: { disabled: true } }

/** The arrow keys drive it, so it is usable without a pointer at all. */
export const KeyboardScrub: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const slider = canvas.getByRole("slider")

        slider.focus()
        await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}")

        await expect(slider).toHaveAttribute("aria-valuenow", "4")
    },
}
