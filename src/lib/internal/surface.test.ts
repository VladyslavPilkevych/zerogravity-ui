import { afterEach, describe, expect, it, vi } from "vitest"

import { context2d, fitCanvas } from "./surface"

afterEach(() => {
    vi.restoreAllMocks()
})

function pair(width: number, height: number) {
    const host = document.createElement("div")
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width,
        height,
    } as DOMRect)
    return { host, canvas: document.createElement("canvas") }
}

describe("fitCanvas", () => {
    it("sizes the backing store by the ratio and the box by CSS pixels", () => {
        vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(2)
        const { host, canvas } = pair(300, 150)

        const size = fitCanvas(canvas, host)

        expect(size).toEqual({ width: 600, height: 300, dpr: 2 })
        expect(canvas.style.width).toBe("300px")
        expect(canvas.style.height).toBe("150px")
    })

    it("caps the ratio, because past 2x the pixels cost more than they show", () => {
        vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(4)
        const { host, canvas } = pair(100, 100)

        expect(fitCanvas(canvas, host).dpr).toBe(2)
        expect(canvas.width).toBe(200)
    })

    it("never sizes to zero", () => {
        const { host, canvas } = pair(0, 0)
        const size = fitCanvas(canvas, host)

        expect(size.width).toBeGreaterThan(0)
        expect(size.height).toBeGreaterThan(0)
    })

    it("leaves the backing store alone when the size has not changed", () => {
        vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(1)
        const { host, canvas } = pair(120, 80)

        fitCanvas(canvas, host)
        const context = { marker: true }
        Object.defineProperty(canvas, "marker", { value: context, writable: true })
        fitCanvas(canvas, host)

        // a canvas clears itself whenever width is assigned, so a no-op resize
        // must not touch it
        expect(canvas.width).toBe(120)
    })
})

describe("context2d", () => {
    it("answers null instead of throwing where 2D is unavailable", () => {
        const canvas = document.createElement("canvas")
        vi.spyOn(canvas, "getContext").mockImplementation(() => {
            throw new Error("no context")
        })

        expect(context2d(canvas)).toBeNull()
    })
})
