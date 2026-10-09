import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { Keycap } from "./Keycap"

describe("Keycap", () => {
    it("is a native button that never submits by default", () => {
        render(<Keycap>Deploy</Keycap>)
        const button = screen.getByRole("button", { name: "Deploy" })

        expect(button.tagName).toBe("BUTTON")
        expect(button).toHaveAttribute("type", "button")
    })

    it("passes native attributes and an explicit type through", () => {
        render(
            <Keycap type="submit" name="intent" value="save" aria-describedby="hint">
                Save
            </Keycap>,
        )
        const button = screen.getByRole("button", { name: "Save" })

        expect(button).toHaveAttribute("type", "submit")
        expect(button).toHaveAttribute("name", "intent")
        expect(button).toHaveAttribute("value", "save")
        expect(button).toHaveAttribute("aria-describedby", "hint")
    })

    it("calls onClick from pointer and keyboard", async () => {
        const user = userEvent.setup()
        const onClick = vi.fn()
        render(<Keycap onClick={onClick}>Run</Keycap>)

        await user.click(screen.getByRole("button", { name: "Run" }))
        await user.keyboard("{Enter}")
        await user.keyboard(" ")

        expect(onClick).toHaveBeenCalledTimes(3)
    })

    it("does not fire when disabled", async () => {
        const user = userEvent.setup()
        const onClick = vi.fn()
        render(
            <Keycap disabled onClick={onClick}>
                Run
            </Keycap>,
        )
        const button = screen.getByRole("button", { name: "Run" })

        await user.click(button)
        expect(button).toBeDisabled()
        expect(onClick).not.toHaveBeenCalled()
    })

    it("forwards its ref to the button", () => {
        const ref = createRef<HTMLButtonElement>()
        render(<Keycap ref={ref}>Go</Keycap>)

        expect(ref.current).toBe(screen.getByRole("button", { name: "Go" }))
    })

    it("hides the decorative layers and exposes variant, size and tone", () => {
        const { container } = render(
            <Keycap variant="outline" size="lg" tone="#ff5fa2">
                Go
            </Keycap>,
        )
        const button = container.querySelector("button") as HTMLButtonElement

        expect(button.dataset.variant).toBe("outline")
        expect(button.dataset.size).toBe("lg")
        expect(button.style.getPropertyValue("--zg-keycap-accent")).toBe("#ff5fa2")
        for (const layer of button.querySelectorAll(".zg-keycap-shadow, .zg-keycap-ring")) {
            expect(layer).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("drops its stepped transitions under reduced motion", () => {
        const css = readFileSync(join(__dirname, "Keycap.css"), "utf8")

        expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*transition: none/)
    })
})
