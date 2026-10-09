import type { Meta, StoryObj } from "@storybook/react-vite"

import { Drench } from "./Drench"

const meta = {
    title: "Experimental/Drench",
    component: Drench,
    parameters: { surface: { padding: 0 } },
    args: { text: "RAIN", seed: 7 },
    decorators: [
        (Story) => (
            <div style={{ height: 420, display: "grid" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Drench>

export default meta
type Story = StoryObj<typeof meta>

/** Six seconds of rain, simulated from a seed and held: the same frame every run. */
export const Soaking: Story = {
    args: { freezeAt: 360 },
}

/** Early in the shower: only some strokes have caught water yet. */
export const FirstDrops: Story = {
    args: { freezeAt: 90 },
}

export const Windswept: Story = {
    args: { freezeAt: 360, wind: -0.6, text: "STORM" },
}

export const WarmWater: Story = {
    args: { freezeAt: 360, color: "#ffc98a", text: "AMBER" },
}

export const SerifFace: Story = {
    args: { freezeAt: 360, fontFamily: "Georgia, serif", fontWeight: 700, text: "Rain" },
}

/** What reduced motion shows: soaked letters and hanging beads, nothing falling. */
export const Still: Story = {
    args: { disabled: true },
}

export const Raining: Story = {
    args: { seed: 1 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Downpour: Story = {
    args: { rain: 1, fall: 1.4, wetness: 0.9, wind: 0.3 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Drizzle: Story = {
    args: { rain: 0.15, fall: 0.7, evaporation: 0.6 },
    parameters: { chromatic: { disableSnapshot: true } },
}
