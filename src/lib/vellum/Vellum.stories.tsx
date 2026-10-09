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

/** Pressed at a pinned point, so the stepped cells and the tilt are identical on every run. */
export const PixelMode: Story = {
    args: { surface: "pixel", radius: 6, pointer: { x: 0.36, y: 0.42 } },
}

export const PixelModeAtRest: Story = {
    args: { surface: "pixel", radius: 6 },
}

export const PixelModeCustomHighlight: Story = {
    args: {
        surface: "pixel",
        radius: 0,
        pixel: 18,
        pointer: { x: 0.7, y: 0.6 },
        highlight: { dent: 0.7, sheen: 1, sheenColor: "#ffd166" },
    },
}
