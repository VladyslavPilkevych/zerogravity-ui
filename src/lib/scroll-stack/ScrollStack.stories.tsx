import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { ScrollStack } from "./ScrollStack"

const TONES = ["#1d2b53", "#2b1d53", "#153f3a", "#4a2b18", "#3f1530"]

function panels(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <section
            key={index}
            className="sb-panel"
            style={{
                height: "100%",
                background: `linear-gradient(150deg, #101017, ${TONES[index % 5]})`,
            }}
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

export const LastCardDocksAndHolds: Story = {
    args: {
        heights: ["90vh", "60vh", "90vh", "50vh"],
        top: 0,
        peek: 16,
        scaleTo: 0.9,
        hold: 0.3,
    },
    parameters: { chromatic: { disableSnapshot: true } },
    render: (args) => (
        <>
            <ScrollStack {...args} />
            <div style={{ height: "100vh" }} />
        </>
    ),
    play: async ({ canvasElement }) => {
        const stack = canvasElement.querySelector<HTMLElement>(".scroll-stack")!
        const cards = [...stack.querySelectorAll<HTMLElement>(".scroll-stack-card")]
        const last = cards.length - 1
        const stickyTop = (index: number) => index * 16
        const origin = stack.getBoundingClientRect().top + window.scrollY
        const dock =
            origin +
            cards.slice(0, last).reduce((sum, card) => sum + card.offsetHeight, 0) -
            stickyTop(last)
        const top = (index: number) => Math.round(cards[index].getBoundingClientRect().top)

        try {
            window.scrollTo(0, dock)
            await waitFor(() => {
                expect(top(last)).toBe(stickyTop(last))
                expect(cards[last - 1].style.transform).toContain("scale(0.9)")
            })
            cards.forEach((_, index) => expect(top(index)).toBe(stickyTop(index)))

            window.scrollTo(0, dock + Math.floor(window.innerHeight * 0.3) - 2)
            await waitFor(() => expect(window.scrollY).toBeGreaterThan(dock))
            cards.forEach((_, index) => expect(top(index)).toBe(stickyTop(index)))

            const space = stack.querySelector<HTMLElement>(".scroll-stack-hold")!.offsetHeight
            window.scrollTo(0, dock + space + 60)
            await waitFor(() => expect(top(last)).toBeLessThan(stickyTop(last)))
        } finally {
            window.scrollTo(0, 0)
        }
    },
}
