import type { Meta, StoryObj } from "@storybook/react-vite"

import { Prism } from "./Prism"

const card = (
    <div
        style={{
            display: "grid",
            gap: 10,
            width: 380,
            padding: "34px 32px",
            borderRadius: "inherit",
            background: "linear-gradient(150deg, #1b2440, #33224a 60%, #123a49)",
            color: "#eef2ff",
        }}
    >
        <strong style={{ fontSize: 24 }}>Refraction</strong>
        <span style={{ opacity: 0.72, fontSize: 14 }}>Light takes the long way through glass.</span>
    </div>
)

const meta = {
    title: "Experimental/Prism",
    component: Prism,
    parameters: { surface: { padding: 48 } },
    args: { children: card },
} satisfies Meta<typeof Prism>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing has touched it, so the frame is the same on every render. */
export const AtRest: Story = { args: { disabled: true } }

export const NoDispersion: Story = { args: { disabled: true, dispersion: 0 } }

export const HeavyDispersion: Story = { args: { disabled: true, dispersion: 1 } }

export const NoSheen: Story = { args: { disabled: true, sheen: 0 } }

export const SquareCorners: Story = { args: { disabled: true, radius: 0 } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const SteepTilt: Story = {
    args: { tilt: 24 },
    parameters: { chromatic: { disableSnapshot: true } },
}
