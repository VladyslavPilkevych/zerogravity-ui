import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Task } from "./Task"

describe("Task", () => {
    it("names its checkbox by the title and describes it with the meta line", () => {
        render(
            <Task
                title="Write report"
                meta={
                    <>
                        <span>Due Fri</span>
                        <span>2 h</span>
                    </>
                }
            />,
        )
        const box = screen.getByRole("checkbox", { name: "Write report" })
        expect(box).toHaveAccessibleDescription(/Due Fri/)
    })

    it("completes uncontrolled and reports the change", async () => {
        const user = userEvent.setup()
        const change = vi.fn()
        const { container } = render(<Task title="Ship" onDoneChange={change} />)

        await user.click(screen.getByRole("checkbox"))
        expect(change).toHaveBeenCalledWith(true)
        expect(container.firstElementChild).toHaveAttribute("data-done")
    })

    it("expands its detail region with a disclosure button", async () => {
        const user = userEvent.setup()
        render(
            <Task title="Plan launch">
                <p>Details</p>
            </Task>,
        )
        const toggle = screen.getByRole("button", { name: /Plan launch/ })

        expect(toggle).toHaveAttribute("aria-expanded", "false")
        expect(screen.queryByText("Details")).toBeNull()
        await user.click(toggle)
        expect(toggle).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByRole("region", { name: "Plan launch" })).toHaveTextContent("Details")
        expect(toggle).toHaveAttribute("aria-controls", screen.getByRole("region").id)
    })

    it("has no disclosure without detail content", () => {
        render(<Task title="Simple" />)
        expect(screen.queryByRole("button")).toBeNull()
    })

    it("follows controlled done and expanded state", async () => {
        const user = userEvent.setup()
        const expand = vi.fn()
        render(
            <Task title="Fixed" done expanded={false} onExpandedChange={expand}>
                <p>Hidden</p>
            </Task>,
        )

        expect(screen.getByRole("checkbox")).toBeChecked()
        await user.click(screen.getByRole("button"))
        expect(expand).toHaveBeenCalledWith(true)
        expect(screen.queryByText("Hidden")).toBeNull()
    })

    it("shows progress named after the task and renders on the server", () => {
        render(<Task title="Migrate" progress={{ value: 1, max: 4 }} />)
        expect(screen.getByRole("progressbar", { name: "Progress of Migrate" })).toHaveAttribute(
            "aria-valuetext",
            "1 of 4",
        )
        expect(renderToString(<Task title="Server" as="li" />)).toContain("<li")
    })
})
