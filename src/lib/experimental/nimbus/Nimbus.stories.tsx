import type { Meta, StoryObj } from "@storybook/react-vite"

import { Nimbus } from "./Nimbus"

const meta = {
    title: "Experimental/Nimbus",
    component: Nimbus,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 420, display: "grid" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Nimbus>

export default meta
type Story = StoryObj<typeof meta>

const copy = (
    <div style={{ display: "grid", gap: 12, maxWidth: 520, padding: 48, color: "#f3f4fb" }}>
        <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.05 }}>Somewhere past the harbour</h2>
        <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.82 }}>
            Text over the field stays real text, above every layer, and readable.
        </p>
    </div>
)

/** Seeded and held at eight seconds in: the same frame on every render. */
export const Calm: Story = { args: { time: 8 } }

export const Drift: Story = { args: { preset: "drift", time: 8 } }

export const Cinematic: Story = { args: { preset: "cinematic", time: 6 } }

export const Pixel: Story = { args: { preset: "pixel", time: 8 } }

/** Halfway through the crossfade from the first mood to the second. */
export const SceneChange: Story = { args: { preset: "cinematic", time: 15 } }

export const BehindContent: Story = {
    args: { preset: "cinematic", time: 6, scrim: 0.5, children: copy },
}

export const CustomColours: Story = {
    args: {
        colors: ["#5a1206", "#7d2a08", "#2c0a3a", "#8a3b12"],
        accent: "#ffb84e",
        density: 0.4,
        time: 8,
    },
}

export const OtherSeed: Story = { args: { preset: "drift", seed: 27, time: 8 } }

export const Live: Story = {
    args: { preset: "cinematic", children: copy },
    parameters: { chromatic: { disableSnapshot: true } },
}
