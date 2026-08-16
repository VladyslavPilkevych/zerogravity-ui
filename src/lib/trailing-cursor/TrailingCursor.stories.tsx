import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { TrailingCursor } from "./TrailingCursor"

const meta = {
    title: "Components/TrailingCursor",
    component: TrailingCursor,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ position: "relative", width: "100%", height: 320 }}>
                <button type="button" data-cursor-label="Open" style={{ margin: 24 }}>
                    Interactive target
                </button>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof TrailingCursor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RingOnly: Story = {
    args: { variant: "ring-only" },
}

export const DotOnly: Story = {
    args: { variant: "dot-only" },
}

export const CustomColors: Story = {
    args: { dotColor: "#ff6b8b", ringBorderColor: "#ff6b8b" },
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            expect(canvasElement.querySelector(".trailing-cursor")).toBeNull()
        })
    },
}

export const HiddenFromAssistiveTech: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const root = canvasElement.querySelector(".trailing-cursor")
            expect(root).not.toBeNull()
            expect(root).toHaveAttribute("aria-hidden", "true")
        })
    },
}
