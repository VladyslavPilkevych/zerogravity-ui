import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { Keycap } from "./Keycap"

const meta = {
    title: "Components/Keycap",
    component: Keycap,
    args: { children: "Deploy", onClick: fn() },
} satisfies Meta<typeof Keycap>

export default meta
type Story = StoryObj<typeof meta>

export const Solid: Story = {}

export const Outline: Story = {
    args: { variant: "outline" },
}

export const Ghost: Story = {
    args: { variant: "ghost" },
}

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Keycap {...args} size="sm">
                Small
            </Keycap>
            <Keycap {...args} size="md">
                Medium
            </Keycap>
            <Keycap {...args} size="lg">
                Large
            </Keycap>
        </div>
    ),
}

export const Tones: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: 20 }}>
            <Keycap {...args} tone="#c6f24e">
                Lime
            </Keycap>
            <Keycap {...args} tone="#ff5fa2" variant="outline">
                Pink
            </Keycap>
            <Keycap {...args} tone="#9d7bff" notch={0}>
                Square
            </Keycap>
        </div>
    ),
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole("button", { name: "Deploy" })
        await expect(button).toBeDisabled()
        await userEvent.click(button)
        await expect(args.onClick).not.toHaveBeenCalled()
    },
}

export const KeyboardPress: Story = {
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole("button", { name: "Deploy" })
        await userEvent.tab()
        await expect(button).toHaveFocus()
        await userEvent.keyboard("{Enter}")
        await expect(args.onClick).toHaveBeenCalledTimes(1)
    },
}

const light = {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "center",
    padding: 28,
    background: "#f6f7f9",
    color: "#14161c",
} as const

export const OnLight: Story = {
    render: (args) => (
        <div style={light}>
            <Keycap {...args}>Solid</Keycap>
            <Keycap {...args} variant="outline">
                Outline
            </Keycap>
            <Keycap {...args} variant="ghost">
                Ghost
            </Keycap>
            <Keycap {...args} disabled>
                Disabled
            </Keycap>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await userEvent.tab()
        await expect(within(canvasElement).getByRole("button", { name: "Solid" })).toHaveFocus()
    },
}
