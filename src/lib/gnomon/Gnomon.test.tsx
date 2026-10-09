import { fireEvent, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
import { Gnomon } from "./Gnomon"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

function lit() {
    const view = render(
        <Gnomon>
            <div data-testid="a">A</div>
            <div data-testid="b">B</div>
        </Gnomon>,
    )
    const host = view.container.querySelector(".xp-gnomon") as HTMLElement
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 200,
    } as DOMRect)
    return { ...view, host }
}

describe("Gnomon", () => {
    it("renders its children untouched", () => {
        const { getByTestId } = lit()

        expect(getByTestId("a")).toHaveTextContent("A")
        expect(getByTestId("b")).toHaveTextContent("B")
    })

    it("lights every child from a pointer anywhere in the root, not only over a child", () => {
        const rects: Record<string, Partial<DOMRect>> = {
            host: { left: 0, top: 0, width: 400, height: 200 },
            a: { left: 40, top: 50, width: 100, height: 100 },
            b: { left: 260, top: 50, width: 100, height: 100 },
        }
        const spy = vi
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockImplementation(function (this: HTMLElement) {
                const key = this.dataset.testid ?? "host"
                return { right: 0, bottom: 0, x: 0, y: 0, ...rects[key] } as DOMRect
            })

        const { getByTestId, container } = render(
            <Gnomon>
                <div data-testid="a">A</div>
                <div data-testid="b">B</div>
            </Gnomon>,
        )
        const host = container.querySelector(".xp-gnomon") as HTMLElement
        const a = getByTestId("a")
        const b = getByTestId("b")
        const dx = (node: HTMLElement) => Number(node.style.getPropertyValue("--gn-dx"))
        const dy = (node: HTMLElement) => Number(node.style.getPropertyValue("--gn-dy"))

        // the gap between the two cards, on the root itself
        fireEvent.pointerMove(host, { clientX: 200, clientY: 100 })
        frames.advance(60)
        expect(dx(a)).toBeLessThan(-0.5)
        expect(dx(b)).toBeGreaterThan(0.5)

        // the empty strip under both cards: now both shadows fall upward
        fireEvent.pointerMove(host, { clientX: 200, clientY: 198 })
        frames.advance(60)
        expect(dy(a)).toBeLessThan(0)
        expect(dy(b)).toBeLessThan(0)
        expect(parseFloat(host.style.getPropertyValue("--gn-ly"))).toBeGreaterThan(95)

        spy.mockRestore()
    })

    it("listens on the root alone and lets go of it on unmount", () => {
        const add = vi.spyOn(HTMLElement.prototype, "addEventListener")
        const remove = vi.spyOn(HTMLElement.prototype, "removeEventListener")
        const { unmount, getByTestId, host } = lit()

        // React binds its own delegated listeners on the container above
        const listened = add.mock.contexts.filter(
            (node, i) =>
                host.contains(node as Node) && String(add.mock.calls[i][0]).startsWith("pointer"),
        )
        expect(listened).toEqual([host, host, host])
        expect(add.mock.contexts).not.toContain(getByTestId("a"))

        unmount()
        const released = remove.mock.calls.filter(
            ([type], i) => remove.mock.contexts[i] === host && String(type).startsWith("pointer"),
        )
        expect(released.map(([type]) => type).sort()).toEqual([
            "pointerdown",
            "pointerleave",
            "pointermove",
        ])

        add.mockRestore()
        remove.mockRestore()
    })

    it("clamps the shadow it writes into CSS", () => {
        const { container } = render(
            <Gnomon distance={9999} softness={-4} depth={12}>
                <div>A</div>
            </Gnomon>,
        )
        const host = container.querySelector(".xp-gnomon") as HTMLElement

        expect(host.style.getPropertyValue("--gn-reach")).toBe("200px")
        expect(host.style.getPropertyValue("--gn-blur")).toBe("0px")
        expect(host.style.getPropertyValue("--gn-depth")).toBe("1")
    })

    it("marks itself still under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(
            <Gnomon>
                <div>A</div>
            </Gnomon>,
        )

        expect((container.querySelector(".xp-gnomon") as HTMLElement).dataset.still).toBe("true")
    })

    it("holds no frame at rest, and gives a running one back on unmount", () => {
        const { unmount, host } = lit()
        expect(frames.pending()).toBe(0)

        fireEvent.pointerMove(host, { clientX: 200, clientY: 100 })
        expect(frames.pending()).toBe(1)
        frames.advance(240)
        expect(frames.pending()).toBe(0)

        fireEvent.pointerMove(host, { clientX: 20, clientY: 20 })
        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("renders on the server with the light at rest", () => {
        const html = renderToString(
            <Gnomon>
                <div>A</div>
            </Gnomon>,
        )

        expect(html).toContain("xp-gnomon")
        expect(html).toContain("--gn-reach:28px")
        expect(html).toContain(">A</div>")
    })

    it("lets a mouse take the light back to rest when it leaves", () => {
        const { host } = lit()
        const lx = () => parseFloat(host.style.getPropertyValue("--gn-lx"))

        fireEvent.pointerMove(host, { clientX: 380, clientY: 100 })
        frames.advance(240)
        expect(lx()).toBeGreaterThan(90)

        fireEvent.pointerLeave(host, { pointerType: "mouse" })
        frames.advance(240)
        expect(lx()).toBeCloseTo(35, 1)
        expect(frames.pending()).toBe(0)
    })

    it("leaves the light where a finger tapped it", () => {
        const { host } = lit()
        const lx = () => parseFloat(host.style.getPropertyValue("--gn-lx"))

        fireEvent.pointerDown(host, { clientX: 380, clientY: 100, pointerType: "touch" })
        fireEvent.pointerLeave(host, { pointerType: "touch" })
        frames.advance(240)
        expect(lx()).toBeGreaterThan(90)
    })

    it("puts the light back at once when it is disabled, and then ignores the pointer", () => {
        const view = lit()
        const { host } = view
        const lx = () => parseFloat(host.style.getPropertyValue("--gn-lx"))

        fireEvent.pointerMove(host, { clientX: 380, clientY: 100 })
        frames.advance(240)
        expect(lx()).toBeGreaterThan(90)

        view.rerender(
            <Gnomon disabled>
                <div data-testid="a">A</div>
                <div data-testid="b">B</div>
            </Gnomon>,
        )
        expect(lx()).toBe(35)
        expect(frames.pending()).toBe(0)

        fireEvent.pointerMove(host, { clientX: 0, clientY: 0 })
        expect(frames.pending()).toBe(0)
        expect(lx()).toBe(35)
    })
})
