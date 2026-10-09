import { afterEach, describe, expect, it, vi } from "vitest"

import { toRgb } from "./tone"

const FALLBACK: [number, number, number] = [1, 2, 3]

afterEach(() => {
    vi.restoreAllMocks()
})

function stubProbe(pixel: [number, number, number, number], accepts: (value: string) => boolean) {
    const probe = {
        _fill: "",
        get fillStyle() {
            return this._fill
        },
        set fillStyle(value: string) {
            if (accepts(value)) this._fill = value
        },
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(pixel) })),
    }
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
        probe as unknown as CanvasRenderingContext2D,
    )
    return probe
}

describe("toRgb", () => {
    it("reads hex directly, without a canvas", () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext")

        expect(toRgb("#ff3d7f", FALLBACK)).toEqual([255, 61, 127])
        expect(toRgb("#0af", FALLBACK)).toEqual([0, 170, 255])
        expect(getContext).not.toHaveBeenCalled()
    })

    it("rasterises any other CSS colour through the canvas", () => {
        const probe = stubProbe([12, 200, 99, 255], () => true)

        expect(toRgb("oklch(0.75 0.15 160)", FALLBACK)).toEqual([12, 200, 99])
        expect(probe.fillStyle).toBe("oklch(0.75 0.15 160)")
    })

    it("resolves a custom property before rasterising it", () => {
        const host = document.createElement("div")
        host.style.setProperty("--trail", "#102030")
        document.body.append(host)

        expect(toRgb("var(--trail)", FALLBACK, host)).toEqual([16, 32, 48])
        host.remove()
    })

    it("keeps the fallback for a value the canvas rejects", () => {
        const probe = stubProbe([0, 0, 0, 0], (value) => value.startsWith("rgb("))

        expect(toRgb("not-a-colour", FALLBACK)).toEqual(FALLBACK)
        expect(probe.fillStyle).toBe("rgb(1,2,3)")
    })

    it("keeps the fallback for a fully transparent colour", () => {
        stubProbe([0, 0, 0, 0], () => true)

        expect(toRgb("transparent", FALLBACK)).toEqual(FALLBACK)
    })
})
