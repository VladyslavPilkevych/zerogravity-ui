import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Clock } from "./Clock"

const meta = {
    title: "Components/Clock",
    component: Clock,
    parameters: { surface: { padding: 32 } },
    args: {
        value: new Date(Date.UTC(2026, 10, 8, 19, 57)),
        locale: "en-GB",
        timeZone: "UTC",
        style: { color: "#f5f5f7" },
    },
} satisfies Meta<typeof Clock>

export default meta
type Story = StoryObj<typeof meta>

export const Pixel: Story = {
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector("time")).toHaveTextContent("19:57")
    },
}

export const Classic: Story = { args: { variant: "classic" } }

export const WithSeconds: Story = { args: { seconds: true, show: "time" } }
