import type { Meta, StoryObj } from "@storybook/react-vite"

import { Facet } from "./Facet"

const hero = (
    <div style={{ display: "grid", placeItems: "center", minHeight: 440, padding: 48 }}>
        <div style={{ textAlign: "center", maxWidth: 620 }}>
            <h1 style={{ fontSize: 52, margin: "0 0 14px", letterSpacing: "-0.03em" }}>
                Cut from light
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: 17 }}>
                A faceted surface that answers the pointer and drifts slowly through colour.
            </p>
        </div>
    </div>
)

const meta = {
    title: "Experimental/Facet",
    component: Facet,
    parameters: { surface: { padding: 0 } },
    args: { children: hero },
} satisfies Meta<typeof Facet>

export default meta
type Story = StoryObj<typeof meta>

export const AmbientOff: Story = {
    args: { ambient: false },
}

export const AmbientOn: Story = {
    args: { ambient: true, ambientInterval: 600000, ambientDuration: 5200 },
}

export const CustomPalette: Story = {
    args: {
        palette: ["#7a3b52", "#8a5a3b"],
        ambient: true,
        ambientInterval: 600000,
        variation: 22,
    },
}

export const CoarseCells: Story = {
    args: { cell: 220 },
}

export const StaticFallback: Story = {
    args: { disabled: true },
}
