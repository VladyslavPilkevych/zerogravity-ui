import type { Meta, StoryObj } from "@storybook/react-vite"

import { UNDERTOW_DEMO_BACK, UNDERTOW_DEMO_FRONT } from "../experimental/undertow/demoImages"
import { Lenticular } from "./Lenticular"

const meta = {
    title: "Components/Lenticular",
    component: Lenticular,
    parameters: { surface: { padding: 32 } },
    args: {
        frontSrc: UNDERTOW_DEMO_FRONT,
        backSrc: UNDERTOW_DEMO_BACK,
        alt: "A meadow at noon on one side of the lens, and at night on the other",
        aspect: "16 / 10",
    },
} satisfies Meta<typeof Lenticular>

export default meta
type Story = StoryObj<typeof meta>

/** The pointer at the far left: only the first picture, no seams from the second. */
export const Left: Story = { args: { position: 0.03 } }

/** Head-on: half of each picture, interlaced under the lens. */
export const HeadOn: Story = { args: { position: 0.5 } }

/** The pointer at the far right: only the second picture. */
export const Right: Story = { args: { position: 0.97 } }

export const FineLens: Story = { args: { disabled: true, strips: 110 } }

export const CoarseLens: Story = { args: { disabled: true, strips: 14 } }

export const NoSheen: Story = { args: { disabled: true, sheen: 0 } }

export const SquareCorners: Story = { args: { disabled: true, radius: 0 } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const BrokenSource: Story = {
    args: { disabled: true, frontSrc: "/missing-a.png", backSrc: "/missing-b.png" },
}
