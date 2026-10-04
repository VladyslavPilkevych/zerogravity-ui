import type { Meta, StoryObj } from "@storybook/react-vite"

import { Phosphor } from "./Phosphor"

const meta = {
    title: "Experimental/Phosphor",
    component: Phosphor,
    parameters: { surface: { padding: 56 } },
    args: { text: "PHOSPHOR", as: "h2", style: { fontSize: 54, fontWeight: 800 } },
    decorators: [
        (Story) => (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    padding: 40,
                    background: "radial-gradient(circle at 50% 45%, #0b1512, #04070a 70%)",
                }}
            >
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Phosphor>

export default meta
type Story = StoryObj<typeof meta>

/** The roll and the mask drift are the only motion; frozen is the snapshot. */
export const Still: Story = { args: { disabled: true } }

export const Amber: Story = { args: { disabled: true, color: "#ffb454" } }

export const NoScanlines: Story = { args: { disabled: true, scanline: 0 } }

export const CoarseScanlines: Story = { args: { disabled: true, scanline: 12 } }

export const WideFringe: Story = { args: { disabled: true, fringe: 8 } }

export const NoBloom: Story = { args: { disabled: true, bloom: 0 } }

export const Rolling: Story = { parameters: { chromatic: { disableSnapshot: true } } }
