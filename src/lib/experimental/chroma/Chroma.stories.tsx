import type { Meta, StoryObj } from "@storybook/react-vite"

import { Chroma } from "./Chroma"

const meta = {
    title: "Experimental/Chroma",
    component: Chroma,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div
                style={{
                    minHeight: 400,
                    background: "radial-gradient(circle at 50% 40%, #131a2e, #05070d)",
                }}
            >
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Chroma>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing has been dragged yet, so the canvas is empty and repeatable. */
export const Untouched: Story = { args: { disabled: true } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const WideSplit: Story = {
    args: { split: 50 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Thin: Story = {
    args: { width: 6 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const LongLinger: Story = {
    args: { linger: 3 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const OwnPalette: Story = {
    args: { colors: ["#ffd166", "#06d6a0", "#ef476f"] },
    parameters: { chromatic: { disableSnapshot: true } },
}
