import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Wake } from "./Wake"

const face = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            minHeight: 300,
            padding: 40,
        }}
    >
        <button
            type="button"
            style={{
                padding: "10px 18px",
                border: 0,
                borderRadius: 999,
                background: "rgba(4, 22, 34, 0.78)",
                color: "#e6faff",
                font: "600 15px/1 system-ui, sans-serif",
            }}
        >
            Dive in
        </button>
    </div>
)

const meta = {
    title: "Components/Wake",
    component: Wake,
    parameters: { surface: { padding: 32 } },
    args: { children: face },
} satisfies Meta<typeof Wake>

export default meta
type Story = StoryObj<typeof meta>

/** Fixed drops run through a fixed number of steps, so the frame is deterministic. */
export const StillTiles: Story = {
    args: { disabled: true },
}

export const StillGrid: Story = {
    args: { disabled: true, surface: "grid" },
}

export const StillChecker: Story = {
    args: { disabled: true, surface: "checker", refraction: 1.6 },
}

export const StillPixelated: Story = {
    args: { disabled: true, pixelated: true },
}

/** Content above the water stays a real, reachable control. */
export const ContentStaysInteractive: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        const button = within(canvasElement).getByRole("button", { name: "Dive in" })
        await userEvent.click(button)
        await expect(button).toBeVisible()
        await expect(canvasElement.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
    },
}

export const Live: Story = {
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Heavy: Story = {
    args: { strength: 1, radius: 24, decay: 4, refraction: 1.6 },
    parameters: { chromatic: { disableSnapshot: true } },
}
