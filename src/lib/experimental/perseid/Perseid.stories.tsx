import type { Meta, StoryObj } from "@storybook/react-vite"

import { Perseid } from "./Perseid"

const meta = {
    title: "Experimental/Perseid",
    component: Perseid,
    parameters: { surface: { padding: 0 } },
    args: { count: 18 },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 460, background: "radial-gradient(#0a0f1f, #03040a)" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Perseid>

export default meta
type Story = StoryObj<typeof meta>

/** A seed fixes the sky and `disabled` holds it, so the frame is repeatable. */
export const Composition: Story = {
    args: { seed: 21, disabled: true },
}

export const Sparse: Story = {
    args: { seed: 21, disabled: true, count: 5 },
}

export const Dense: Story = {
    args: { seed: 21, disabled: true, count: 60 },
}

export const CountIsClamped: Story = {
    args: { seed: 21, disabled: true, count: 5000 },
}

export const Steep: Story = {
    args: { seed: 8, disabled: true, angle: 4 },
}

export const LeaningRight: Story = {
    args: { seed: 8, disabled: true, angle: 58 },
}

export const IcePalette: Story = {
    args: { seed: 3, disabled: true, colors: ["#eaf4ff", "#9ec9ff", "#5ce1e6"] },
}

export const EmberPalette: Story = {
    args: { seed: 3, disabled: true, colors: ["#fff1e0", "#ff9f6b", "#ff5f6d"] },
}

export const WithContent: Story = {
    args: {
        seed: 12,
        disabled: true,
        children: (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: 460,
                    color: "#e8f0ff",
                    font: "700 40px/1.2 system-ui, sans-serif",
                }}
            >
                Perseid
            </div>
        ),
    },
}

export const Falling: Story = {
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Parallax: Story = {
    args: { parallax: true },
    parameters: { chromatic: { disableSnapshot: true } },
}
