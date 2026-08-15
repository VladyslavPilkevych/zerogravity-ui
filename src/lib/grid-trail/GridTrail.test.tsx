import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"

import { installCanvasHarness, installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../test/environment"
import { GridTrail } from "./GridTrail"
import { GridTrailEngine } from "./engine"
import { GRID_TRAIL_DEFAULTS } from "./types"

function movePointer(x: number, y: number) {
    const event = new Event("pointermove") as PointerEvent
    Object.defineProperty(event, "clientX", { value: x })
    Object.defineProperty(event, "clientY", { value: y })
    Object.defineProperty(event, "pointerType", { value: "mouse" })
    act(() => {
        window.dispatchEvent(event)
    })
}

describe("GridTrail", () => {
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
        const { container } = render(<GridTrail />)
        const node = container.querySelector("canvas")

        expect(node).not.toBeNull()
        expect(node?.getAttribute("aria-hidden")).toBe("true")
    })

    it("renders nothing and attaches no listeners when disabled", () => {
        const listen = vi.spyOn(window, "addEventListener")
        const { container } = render(<GridTrail disabled />)

        expect(container.querySelector("canvas")).toBeNull()
        expect(listen.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("renders nothing and attaches no listeners under reduced motion", () => {
        mediaState.reducedMotion = true
        const listen = vi.spyOn(window, "addEventListener")
        const { container } = render(<GridTrail />)

        expect(container.querySelector("canvas")).toBeNull()
        expect(listen.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("renders nothing on a coarse pointer unless enableOnTouch is set", () => {
        mediaState.fine = false
        const { container, rerender } = render(<GridTrail />)
        expect(container.querySelector("canvas")).toBeNull()

        rerender(<GridTrail enableOnTouch />)
        expect(container.querySelector("canvas")).not.toBeNull()
    })

    it("stays idle until the pointer moves, then stops again once cells fade", () => {
        render(<GridTrail fadeDuration={100} />)

        expect(frames.pending()).toBe(0)

        movePointer(120, 80)
        expect(frames.pending()).toBe(1)

        act(() => {
            frames.advance(4, 16)
        })
        expect(frames.pending()).toBe(1)

        act(() => {
            frames.advance(6, 32)
        })
        expect(frames.pending()).toBe(0)
    })

    it("restarts the loop after it has gone idle", () => {
        render(<GridTrail fadeDuration={50} />)

        movePointer(10, 10)
        act(() => {
            frames.advance(8, 32)
        })
        expect(frames.pending()).toBe(0)

        movePointer(200, 200)
        expect(frames.pending()).toBe(1)
    })

    it("removes its listeners on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<GridTrail />)

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })

    it("measures the host once instead of on every pointer move", () => {
        const host = document.createElement("div")
        document.body.appendChild(host)
        const canvas = document.createElement("canvas")
        host.appendChild(canvas)

        const original = Element.prototype.getBoundingClientRect
        let reads = 0
        Element.prototype.getBoundingClientRect = function patched(this: Element) {
            reads += 1
            return {
                x: 0,
                y: 0,
                left: 0,
                top: 0,
                right: 800,
                bottom: 600,
                width: 800,
                height: 600,
                toJSON: () => ({}),
            } as DOMRect
        }

        const engine = new GridTrailEngine(canvas, host, { ...GRID_TRAIL_DEFAULTS })

        const move = () => {
            for (let i = 0; i < 50; i += 1) {
                host.dispatchEvent(
                    new PointerEvent("pointermove", { clientX: 10 + i, clientY: 20 }),
                )
            }
        }

        reads = 0
        move()
        expect(reads).toBe(1)

        window.dispatchEvent(new Event("scroll"))
        reads = 0
        move()
        expect(reads).toBe(1)

        Element.prototype.getBoundingClientRect = original
        engine.destroy()
        host.remove()
    })

    it("releases every window listener it registers", () => {
        const balance = new Map<string, number>()
        const add = window.addEventListener
        const remove = window.removeEventListener
        const bump = (key: string, delta: number) =>
            balance.set(key, (balance.get(key) ?? 0) + delta)

        window.addEventListener = function patched(type: string, ...rest: unknown[]) {
            bump(type, 1)
            return add.call(window, type, ...(rest as [EventListener]))
        } as typeof window.addEventListener
        window.removeEventListener = function patched(type: string, ...rest: unknown[]) {
            bump(type, -1)
            return remove.call(window, type, ...(rest as [EventListener]))
        } as typeof window.removeEventListener

        const host = document.createElement("div")
        document.body.appendChild(host)
        render(<GridTrail container={{ current: host }} />).unmount()
        host.remove()

        window.addEventListener = add
        window.removeEventListener = remove

        expect(Array.from(balance.entries()).filter(([, count]) => count !== 0)).toEqual([])
    })
})
