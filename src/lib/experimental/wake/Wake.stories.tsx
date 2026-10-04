import type { Meta, StoryObj } from "@storybook/react-vite"

import { Wake } from "./Wake"

const face = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            minHeight: 260,
            padding: 40,
            background: "linear-gradient(160deg, #0b1220, #14243d)",
            color: "#dbeafe",
            font: "600 28px/1.3 system-ui, sans-serif",
            textAlign: "center",
        }}
    >
        Move across the surface
    </div>
)

const meta = {
    title: "Experimental/Wake",
    component: Wake,
    parameters: { surface: { padding: 32 } },
    args: { children: face },
} satisfies Meta<typeof Wake>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing has touched the surface yet, so the frame is deterministic. */
export const AtRest: Story = {
    args: { disabled: true },
}

export const ContentStaysReadable: Story = {
    args: { disabled: true, mode: "distortion" },
}

export const Highlight: Story = {
    args: { mode: "highlight" },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Distortion: Story = {
    args: { mode: "distortion" },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const WarmLight: Story = {
    args: { color: "#ffd8a8" },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const WideRipples: Story = {
    args: { radius: 0.5, strength: 0.85 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Slow: Story = {
    args: { speed: 0.4 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const PointerOnly: Story = {
    args: { enableOnTouch: false },
    parameters: { chromatic: { disableSnapshot: true } },
}
