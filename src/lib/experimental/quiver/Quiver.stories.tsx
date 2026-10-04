import type { Meta, StoryObj } from "@storybook/react-vite"

import { Quiver } from "./Quiver"

const meta = {
    title: "Experimental/Quiver",
    component: Quiver,
    parameters: { surface: { padding: 56 } },
    args: { text: "Quiver", as: "h2", style: { fontSize: 62, fontWeight: 800 } },
} satisfies Meta<typeof Quiver>

export default meta
type Story = StoryObj<typeof meta>

/** The line at rest, with no wave anywhere on it. */
export const Flat: Story = { args: { disabled: true } }

export const LongLine: Story = {
    args: { disabled: true, text: "A whole line of type" },
}

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const HighLift: Story = {
    args: { lift: 50 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const WideCrest: Story = {
    args: { width: 0.7 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const NoTwist: Story = {
    args: { twist: 0 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const PointerOnly: Story = {
    args: { ambient: false },
    parameters: { chromatic: { disableSnapshot: true } },
}
