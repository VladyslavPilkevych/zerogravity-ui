import type { Meta, StoryObj } from "@storybook/react-vite"

import { Progress } from "./Progress"
import { geometry, StyleBoards } from "../../../.storybook/StyleBoards"
import { expect } from "storybook/test"

const meta = {
    title: "Components/Progress",
    component: Progress,
    parameters: { surface: { padding: 32 } },
    args: { label: "Subtasks", value: 3, max: 8, style: { color: "#f5f5f7", maxWidth: 420 } },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Pixel: Story = {}

export const Classic: Story = { args: { variant: "classic" } }

export const Segmented: Story = { args: { segments: true } }

export const Percentage: Story = { args: { value: 64, max: 100, label: "Upload" } }

const STYLES = ["pixel", "classic", "minimal", "glass"] as const

/** One track size in every style; minimal draws its rail inside the same box. */
export const Styles: Story = {
    render: (args) => (
        <StyleBoards
            styles={STYLES}
            render={(style) => (
                <div style={{ display: "grid", gap: 14 }}>
                    <Progress {...args} style={{ maxWidth: 420 }} variant={style} />
                    <Progress
                        {...args}
                        style={{ maxWidth: 420 }}
                        label="Week"
                        value={4}
                        max={7}
                        segments
                        variant={style}
                    />
                </div>
            )}
        />
    ),
    play: async ({ canvasElement }) => {
        for (const selector of [".zg-progress-track", ".zg-progress-block"]) {
            const rects = geometry(canvasElement, "light", selector)
            for (const style of STYLES) await expect(rects[style]).toBe(rects.pixel)
        }
    },
}
