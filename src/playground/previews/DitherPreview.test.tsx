import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { findComponent } from "@/docs/registry"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { installCanvasHarness } from "../../test/frames"

import { DitherPreview } from "./DitherPreview"
import { TagPreview } from "./TagPreview"

function api(slug: string, patch: Record<string, unknown> = {}): PreviewApi {
    return {
        config: { ...findComponent(slug)!.defaults, ...patch },
        presetId: "",
        setPreset: () => {},
        set: () => {},
        apply: () => {},
        replace: () => {},
        reset: () => {},
        editCount: 0,
    }
}

describe("Dither preview", () => {
    let canvas: ReturnType<typeof installCanvasHarness>
    beforeEach(() => {
        canvas = installCanvasHarness()
    })
    afterEach(() => canvas.restore())

    it("never navigates: no links, the cards are a native radio choice", async () => {
        const { container } = render(<DitherPreview {...api("dither")} />)

        expect(container.querySelector("a[href]")).toBeNull()
        const radios = screen.getAllByRole("radio")
        expect(radios).toHaveLength(3)

        await userEvent.click(screen.getByText("Public"))
        expect(screen.getByRole("radio", { name: /Public/ })).toBeChecked()
        expect(container.querySelector("a[href]")).toBeNull()
    })

    it("passes the variant through to every card", () => {
        const { container, rerender } = render(<DitherPreview {...api("dither")} />)
        const variants = () =>
            [...container.querySelectorAll(".zg-dither")].map((node) =>
                node.getAttribute("data-variant"),
            )
        expect(variants()).toEqual(["sweep", "sweep", "sweep"])

        rerender(<DitherPreview {...api("dither", { variant: "edge" })} />)
        expect(variants()).toEqual(["edge", "edge", "edge"])
    })
})

describe("Tag preview", () => {
    it("shows both variants for every status at once", () => {
        const { container } = render(<TagPreview {...api("tag")} />)

        for (const variant of ["outline", "solid"]) {
            const row = container.querySelector(`.ipg-matrix-row[data-variant="${variant}"]`)!
            expect(row.querySelectorAll(`.zg-tag[data-variant="${variant}"]`)).toHaveLength(6)
        }
    })
})
