import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Ricochet } from "./Ricochet"

const frame = { height: 460 }

const meta = {
    title: "Experimental/Ricochet",
    component: Ricochet,
    parameters: { surface: { padding: 32 } },
    args: { text: "404", style: frame },
} satisfies Meta<typeof Ricochet>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing moves before the serve, so this frame is safe to snapshot. */
export const Static404: Story = {
    args: { autoStart: false, interactive: false, hint: "" },
    play: async ({ canvas }) => {
        await expect(canvas.getByText("404")).toBeInTheDocument()
    },
}

export const Playing404: Story = {
    args: { autoStart: true },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvas }) => {
        const shell = canvas.getByRole("group").closest(".xp-ricochet")

        await waitFor(() => expect(shell).toHaveAttribute("data-phase", "playing"))
    },
}

export const CustomWord: Story = {
    args: { text: "LOST", autoStart: false, interactive: false, hint: "" },
}

export const CustomNumber: Story = {
    args: { text: "500", autoStart: false, interactive: false, hint: "" },
}

/**
 * A blank text leaves nothing to knock down, which is exactly the cleared board,
 * so Chromatic gets a still frame of the end state instead of a timed rally.
 */
export const Cleared: Story = {
    args: { text: " ", autoStart: false, interactive: false, hint: "" },
    play: async ({ canvas }) => {
        const shell = canvas.getByRole("group").closest(".xp-ricochet")

        await expect(shell).toHaveAttribute("data-phase", "cleared")
    },
}

/**
 * Storybook cannot emulate the media query, so this mirrors what reduced motion
 * renders: the whole text standing still, no loop, no cursor hiding, no focus stop.
 */
export const ReducedMotion: Story = {
    args: { autoStart: false, interactive: false, hint: "" },
}

export const Mono: Story = {
    args: { variant: "mono", autoStart: false, interactive: false, hint: "" },
}

export const Soft: Story = {
    args: { variant: "soft", autoStart: false, interactive: false, hint: "" },
}

export const CustomPalette: Story = {
    args: {
        color: "#b6e26a",
        ballColor: "#ffffff",
        paddleColor: "#f2779a",
        autoStart: false,
        interactive: false,
        hint: "",
    },
}

export const FinePixels: Story = {
    args: { pixelSize: 12, autoStart: false, interactive: false, hint: "" },
}

export const PageNotFound: Story = {
    args: { text: "404" },
    parameters: { chromatic: { disableSnapshot: true } },
    render: (args) => (
        <div style={{ display: "grid", gap: 20, justifyItems: "center" }}>
            <span
                style={{
                    fontSize: 11,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                }}
            >
                Page not found
            </span>

            <Ricochet {...args} style={{ height: 420 }} />

            <p
                style={{
                    maxWidth: 420,
                    margin: 0,
                    textAlign: "center",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.66)",
                }}
            >
                That page went missing. Knock the number apart while you decide where to go next.
            </p>

            <a
                href="#top"
                style={{
                    padding: "12px 24px",
                    borderRadius: 999,
                    background: "#fdf3e3",
                    color: "#12131a",
                    font: "inherit",
                    fontWeight: 650,
                    textDecoration: "none",
                }}
            >
                Back home
            </a>
        </div>
    ),
}
