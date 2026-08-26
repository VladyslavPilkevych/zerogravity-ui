import type { Meta, StoryObj } from "@storybook/react-vite"

import { Lattice } from "./Lattice"

const meta = {
    title: "Experimental/Lattice",
    component: Lattice,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 420, background: "#06070d" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Lattice>

export default meta
type Story = StoryObj<typeof meta>

/** Seeded jitter and no pointer: the same mesh on every render. */
export const Resting: Story = { args: { disabled: true } }

export const Fine: Story = { args: { disabled: true, gap: 26 } }

export const Coarse: Story = { args: { disabled: true, gap: 130 } }

export const OtherSeed: Story = { args: { disabled: true, seed: 34 } }

export const WarmThread: Story = { args: { disabled: true, color: "#ffb27a" } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const StrongPush: Story = {
    args: { strength: 1, radius: 0.6 },
    parameters: { chromatic: { disableSnapshot: true } },
}
