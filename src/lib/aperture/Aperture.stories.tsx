import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Aperture } from "./Aperture"

const meta = {
    title: "Components/Aperture",
    component: Aperture,
    parameters: { surface: { padding: 0 } },
    args: {
        height: "150vh",
        children: (
            <div className="sb-panel" style={{ height: "100%" }}>
                Full-bleed panel
            </div>
        ),
    },
} satisfies Meta<typeof Aperture>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RoundedFrame: Story = {
    args: { radius: 32, inset: 8 },
}

export const Opening: Story = {
    args: { direction: "open" },
}

export const CloseThenOpen: Story = {
    args: { direction: "both" },
}

export const StrongDim: Story = {
    args: { dim: 0.8 },
}

export const Disabled: Story = {
    args: { disabled: true },
}

export const RendersTheFrame: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            expect(canvasElement.querySelector(".aperture-frame")).not.toBeNull()
            expect(canvasElement.querySelector(".aperture-inner")).not.toBeNull()
        })
    },
}
