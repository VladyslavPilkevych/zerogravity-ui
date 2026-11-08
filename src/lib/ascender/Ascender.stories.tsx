import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Ascender } from "./Ascender"

const meta = {
    title: "Components/Ascender",
    component: Ascender,
    parameters: { surface: { padding: 48 } },
    args: {
        as: "h2",
        text: "Every word arrives on its own beat",
        style: { margin: 0, font: "700 40px/1.1 system-ui, sans-serif", color: "#f5f5f7" },
    },
} satisfies Meta<typeof Ascender>

export default meta
type Story = StoryObj<typeof meta>

/** Reveals as soon as the line is in view; the end state is the static headline. */
export const Revealed: Story = {
    args: { duration: 300, stagger: 20 },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-ascender") as HTMLElement
        await waitFor(() => expect(root).toHaveAttribute("data-state", "shown"), { timeout: 4000 })

        const words = [...canvasElement.querySelectorAll(".zg-ascender-word")]
        await waitFor(
            () => {
                for (const word of words) expect(getComputedStyle(word).transform).toBe("none")
            },
            { timeout: 4000 },
        )
    },
}

export const OnMount: Story = {
    args: { trigger: "mount", duration: 300, stagger: 20 },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-ascender") as HTMLElement
        await expect(root).not.toHaveAttribute("data-state")
        await expect(root).toHaveAttribute("data-trigger", "mount")
    },
}

/** Screen readers get the sentence once; the words themselves are hidden from them. */
export const ReadOnce: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        const heading = canvasElement.querySelector("h2") as HTMLElement
        await expect(heading.querySelector(".zg-ascender-words")).toHaveAttribute(
            "aria-hidden",
            "true",
        )
        await expect(heading.querySelector(".zg-ascender-text")).toHaveTextContent(
            "Every word arrives on its own beat",
        )
    },
}
