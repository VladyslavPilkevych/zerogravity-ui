import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Seam } from "./Seam"

const meta = {
    title: "Components/Seam",
    component: Seam,
    parameters: { surface: { padding: 40 } },
    args: { style: { color: "rgba(255,255,255,0.75)" } },
} satisfies Meta<typeof Seam>

export default meta
type Story = StoryObj<typeof meta>

export const Dash: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("separator")).toBeInTheDocument()
    },
}

export const Stair: Story = {
    args: { pattern: "stair", tone: "#c6f24e" },
}

export const Dither: Story = {
    args: { pattern: "dither", tone: "#9d7bff", cell: 5 },
}

export const Labelled: Story = {
    args: { pattern: "dither", label: "Section two", tone: "#4ee1f2" },
    play: async ({ canvasElement }) => {
        await expect(
            within(canvasElement).getByRole("separator", { name: "Section two" }),
        ).toBeInTheDocument()
    },
}

export const PulseStill: Story = {
    args: { pattern: "pulse", animated: false, tone: "#ff5fa2" },
}

export const Pulse: Story = {
    args: { pattern: "pulse", tone: "#ff5fa2" },
    parameters: { chromatic: { disableSnapshot: true } },
}
