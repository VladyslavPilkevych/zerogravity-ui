import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Sash } from "./Sash"

const words = ["Motion", "Pointer", "Scroll", "Typography", "Surfaces"]

const meta = {
    title: "Components/Sash",
    component: Sash,
    parameters: { surface: { padding: 24 }, chromatic: { disableSnapshot: true } },
    args: {
        label: "Topics",
        style: { color: "#f5f5f7", font: "600 28px/1.2 system-ui, sans-serif" },
        children: words.map((word) => <span key={word}>{word} ✦</span>),
    },
} satisfies Meta<typeof Sash>

export default meta
type Story = StoryObj<typeof meta>

/** Enough copies to cover the band plus one full shift, so the loop never shows a gap. */
export const Seamless: Story = {
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-sash") as HTMLElement
        await waitFor(() => expect(root).toHaveAttribute("data-ready"))

        const shift = parseFloat(root.style.getPropertyValue("--zg-sash-shift"))
        const track = root.querySelector(".zg-sash-track") as HTMLElement
        await expect(track.getBoundingClientRect().width).toBeGreaterThanOrEqual(
            root.getBoundingClientRect().width + shift - 1,
        )
        await expect(getComputedStyle(track).animationName).toBe("zg-sash-run")

        for (const copy of root.querySelectorAll("[data-copy]")) {
            await expect(copy).toHaveAttribute("inert")
        }
    },
}

export const Reversed: Story = { args: { direction: "right", fade: true } }

/** Disabled bands wrap instead of clipping, so every item stays readable. */
export const Static: Story = {
    args: { disabled: true },
    parameters: { chromatic: { disableSnapshot: false } },
    play: async ({ canvasElement }) => {
        const runs = canvasElement.querySelectorAll(".zg-sash-run")
        await expect(runs).toHaveLength(1)
        const root = canvasElement.querySelector(".zg-sash") as HTMLElement
        await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
    },
}

/** The original, smoother look, kept as the second style. */
export const Classic: Story = { args: { variant: "classic" } }
