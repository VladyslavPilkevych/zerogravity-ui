import type { Meta, StoryObj } from "@storybook/react-vite"

import { Palimpsest } from "./Palimpsest"

const meta = {
    title: "Experimental/Palimpsest",
    component: Palimpsest,
    parameters: { surface: { padding: 56 } },
    args: { text: "Palimpsest", as: "h2", style: { fontSize: 62, fontWeight: 800 } },
} satisfies Meta<typeof Palimpsest>

export default meta
type Story = StoryObj<typeof meta>

/** `always` opens the stack without a pointer, so the frame is repeatable. */
export const Open: Story = { args: { trigger: "always" } }

export const Closed: Story = { args: { disabled: true } }

export const TwoLayers: Story = { args: { trigger: "always", layers: 2 } }

export const EightLayers: Story = { args: { trigger: "always", layers: 8 } }

export const WideSpread: Story = { args: { trigger: "always", spread: 80 } }

export const NoRotation: Story = { args: { trigger: "always", rotation: 0 } }

export const OtherSeed: Story = { args: { trigger: "always", seed: 21 } }

export const OwnPalette: Story = {
    args: { trigger: "always", colors: ["#00e5ff", "#ff2f6d"] },
}

export const OnHover: Story = { parameters: { chromatic: { disableSnapshot: true } } }
