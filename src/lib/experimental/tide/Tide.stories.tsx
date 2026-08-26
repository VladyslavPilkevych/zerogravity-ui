import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tide } from "./Tide"

const meta = {
    title: "Experimental/Tide",
    component: Tide,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ background: "#101a33" }}>
                <div style={{ padding: "40px 20px", color: "rgba(240,244,255,0.8)" }}>
                    Above the waterline
                </div>
                <Story />
                <div style={{ padding: "40px 20px", background: "#071417", color: "#c9d6d2" }}>
                    Below it
                </div>
            </div>
        ),
    ],
} satisfies Meta<typeof Tide>

export default meta
type Story = StoryObj<typeof meta>

/** The wave is time-driven, so a still frame is the honest snapshot. */
export const Still: Story = { args: { disabled: true } }

export const Flat: Story = { args: { disabled: true, amplitude: 0.05 } }

export const Choppy: Story = { args: { disabled: true, amplitude: 1, crests: 5 } }

export const OneLayer: Story = { args: { disabled: true, layers: 1 } }

export const Gradient: Story = { args: { disabled: true, colorTo: "#12d0b4" } }

export const Flipped: Story = { args: { disabled: true, flip: true } }

export const Tall: Story = { args: { disabled: true, height: 240 } }

export const Moving: Story = { parameters: { chromatic: { disableSnapshot: true } } }
