import type { Meta, StoryObj } from "@storybook/react-vite"

import { Progress } from "./Progress"

const meta = {
    title: "Components/Progress",
    component: Progress,
    parameters: { surface: { padding: 32 } },
    args: { label: "Subtasks", value: 3, max: 8, style: { color: "#f5f5f7", maxWidth: 420 } },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Pixel: Story = {}

export const Classic: Story = { args: { variant: "classic" } }

export const Segmented: Story = { args: { segments: true } }

export const Percentage: Story = { args: { value: 64, max: 100, label: "Upload" } }
