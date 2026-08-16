import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { SplitFlap } from "./SplitFlap"

const meta = {
    title: "Components/SplitFlap",
    component: SplitFlap,
    args: {
        value: "ARRIVALS",
        stepDuration: 40,
        stagger: 0,
    },
} satisfies Meta<typeof SplitFlap>

export default meta
type Story = StoryObj<typeof meta>

const settled = async (canvasElement: HTMLElement, text: string) => {
    await waitFor(
        () => {
            const board = canvasElement.querySelector(".split-flap")
            expect(board?.getAttribute("aria-label")).toBe(text)
            expect(board?.querySelectorAll('[data-flipping="true"]')).toHaveLength(0)
        },
        { timeout: 8000 },
    )
}

export const Default: Story = {
    play: async ({ canvasElement }) => settled(canvasElement, "ARRIVALS"),
}

export const SingleCharacter: Story = {
    args: { value: "Z" },
    play: async ({ canvasElement }) => settled(canvasElement, "Z"),
}

export const LongContent: Story = {
    args: { value: "DEPARTURES DELAYED" },
    play: async ({ canvasElement }) => settled(canvasElement, "DEPARTURES DELAYED"),
}

export const Numeric: Story = {
    args: { value: "01234567" },
    play: async ({ canvasElement }) => settled(canvasElement, "01234567"),
}

export const CustomStyles: Story = {
    args: {
        value: "ZEROG",
        color: "#0b0b12",
        background: "#8ab4ff",
        seamColor: "rgba(0,0,0,0.35)",
        radius: 10,
        fontSize: 44,
    },
    play: async ({ canvasElement }) => settled(canvasElement, "ZEROG"),
}

export const FixedLength: Story = {
    args: { value: "AB", length: 6 },
}

export const Empty: Story = {
    args: { value: "" },
    play: async ({ canvasElement }) => {
        const board = canvasElement.querySelector(".split-flap")
        expect(board).toHaveAttribute("aria-hidden", "true")
        expect(board).not.toHaveAttribute("role")
    },
}

export const Clock: Story = {
    args: { mode: "clock" },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Countdown: Story = {
    args: { mode: "countdown", target: 90 },
    parameters: { chromatic: { disableSnapshot: true } },
}
