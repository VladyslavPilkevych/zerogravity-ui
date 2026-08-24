import type { Meta, StoryObj } from "@storybook/react-vite"

import { Overprint } from "./Overprint"

const meta = {
    title: "Components/Overprint",
    component: Overprint,
    args: { text: "MISREGISTER" },
} satisfies Meta<typeof Overprint>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DuotoneWide: Story = {
    args: { inks: ["#ff2d55", "#00e0ff"], spread: 26, size: 110 },
}

export const StaticFallback: Story = {
    args: { disabled: true },
}
