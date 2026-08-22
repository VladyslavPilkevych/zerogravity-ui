import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { COMPONENTS, REPOSITORY_URL, sidebarIndex } from "../registry"
import { CodeBlock } from "./CodeBlock"
import { Dependencies } from "./Dependencies"
import { DocsShell } from "./DocsShell"
import { PropsTable } from "./PropsTable"
import { SiteHeader } from "./SiteHeader"

const pathname = { value: "/docs/reel" }

vi.mock("next/navigation", () => ({
    usePathname: () => pathname.value,
}))

beforeEach(() => {
    pathname.value = "/docs/reel"
})

describe("SiteHeader", () => {
    it("sends the brand to the home page", () => {
        render(<SiteHeader />)

        expect(screen.getByRole("link", { name: "ZeroGravity UI" })).toHaveAttribute("href", "/")
    })

    it("links to the docs area", () => {
        render(<SiteHeader />)

        expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs")
    })

    it("marks Docs as current while inside the docs", () => {
        render(<SiteHeader />)

        expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page")
    })

    it("does not mark Docs as current on the home page", () => {
        pathname.value = "/"
        render(<SiteHeader />)

        expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("aria-current")
    })

    it("uses the real repository url and opens it safely", () => {
        render(<SiteHeader />)
        const link = screen.getByRole("link", { name: /GitHub/i })

        expect(link).toHaveAttribute("href", REPOSITORY_URL)
        expect(link).toHaveAttribute("target", "_blank")
        expect(link.getAttribute("rel")).toContain("noopener")
    })

    it("lists no individual components", () => {
        render(<SiteHeader />)

        expect(screen.queryByRole("link", { name: "Reel" })).toBeNull()
    })
})

describe("DocsShell", () => {
    const index = sidebarIndex()

    it("lists every component", () => {
        render(<DocsShell index={index}>page</DocsShell>)

        for (const entry of COMPONENTS) {
            expect(
                screen.getByRole("link", { name: new RegExp(`^${entry.name}( exp)?$`) }),
            ).toHaveAttribute("href", `/docs/${entry.slug}`)
        }
    })

    it("marks the open component as current", () => {
        render(<DocsShell index={index}>page</DocsShell>)

        expect(screen.getByRole("link", { name: /^Reel/ })).toHaveAttribute("aria-current", "page")
        expect(screen.getByRole("link", { name: /^Stencil/ })).not.toHaveAttribute("aria-current")
    })

    it("groups the list by category", () => {
        render(<DocsShell index={index}>page</DocsShell>)

        expect(screen.getByRole("heading", { name: "Typography" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Motion" })).toBeInTheDocument()
    })

    it("filters as you type", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        await user.type(screen.getByLabelText("Search components"), "carousel")

        expect(screen.getByRole("link", { name: /^Reel/ })).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /^Stencil/ })).toBeNull()
    })

    it("reports how many matched", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        expect(screen.getByText(`${COMPONENTS.length} components`)).toBeInTheDocument()

        await user.type(screen.getByLabelText("Search components"), "reel")

        expect(screen.getByText(`1 of ${COMPONENTS.length} match`)).toBeInTheDocument()
    })

    it("shows a friendly empty state", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        await user.type(screen.getByLabelText("Search components"), "nothing here")

        expect(screen.getByText("No components found")).toBeInTheDocument()
    })

    it("focuses and selects the search on the shortcut", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        const input = screen.getByLabelText("Search components") as HTMLInputElement
        Object.defineProperty(input, "offsetParent", { value: document.body, configurable: true })

        await user.type(input, "reel")
        input.blur()
        await user.keyboard("{Meta>}k{/Meta}")

        expect(document.activeElement).toBe(input)
        expect(input.selectionStart).toBe(0)
        expect(input.selectionEnd).toBe(4)
    })

    it("also answers to Ctrl+K", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        const input = screen.getByLabelText("Search components") as HTMLInputElement
        Object.defineProperty(input, "offsetParent", { value: document.body, configurable: true })

        await user.keyboard("{Control>}k{/Control}")

        expect(document.activeElement).toBe(input)
    })

    it("clears on Escape, then blurs", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)
        const input = screen.getByLabelText("Search components") as HTMLInputElement

        await user.type(input, "reel")
        await user.keyboard("{Escape}")
        expect(input).toHaveValue("")
        expect(document.activeElement).toBe(input)

        await user.keyboard("{Escape}")
        expect(document.activeElement).not.toBe(input)
    })

    it("shows the same shortcut on the server and the first client render", () => {
        render(<DocsShell index={index}>page</DocsShell>)

        expect(screen.getAllByText("Ctrl")[0]).toBeInTheDocument()
    })

    it("opens a drawer when there is no rail to focus", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        await user.keyboard("{Meta>}k{/Meta}")

        expect(screen.getByRole("dialog", { name: "Components" })).toBeInTheDocument()
    })

    it("opens the drawer from the menu button and closes on Escape", async () => {
        const user = userEvent.setup()
        render(<DocsShell index={index}>page</DocsShell>)

        await user.click(screen.getByRole("button", { name: "Components" }))
        expect(screen.getByRole("dialog", { name: "Components" })).toBeInTheDocument()

        await user.keyboard("{Escape}")
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    })

    it("renders the page content beside the sidebar", () => {
        render(<DocsShell index={index}>the page</DocsShell>)

        expect(screen.getByRole("main")).toHaveTextContent("the page")
    })
})

describe("CodeBlock", () => {
    it("shows the language and the code", () => {
        render(<CodeBlock code="<Reel radius={20} />" />)

        expect(screen.getByText("TSX")).toBeInTheDocument()
        expect(document.querySelector("pre")?.textContent).toBe("<Reel radius={20} />")
    })

    it("copies the current code and confirms it", async () => {
        const user = userEvent.setup()
        const write = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText: write },
            configurable: true,
        })

        render(<CodeBlock code="<Reel radius={20} />" />)
        await user.click(screen.getByRole("button", { name: /copy/i }))

        expect(write).toHaveBeenCalledWith("<Reel radius={20} />")
        await waitFor(() => expect(screen.getByRole("button", { name: /copied/i })).toBeVisible())
    })
})

describe("PropsTable", () => {
    it("renders a row per prop with all four columns", () => {
        render(
            <PropsTable
                name="Reel"
                rows={[
                    {
                        name: "radius",
                        type: "number",
                        default: "20",
                        description: "Corner radius.",
                    },
                ]}
            />,
        )

        expect(screen.getByRole("columnheader", { name: "Property" })).toBeInTheDocument()
        expect(screen.getByRole("rowheader", { name: "radius" })).toBeInTheDocument()
        expect(screen.getByRole("cell", { name: "number" })).toBeInTheDocument()
        expect(screen.getByRole("cell", { name: "20" })).toBeInTheDocument()
        expect(screen.getByRole("cell", { name: "Corner radius." })).toBeInTheDocument()
    })
})

describe("Dependencies", () => {
    it("says so clearly when there are none", () => {
        render(<Dependencies packages={[]} />)

        expect(screen.getByText("0")).toBeInTheDocument()
        expect(screen.getByText(/external runtime dependencies/)).toBeInTheDocument()
        expect(screen.getByText("Ships with nothing but React.")).toBeInTheDocument()
    })

    it("names each package when there are some", () => {
        render(<Dependencies packages={["gsap", "motion"]} />)

        expect(screen.getByText("2")).toBeInTheDocument()
        expect(screen.getByText("gsap")).toBeInTheDocument()
        expect(screen.getByText("motion")).toBeInTheDocument()
    })

    it("uses the singular for one package", () => {
        render(<Dependencies packages={["gsap"]} />)

        expect(screen.getByText(/external runtime dependency/)).toBeInTheDocument()
    })
})
