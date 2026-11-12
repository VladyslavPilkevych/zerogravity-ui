import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"

import { Task } from "./Task"
import { geometry, StyleBoards } from "../../../.storybook/StyleBoards"

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

const STYLES = ["pixel", "classic", "minimal", "glass"] as const

/** Classic, minimal and glass share one geometry; pixel sets its meta line in mono. */
export const Styles: Story = {
    render: (args) => (
        <StyleBoards
            styles={STYLES}
            render={(style, tone) => (
                <Task
                    {...args}
                    title={`Quarterly report ${STYLES.indexOf(style) * 2 + (tone === "dark" ? 1 : 0)}`}
                    style={{ maxWidth: 480 }}
                    defaultExpanded
                    variant={style}
                />
            )}
        />
    ),
    play: async ({ canvasElement }) => {
        for (const selector of [".zg-task", ".zg-task-check", ".zg-task-chevron"]) {
            const rects = geometry(canvasElement, "light", selector)
            await expect(rects.minimal).toBe(rects.classic)
            await expect(rects.glass).toBe(rects.classic)
        }
    },
}
