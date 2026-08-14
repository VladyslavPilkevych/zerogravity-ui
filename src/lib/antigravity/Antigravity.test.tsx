import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { installCanvasHarness, installFrameHarness, type FrameHarness } from "../../test/frames"
import { Antigravity } from "./Antigravity"
import { ANTIGRAVITY_PRESETS, getAntigravityPreset } from "./presets"
import { ANTIGRAVITY_DEFAULTS, resolveAntigravityConfig } from "./types"

describe("Antigravity", () => {
    let frames: FrameHarness
    let canvas: ReturnType<typeof installCanvasHarness>

    beforeEach(() => {
        frames = installFrameHarness()
        canvas = installCanvasHarness()
    })

    afterEach(() => {
        frames.restore()
        canvas.restore()
    })

    it("renders a canvas hidden from the accessibility tree", () => {
        const { container } = render(
            <div>
                <Antigravity />
            </div>,
        )
        const node = container.querySelector("canvas.antigravity")

        expect(node).not.toBeNull()
        expect(node?.getAttribute("aria-hidden")).toBe("true")
    })

    it("keeps the consumer className alongside its own", () => {
        const { container } = render(
            <div>
                <Antigravity className="hero-field" />
            </div>,
        )

        expect(container.querySelector("canvas")?.className).toBe("antigravity hero-field")
    })

    it("tears down its listeners on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(
            <div>
                <Antigravity />
            </div>,
        )

        unmount()

        expect(remove.mock.calls.some(([type]) => type === "pointermove")).toBe(true)
    })
})

describe("resolveAntigravityConfig", () => {
    it("returns the defaults when given nothing", () => {
        expect(resolveAntigravityConfig()).toEqual(ANTIGRAVITY_DEFAULTS)
    })

    it("merges nested sections one level deep without dropping siblings", () => {
        const config = resolveAntigravityConfig({ pulse: { size: 0.9 } })

        expect(config.pulse.size).toBe(0.9)
        expect(config.pulse.waveform).toBe(ANTIGRAVITY_DEFAULTS.pulse.waveform)
        expect(config.formation).toEqual(ANTIGRAVITY_DEFAULTS.formation)
    })

    it("does not mutate the shared defaults", () => {
        resolveAntigravityConfig({ count: 42, color: { opacity: 0.1 } })

        expect(ANTIGRAVITY_DEFAULTS.count).toBe(900)
        expect(ANTIGRAVITY_DEFAULTS.color.opacity).toBe(0.85)
    })
})

describe("presets", () => {
    it("exposes unique ids that all resolve", () => {
        const ids = ANTIGRAVITY_PRESETS.map((preset) => preset.id)

        expect(new Set(ids).size).toBe(ids.length)
        for (const id of ids) expect(getAntigravityPreset(id)).toBeDefined()
    })

    it("returns undefined for an unknown id", () => {
        expect(getAntigravityPreset("does-not-exist")).toBeUndefined()
    })

    it("produces a valid config for every preset", () => {
        for (const preset of ANTIGRAVITY_PRESETS) {
            const config = resolveAntigravityConfig(preset.options)
            expect(config.count).toBeGreaterThan(0)
            expect(config.formation.radius).toBeGreaterThan(0)
        }
    })
})
