import type { Meta, StoryObj } from "@storybook/react-vite"

import { Nimbus } from "./Nimbus"

const meta = {
    title: "Experimental/Nimbus",
    component: Nimbus,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 420 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Nimbus>

export default meta
type Story = StoryObj<typeof meta>

/** Seeded bodies, held still: the same sky on every render. */
export const Still: Story = { args: { disabled: true } }

export const Sparse: Story = { args: { disabled: true, count: 2 } }

export const Crowded: Story = { args: { disabled: true, count: 12 } }

export const Faint: Story = { args: { disabled: true, intensity: 0.25 } }

export const OtherSeed: Story = { args: { disabled: true, seed: 27 } }

export const Ember: Story = {
    args: { disabled: true, colors: ["#5a1206", "#7d2a08", "#2c0a3a", "#8a3b12"] },
}

export const Drifting: Story = { parameters: { chromatic: { disableSnapshot: true } } }
