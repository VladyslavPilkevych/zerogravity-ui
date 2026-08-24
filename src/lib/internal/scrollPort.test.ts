import { describe, expect, it } from "vitest"

import { scrollPort } from "./scrollPort"

function box(top: number, height = 100) {
    return {
        getBoundingClientRect: () =>
            ({ top, height, bottom: top + height, left: 0, right: 0, width: 0 }) as DOMRect,
    } as unknown as Element
}

describe("scrollPort", () => {
    it("falls back to the window when there is no container", () => {
        Object.defineProperty(window, "scrollY", { value: 240, configurable: true })

        const port = scrollPort(null)

        expect(port.scroll()).toBe(240)
        expect(port.height()).toBe(window.innerHeight)
        expect(port.target).toBe(window)
        expect(port.top(box(80))).toBe(80)
    })

    it("reads a container's own scroll offset and height", () => {
        const host = document.createElement("div")
        Object.defineProperty(host, "scrollTop", { value: 130, configurable: true })
        Object.defineProperty(host, "clientHeight", { value: 420, configurable: true })
        host.getBoundingClientRect = () => ({ top: 60 }) as DOMRect

        const port = scrollPort(host)

        expect(port.scroll()).toBe(130)
        expect(port.height()).toBe(420)
        expect(port.target).toBe(host)
    })

    it("measures a child against the container, not the viewport", () => {
        const host = document.createElement("div")
        Object.defineProperty(host, "scrollTop", { value: 0, configurable: true })
        Object.defineProperty(host, "clientHeight", { value: 400, configurable: true })
        host.getBoundingClientRect = () => ({ top: 60 }) as DOMRect

        expect(scrollPort(host).top(box(200))).toBe(140)
    })

    it("gives the same answer as the window port when the container is at the origin", () => {
        const host = document.createElement("div")
        Object.defineProperty(host, "scrollTop", { value: 0, configurable: true })
        host.getBoundingClientRect = () => ({ top: 0 }) as DOMRect

        expect(scrollPort(host).top(box(75))).toBe(scrollPort(null).top(box(75)))
    })
})
