import type { Meta, StoryObj } from "@storybook/react-vite"

import { RASTER_DEMO_IMAGE } from "../raster/demoImage"
import { Emulsion } from "./Emulsion"

const meta = {
    title: "Experimental/Emulsion",
    component: Emulsion,
    parameters: { surface: { padding: 32 } },
    args: {
        src: RASTER_DEMO_IMAGE,
        alt: "Abstract poster of a sun setting behind layered hills",
        aspect: "16 / 10",
    },
} satisfies Meta<typeof Emulsion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoTreatment: Story = {
    args: { halation: 0, grain: 0, leak: 0, fade: 0, warmth: 0 },
}

export const HeavyHalation: Story = { args: { halation: 1 } }

export const HeavyGrain: Story = { args: { grain: 1 } }

export const Cool: Story = { args: { warmth: -1 } }

export const BigLeak: Story = { args: { leak: 1 } }

export const Faded: Story = { args: { fade: 0.7 } }

export const SquareCorners: Story = { args: { radius: 0 } }

export const BrokenSource: Story = { args: { src: "/no-such-picture.png" } }
