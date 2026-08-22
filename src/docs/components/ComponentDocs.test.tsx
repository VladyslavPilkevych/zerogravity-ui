import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { findComponent } from "../registry"
import { ComponentDocs } from "./ComponentDocs"

vi.mock("../previews", () => ({ PREVIEWS: {} }))

const raster = findComponent("raster")!
const reel = findComponent("reel")!

function code() {
    return document.querySelector(".dz-code code")?.textContent ?? ""
}

describe("ComponentDocs", () => {
    it("leads with the name, the category and the description", () => {
        render(<ComponentDocs entry={raster} />)

        expect(screen.getByRole("heading", { level: 1, name: "Raster" })).toBeInTheDocument()
        expect(screen.getByText(raster.description)).toBeInTheDocument()
        expect(screen.getByText("Media")).toBeInTheDocument()
    })

    it("keeps the sections in one order for every component", () => {
        render(<ComponentDocs entry={raster} />)
        const headings = screen
            .getAllByRole("heading", { level: 2 })
            .map((node) => node.textContent)

        expect(headings).toEqual(["Customize", "Usage", "Props", "Dependencies"])
    })

    it("starts on the preview tab and can switch to code", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={raster} />)

        expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute(
            "aria-selected",
            "true",
        )

        await user.click(screen.getByRole("tab", { name: "Code" }))

        expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true")
        expect(document.querySelector(".dz-preview")).toBeNull()
    })

    it("generates a bare tag until something is changed", () => {
        render(<ComponentDocs entry={raster} />)

        expect(code()).toBe("<Raster />")
    })

    it("rewrites the snippet when a control changes", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={raster} />)

        await user.selectOptions(screen.getByRole("combobox", { name: /Mode/ }), "glyph")

        expect(code()).toContain('mode="glyph"')
    })

    it("keeps defaults out of the snippet as controls move back", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={raster} />)

        await user.click(screen.getByRole("checkbox", { name: "Animated" }))
        expect(code()).toContain("animated={false}")

        await user.click(screen.getByRole("checkbox", { name: "Animated" }))
        expect(code()).toBe("<Raster />")
    })

    it("puts the changed value on the control too", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={raster} />)

        await user.selectOptions(screen.getByRole("combobox", { name: /Glyph set/ }), "dots")

        expect(screen.getByRole("combobox", { name: /Glyph set/ })).toHaveValue("dots")
        expect(code()).toContain('glyphSet="dots"')
    })

    it("resets back to the defaults", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={raster} />)

        await user.click(screen.getByRole("checkbox", { name: "Animated" }))
        expect(screen.getByRole("button", { name: "Reset 1" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Reset 1" }))

        expect(code()).toBe("<Raster />")
        expect(screen.getByRole("checkbox", { name: "Animated" })).toBeChecked()
    })

    it("applies a preset and keeps manual edits on top of it", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={reel} />)

        await user.click(screen.getByRole("button", { name: "Coverflow" }))
        expect(code()).toContain("rotate={42}")

        await user.click(screen.getByRole("button", { name: "Tight" }))
        expect(code()).not.toContain("rotate={42}")
    })

    it("keeps a manual edit across a preset change", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={reel} />)

        const radius = screen.getByRole("spinbutton", { name: /Corner radius/ })
        fireEvent.change(radius, { target: { value: "44" } })
        expect(code()).toContain("radius={44}")

        await user.click(screen.getByRole("button", { name: "Coverflow" }))

        expect(code()).toContain("radius={44}")
    })

    it("never generates a demo-only prop", () => {
        render(<ComponentDocs entry={reel} />)

        const items = screen.getByRole("spinbutton", { name: /Items/ })
        fireEvent.change(items, { target: { value: "4" } })

        expect(items).toHaveValue(4)
        expect(code()).not.toContain("items")
    })

    it("shows both the preview snippet and the usage snippet from one state", async () => {
        const user = userEvent.setup()
        render(<ComponentDocs entry={raster} />)

        await user.selectOptions(screen.getByRole("combobox", { name: /Mode/ }), "blur")
        await user.click(screen.getByRole("tab", { name: "Code" }))

        const blocks = document.querySelectorAll(".dz-code code")
        expect(blocks).toHaveLength(2)
        expect(blocks[0].textContent).toBe(blocks[1].textContent)
    })

    it("renders the props table from the same schema", () => {
        render(<ComponentDocs entry={raster} />)
        const table = screen.getByRole("table")

        const row = within(table).getByRole("rowheader", { name: "pixelSize" }).closest("tr")!
        expect(within(row).getByRole("cell", { name: "number" })).toBeInTheDocument()
        expect(within(row).getByRole("cell", { name: "18" })).toBeInTheDocument()
        expect(within(table).queryByRole("rowheader", { name: "paletteName" })).toBeNull()
    })

    it("shows the dependency count", () => {
        render(<ComponentDocs entry={raster} />)

        expect(screen.getByText("Ships with nothing but React.")).toBeInTheDocument()
    })

    it("flags an experimental component", () => {
        render(<ComponentDocs entry={raster} />)

        expect(screen.getByText(/not part of the published package/)).toBeInTheDocument()
    })

    it("says nothing about experiments on a stable component", () => {
        render(<ComponentDocs entry={reel} />)

        expect(screen.queryByText(/not part of the published package/)).toBeNull()
    })
})
