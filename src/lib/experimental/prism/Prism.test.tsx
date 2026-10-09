import { fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest"

import { mediaState, resetMediaState } from "../../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../../test/frames"
import { Prism } from "./Prism"
import { cellSize, paintSpectrum, SPECTRUM, type SpectrumScene } from "./spectrum"

let frames: ReturnType<typeof installFrameHarness>
let canvas: ReturnType<typeof installCanvasHarness>

beforeEach(() => {
    frames = installFrameHarness()
    canvas = installCanvasHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
    resetMediaState()
    vi.restoreAllMocks()
})

function hostOf(container: HTMLElement) {
    return container.querySelector(".xp-prism") as HTMLElement
}

function measure(host: HTMLElement) {
    return vi
        .spyOn(host, "getBoundingClientRect")
        .mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect)
}

describe("Prism", () => {
    it("keeps its content interactive under the glass", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        const { getByRole } = render(
            <Prism>
                <button type="button" onClick={onClick}>
                    Press
                </button>
            </Prism>,
        )

        await user.click(getByRole("button", { name: "Press" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("draws pixel facets on one hidden canvas by default", () => {
        const { container } = render(<Prism>card</Prism>)
        const layers = container.querySelectorAll(".xp-prism-cells, .xp-prism-rim")

        expect(hostOf(container).dataset.facets).toBe("pixel")
        expect(container.querySelector(".xp-prism-split")).toBeNull()
        expect(layers).toHaveLength(2)
        for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true")
    })

    it("keeps the gradient layers for smooth facets", () => {
        const { container } = render(<Prism facets="smooth">card</Prism>)
        const layers = container.querySelectorAll(".xp-prism-split, .xp-prism-sheen, .xp-prism-rim")

        expect(container.querySelector("canvas")).toBeNull()
        expect(layers).toHaveLength(3)
        for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true")
    })

    it("clamps the values it writes into CSS", () => {
        const { container } = render(
            <Prism radius={9999} dispersion={5} sheen={-3}>
                card
            </Prism>,
        )
        const host = hostOf(container)

        expect(host.style.getPropertyValue("--pr-radius")).toBe("96px")
        expect(host.style.getPropertyValue("--pr-split")).toBe("1")
        expect(host.style.getPropertyValue("--pr-sheen")).toBe("0")
    })

    it("answers the pointer against its own box", () => {
        const { container } = render(<Prism>card</Prism>)
        const host = hostOf(container)
        measure(host)

        fireEvent.pointerMove(host, { clientX: 150, clientY: 25 })
        frames.advance(20)

        expect(Number(host.style.getPropertyValue("--pr-ry"))).toBeGreaterThan(0)
        expect(Number(host.style.getPropertyValue("--pr-rx"))).toBeGreaterThan(0)
    })

    it("measures once per move burst, not once per move", () => {
        const { container } = render(<Prism>card</Prism>)
        const host = hostOf(container)
        const box = measure(host)
        box.mockClear()

        for (let step = 0; step < 10; step += 1) {
            fireEvent.pointerMove(host, { clientX: 20 + step * 10, clientY: 40 })
        }

        expect(box).toHaveBeenCalledTimes(1)
    })

    it("measures again after the element is resized", () => {
        let resized: () => void = () => {}
        const original = globalThis.ResizeObserver
        globalThis.ResizeObserver = class {
            constructor(run: ResizeObserverCallback) {
                resized = () => run([], this)
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        onTestFinished(() => {
            globalThis.ResizeObserver = original
        })
        const { container } = render(<Prism>card</Prism>)
        const host = hostOf(container)
        const box = measure(host)

        fireEvent.pointerMove(host, { clientX: 20, clientY: 40 })
        box.mockClear()
        resized()
        fireEvent.pointerMove(host, { clientX: 30, clientY: 40 })

        expect(box.mock.calls.length).toBeGreaterThan(0)
    })

    it("goes idle once the light has settled", () => {
        const { container } = render(<Prism>card</Prism>)
        const host = hostOf(container)
        measure(host)

        expect(frames.pending()).toBe(0)
        fireEvent.pointerMove(host, { clientX: 180, clientY: 90 })
        expect(frames.pending()).toBe(1)

        frames.advance(240)
        expect(frames.pending()).toBe(0)
        expect(host.style.getPropertyValue("--pr-x")).toBe("0.9000")
    })

    it("gives its frame back on unmount mid-motion", () => {
        const { container, unmount } = render(<Prism>card</Prism>)
        const host = hostOf(container)
        measure(host)

        fireEvent.pointerMove(host, { clientX: 180, clientY: 90 })
        frames.advance(2)
        expect(frames.pending()).toBe(1)

        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("holds the slab flat under reduced motion and still draws the light", () => {
        mediaState.reducedMotion = true
        const paint = vi.spyOn(HTMLCanvasElement.prototype, "getContext")
        const { container } = render(<Prism>card</Prism>)
        const host = hostOf(container)

        fireEvent.pointerMove(host, { clientX: 10, clientY: 10 })
        frames.advance(10)

        expect(host.dataset.still).toBe("true")
        expect(host.style.getPropertyValue("--pr-rx")).toBe("0.000")
        expect(host.style.getPropertyValue("--pr-x")).toBe("0.5000")
        expect(paint).toHaveBeenCalled()
        expect(frames.pending()).toBe(0)
    })

    it("ignores a coarse pointer", () => {
        mediaState.fine = false
        const { container } = render(<Prism>card</Prism>)
        const host = hostOf(container)
        measure(host)

        fireEvent.pointerMove(host, { clientX: 190, clientY: 10 })
        frames.advance(10)

        expect(host.dataset.touch).toBe("true")
        expect(host.style.getPropertyValue("--pr-x")).toBe("0.5000")
        expect(frames.pending()).toBe(0)
    })

    it("pins the light where it is told, from the first frame", () => {
        const { container } = render(<Prism pointer={{ x: 0.8, y: 0.2 }}>card</Prism>)
        const host = hostOf(container)
        measure(host)

        expect(host.style.getPropertyValue("--pr-x")).toBe("0.8000")
        expect(host.style.getPropertyValue("--pr-y")).toBe("0.2000")
        expect(Number(host.style.getPropertyValue("--pr-ry"))).toBeGreaterThan(0)

        fireEvent.pointerMove(host, { clientX: 10, clientY: 90 })
        expect(frames.pending()).toBe(0)
    })

    it("renders on the server without touching the window", () => {
        const html = renderToString(<Prism>card</Prism>)

        expect(html).toContain("xp-prism-cells")
        expect(html).toContain("card")
    })
})

describe("paintSpectrum", () => {
    function record() {
        const colors: string[] = []
        const target = {
            globalAlpha: 1,
            fillStyle: "" as CanvasRenderingContext2D["fillStyle"],
            setTransform: () => {},
            clearRect: () => {},
            fillRect: (x: number, y: number, width: number, height: number) => {
                colors.push(String(target.fillStyle))
                expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true)
                expect(width).toBe(height)
            },
        }
        return { target, colors }
    }

    const scene: SpectrumScene = {
        x: 0.3,
        y: 0.4,
        leanX: -0.4,
        leanY: -0.2,
        dispersion: 0.8,
        sheen: 0.7,
        cell: 8,
    }

    it("splits the light into whole square cells of the spectrum", () => {
        const { target, colors } = record()
        paintSpectrum(target, 400, 200, 1, scene)

        const spectral = new Set(colors.filter((color) => SPECTRUM.includes(color)))
        expect(spectral.size).toBe(SPECTRUM.length)
        expect(target.globalAlpha).toBe(1)
    })

    it("keeps the beam white when there is no dispersion", () => {
        const { target, colors } = record()
        paintSpectrum(target, 400, 200, 1, { ...scene, dispersion: 0 })

        expect(colors.some((color) => SPECTRUM.includes(color))).toBe(false)
        expect(colors).toContain("#ffffff")
    })

    it("is the same picture every time for the same scene", () => {
        const first = record()
        const second = record()
        paintSpectrum(first.target, 320, 160, 2, scene)
        paintSpectrum(second.target, 320, 160, 2, scene)

        expect(second.colors).toEqual(first.colors)
    })

    it("grows the cells instead of the cost on a huge surface", () => {
        expect(cellSize(400, 200, 8, 1)).toBe(8)
        const size = cellSize(8000, 6000, 4, 2)
        expect((8000 / size) * (6000 / size)).toBeLessThanOrEqual(9000)
    })
})
