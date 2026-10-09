import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fireEvent } from "storybook/test"

import { Wash } from "./Wash"

const content = (
    <div style={{ display: "grid", placeItems: "center", minHeight: 420, padding: 48 }}>
        <div style={{ textAlign: "center", maxWidth: 560 }}>
            <h1 style={{ fontSize: 48, margin: "0 0 12px", letterSpacing: "-0.03em" }}>
                Ink on paper
            </h1>
            <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,0.76)", fontSize: 17 }}>
                Tap anywhere and a new colour spreads from that point.
            </p>
            <button
                type="button"
                style={{
                    padding: "12px 24px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "rgba(255,255,255,0.1)",
                    color: "inherit",
                    font: "inherit",
                }}
            >
                Foreground stays interactive
            </button>
        </div>
    </div>
)

const meta = {
    title: "Components/Wash",
    component: Wash,
    parameters: { surface: { padding: 0 } },
    args: { children: content },
} satisfies Meta<typeof Wash>

export default meta
type Story = StoryObj<typeof meta>

export const Click: Story = {
    args: { mode: "click" },
}

export const Auto: Story = {
    args: { mode: "auto", interval: 600000 },
}

export const CustomPalette: Story = {
    args: {
        mode: "click",
        colors: ["#233c2c", "#3d2f4f", "#52321f", "#1f3a4a"],
    },
}

export const SoftEdge: Story = {
    args: { mode: "click", softness: 0.8, duration: 2200 },
}

export const StaticFallback: Story = {
    args: { disabled: true },
}

export const PixelBurstFrozen: Story = {
    name: "Wash pixel burst frozen state",
    args: { mode: "click", burst: true, seed: 7, freezeAt: 0.3 },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".xp-wash") as HTMLElement
        const box = root.getBoundingClientRect()

        fireEvent.pointerDown(root, {
            clientX: box.left + box.width * 0.62,
            clientY: box.top + box.height * 0.42,
        })

        await expect(root.querySelector(".xp-wash-pour")).not.toBeNull()
        await expect(root.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
    },
}
