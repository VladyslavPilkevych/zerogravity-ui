import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SiteFooter } from "./SiteFooter"

const pathname = vi.hoisted(() => ({ value: "/" }))

vi.mock("next/navigation", () => ({
    usePathname: () => pathname.value,
}))

vi.mock("next/link", () => ({
    default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}))

describe("SiteFooter", () => {
    it("signs off with the wordmark on the marketing page", () => {
        pathname.value = "/"
        const { container, getByText } = render(<SiteFooter />)

        expect(getByText("ZeroGravity")).toBeInTheDocument()
        expect(container.querySelector(".pz-signature svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("leaves the signature out of the docs, where it is only scrolling", () => {
        pathname.value = "/docs/reel"
        const { queryByText } = render(<SiteFooter />)

        expect(queryByText("ZeroGravity")).toBeNull()
    })

    it("always offers the three ways out", () => {
        pathname.value = "/docs"
        const { getByRole } = render(<SiteFooter />)

        expect(getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs")
        expect(getByRole("link", { name: "npm" })).toHaveAttribute(
            "href",
            "https://www.npmjs.com/package/zerogravity",
        )
        expect(getByRole("link", { name: "GitHub" })).toHaveAttribute(
            "href",
            expect.stringContaining("github.com"),
        )
    })

    it("opens the outside links safely", () => {
        pathname.value = "/docs"
        const { getByRole } = render(<SiteFooter />)

        expect(getByRole("link", { name: "GitHub" })).toHaveAttribute("rel", "noreferrer noopener")
    })
})
