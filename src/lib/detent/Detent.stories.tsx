import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor } from "storybook/test"

import { Detent } from "./Detent"
import { geometry, StyleBoards } from "../../../.storybook/StyleBoards"

const meta = {
    title: "Components/Detent",
    component: Detent,
    parameters: { surface: { padding: 32 } },
    args: {
        label: "View",
        options: [
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
            { value: "board", label: "Board" },
        ],
        style: { color: "#f5f5f7", font: "14px system-ui, sans-serif" },
    },
} satisfies Meta<typeof Detent>

export default meta
type Story = StoryObj<typeof meta>

function aligned(canvas: HTMLElement) {
    const thumb = canvas.querySelector(".zg-detent-indicator") as HTMLElement
    const checked = canvas.querySelector(".zg-detent-option[data-checked]") as HTMLElement
    return Math.abs(thumb.getBoundingClientRect().left - checked.getBoundingClientRect().left)
}

/** The thumb lands exactly on the selected option, by click and by keyboard. */
export const Selecting: Story = {
    play: async ({ canvasElement }) => {
        await expect(aligned(canvasElement)).toBeLessThan(1)

        await userEvent.click(canvasElement.querySelector("input[value='board']") as HTMLElement)
        await waitFor(() => expect(aligned(canvasElement)).toBeLessThan(1), { timeout: 3000 })

        await userEvent.keyboard("{ArrowLeft}")
        await expect(canvasElement.querySelector("input[value='list']")).toBeChecked()
        await waitFor(() => expect(aligned(canvasElement)).toBeLessThan(1), { timeout: 3000 })
    },
}

export const FullWidth: Story = { args: { fullWidth: true } }

export const WithDisabledOption: Story = {
    args: {
        options: [
            { value: "day", label: "Day" },
            { value: "week", label: "Week", disabled: true },
            { value: "month", label: "Month" },
        ],
        label: "Range",
    },
}

export const RightToLeft: Story = {
    args: { defaultValue: "board" },
    decorators: [
        (Story) => (
            <div dir="rtl">
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        await waitFor(() => expect(aligned(canvasElement)).toBeLessThan(1), { timeout: 3000 })
    },
}

/** The original, smoother look, kept as the second style. */
export const Classic: Story = { args: { variant: "classic" } }

const STYLES = ["pixel", "classic", "minimal", "glass"] as const

/** Options keep their size across classic, minimal and glass; pixel is tighter by design. */
export const Styles: Story = {
    render: (args) => (
        <StyleBoards
            styles={STYLES}
            render={(style) => (
                <Detent
                    {...args}
                    style={{ font: "14px system-ui, sans-serif" }}
                    defaultValue="list"
                    variant={style}
                />
            )}
        />
    ),
    play: async ({ canvasElement }) => {
        const rects = geometry(canvasElement, "light", ".zg-detent-option")
        await expect(rects.minimal).toBe(rects.classic)
        await expect(rects.glass).toBe(rects.classic)
        await waitFor(() => expect(aligned(canvasElement)).toBeLessThan(1), { timeout: 3000 })
    },
}
