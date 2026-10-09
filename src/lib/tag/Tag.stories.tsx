import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Tag, TAG_STATUSES } from "./Tag"

const meta = {
    title: "Components/Tag",
    component: Tag,
    parameters: { surface: { padding: 40 } },
    args: { children: "Stable" },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

const row = { display: "flex", flexWrap: "wrap", gap: 12, color: "#fff" } as const

export const Statuses: Story = {
    render: (args) => (
        <div style={row}>
            {TAG_STATUSES.filter((status) => status !== "live").map((status) => (
                <Tag {...args} key={status} status={status}>
                    {status}
                </Tag>
            ))}
        </div>
    ),
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText("success")).toBeVisible()
    },
}

export const Solid: Story = {
    render: (args) => (
        <div style={row}>
            {TAG_STATUSES.filter((status) => status !== "live").map((status) => (
                <Tag {...args} key={status} status={status} variant="solid">
                    {status}
                </Tag>
            ))}
        </div>
    ),
}

export const Live: Story = {
    args: { status: "live", children: "Live", role: "status" },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Live")
    },
}

export const CustomTone: Story = {
    args: { tone: "#9d7bff", children: "Beta", style: { color: "#fff" } },
}

const light = { ...row, padding: 24, background: "#f6f7f9", color: "#14161c" } as const

export const OnLight: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={light}>
                {TAG_STATUSES.map((status) => (
                    <Tag {...args} key={status} status={status}>
                        {status}
                    </Tag>
                ))}
            </div>
            <div style={light}>
                {TAG_STATUSES.map((status) => (
                    <Tag {...args} key={status} status={status} variant="solid">
                        {status}
                    </Tag>
                ))}
            </div>
        </div>
    ),
    parameters: { chromatic: { pauseAnimationAtEnd: true } },
}
