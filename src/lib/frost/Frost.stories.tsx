import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Frost } from "./Frost"

const backdrop = {
    display: "grid",
    placeItems: "center",
    minHeight: 300,
    padding: 32,
    background:
        "radial-gradient(circle at 25% 30%, #ff7a59 0 18%, transparent 19%), radial-gradient(circle at 72% 64%, #4f8cff 0 22%, transparent 23%), linear-gradient(135deg, #1b1430, #0d2a33)",
}

const meta = {
    title: "Components/Frost",
    component: Frost,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={backdrop}>
                <Story />
            </div>
        ),
    ],
    args: {
        style: {
            padding: "24px 28px",
            maxWidth: 320,
            color: "#f5f5f7",
            font: "15px/1.5 system-ui",
        },
        children: (
            <>
                <strong style={{ display: "block", fontSize: 18 }}>Frosted surface</strong>
                Content stays readable over a busy background.
            </>
        ),
    },
} satisfies Meta<typeof Frost>

export default meta
type Story = StoryObj<typeof meta>

export const Blur: Story = {
    play: async ({ canvasElement }) => {
        const surface = canvasElement.querySelector(".zg-frost") as HTMLElement
        await expect(getComputedStyle(surface).backdropFilter).toBe("blur(12px)")
    },
}

export const Dark: Story = { args: { tone: "dark" } }

/** No backdrop pass at all: the cheap choice for chips and repeated items. */
export const Tint: Story = {
    args: {
        variant: "tint",
        style: {
            padding: "24px 28px",
            maxWidth: 320,
            color: "#0c0e13",
            font: "15px/1.5 system-ui",
        },
    },
    play: async ({ canvasElement }) => {
        const surface = canvasElement.querySelector(".zg-frost") as HTMLElement
        await expect(getComputedStyle(surface).backdropFilter).toBe("none")
    },
}

export const Plain: Story = { args: { border: false, shadow: false, radius: 8 } }
