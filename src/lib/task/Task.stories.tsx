import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"

import { Task } from "./Task"

const meta = {
    title: "Components/Task",
    component: Task,
    parameters: { surface: { padding: 32 } },
    args: {
        title: "Quarterly report",
        style: { color: "#f5f5f7", maxWidth: 480 },
        progress: { value: 1, max: 4 },
        meta: (
            <>
                <span>In progress</span>
                <span>Due Fri</span>
                <span>3 h</span>
            </>
        ),
        children: <p style={{ margin: 0 }}>Outline, draft, figures and a review.</p>,
    },
} satisfies Meta<typeof Task>

export default meta
type Story = StoryObj<typeof meta>

export const Pixel: Story = {
    play: async ({ canvasElement }) => {
        const toggle = canvasElement.querySelector(".zg-task-summary") as HTMLElement
        await userEvent.click(toggle)
        await expect(toggle).toHaveAttribute("aria-expanded", "true")
    },
}

export const Classic: Story = { args: { variant: "classic", defaultExpanded: true } }

export const Done: Story = { args: { defaultDone: true, progress: undefined } }
