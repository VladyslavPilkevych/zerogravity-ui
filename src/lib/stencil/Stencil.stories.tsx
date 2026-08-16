import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Stencil } from "./Stencil"

const meta = {
    title: "Components/Stencil",
    component: Stencil,
    args: {
        text: "ZEROGRAV",
        size: 96,
        animate: 0,
    },
} satisfies Meta<typeof Stencil>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Zebra: Story = {
    args: { fill: "zebra" },
}

export const Leopard: Story = {
    args: { fill: "leopard" },
}

export const Stripes: Story = {
    args: { fill: "stripes", angle: 45 },
}

export const Outlined: Story = {
    args: { outline: 2, outlineColor: "#8ab4ff" },
}

export const LongContent: Story = {
    args: { text: "LONG DISPLAY HEADLINE", size: 56 },
}

export const SingleLetter: Story = {
    args: { text: "Z", size: 160 },
}

export const TightTracking: Story = {
    args: { text: "ZEBRA", tracking: -0.06, size: 140 },
}

export const HoverLift: Story = {
    args: { hover: "lift" },
}

export const HoverWave: Story = {
    args: { hover: "wave" },
    play: async ({ canvasElement }) => {
        const letter = canvasElement.querySelectorAll<HTMLElement>(".stencil-letter")[3]
        await userEvent.hover(letter)
        await waitFor(() => {
            expect(letter.style.getPropertyValue("--stencil-wave")).not.toBe("")
        })
    },
}

export const ReadsAsOneWord: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const image = await canvas.findByRole("img", { name: "ZEROGRAV" })
        expect(image).toBeInTheDocument()
        const letters = canvasElement.querySelectorAll(".stencil-letter")
        letters.forEach((letter) => expect(letter).toHaveAttribute("aria-hidden", "true"))
    },
}

export const Animated: Story = {
    args: { animate: 6 },
    parameters: { chromatic: { disableSnapshot: true } },
}
