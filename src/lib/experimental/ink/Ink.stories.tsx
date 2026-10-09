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

/** Long past drying: the settled state, which is also what reduced motion shows. */
export const Soaked: Story = { args: { time: 30 } }

/** Held 1.2 s in: the stroke still wet and the bleed still running. */
export const MidSpread: Story = { args: { time: 1.2 } }

export const LongWord: Story = { args: { time: 30, text: "Diffusion" } }

export const HeavyBleed: Story = { args: { time: 30, bleed: 1, feather: 1 } }

export const SizedPaper: Story = { args: { time: 30, bleed: 0.1, feather: 0, rim: 0.3 } }

export const RedInk: Story = { args: { time: 30, color: "#7a1020", paper: "#f6efe4" } }

export const OtherSeed: Story = { args: { time: 30, seed: 31 } }

export const Soaking: Story = { parameters: { chromatic: { disableSnapshot: true } } }

/** Drag to write; a nib held still pools. */
export const Drawing: Story = {
    args: { repeat: 0, nib: 8 },
    parameters: { chromatic: { disableSnapshot: true } },
}
