import type { Meta, StoryObj } from "@storybook/react-vite"

import { Drench } from "./Drench"

const meta = {
    title: "Experimental/Drench",
    component: Drench,
    parameters: { surface: { padding: 0 } },
    args: { text: "ZERO" },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 420, background: "#05070d" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Drench>

export default meta
type Story = StoryObj<typeof meta>

/** `disabled` holds the soaked word: the same beads in the same places. */
export const Soaked: Story = {
    args: { disabled: true },
}

export const LongWord: Story = {
    args: { disabled: true, text: "GRAVITY" },
}

export const WarmWater: Story = {
    args: { disabled: true, color: "#ffcf8f" },
}

export const LightWeight: Story = {
    args: { disabled: true, fontWeight: 400 },
}

export const SerifFace: Story = {
    args: { disabled: true, fontFamily: "Georgia, serif" },
}

export const FineOutline: Story = {
    args: { disabled: true, outline: 0.015 },
}

export const HeavyOutline: Story = {
    args: { disabled: true, outline: 0.11 },
}

export const Raining: Story = {
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Downpour: Story = {
    args: { rain: 1, fall: 1.6, wetness: 0.9 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Drizzle: Story = {
    args: { rain: 0.15, fall: 0.6, evaporation: 0.7 },
    parameters: { chromatic: { disableSnapshot: true } },
}
