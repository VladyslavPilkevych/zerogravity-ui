import type { Meta, StoryObj } from "@storybook/react-vite"

import { Quartz } from "./Quartz"

const face = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            minHeight: 260,
            padding: 40,
            background: "linear-gradient(150deg, #2b1f3d, #123243 62%, #3d2438)",
            color: "#f2f4ff",
            font: "700 30px/1.2 system-ui, sans-serif",
        }}
    >
        Grain
    </div>
)

const meta = {
    title: "Experimental/Quartz",
    component: Quartz,
    parameters: { surface: { padding: 32 } },
    args: { children: face },
} satisfies Meta<typeof Quartz>

export default meta
type Story = StoryObj<typeof meta>

/** The tile is seeded, so a frozen frame is the same every time. */
export const Still: Story = { args: { disabled: true } }

export const Heavy: Story = { args: { disabled: true, intensity: 0.85 } }

export const Coarse: Story = { args: { disabled: true, scale: 256 } }

export const Fine: Story = { args: { disabled: true, scale: 32 } }

export const Coloured: Story = { args: { disabled: true, colour: 1 } }

export const Overlay: Story = { args: { disabled: true, blend: "overlay" } }

export const Screen: Story = { args: { disabled: true, blend: "screen" } }

export const Shifting: Story = { parameters: { chromatic: { disableSnapshot: true } } }
