import type { Meta, StoryObj } from "@storybook/react-vite"

import { Kbd } from "./Kbd"

const meta = {
    title: "Experimental/Kbd",
    component: Kbd,
    parameters: { surface: { padding: 40 } },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
    args: { children: "/" },
}

export const Shortcut: Story = {
    args: { keys: ["Mod", "K"] },
}

export const Mac: Story = {
    args: { keys: ["Mod", "K"], platform: "mac" },
}

export const Modifiers: Story = {
    args: { keys: ["Shift", "Alt", "Enter"], platform: "mac" },
}

export const InSentence: Story = {
    args: { keys: ["Mod", "K"] },
    render: (args) => (
        <p style={{ color: "rgba(255,255,255,0.7)", font: "15px/1.6 system-ui" }}>
            Press <Kbd {...args} /> to search the components.
        </p>
    ),
}
