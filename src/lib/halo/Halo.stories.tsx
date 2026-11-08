import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Halo } from "./Halo"

const meta = {
    title: "Components/Halo",
    component: Halo,
    parameters: { surface: { padding: 40 } },
    args: { text: "Circular text", spin: false, style: { color: "#f5f5f7" } },
} satisfies Meta<typeof Halo>

export default meta
type Story = StoryObj<typeof meta>

/** The ring covers the full turn: the largest gap between glyphs is one slot. */
export const FullCircle: Story = {
    play: async ({ canvasElement }) => {
        const ring = canvasElement.querySelector(".zg-halo-ring") as HTMLElement
        const box = ring.getBoundingClientRect()
        const cx = box.left + box.width / 2
        const cy = box.top + box.height / 2
        const turns = [...canvasElement.querySelectorAll(".zg-halo-glyph > span")]
            .map((glyph) => {
                const g = glyph.getBoundingClientRect()
                const angle = Math.atan2(g.left + g.width / 2 - cx, cy - (g.top + g.height / 2))
                return ((angle * 180) / Math.PI + 360) % 360
            })
            .sort((a, b) => a - b)

        let gap = 360 - turns[turns.length - 1] + turns[0]
        for (let i = 1; i < turns.length; i++) gap = Math.max(gap, turns[i] - turns[i - 1])
        await expect(gap).toBeLessThan((360 / turns.length) * 1.2)
    },
}

export const WithCentre: Story = {
    args: {
        text: "Scroll to explore",
        repeat: 2,
        size: 180,
        children: (
            <button
                type="button"
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "1px solid currentColor",
                    background: "transparent",
                    color: "inherit",
                    fontSize: 22,
                }}
            >
                ↓
            </button>
        ),
    },
}

export const Spinning: Story = {
    args: { spin: true, pauseOnHover: true },
    parameters: { chromatic: { disableSnapshot: true } },
}
