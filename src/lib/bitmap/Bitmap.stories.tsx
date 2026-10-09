import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Bitmap } from "./Bitmap"

const SIGNAL = ["#4ee1f2", "#c6f432"]
const SPECTRUM = ["#4ee1f2", "#8b7bff", "#ff6fb5", "#ffb547", "#c6f432"]

const meta = {
    title: "Components/Bitmap",
    component: Bitmap,
    args: { text: "ZeroGravity" },
    decorators: [
        (Story) => (
            <div style={{ width: "min(720px, 100%)", color: "#e8edf5" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Bitmap>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {
    args: { colors: SPECTRUM, effect: "cycle", animated: false },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-bitmap")
        expect(root).not.toHaveAttribute("data-effect")
        expect(root?.querySelectorAll("g")).toHaveLength(SPECTRUM.length)
    },
}

export const SweepPaused: Story = {
    args: { colors: SIGNAL, dim: 0.82, gap: 0.12, paused: true },
    play: async ({ canvasElement }) => {
        expect(canvasElement.querySelector(".zg-bitmap")).toHaveAttribute("data-paused")
    },
}

export const CyclePaused: Story = {
    args: { colors: SPECTRUM, effect: "cycle", paused: true },
}

export const FixedPixels: Story = {
    args: { text: "PIXEL 8", pixelSize: 10, gap: 0.16, animated: false },
}

export const Heading: Story = {
    args: { text: "Launch day", as: "h1", colors: SIGNAL, animated: false },
    play: async ({ canvas }) => {
        expect(canvas.getByRole("heading", { level: 1, name: "Launch day" })).toBeInTheDocument()
    },
}

export const Punctuation: Story = {
    args: { text: "v0.1 · 100% (ok)!", animated: false, colors: SIGNAL },
}

export const Live: Story = {
    args: { colors: SPECTRUM, effect: "wave", dim: 0.3 },
    parameters: { chromatic: { disableSnapshot: true } },
}
