import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Bezel } from "./Bezel"

const copy = { margin: 0, color: "rgba(255,255,255,0.75)", font: "14px/1.6 system-ui" } as const

const meta = {
    title: "Components/Bezel",
    component: Bezel,
    parameters: { surface: { padding: 40 } },
    args: { style: { maxWidth: 360, color: "#fff" } },
    render: (args) => (
        <Bezel {...args}>
            <p style={copy}>A frame for any content, drawn without images.</p>
        </Bezel>
    ),
} satisfies Meta<typeof Bezel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Labelled: Story = {
    args: { label: "Telemetry", tone: "#c6f24e" },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText("Telemetry")).toBeVisible()
    },
}

export const Grid: Story = {
    args: { label: "Grid", grid: true, tone: "#9d7bff" },
}

export const SquareCorners: Story = {
    args: { notch: 0, ticks: false },
}

export const AsSection: Story = {
    args: { as: "section", "aria-label": "Summary", label: "Summary" },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("region", { name: "Summary" })).toBeVisible()
    },
}
