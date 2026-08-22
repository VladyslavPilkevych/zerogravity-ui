import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { findComponent } from "@/docs/registry"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { LodestonePreview } from "./LodestonePreview"
import { RasterPreview } from "./RasterPreview"
import { SplitFlapPreview } from "./SplitFlapPreview"

function api(defaults: Record<string, unknown>, patch: Record<string, unknown> = {}) {
    const config = { ...defaults, ...patch }
    const calls: Record<string, unknown>[] = []

    const state: PreviewApi = {
        config,
        presetId: "",
        setPreset: () => {},
        set: (path, value) => calls.push({ [path]: value }),
        apply: (values) => calls.push(values),
        replace: (values) => calls.push(values),
        reset: () => {},
        editCount: 0,
    }

    return { state, calls }
}

describe("Lodestone preview", () => {
    it("labels the magnets plainly instead of faking navigation", () => {
        const { state } = api(findComponent("lodestone")!.defaults)
        render(<LodestonePreview {...state} />)

        expect(screen.getByText("Button 1")).toBeInTheDocument()
        expect(screen.getByText("Button 2")).toBeInTheDocument()
        expect(screen.getByText("Button 3")).toBeInTheDocument()
        expect(screen.queryByText(/Read the docs|Book a demo|Pricing/)).toBeNull()
    })
})

describe("Raster preview", () => {
    const defaults = findComponent("raster")!.defaults

    it("offers the source image beside every mode", () => {
        const { state } = api(defaults)
        render(<RasterPreview {...state} />)
        const group = screen.getByRole("group", { name: "Rendering mode" })

        expect(within(group).getAllByRole("button")).toHaveLength(5)
        for (const label of ["Original", "Blur", "Glass", "Glyph", "Pixel"]) {
            expect(within(group).getByRole("button", { name: new RegExp(label) })).toBeVisible()
        }
    })

    it("marks the mode coming from the shared config", () => {
        const { state } = api(defaults, { mode: "glyph" })
        render(<RasterPreview {...state} />)

        expect(screen.getByRole("button", { name: /Glyph/ })).toHaveAttribute(
            "aria-pressed",
            "true",
        )
        expect(screen.getByRole("button", { name: /Pixel/ })).toHaveAttribute(
            "aria-pressed",
            "false",
        )
    })

    it("marks Original whenever the effect is switched off", () => {
        const { state } = api(defaults, { disabled: true })
        render(<RasterPreview {...state} />)

        expect(screen.getByRole("button", { name: /Original/ })).toHaveAttribute(
            "aria-pressed",
            "true",
        )
    })

    it("writes a thumbnail choice back into the shared config", async () => {
        const user = userEvent.setup()
        const { state, calls } = api(defaults)
        render(<RasterPreview {...state} />)

        await user.click(screen.getByRole("button", { name: /Glass/ }))

        expect(calls).toEqual([{ mode: "glass", disabled: false }])
    })

    it("keeps the chosen mode when Original is picked", async () => {
        const user = userEvent.setup()
        const { state, calls } = api(defaults, { mode: "glyph" })
        render(<RasterPreview {...state} />)

        await user.click(screen.getByRole("button", { name: /Original/ }))

        expect(calls).toEqual([{ disabled: true }])
    })

    it("activates a thumbnail from the keyboard", async () => {
        const user = userEvent.setup()
        const { state, calls } = api(defaults)
        render(<RasterPreview {...state} />)

        screen.getByRole("button", { name: /Blur/ }).focus()
        await user.keyboard("{Enter}")

        expect(calls).toEqual([{ mode: "blur", disabled: false }])
    })
})

describe("SplitFlap preview", () => {
    const defaults = findComponent("split-flap")!.defaults

    it("flips to the next word when the board button is used", async () => {
        const user = userEvent.setup()
        const { state, calls } = api(defaults, { value: "DEPARTURES", mode: "text" })
        render(<SplitFlapPreview {...state} />)

        await user.click(screen.getByRole("button", { name: "Flip to the next word" }))

        expect(calls).toHaveLength(1)
        expect(Object.values(calls[0])[0]).not.toBe("DEPARTURES")
        expect(typeof Object.values(calls[0])[0]).toBe("string")
    })

    it("counts up when the value is numeric", async () => {
        const user = userEvent.setup()
        const { state, calls } = api(defaults, { value: "0007", mode: "text" })
        render(<SplitFlapPreview {...state} />)

        await user.click(screen.getByRole("button", { name: "Count up" }))

        expect(calls).toEqual([{ value: "0008" }])
    })

    it("wraps a counter back to zero", async () => {
        const user = userEvent.setup()
        const { state, calls } = api(defaults, { value: "9999", mode: "text" })
        render(<SplitFlapPreview {...state} />)

        await user.click(screen.getByRole("button", { name: "Count up" }))

        expect(calls).toEqual([{ value: "0000" }])
    })

    it("hides the button in the clock modes, where it would do nothing", () => {
        const { state } = api(defaults, { mode: "clock" })
        render(<SplitFlapPreview {...state} />)

        expect(screen.queryByRole("button")).toBeNull()
    })
})
