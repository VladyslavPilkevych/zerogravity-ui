import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type CSSProperties } from "react"
import { expect, userEvent, within } from "storybook/test"

import { Tide } from "./Tide"
import type { TideEdge } from "./contour"

const panel: CSSProperties = {
    display: "grid",
    alignContent: "end",
    gap: 8,
    minHeight: 180,
    padding: "calc(20px + var(--tide-band))",
    background: "linear-gradient(160deg, #1d5cff, #12d0b4)",
    color: "#f4fbff",
    fontFamily: "system-ui, sans-serif",
}

const meta = {
    title: "Experimental/Tide",
    component: Tide,
    parameters: { surface: { padding: 32 } },
    args: { paused: true, amplitude: 14, wavelength: 120 },
    render: (args) => (
        <div style={{ width: 320 }}>
            <Tide {...args}>
                <div style={panel}>
                    <strong>edge=&quot;{args.edge ?? "all"}&quot;</strong>
                </div>
            </Tide>
        </div>
    ),
} satisfies Meta<typeof Tide>

export default meta
type Story = StoryObj<typeof meta>

const EDGES: TideEdge[] = ["all", "top", "bottom", "left", "right", "x", "y"]

/** Every edge at the rest phase: paused before the first frame, so each render is identical. */
export const ContourVariants: Story = {
    render: (args) => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 20,
                width: "min(100%, 820px)",
            }}
        >
            {EDGES.map((edge) => (
                <Tide key={edge} {...args} edge={edge}>
                    <div style={{ ...panel, minHeight: 130 }}>
                        <strong>edge=&quot;{edge}&quot;</strong>
                    </div>
                </Tide>
            ))}
        </div>
    ),
}

export const All: Story = { args: { edge: "all" } }

export const Bottom: Story = { args: { edge: "bottom" } }

export const Sides: Story = { args: { edge: "x" } }

export const Stroke: Story = { args: { edge: "all", stroke: "#ffffff" } }

export const Disabled: Story = { args: { edge: "top", paused: false, disabled: true } }

function PressMe() {
    const [pressed, setPressed] = useState(false)
    return (
        <button type="button" aria-pressed={pressed} onClick={() => setPressed(!pressed)}>
            Hold
        </button>
    )
}

/** The clip only trims the band, so what sits inside it can still be clicked and focused. */
export const InteractiveChildren: Story = {
    args: { edge: "all" },
    render: (args) => (
        <div style={{ width: 320 }}>
            <Tide {...args}>
                <div style={panel}>
                    <PressMe />
                </div>
            </Tide>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const button = within(canvasElement).getByRole("button", { name: "Hold" })

        await userEvent.tab()
        await expect(button).toHaveFocus()
        await userEvent.click(button)
        await expect(button).toHaveAttribute("aria-pressed", "true")
    },
}

export const Moving: Story = {
    args: { paused: false },
    parameters: { chromatic: { disableSnapshot: true } },
}
