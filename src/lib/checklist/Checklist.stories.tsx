import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"

import { Checklist } from "./Checklist"
import { StyleBoards } from "../../../.storybook/StyleBoards"

const meta = {
    title: "Components/Checklist",
    component: Checklist,
    parameters: { surface: { padding: 32 } },
    args: {
        label: "Conference prep",
        items: [
            { id: "tickets", label: "Book train tickets" },
            { id: "hotel", label: "Reserve the hotel" },
            { id: "talk", label: "Rehearse the talk" },
            { id: "visa", label: "Visa (not needed)", disabled: true },
        ],
        defaultValue: ["tickets"],
        showProgress: true,
        style: { color: "#f5f5f7", maxWidth: 420 },
    },
} satisfies Meta<typeof Checklist>

export default meta
type Story = StoryObj<typeof meta>

export const Pixel: Story = {
    play: async ({ canvasElement }) => {
        const boxes = canvasElement.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
        boxes[1].focus()
        await userEvent.keyboard(" ")
        await expect(boxes[1]).toBeChecked()
        await expect(canvasElement.querySelector("[role=progressbar]")).toHaveAttribute(
            "aria-valuetext",
            "2 of 4",
        )
    },
}

export const Classic: Story = { args: { variant: "classic" } }

/** Every style over light and dark, with native checkboxes throughout. */
export const Styles: Story = {
    render: (args) => (
        <StyleBoards
            styles={["pixel", "classic", "minimal", "glass"] as const}
            render={(style) => (
                <Checklist
                    {...args}
                    style={{ maxWidth: 420 }}
                    defaultValue={["tickets"]}
                    showProgress
                    variant={style}
                />
            )}
        />
    ),
}
