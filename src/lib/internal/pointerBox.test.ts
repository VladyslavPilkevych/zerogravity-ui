import { afterEach, describe, expect, it, vi } from "vitest"

import { pointerBox } from "./pointerBox"

afterEach(() => {
    vi.restoreAllMocks()
})

function host(rect: Partial<DOMRect>) {
    const element = document.createElement("div")
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        ...rect,
    } as DOMRect)
    return element
}

describe("pointerBox", () => {
    it("reports a point in the element's own space", () => {
        const box = pointerBox(host({ left: 40, top: 20 }))

        expect(box.at({ clientX: 140, clientY: 70 })).toEqual({ x: 0.5, y: 0.5 })
        expect(box.px({ clientX: 140, clientY: 70 })).toEqual({ x: 100, y: 50 })
        box.dispose()
    })

    it("measures once and reuses it, so a hot path reads no layout", () => {
        const element = host({})
        const measure = element.getBoundingClientRect as ReturnType<typeof vi.fn>
        const box = pointerBox(element)

        for (let move = 0; move < 50; move += 1) box.at({ clientX: move, clientY: move })

        expect(measure).toHaveBeenCalledTimes(1)
        box.dispose()
    })

    it("measures again once the page has scrolled", () => {
        const element = host({})
        const measure = element.getBoundingClientRect as ReturnType<typeof vi.fn>
        const box = pointerBox(element)

        box.at({ clientX: 1, clientY: 1 })
        window.dispatchEvent(new Event("scroll"))
        box.at({ clientX: 1, clientY: 1 })

        expect(measure).toHaveBeenCalledTimes(2)
        box.dispose()
    })

    it("answers null while the element has no size", () => {
        const box = pointerBox(host({ width: 0, height: 0 }))

        expect(box.at({ clientX: 5, clientY: 5 })).toBeNull()
        expect(box.px({ clientX: 5, clientY: 5 })).toBeNull()
        box.dispose()
    })

    it("takes its listeners back", () => {
        const off = vi.spyOn(window, "removeEventListener")
        pointerBox(host({})).dispose()

        expect(off.mock.calls.map(([name]) => name)).toEqual(
            expect.arrayContaining(["resize", "scroll"]),
        )
    })
})
