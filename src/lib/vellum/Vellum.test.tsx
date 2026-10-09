import { fireEvent, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../test/frames"
import { paintSheet, shadeAt, sheetCell } from "./sheet"
import { Vellum } from "./Vellum"

let frames: ReturnType<typeof installFrameHarness>
let canvas: ReturnType<typeof installCanvasHarness>

beforeEach(() => {
    frames = installFrameHarness()
    canvas = installCanvasHarness()
})

afterEach(() => {
    frames.restore()
    canvas.restore()
    vi.restoreAllMocks()
    mediaState.reducedMotion = false
    mediaState.fine = true
})

function rootOf(container: HTMLElement) {
    return container.querySelector(".xp-vellum") as HTMLElement
}

function measure(root: HTMLElement) {
    return vi
        .spyOn(root, "getBoundingClientRect")
        .mockReturnValue({ left: 0, top: 0, width: 400, height: 200 } as DOMRect)
}

describe("Vellum", () => {
    it("renders children inside the sheet", () => {
        const { container, getByText } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        expect(container.querySelector(".xp-vellum-sheet")).not.toBeNull()
        expect(getByText("surface")).toBeInTheDocument()
    })

    it("draws the highlight layers by default and hides them from assistive tech", () => {
        const { container } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        expect(container.querySelector(".xp-vellum-dent")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".xp-vellum-sheen")).toHaveAttribute("aria-hidden", "true")
    })

    it("removes the highlight entirely when it is switched off", () => {
        const { container } = render(
            <Vellum highlight={false}>
                <p>surface</p>
            </Vellum>,
        )

        expect(container.querySelector(".xp-vellum-dent")).toBeNull()
        expect(container.querySelector(".xp-vellum-sheen")).toBeNull()
    })

    it("keeps the tilt working while the highlight is off", () => {
        const { container } = render(
            <Vellum highlight={false} tilt={20}>
                <p>surface</p>
            </Vellum>,
        )
        const root = container.querySelector(".xp-vellum") as HTMLElement

        expect(root.style.getPropertyValue("--vellum-tilt")).toBe("20deg")
        expect(container.querySelector(".xp-vellum-sheet")).not.toBeNull()
    })

    it("applies a custom highlight configuration", () => {
        const { container } = render(
            <Vellum highlight={{ dent: 0.8, sheen: 0.2, sheenColor: "#ffcc00" }}>
                <p>surface</p>
            </Vellum>,
        )
        const root = container.querySelector(".xp-vellum") as HTMLElement

        expect(root.style.getPropertyValue("--vellum-dent")).toBe("0.8")
        expect(root.style.getPropertyValue("--vellum-sheen")).toBe("0.2")
        expect(root.style.getPropertyValue("--vellum-sheen-color")).toBe("#ffcc00")
    })

    it("removes its pointer listeners on unmount", () => {
        const { container, unmount } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        const root = container.querySelector(".xp-vellum") as HTMLElement
        const remove = vi.spyOn(root, "removeEventListener")

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })

    it("follows the pointer in its own box and measures once per burst", () => {
        const { container } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        const root = rootOf(container)
        const box = measure(root)
        box.mockClear()

        for (let step = 0; step < 8; step += 1) {
            fireEvent.pointerMove(root, { clientX: 300 + step, clientY: 50 })
        }
        frames.advance(120)

        expect(box).toHaveBeenCalledTimes(1)
        expect(Number(root.style.getPropertyValue("--vellum-x"))).toBeCloseTo(0.7675, 2)
        expect(root.style.getPropertyValue("--vellum-press")).toBe("1.0000")
    })

    it("goes idle once settled and gives its frame back on unmount", () => {
        const { container, unmount } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        const root = rootOf(container)
        measure(root)

        expect(frames.pending()).toBe(0)
        fireEvent.pointerMove(root, { clientX: 380, clientY: 20 })
        expect(frames.pending()).toBe(1)
        frames.advance(240)
        expect(frames.pending()).toBe(0)

        fireEvent.pointerLeave(root)
        frames.advance(2)
        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("draws the pixel surface on one hidden canvas instead of the gradient overlays", () => {
        const { container } = render(
            <Vellum surface="pixel">
                <p>surface</p>
            </Vellum>,
        )

        expect(rootOf(container).dataset.surface).toBe("pixel")
        expect(container.querySelector(".xp-vellum-cells")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector(".xp-vellum-dent")).toBeNull()
        expect(container.querySelector(".xp-vellum-sheen")).toBeNull()
    })

    it("draws nothing at all for a pixel surface whose highlight is off", () => {
        const { container } = render(
            <Vellum surface="pixel" highlight={false}>
                <p>surface</p>
            </Vellum>,
        )

        expect(container.querySelector("canvas")).toBeNull()
        expect(rootOf(container).dataset.surface).toBeUndefined()
    })

    it("presses at a pinned point from the first frame and ignores the pointer", () => {
        const { container } = render(
            <Vellum surface="pixel" pointer={{ x: 0.25, y: 0.75 }}>
                <p>surface</p>
            </Vellum>,
        )
        const root = rootOf(container)
        measure(root)

        expect(root.style.getPropertyValue("--vellum-x")).toBe("0.2500")
        expect(root.style.getPropertyValue("--vellum-y")).toBe("0.7500")
        expect(root.style.getPropertyValue("--vellum-press")).toBe("1.0000")

        fireEvent.pointerMove(root, { clientX: 10, clientY: 10 })
        expect(frames.pending()).toBe(0)
    })

    it("keeps the pixel surface painted and still under reduced motion", () => {
        mediaState.reducedMotion = true
        const paint = vi.spyOn(HTMLCanvasElement.prototype, "getContext")
        const { container } = render(
            <Vellum surface="pixel">
                <p>surface</p>
            </Vellum>,
        )
        const root = rootOf(container)
        const add = vi.spyOn(root, "addEventListener")

        fireEvent.pointerMove(root, { clientX: 10, clientY: 10 })

        expect(root.dataset.still).toBe("true")
        expect(paint).toHaveBeenCalled()
        expect(add).not.toHaveBeenCalled()
        expect(frames.pending()).toBe(0)
    })

    it("stays still on a coarse pointer unless asked", () => {
        mediaState.fine = false
        const { container } = render(
            <Vellum>
                <p>surface</p>
            </Vellum>,
        )
        const root = rootOf(container)
        measure(root)

        fireEvent.pointerMove(root, { clientX: 390, clientY: 10 })

        expect(root.dataset.still).toBe("true")
        expect(frames.pending()).toBe(0)
    })

    it("renders on the server without touching the window", () => {
        const html = renderToString(
            <Vellum surface="pixel">
                <p>surface</p>
            </Vellum>,
        )

        expect(html).toContain("xp-vellum-cells")
        expect(html).toContain("surface")
    })
})

describe("pixel sheet", () => {
    it("shades the wall facing away from the light and lights the wall facing it", () => {
        const towardLight = shadeAt(-3, -3, 10, 1)
        const awayFromLight = shadeAt(3, 3, 10, 1)

        expect(towardLight.shade).toBeLessThan(0)
        expect(awayFromLight.shade).toBeGreaterThan(0)
    })

    it("steps the light in thirds instead of a gradient", () => {
        for (let dx = -9; dx <= 9; dx += 1) {
            const { shade } = shadeAt(dx, dx * 0.5, 10, 1)
            expect(Math.round(Math.abs(shade) * 3)).toBeCloseTo(Math.abs(shade) * 3, 6)
        }
    })

    it("is flat when nothing presses it and outside the dent", () => {
        expect(shadeAt(2, 2, 10, 0)).toEqual({ shade: 0, pull: 0, depth: 0 })
        expect(shadeAt(20, 0, 10, 1)).toEqual({ shade: 0, pull: 0, depth: 0 })
        expect(shadeAt(0.1, 0.1, 10, 1).pull).toBeGreaterThan(shadeAt(6, 0, 10, 1).pull)
    })

    it("paints whole-pixel square cells and leaves the alpha as it found it", () => {
        const target = {
            globalAlpha: 1,
            fillStyle: "" as CanvasRenderingContext2D["fillStyle"],
            setTransform: () => {},
            clearRect: () => {},
            fillRect: vi.fn((x: number, y: number, width: number, height: number) => {
                expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true)
                expect(width).toBe(height)
            }),
        }

        paintSheet(target, 240, 120, 2, {
            x: 0.4,
            y: 0.5,
            press: 1,
            dent: 0.35,
            sheen: 0.5,
            cell: 12,
            shadow: "#000",
            light: "#fff",
        })

        expect(target.fillRect).toHaveBeenCalled()
        expect(target.globalAlpha).toBe(1)
        expect(sheetCell(240, 120, 12, 2)).toBe(24)
        const huge = sheetCell(9000, 9000, 4, 2)
        expect((9000 / huge) ** 2).toBeLessThanOrEqual(6000)
    })
})
