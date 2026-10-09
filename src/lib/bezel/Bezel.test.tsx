import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Bezel } from "./Bezel"

describe("Bezel", () => {
    it("frames arbitrary content and keeps it readable", () => {
        render(
            <Bezel>
                <p>Content</p>
            </Bezel>,
        )

        expect(screen.getByText("Content")).toBeVisible()
    })

    it("renders the label as real text and the frame as decoration", () => {
        const { container } = render(<Bezel label="Status">Body</Bezel>)
        const root = container.firstElementChild as HTMLElement

        expect(screen.getByText("Status")).toHaveClass("zg-bezel-label")
        for (const layer of root.querySelectorAll(
            ".zg-bezel-plate, .zg-bezel-frame, .zg-bezel-ticks",
        )) {
            expect(layer).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("renders the requested element and passes attributes through", () => {
        render(
            <Bezel as="section" aria-label="Usage" id="usage">
                Body
            </Bezel>,
        )
        const region = screen.getByRole("region", { name: "Usage" })

        expect(region.tagName).toBe("SECTION")
        expect(region).toHaveAttribute("id", "usage")
    })

    it("switches its options through data attributes and tokens", () => {
        const { container } = render(
            <Bezel grid scan={false} ticks={false} tone="#9d7bff" notch={0} padding={12}>
                Body
            </Bezel>,
        )
        const root = container.firstElementChild as HTMLElement

        expect(root).toHaveAttribute("data-grid")
        expect(root).not.toHaveAttribute("data-scan")
        expect(root.querySelector(".zg-bezel-ticks")).toBeNull()
        expect(root.style.getPropertyValue("--zg-bezel-accent")).toBe("#9d7bff")
        expect(root.style.getPropertyValue("--zg-notch")).toBe("0px")
        expect(root.style.getPropertyValue("--zg-bezel-pad")).toBe("12px")
    })

    it("stops the scan and the tick motion under reduced motion", () => {
        const css = readFileSync(join(__dirname, "Bezel.css"), "utf8")

        expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/)
    })
})
