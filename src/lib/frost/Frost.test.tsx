import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Frost } from "./Frost"

function surface(container: HTMLElement) {
    return container.querySelector(".zg-frost") as HTMLElement
}

describe("Frost", () => {
    it("wraps arbitrary children and passes attributes and refs through", () => {
        const ref = createRef<HTMLElement>()
        render(
            <Frost as="section" aria-label="Summary" id="card" ref={ref}>
                <p>Inside</p>
            </Frost>,
        )

        const region = screen.getByRole("region", { name: "Summary" })
        expect(region.tagName).toBe("SECTION")
        expect(region).toHaveAttribute("id", "card")
        expect(ref.current).toBe(region)
        expect(screen.getByText("Inside")).toBeInTheDocument()
    })

    it("blurs by default with a conservative radius", () => {
        const { container } = render(<Frost>x</Frost>)

        expect(surface(container).dataset.variant).toBe("blur")
        expect(surface(container).style.getPropertyValue("--zg-frost-blur")).toBe("12px")
    })

    it("drops the backdrop in tint mode and at zero blur", () => {
        const tint = render(<Frost variant="tint">x</Frost>)
        expect(surface(tint.container).dataset.variant).toBe("tint")

        const zero = render(<Frost blur={0}>x</Frost>)
        expect(surface(zero.container).dataset.variant).toBe("tint")
    })

    it("clamps blur and tint opacity and accepts any radius", () => {
        const { container } = render(
            <Frost blur={500} tintOpacity={4} radius="2rem">
                x
            </Frost>,
        )
        const style = surface(container).style

        expect(style.getPropertyValue("--zg-frost-blur")).toBe("40px")
        expect(style.getPropertyValue("--zg-frost-amount")).toBe("100%")
        expect(style.getPropertyValue("--zg-frost-radius")).toBe("2rem")
    })

    it("only overrides the tone's tint when asked", () => {
        const plain = render(<Frost>x</Frost>)
        expect(surface(plain.container).style.getPropertyValue("--zg-frost-tint")).toBe("")

        const branded = render(<Frost tint="var(--brand)">x</Frost>)
        expect(surface(branded.container).style.getPropertyValue("--zg-frost-tint")).toBe(
            "var(--brand)",
        )
    })

    it("can drop the edge and the shadow", () => {
        const { container } = render(
            <Frost border={false} shadow={false}>
                x
            </Frost>,
        )

        expect(surface(container).dataset.border).toBeUndefined()
        expect(surface(container).dataset.shadow).toBeUndefined()
    })

    it("is a server component: no client directive, renders to a string", () => {
        const source = readFileSync(
            path.join(path.dirname(fileURLToPath(import.meta.url)), "Frost.tsx"),
            "utf8",
        )
        expect(source.startsWith('"use client"')).toBe(false)

        const html = renderToString(<Frost tone="dark">Server</Frost>)
        expect(html).toContain('data-tone="dark"')
        expect(html).toContain("Server")
    })
})
