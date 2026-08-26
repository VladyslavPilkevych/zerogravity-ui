import type { Meta, StoryObj } from "@storybook/react-vite"

import { RASTER_DEMO_IMAGE } from "../raster/demoImage"
import { Anaglyph } from "./Anaglyph"

const meta = {
    title: "Experimental/Anaglyph",
    component: Anaglyph,
    parameters: { surface: { padding: 32 } },
    args: {
        src: RASTER_DEMO_IMAGE,
        alt: "Abstract poster of a sun setting behind layered hills",
        aspect: "16 / 10",
    },
} satisfies Meta<typeof Anaglyph>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing is pointing at it, so the channels sit fully apart. */
export const Split: Story = { args: { disabled: true } }

export const NarrowSplit: Story = { args: { disabled: true, separation: 4 } }

export const WideSplit: Story = { args: { disabled: true, separation: 50 } }

export const Parallax: Story = { args: { disabled: true, mode: "parallax" } }

export const SquareCorners: Story = { args: { disabled: true, radius: 0 } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

export const BrokenSource: Story = { args: { src: "/no-such-picture.png" } }
