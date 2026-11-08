import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Checklist, type ChecklistItem } from "./Checklist"

const ITEMS: ChecklistItem[] = [
    { id: "outline", label: "Outline" },
    { id: "draft", label: "Draft" },
    { id: "review", label: "Review", disabled: true },
]

describe("Checklist", () => {
    it("is a named group of native checkboxes", () => {
        render(<Checklist label="Subtasks" items={ITEMS} />)
        expect(screen.getByRole("group", { name: "Subtasks" })).toBeInTheDocument()
        expect(screen.getAllByRole("checkbox")).toHaveLength(3)
        expect(screen.getByRole("checkbox", { name: "Review" })).toBeDisabled()
    })

    it("toggles uncontrolled from the keyboard and reports the checked ids in order", async () => {
        const user = userEvent.setup()
        const change = vi.fn()
        render(
            <Checklist label="Subtasks" items={ITEMS} defaultValue={["draft"]} onChange={change} />,
        )

        await user.tab()
        await user.keyboard(" ")
        expect(screen.getByRole("checkbox", { name: "Outline" })).toBeChecked()
        expect(change).toHaveBeenLastCalledWith(["outline", "draft"])
        expect(screen.getByText("Outline").closest("li")).toHaveAttribute("data-checked")
    })

    it("follows a controlled value", async () => {
        const user = userEvent.setup()
        function Controlled() {
            const [value, setValue] = useState<string[]>([])
            return (
                <>
                    <Checklist label="Steps" items={ITEMS} value={value} onChange={setValue} />
                    <output>{value.join(",")}</output>
                </>
            )
        }
        render(<Controlled />)
        await user.click(screen.getByText("Draft"))
        expect(screen.getByRole("status")).toHaveTextContent("draft")
    })

    it("shows its own progress and submits with a form", async () => {
        const user = userEvent.setup()
        const { container } = render(
            <form>
                <Checklist label="Subtasks" name="done" items={ITEMS} showProgress />
            </form>,
        )

        await user.click(screen.getByText("Outline"))
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "1 of 3")
        expect(
            new FormData(container.querySelector("form") as HTMLFormElement).getAll("done"),
        ).toEqual(["outline"])
    })

    it("can disable the whole list", () => {
        render(<Checklist label="Locked" items={ITEMS} disabled />)
        for (const box of screen.getAllByRole("checkbox")) expect(box).toBeDisabled()
    })
})
