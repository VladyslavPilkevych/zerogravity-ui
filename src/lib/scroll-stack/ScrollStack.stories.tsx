import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { ScrollStack } from "./ScrollStack"

const TONES = ["#1d2b53", "#2b1d53", "#153f3a", "#4a2b18", "#3f1530"]

function panels(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <section
            key={index}
            className="sb-panel"
            style={{ background: `linear-gradient(150deg, #101017, ${TONES[index % 5]})` }}
        >
            Section {index + 1}
        </section>
    ))
}

const meta = {
    title: "Components/ScrollStack",
    component: ScrollStack,
    parameters: { surface: { padding: 0 } },
    args: {
        height: "70vh",
        children: panels(4),
    },
} satisfies Meta<typeof ScrollStack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleCard: Story = {
    args: { children: panels(1) },
}

export const ManyCards: Story = {
    args: { children: panels(8) },
}

export const Rounded: Story = {
    args: { rounded: 28 },
}

export const StrongDim: Story = {
    args: { dim: 0.7, scaleTo: 0.86 },
}

export const Disabled: Story = {
    args: { disabled: true },
}

export const RendersEveryCard: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            expect(canvasElement.querySelectorAll(".scroll-stack-card")).toHaveLength(4)
        })
    },
}
