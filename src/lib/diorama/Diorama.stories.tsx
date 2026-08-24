import type { Meta, StoryObj } from "@storybook/react-vite"

import { Diorama } from "./Diorama"

const backdrop = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            minHeight: 460,
            background: "linear-gradient(160deg, #0d1b2a, #1b3a5c 55%, #2a5674)",
            textAlign: "center",
        }}
    >
        <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: 44, margin: "0 0 12px" }}>Distant subject</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
                Move the pointer to look past the foreground.
            </p>
        </div>
    </div>
)

const leaf = (top: string, left: string, size: number, tone: string) => (
    <span
        style={{
            position: "absolute",
            top,
            left,
            width: size,
            height: size,
            borderRadius: "46% 54% 38% 62% / 58% 42% 58% 42%",
            background: tone,
        }}
    />
)

const near = (
    <div style={{ position: "absolute", inset: 0 }}>
        {leaf("6%", "4%", 220, "rgba(12, 30, 20, 0.92)")}
        {leaf("58%", "72%", 260, "rgba(9, 24, 16, 0.94)")}
    </div>
)

const mid = (
    <div style={{ position: "absolute", inset: 0 }}>
        {leaf("30%", "38%", 170, "rgba(18, 46, 32, 0.7)")}
    </div>
)

const meta = {
    title: "Components/Diorama",
    component: Diorama,
    parameters: { surface: { padding: 0 } },
    args: {
        background: backdrop,
        planes: [
            { content: mid, depth: 0.45 },
            { content: near, depth: 1 },
        ],
    },
} satisfies Meta<typeof Diorama>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const StrongDepth: Story = {
    args: { parallax: 90, blur: 14, perspective: 900 },
}

export const SubtleDepth: Story = {
    args: { parallax: 18, blur: 3 },
}

export const StaticFallback: Story = {
    args: { disabled: true },
}
