import type { Meta, StoryObj } from "@storybook/react-vite"

import { Meniscus } from "./Meniscus"

const meta = {
    title: "Experimental/Meniscus",
    component: Meniscus,
    parameters: { surface: { padding: 48 } },
    args: { value: 0.62, label: "Upload progress" },
} satisfies Meta<typeof Meniscus>

export default meta
type Story = StoryObj<typeof meta>

/** Held mid-fill with a flat surface, which is the reduced-motion state too. */
export const Filling: Story = { args: { disabled: true } }

export const Empty: Story = { args: { disabled: true, value: 0 } }

export const Full: Story = { args: { disabled: true, value: 1 } }

export const Pill: Story = { args: { disabled: true, shape: "pill" } }

export const Square: Story = { args: { disabled: true, shape: "square" } }

export const Gradient: Story = { args: { disabled: true, colorTo: "#41e0c8" } }

export const NoNumber: Story = { args: { disabled: true, showValue: false } }

export const OwnContent: Story = {
    args: { disabled: true, children: <strong style={{ color: "#fff" }}>62</strong> },
}

export const Indeterminate: Story = {
    args: { value: undefined, label: "Working" },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Sloshing: Story = { parameters: { chromatic: { disableSnapshot: true } } }
