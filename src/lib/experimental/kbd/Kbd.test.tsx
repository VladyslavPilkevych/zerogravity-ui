import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Kbd } from "./Kbd"

describe("Kbd", () => {
    it("renders a single key from children", () => {
        const { container } = render(<Kbd>/</Kbd>)
        const key = container.querySelector("kbd")

        expect(key?.textContent).toBe("/")
    })

    it("renders one element per key in a group", () => {
        const { container } = render(<Kbd keys={["Mod", "K"]} />)

        expect(container.querySelectorAll(".zg-kbd-key")).toHaveLength(2)
    })

    it("draws the command glyph on mac", () => {
        const { container } = render(<Kbd keys={["Mod", "K"]} platform="mac" />)

        expect(container.textContent).toContain("⌘")
        expect(container.textContent).not.toContain("Ctrl")
    })

    it("draws Ctrl everywhere else", () => {
        const { container } = render(<Kbd keys={["Mod", "K"]} platform="pc" />)

        expect(container.textContent).toContain("Ctrl")
        expect(container.textContent).not.toContain("⌘")
    })

    it("defaults to the pc glyphs so the server and the client agree", () => {
        const { container } = render(<Kbd keys={["Mod"]} />)

        expect(container.textContent).toContain("Ctrl")
    })

    it("speaks a name for glyphs that would not read aloud", () => {
        const { container } = render(<Kbd keys={["Mod"]} platform="mac" />)

        expect(container.querySelector(".zg-kbd-sr")?.textContent).toBe("Command")
        expect(container.querySelector("[aria-hidden='true']")?.textContent).toBe("⌘")
    })

    it("leaves a plain key as plain text", () => {
        const { container } = render(<Kbd keys={["K"]} />)

        expect(container.querySelector(".zg-kbd-sr")).toBeNull()
        expect(container.textContent).toBe("K")
    })

    it("uses the kbd element", () => {
        const { container } = render(<Kbd keys={["Mod", "K"]} />)

        expect(container.querySelectorAll("kbd")).toHaveLength(2)
    })

    it("passes className through", () => {
        const { container } = render(<Kbd keys={["K"]} className="mine" />)

        expect(container.querySelector(".zg-kbd")?.className).toContain("mine")
    })
})
