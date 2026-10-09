import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type * as Lib from "@/lib"
import { getAntigravityPreset } from "@/lib/antigravity/presets"
import { resolveAntigravityConfig } from "@/lib/antigravity/types"

import { findComponent } from "../registry"
import { snippetFor } from "../snippet"
import { HomeField } from "./HomeField"

const received: Record<string, unknown>[] = []

vi.mock("@/lib", async (importOriginal) => ({
    ...(await importOriginal<typeof Lib>()),
    Antigravity: (props: Record<string, unknown>) => {
        received.push(props)
        return null
    },
}))

const pixel = getAntigravityPreset("pixel")!

describe("pixel showcase", () => {
    it("drives the homepage hero with only local overrides on top", () => {
        render(<HomeField />)
        const { className, seed, ...rest } = received.at(-1)!

        expect(className).toBe("pz-field")
        expect(seed).toBe(2049)
        expect(rest).toEqual(pixel.options)
    })

    it("is what the docs page opens on", () => {
        const entry = findComponent("antigravity")!

        expect(entry.presets?.[0]?.id).toBe("pixel")
        const { formation, ...rest } = entry.presets![0]!.values as typeof pixel.options
        const { formation: heroFormation, ...heroRest } = pixel.options

        expect(rest).toEqual(heroRest)
        expect(formation).toEqual({ ...heroFormation, radius: 290 })
    })

    it("prints as props that differ from the library defaults", () => {
        const entry = findComponent("antigravity")!
        const config = resolveAntigravityConfig(pixel.options) as unknown as Record<string, unknown>

        const code = snippetFor(entry, config)

        expect(code).toMatch(/^import \{ Antigravity \} from "zerogravity(\/antigravity)?"/)
        expect(code).toContain("count={1960}")
        expect(code).toContain('shape: "square"')
        expect(code).not.toContain("dprCap")
    })
})
