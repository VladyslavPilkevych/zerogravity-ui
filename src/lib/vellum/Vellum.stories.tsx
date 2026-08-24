import type { Meta, StoryObj } from "@storybook/react-vite"

import { Vellum } from "./Vellum"

const card = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            width: 460,
            height: 280,
            background: "linear-gradient(150deg, #1b1b26, #2f2440)",
            fontSize: 24,
            fontWeight: 700,
        }}
    >
        Flexible sheet
    </div>
)

const meta = {
    title: "Components/Vellum",
    component: Vellum,
    args: { children: card },
} satisfies Meta<typeof Vellum>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const HighlightOff: Story = {
    args: { highlight: false },
}

export const CustomHighlight: Story = {
    args: { highlight: { dent: 0.15, sheen: 1, sheenColor: "#ffd166" }, tilt: 14 },
}

export const NoTilt: Story = {
    args: { tilt: 0 },
}
