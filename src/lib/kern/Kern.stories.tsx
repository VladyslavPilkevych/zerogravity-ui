import type { Meta, StoryObj } from "@storybook/react-vite"

import { Kern } from "./Kern"

const meta = {
    title: "Components/Kern",
    component: Kern,
    args: { text: "TYPESET" },
} satisfies Meta<typeof Kern>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WideBloom: Story = {
    args: { radius: 280, spread: 0.7, lift: 26, weight: 480, size: 104 },
}

export const WithSpaces: Story = {
    args: { text: "SET IN LEAD", size: 64 },
}

export const StaticFallback: Story = {
    args: { disabled: true },
}
