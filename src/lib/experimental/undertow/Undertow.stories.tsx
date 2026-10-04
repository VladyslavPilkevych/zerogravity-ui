import type { Meta, StoryObj } from "@storybook/react-vite"

import { Undertow } from "./Undertow"
import { UNDERTOW_DEMO_BACK, UNDERTOW_DEMO_FRONT } from "./demoImages"

const meta = {
    title: "Experimental/Undertow",
    component: Undertow,
    parameters: { surface: { padding: 32 } },
    args: {
        frontSrc: UNDERTOW_DEMO_FRONT,
        backSrc: UNDERTOW_DEMO_BACK,
        alt: "A meadow at noon, with the same meadow at night underneath",
        aspect: "16 / 9",
    },
} satisfies Meta<typeof Undertow>

export default meta
type Story = StoryObj<typeof meta>

/** `disabled` holds one centred disturbance, so the frame never moves. */
export const Parted: Story = {
    args: { disabled: true },
}

export const WideOpening: Story = {
    args: { disabled: true, radius: 0.46 },
}

export const NarrowOpening: Story = {
    args: { disabled: true, radius: 0.16 },
}

export const SoftEdge: Story = {
    args: { disabled: true, softness: 0.75 },
}

export const HardEdge: Story = {
    args: { disabled: true, softness: 0.05 },
}

export const CalmBoundary: Story = {
    args: { disabled: true, strength: 0.1 },
}

export const RestlessBoundary: Story = {
    args: { disabled: true, strength: 1 },
}

export const Portrait: Story = {
    args: { disabled: true, aspect: "3 / 4" },
}

export const TopCrop: Story = {
    args: { disabled: true, aspect: "21 / 9", objectPosition: "50% 0%" },
}

export const Live: Story = {
    parameters: { chromatic: { disableSnapshot: true } },
}

/** The trail stays open far longer, so a whole drag reads at once. */
export const LongLinger: Story = {
    args: { linger: 7 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const ShortLinger: Story = {
    args: { linger: 0.5 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const NotInteractive: Story = {
    args: { interactive: false },
    parameters: { chromatic: { disableSnapshot: true } },
}
