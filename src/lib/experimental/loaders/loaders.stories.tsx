import type { Meta, StoryObj } from "@storybook/react-vite"

import { PixelBar } from "./PixelBar"
import { PixelBlocks } from "./PixelBlocks"
import { PixelHeart } from "./PixelHeart"
import { PixelPulse } from "./PixelPulse"

const meta = {
    title: "Experimental/Pixel loaders",
    parameters: {
        surface: { padding: 48 },
        // infinite CSS loops never settle, so only the resting stories are snapshotted
        chromatic: { disableSnapshot: true },
    },
} satisfies Meta

export default meta

const still = { chromatic: { disableSnapshot: false } }

type HeartStory = StoryObj<typeof PixelHeart>

export const Heart: HeartStory = {
    render: (args) => <PixelHeart {...args} />,
}

export const HeartLarge: HeartStory = {
    render: (args) => <PixelHeart {...args} />,
    args: { size: 180 },
}

export const HeartBlink: HeartStory = {
    render: (args) => <PixelHeart {...args} />,
    args: { variant: "blink" },
}

export const HeartCustomColor: HeartStory = {
    render: (args) => <PixelHeart {...args} />,
    args: { color: "#f2779a", size: 128 },
}

export const HeartReducedMotion: HeartStory = {
    render: (args) => <PixelHeart {...args} />,
    args: { paused: true, size: 128 },
    parameters: still,
}

type BlocksStory = StoryObj<typeof PixelBlocks>

export const Blocks: BlocksStory = {
    render: (args) => <PixelBlocks {...args} />,
}

export const BlocksLarge: BlocksStory = {
    render: (args) => <PixelBlocks {...args} />,
    args: { size: 18, count: 7 },
}

export const BlocksVariants: BlocksStory = {
    render: (args) => (
        <div style={{ display: "grid", gap: 34, justifyItems: "start" }}>
            <PixelBlocks {...args} variant="wave" />
            <PixelBlocks {...args} variant="center" />
            <PixelBlocks {...args} variant="steps" />
        </div>
    ),
    args: { size: 14 },
}

export const BlocksCustomColor: BlocksStory = {
    render: (args) => <PixelBlocks {...args} />,
    args: { color: "#7ad4ea", size: 16 },
}

export const BlocksReducedMotion: BlocksStory = {
    render: (args) => <PixelBlocks {...args} />,
    args: { paused: true, size: 16 },
    parameters: still,
}

type BarStory = StoryObj<typeof PixelBar>

export const Bar: BarStory = {
    render: (args) => <PixelBar {...args} />,
}

export const BarLarge: BarStory = {
    render: (args) => <PixelBar {...args} />,
    args: { size: 20, segments: 18 },
}

export const BarProgress: BarStory = {
    render: (args) => <PixelBar {...args} />,
    args: { value: 0.55 },
    parameters: still,
}

export const BarCustomColor: BarStory = {
    render: (args) => <PixelBar {...args} />,
    args: { color: "#b6e26a", size: 16 },
}

export const BarReducedMotion: BarStory = {
    render: (args) => <PixelBar {...args} />,
    args: { paused: true },
    parameters: still,
}

type PulseStory = StoryObj<typeof PixelPulse>

const frame = { height: 320, borderRadius: 18, overflow: "hidden", background: "#0b0c14" }

export const Pulse: PulseStory = {
    render: (args) => (
        <div style={frame}>
            <PixelPulse {...args} />
        </div>
    ),
}

export const PulseWithHeart: PulseStory = {
    render: (args) => (
        <div style={frame}>
            <PixelPulse {...args}>
                <PixelHeart size={84} label="" />
                <PixelBlocks size={8} label="" />
            </PixelPulse>
        </div>
    ),
}

export const PulseLarge: PulseStory = {
    render: (args) => (
        <div style={frame}>
            <PixelPulse {...args} />
        </div>
    ),
    args: { cell: 52 },
}

export const PulseCustomColor: PulseStory = {
    render: (args) => (
        <div style={frame}>
            <PixelPulse {...args} />
        </div>
    ),
    args: { color: "#9a86d6" },
}

export const PulseReducedMotion: PulseStory = {
    render: (args) => (
        <div style={frame}>
            <PixelPulse {...args}>
                <PixelHeart size={84} label="" paused />
            </PixelPulse>
        </div>
    ),
    args: { paused: true },
    parameters: still,
}

export const Gallery: StoryObj = {
    render: () => (
        <div style={{ display: "grid", gap: 44, justifyItems: "center" }}>
            <PixelHeart size={112} />
            <PixelBlocks size={14} />
            <div style={{ width: "min(420px, 100%)" }}>
                <PixelBar />
            </div>
        </div>
    ),
}
