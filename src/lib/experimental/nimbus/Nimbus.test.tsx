import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { frameCount } from "../../internal"
import { mediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Nimbus } from "./Nimbus"
import { NIMBUS_COLORS, NIMBUS_PRESETS, resolveNimbus } from "./presets"
import {
    BUFFER_CAP,
    PARTICLE_LIMIT,
    bufferSize,
    createField,
    particleCount,
    sceneAt,
} from "./render"

let canvas: ReturnType<typeof installCanvasHarness>
let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    canvas = installCanvasHarness()
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
    vi.restoreAllMocks()
})

const host = (container: HTMLElement) => container.querySelector(".xp-nimbus") as HTMLElement

describe("resolveNimbus", () => {
    it("is the calm preset when nothing is given", () => {
        const config = resolveNimbus()

        expect(config.preset).toBe("calm")
        expect(config.motion).toBe(NIMBUS_PRESETS.calm.motion)
        expect(config.scenes).toHaveLength(1)
        expect(config.scenes[0].fog).toEqual(NIMBUS_COLORS)
    })

    it("lets a given prop win over its preset and keeps the rest", () => {
        const config = resolveNimbus({ preset: "cinematic", motion: 0.2 })

        expect(config.motion).toBe(0.2)
        expect(config.lighting).toBe(NIMBUS_PRESETS.cinematic.lighting)
        expect(config.scenes).toHaveLength(NIMBUS_PRESETS.cinematic.scenes.length)
    })

    it("clamps every knob and falls back on nonsense", () => {
        const config = resolveNimbus({
            motion: 5,
            parallax: -2,
            density: Number.NaN,
            speed: 100,
            grain: Number.POSITIVE_INFINITY,
        })

        expect(config.motion).toBe(1)
        expect(config.parallax).toBe(0)
        expect(config.density).toBe(NIMBUS_PRESETS.calm.density)
        expect(config.speed).toBe(3)
        expect(config.grain).toBe(NIMBUS_PRESETS.calm.grain)
        expect(resolveNimbus({ speed: 0 }).speed).toBe(0.1)
    })

    it("treats an unknown preset as calm", () => {
        expect(resolveNimbus({ preset: "loud" as never }).preset).toBe("calm")
    })

    it("takes colours as one scene, scenes over colours, and an accent everywhere", () => {
        const colours = resolveNimbus({ preset: "drift", colors: ["#111", "#222"] })
        expect(colours.scenes).toHaveLength(1)
        expect(colours.scenes[0].fog).toEqual(["#111", "#222"])
        expect(colours.scenes[0].sky).toEqual(NIMBUS_PRESETS.drift.scenes[0].sky)

        const scenes = resolveNimbus({
            colors: ["#111"],
            scenes: [{ fog: ["#a00"] }, { fog: [] }, { fog: ["#0a0"], light: "#fff" }],
            accent: "#ff0",
        })
        expect(scenes.scenes.map((scene) => scene.fog[0])).toEqual(["#a00", "#0a0"])
        expect(scenes.scenes.every((scene) => scene.light === "#ff0")).toBe(true)

        expect(resolveNimbus({ colors: [] }).scenes[0].fog).toEqual(NIMBUS_COLORS)
    })
})

describe("the field", () => {
    it("crossfades scenes in a fixed rhythm and wraps round", () => {
        const mix = { from: 0, to: 0, mix: 0 }

        expect(sceneAt(5, 3, 10, 4, mix)).toEqual({ from: 0, to: 1, mix: 0 })
        expect(sceneAt(12, 3, 10, 4, mix).mix).toBeCloseTo(0.5)
        expect(sceneAt(14 * 3 + 1, 3, 10, 4, mix)).toEqual({ from: 0, to: 1, mix: 0 })
        expect(sceneAt(100, 1, 10, 4, mix)).toEqual({ from: 0, to: 0, mix: 0 })
    })

    it("keeps the dust in one fixed pool", () => {
        const field = createField(9)

        expect(field.px).toHaveLength(PARTICLE_LIMIT)
        expect(particleCount(50)).toBe(PARTICLE_LIMIT)
        expect(particleCount(-1)).toBe(0)
        expect(createField(9).px).toEqual(field.px)
    })

    it("caps the buffer however large the element", () => {
        const size = bufferSize(8000, 3000, 4)

        expect(Math.max(size.width, size.height)).toBe(BUFFER_CAP)
        expect(bufferSize(0, 0, 4)).toEqual({ width: 1, height: 1 })
    })
})

describe("Nimbus", () => {
    it("hides every layer and keeps its content readable", () => {
        const { container, getByText } = render(
            <Nimbus preset="cinematic">
                <h2>Title</h2>
            </Nimbus>,
        )

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".xp-nimbus-scrim")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".xp-nimbus-grain")).toHaveAttribute("aria-hidden", "true")
        expect(getByText("Title")).toBeInTheDocument()
        expect(host(container).dataset.preset).toBe("cinematic")
    })

    it("draws no scrim or grain at their calm defaults", () => {
        const { container } = render(<Nimbus />)

        expect(container.querySelector(".xp-nimbus-scrim")).toBeNull()
        expect(container.querySelector(".xp-nimbus-grain")).toBeNull()
    })

    it("holds still under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Nimbus preset="cinematic" />)

        expect(host(container).dataset.still).toBe("true")
        expect(host(container).dataset.interactive).toBeUndefined()
        expect(frames.pending()).toBe(0)
    })

    it("holds a fixed moment when given a time", () => {
        const { container } = render(<Nimbus preset="drift" time={12} />)

        expect(host(container).dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })

    it("paints at its own modest rate, not every frame", () => {
        const context = document
            .createElement("canvas")
            .getContext("2d") as CanvasRenderingContext2D
        render(<Nimbus />)
        const fill = vi.spyOn(context, "fillRect")

        frames.advance(30)

        // calm paints the sky and the vignette: two fills a paint, at 30 a second
        const paints = fill.mock.calls.length / 2
        expect(paints).toBeGreaterThan(8)
        expect(paints).toBeLessThan(20)
    })

    it("leaves the shared clock while offscreen and rejoins on return", () => {
        let report: (entries: Array<{ isIntersecting: boolean }>) => void = () => {}
        const original = globalThis.IntersectionObserver
        globalThis.IntersectionObserver = class {
            constructor(callback: typeof report) {
                report = callback
            }
            observe() {}
            disconnect() {}
        } as unknown as typeof IntersectionObserver

        try {
            render(<Nimbus />)
            expect(frames.pending()).toBe(1)

            act(() => report([{ isIntersecting: false }]))
            frames.advance(2)
            expect(frames.pending()).toBe(0)

            act(() => report([{ isIntersecting: true }]))
            expect(frames.pending()).toBe(1)
        } finally {
            globalThis.IntersectionObserver = original
        }
    })

    it("answers a fine pointer only", () => {
        const fine = render(<Nimbus parallax={0.5} />)
        expect(host(fine.container).dataset.interactive).toBe("true")
        fireEvent.pointerMove(host(fine.container), { clientX: 10, clientY: 10 })
        fine.unmount()

        mediaState.fine = false
        const coarse = render(<Nimbus parallax={0.5} />)
        expect(host(coarse.container).dataset.interactive).toBeUndefined()
        expect(frames.pending()).toBe(1)
    })

    it("marks the pixel preset for the stylesheet", () => {
        const { container } = render(<Nimbus preset="pixel" />)

        expect(host(container).dataset.pixel).toBe("true")
        frames.advance(10)
    })

    it("cleans up on unmount", () => {
        const resize = vi.spyOn(ResizeObserver.prototype, "disconnect")
        const visible = vi.spyOn(IntersectionObserver.prototype, "disconnect")
        const { container, unmount } = render(<Nimbus parallax={0.5} />)
        const remove = vi.spyOn(host(container), "removeEventListener")

        expect(frameCount()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
        expect(frameCount()).toBe(0)
        expect(resize).toHaveBeenCalled()
        expect(visible).toHaveBeenCalled()
        expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function))
    })

    it("degrades quietly without a 2D context", () => {
        canvas.restore()
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)

        expect(() => render(<Nimbus preset="cinematic" />)).not.toThrow()
        expect(frameCount()).toBe(0)
    })
})
