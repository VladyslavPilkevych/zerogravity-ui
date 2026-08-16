import type { Meta, StoryObj } from "@storybook/react-vite"

import { Louvre } from "./Louvre"

const section = (label: string, tone: string) => (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            background: tone,
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: "-0.02em",
        }}
    >
        {label}
    </div>
)

const meta = {
    title: "Experimental/Louvre",
    component: Louvre,
    parameters: { surface: { padding: 0 } },
    args: {
        front: section("Section A", "linear-gradient(150deg, #1a1226, #3a1f52)"),
        back: section("Section B", "linear-gradient(150deg, #06231f, #0d4f42)"),
    },
} satisfies Meta<typeof Louvre>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VerticalSlats: Story = {
    args: { orientation: "vertical", slats: 14, phase: 0.8 },
}

export const WideSlats: Story = {
    args: { slats: 5, gap: 4 },
}

export const StaticFallback: Story = {
    args: { disabled: true },
}
