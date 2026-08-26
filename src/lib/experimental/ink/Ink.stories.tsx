import type { Meta, StoryObj } from "@storybook/react-vite"

import { Ink } from "./Ink"

const meta = {
    title: "Experimental/Ink",
    component: Ink,
    parameters: { surface: { padding: 0 } },
    args: { text: "Ink" },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 320 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Ink>

export default meta
type Story = StoryObj<typeof meta>

/** Fully soaked and held, which is also the reduced-motion state. */
export const Soaked: Story = { args: { disabled: true } }

export const LongWord: Story = { args: { disabled: true, text: "Diffusion" } }

export const HeavyBleed: Story = { args: { disabled: true, bleed: 1, feather: 1 } }

export const NoBleed: Story = { args: { disabled: true, bleed: 0, feather: 0 } }

export const RedInk: Story = { args: { disabled: true, color: "#7a1020" } }

export const OtherSeed: Story = { args: { disabled: true, seed: 31 } }

export const Soaking: Story = { parameters: { chromatic: { disableSnapshot: true } } }
