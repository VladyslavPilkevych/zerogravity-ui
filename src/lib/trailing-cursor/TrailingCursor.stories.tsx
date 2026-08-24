import type { Meta, StoryObj } from "@storybook/react-vite"
import { useRef } from "react"
import { expect, waitFor } from "storybook/test"

import { TrailingCursor } from "./TrailingCursor"

const meta = {
    title: "Components/TrailingCursor",
    component: TrailingCursor,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ position: "relative", width: "100%", height: 320 }}>
                <button type="button" data-cursor-label="Open" style={{ margin: 24 }}>
                    Interactive target
                </button>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof TrailingCursor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RingOnly: Story = {
    args: { variant: "ring-only" },
}

export const DotOnly: Story = {
    args: { variant: "dot-only" },
}

export const CustomColors: Story = {
    args: { dotColor: "#ff6b8b", ringBorderColor: "#ff6b8b" },
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            expect(canvasElement.querySelector(".trailing-cursor")).toBeNull()
        })
    },
}

export const HiddenFromAssistiveTech: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const root = canvasElement.querySelector(".trailing-cursor")
            expect(root).not.toBeNull()
            expect(root).toHaveAttribute("aria-hidden", "true")
        })
    },
}

/** Scoped to one box: the page keeps its own cursor everywhere else. */
export const Scoped: Story = {
    render: (args) => {
        function Scene() {
            const box = useRef<HTMLDivElement>(null)

            return (
                <div style={{ display: "grid", gap: 16 }}>
                    <div
                        ref={box}
                        style={{
                            display: "grid",
                            placeItems: "center",
                            height: 260,
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(255,255,255,0.72)",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                        }}
                    >
                        <TrailingCursor {...args} container={box} />
                        Move cursor
                    </div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
                        Outside the box the normal cursor comes back.
                    </p>
                </div>
            )
        }

        return <Scene />
    },
    play: async ({ canvasElement }) => {
        const box = canvasElement.querySelector(".trailing-cursor")?.parentElement as HTMLElement

        await expect(box.classList.contains("trailing-cursor-none")).toBe(true)
        await expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
        await expect(canvasElement.querySelector(".trailing-cursor")).toHaveAttribute(
            "data-scoped",
            "true",
        )
    },
}
