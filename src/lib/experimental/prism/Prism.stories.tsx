import type { Meta, StoryObj } from "@storybook/react-vite"
import type { CSSProperties } from "react"

import { Prism } from "./Prism"

const card = (
    <div
        style={{
            display: "grid",
            gap: 10,
            width: 380,
            padding: "44px 32px",
            borderRadius: "inherit",
            background: "linear-gradient(160deg, #141a33, #1d1438 62%, #0f2633)",
            color: "#eef2ff",
        }}
    >
        <strong style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>Refraction</strong>
        <span style={{ opacity: 0.72, fontSize: 14 }}>
            White light enters at one point and leaves split into bands.
        </span>
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

/** The light is pinned, so the pixel spectrum and the tilt are identical on every run. */
export const PixelMode: Story = { args: { pointer: { x: 0.22, y: 0.3 } } }

/** A restrained strength: a hairline of colour on every edge, nothing more. */
export const LowStrength: Story = { args: { pointer: { x: 0.22, y: 0.3 }, strength: 0.2 } }

/** Full strength: the content splits into red, green and blue and the beam runs solid. */
export const HighStrength: Story = {
    args: { pointer: { x: 0.8, y: 0.25 }, strength: 1.8, dispersion: 1 },
}

/** A steep lean on thick glass: the rainbow edge and the caustic behind it are the point. */
export const Deep: Story = {
    args: {
        pointer: { x: 0.85, y: 0.2 },
        strength: 1.2,
        tilt: 26,
        depth: 40,
        facets: "smooth",
        radius: 16,
    },
    parameters: { surface: { padding: 72 } },
}

export const PixelModeCoarseCells: Story = {
    args: { pointer: { x: 0.7, y: 0.6 }, pixel: 14, dispersion: 1 },
}

export const NoDispersion: Story = { args: { pointer: { x: 0.3, y: 0.4 }, dispersion: 0 } }

export const Smooth: Story = { args: { disabled: true, facets: "smooth", radius: 20 } }

export const SmoothHeavyDispersion: Story = {
    args: { disabled: true, facets: "smooth", radius: 20, dispersion: 1 },
}

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const SteepTilt: Story = {
    args: { tilt: 24 },
    parameters: { chromatic: { disableSnapshot: true } },
}

const lightCard = (
    <div
        style={{
            display: "grid",
            gap: 10,
            width: 380,
            padding: "44px 32px",
            borderRadius: "inherit",
            background: "linear-gradient(160deg, #ffffff, #eef1f6)",
            color: "#14161c",
        }}
    >
        <strong style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>Refraction</strong>
        <span style={{ opacity: 0.78, fontSize: 14 }}>
            White light enters at one point and leaves split into bands.
        </span>
    </div>
)

/** A pale card on a pale page, with the light pinned so the frame repeats. */
export const OnLight: Story = {
    args: { children: lightCard, pointer: { x: 0.22, y: 0.3 } },
    decorators: [
        (Story) => (
            <div style={{ padding: 32, background: "#f6f7f9" }}>
                <Story />
            </div>
        ),
    ],
}

/** The same card with the light multiplied in, which is how it reads on a pale surface. */
export const OnLightMultiply: Story = {
    args: {
        children: lightCard,
        pointer: { x: 0.22, y: 0.3 },
        style: { "--prism-blend": "multiply" } as CSSProperties,
    },
    decorators: OnLight.decorators,
}
