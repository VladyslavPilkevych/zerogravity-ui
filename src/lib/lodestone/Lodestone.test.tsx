import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { Lodestone } from "./Lodestone"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.fine = true
})

function movePointerTo(x: number, y: number) {
    const event = new Event("pointermove") as PointerEvent
    Object.defineProperty(event, "clientX", { value: x })
    Object.defineProperty(event, "clientY", { value: y })
    window.dispatchEvent(event)
}

describe("Lodestone", () => {
    it("renders a real button that stays clickable", async () => {
        const onClick = vi.fn()
        const { getByRole } = render(<Lodestone onClick={onClick}>Get started</Lodestone>)

        const button = getByRole("button", { name: "Get started" })
        expect(button.tagName).toBe("BUTTON")
        expect(button).toHaveAttribute("type", "button")

        await userEvent.click(button)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("forwards the disabled state and does not fire clicks", async () => {
        const onClick = vi.fn()
        const { getByRole } = render(
            <Lodestone disabled onClick={onClick}>
                Disabled
            </Lodestone>,
        )

        const button = getByRole("button", { name: "Disabled" })
        expect(button).toBeDisabled()

        await userEvent.click(button)
        expect(onClick).not.toHaveBeenCalled()
    })

    it("is reachable by keyboard without any pointer movement", async () => {
        const onClick = vi.fn()
        const { getByRole } = render(<Lodestone onClick={onClick}>Focus me</Lodestone>)

        await userEvent.tab()
        expect(getByRole("button", { name: "Focus me" })).toHaveFocus()

        await userEvent.keyboard("{Enter}")
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("does not displace the button when the pointer is outside the radius", () => {
        const { getByRole } = render(<Lodestone radius={40}>Far</Lodestone>)
        const button = getByRole("button", { name: "Far" })

        movePointerTo(4000, 4000)

        expect(button.style.transform).toBe("")
    })

    it("keeps each button clickable while a neighbour is attracted", async () => {
        const first = vi.fn()
        const second = vi.fn()
        const { getByRole } = render(
            <div>
                <Lodestone onClick={first}>First</Lodestone>
                <Lodestone onClick={second}>Second</Lodestone>
            </div>,
        )

        movePointerTo(10, 10)

        await userEvent.click(getByRole("button", { name: "Second" }))
        expect(second).toHaveBeenCalledTimes(1)
        expect(first).not.toHaveBeenCalled()
    })

    it("binds no pointer listener under reduced motion", () => {
        mediaState.reducedMotion = true
        const add = vi.spyOn(window, "addEventListener")

        render(<Lodestone>Static</Lodestone>)

        expect(add.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("releases its listeners on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<Lodestone>Cleanup</Lodestone>)

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })
})
