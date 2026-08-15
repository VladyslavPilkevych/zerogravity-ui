import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Antigravity } from "./Antigravity"

const meta = {
    title: "Components/Antigravity",
    component: Antigravity,
    parameters: {
        surface: { padding: 0 },
    },
    args: {
        seed: 1337,
        paused: true,
        render: { fadeIn: 0 },
        style: { position: "relative", width: "100%", height: 420 },
    },
} satisfies Meta<typeof Antigravity>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Ring: Story = {
    args: { count: 400, formation: { shape: "ring" } },
}

export const Heart: Story = {
    args: { count: 500, formation: { shape: "heart" } },
}

export const Dna: Story = {
    args: { count: 600, formation: { shape: "dna" } },
}

export const Planet: Story = {
    args: { count: 700, formation: { shape: "planet" } },
}

export const SparseCount: Story = {
    args: { count: 40 },
}

export const DenseCount: Story = {
    args: { count: 1200 },
}

export const SquareParticles: Story = {
    args: { particle: { shape: "square" } },
}

export const Disabled: Story = {
    args: { paused: true, count: 0 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const MountsACanvas: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const canvas = canvasElement.querySelector("canvas")
            expect(canvas).not.toBeNull()
            expect(canvas?.getAttribute("aria-hidden")).toBe("true")
            expect(canvas?.width).toBeGreaterThan(0)
        })
    },
}

export const Animating: Story = {
    args: { paused: false, render: { fadeIn: 2000 } },
    parameters: { chromatic: { disableSnapshot: true } },
}
