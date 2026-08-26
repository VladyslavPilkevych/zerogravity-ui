import type { Meta, StoryObj } from "@storybook/react-vite"

import { Sonar } from "./Sonar"

const meta = {
    title: "Experimental/Sonar",
    component: Sonar,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ minHeight: 400, background: "#06080f" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Sonar>

export default meta
type Story = StoryObj<typeof meta>

/** The field at rest: a still, even grid of dots. */
export const Field: Story = { args: { disabled: true } }

export const TightGrid: Story = { args: { disabled: true, gap: 12 } }

export const LooseGrid: Story = { args: { disabled: true, gap: 60 } }

export const WarmDots: Story = { args: { disabled: true, color: "#ffb27a" } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const FiresOnHover: Story = {
    args: { onHover: true },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const BigShove: Story = {
    args: { amplitude: 60, band: 200 },
    parameters: { chromatic: { disableSnapshot: true } },
}
