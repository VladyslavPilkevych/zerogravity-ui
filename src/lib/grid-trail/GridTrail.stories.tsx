import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { GridTrail } from "./GridTrail"

const meta = {
    title: "Components/GridTrail",
    component: GridTrail,
    parameters: { surface: { padding: 0 } },
    args: {
        gridOpacity: 0.14,
    },
    decorators: [
        (Story) => (
            <div style={{ position: "relative", width: "100%", height: 420 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof GridTrail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LargeCells: Story = {
    args: { cellSize: 64 },
}

export const SmallCells: Story = {
    args: { cellSize: 18 },
}

export const CircleShape: Story = {
    args: { shape: "circle" },
}

export const CustomColor: Story = {
    args: { color: "#ff6b8b" },
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            expect(canvasElement.querySelector("canvas")).toBeNull()
        })
    },
}

export const MountsAHiddenCanvas: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const canvas = canvasElement.querySelector("canvas")
            expect(canvas).not.toBeNull()
            expect(canvas).toHaveAttribute("aria-hidden", "true")
        })
    },
}
