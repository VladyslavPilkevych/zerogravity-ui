import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Dither } from "./Dither"

const tile = {
    display: "grid",
    gap: 8,
    width: 280,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0c0e16",
    color: "#fff",
    font: "14px/1.5 system-ui",
    textDecoration: "none",
} as const

const meta = {
    title: "Components/Dither",
    component: Dither,
    args: { children: "Pixel hover" },
    render: (args) => (
        <Dither {...args} style={tile}>
            <strong>Interface</strong>
            <span>Blocks sweep in from the pointer and dissolve on exit.</span>
        </Dither>
    ),
} satisfies Meta<typeof Dither>

export default meta
type Story = StoryObj<typeof meta>

async function settled(canvasElement: HTMLElement, state: string) {
    await waitFor(
        () =>
            expect(canvasElement.querySelector(".zg-dither")).toHaveAttribute("data-state", state),
        { timeout: 3000 },
    )
}

export const Rest: Story = {
    play: async ({ canvasElement }) => settled(canvasElement, "idle"),
}

export const Active: Story = {
    args: { active: true },
    play: async ({ canvasElement }) => settled(canvasElement, "on"),
}

export const Multicolour: Story = {
    args: { active: true, colors: ["#4ee1f2", "#c6f24e", "#ff5fa2", "#9d7bff"], cell: 10 },
    play: async ({ canvasElement }) => settled(canvasElement, "on"),
}

export const KeyboardFocus: Story = {
    args: { as: "a", href: "#dither" },
    play: async ({ canvasElement }) => {
        await userEvent.tab()
        const link = within(canvasElement).getByRole("link")
        await expect(link).toHaveFocus()
        await settled(canvasElement, "on")
    },
}

export const HoverAndLeave: Story = {
    args: { as: "button", type: "button" },
    play: async ({ canvasElement }) => {
        const button = within(canvasElement).getByRole("button")
        await userEvent.hover(button)
        await settled(canvasElement, "on")
        await userEvent.unhover(button)
        await settled(canvasElement, "idle")
    },
}

export const ListNavigation: Story = {
    render: (args) => (
        <nav aria-label="Sections">
            <Dither
                {...args}
                as="ul"
                active
                style={{ ...tile, listStyle: "none", margin: 0, display: "flex", gap: 16 }}
            >
                <li>
                    <a href="#docs" style={{ color: "inherit" }}>
                        Docs
                    </a>
                </li>
                <li>
                    <a href="#components" style={{ color: "inherit" }}>
                        Components
                    </a>
                </li>
            </Dither>
        </nav>
    ),
    play: async ({ canvasElement }) => {
        const list = within(canvasElement).getByRole("list")
        await expect(within(list).getAllByRole("listitem")).toHaveLength(2)
        await expect([...list.children].every((child) => child.tagName === "LI")).toBe(true)
        const slot = list.querySelector(".zg-dither-slot")!
        await expect(getComputedStyle(slot).position).toBe("absolute")
        await expect(slot.getBoundingClientRect().width).toBe(list.clientWidth)
        await settled(canvasElement, "on")
    },
}
