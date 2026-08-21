import type { Meta, StoryObj } from "@storybook/react-vite"

import { Raster } from "./Raster"
import { RASTER_DEMO_IMAGE } from "./demoImage"
import { RASTER_GLYPH_SETS } from "./sample"

const meta = {
    title: "Experimental/Raster",
    component: Raster,
    parameters: { surface: { padding: 32 } },
    args: {
        src: RASTER_DEMO_IMAGE,
        alt: "Abstract poster of a sun setting behind layered hills",
        aspectRatio: "16 / 9",
    },
} satisfies Meta<typeof Raster>

export default meta
type Story = StoryObj<typeof meta>

export const Blur: Story = {
    args: { mode: "blur" },
}

export const BlurHeavy: Story = {
    args: { mode: "blur", blurStrength: 48 },
}

export const Glass: Story = {
    args: { mode: "glass", animated: false },
}

export const GlassAnimated: Story = {
    args: { mode: "glass" },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const GlassStrong: Story = {
    args: { mode: "glass", distortion: 40, animated: false },
}

export const Glyph: Story = {
    args: { mode: "glyph" },
}

export const GlyphAscii: Story = {
    args: { mode: "glyph", glyphSet: "ascii", cellSize: 10 },
}

export const GlyphBlocks: Story = {
    args: { mode: "glyph", glyphSet: "blocks", cellSize: 8 },
}

export const GlyphCustomSet: Story = {
    args: { mode: "glyph", glyphSet: " ·+○◍●", cellSize: 14, contrast: 1.4 },
}

export const Pixel: Story = {
    args: { mode: "pixel" },
}

export const PixelCoarse: Story = {
    args: { mode: "pixel", pixelSize: 34, gridGap: 4 },
}

export const PixelSquare: Story = {
    args: { mode: "pixel", pixelSize: 16, gridGap: 0, rounded: 0 },
}

export const PixelDots: Story = {
    args: { mode: "pixel", pixelSize: 18, gridGap: 2, rounded: 1 },
}

export const PixelRounding: Story = {
    args: { mode: "pixel" },
    render: (args) => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
            }}
        >
            {[0, 0.3, 0.6, 1].map((amount) => (
                <Raster key={amount} {...args} rounded={amount} aspectRatio="4 / 3" />
            ))}
        </div>
    ),
}

export const Interactive: Story = {
    args: { mode: "glyph", interactive: true },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const ReducedMotion: Story = {
    args: { mode: "glass", animated: false },
}

export const Disabled: Story = {
    args: { mode: "glyph", disabled: true },
}

export const EveryMode: Story = {
    args: { mode: "blur" },
    render: (args) => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
            }}
        >
            {(["blur", "glass", "glyph", "pixel"] as const).map((mode) => (
                <Raster key={mode} {...args} mode={mode} animated={false} aspectRatio="4 / 3" />
            ))}
        </div>
    ),
}

export const GlyphSets: Story = {
    args: { mode: "glyph" },
    render: (args) => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
            }}
        >
            {Object.keys(RASTER_GLYPH_SETS).map((set) => (
                <Raster
                    key={set}
                    {...args}
                    glyphSet={set as keyof typeof RASTER_GLYPH_SETS}
                    aspectRatio="4 / 3"
                />
            ))}
        </div>
    ),
}
