import type { Meta, StoryObj } from "@storybook/react-vite"
import type { CSSProperties } from "react"

import { Lodestone } from "./Lodestone"

const meta = {
    title: "Components/Lodestone",
    component: Lodestone,
    args: { children: "Get started" },
} satisfies Meta<typeof Lodestone>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const StrongAttraction: Story = {
    args: { radius: 260, strength: 0.7, maxDisplacement: 44, lift: 0.12 },
}

export const ButtonRow: Story = {
    render: () => (
        <div style={{ display: "flex", gap: 18 }}>
            <Lodestone>Get started</Lodestone>
            <Lodestone>Documentation</Lodestone>
            <Lodestone disabled>Unavailable</Lodestone>
        </div>
    ),
}

export const TightSpacing: Story = {
    render: () => (
        <div style={{ display: "flex", gap: 6 }}>
            <Lodestone strength={0.8} maxDisplacement={48} minGap={10}>
                One
            </Lodestone>
            <Lodestone strength={0.8} maxDisplacement={48} minGap={10}>
                Two
            </Lodestone>
            <Lodestone strength={0.8} maxDisplacement={48} minGap={10}>
                Three
            </Lodestone>
        </div>
    ),
}

/** Pixel faces at rest: no pointer nearby, so the frame is static. */
export const PixelButtons: Story = {
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            <Lodestone variant="pixel">Get started</Lodestone>
            <Lodestone variant="pixel">Docs</Lodestone>
            <Lodestone variant="pixel" style={{ "--lodestone-accent": "#c6f24e" } as CSSProperties}>
                GitHub
            </Lodestone>
            <Lodestone variant="pixel" disabled>
                Unavailable
            </Lodestone>
        </div>
    ),
}

export const Disabled: Story = {
    args: { disabled: true, children: "Unavailable" },
}

export const ReducedMotionFallback: Story = {
    args: { respectReducedMotion: true, children: "Static button" },
}
