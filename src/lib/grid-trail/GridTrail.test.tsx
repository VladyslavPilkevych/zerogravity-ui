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

function stubRect(rect: Partial<DOMRect>) {
    const original = Element.prototype.getBoundingClientRect
    let current = rect
    let reads = 0

    Element.prototype.getBoundingClientRect = function patched(this: Element) {
        reads += 1
        const left = current.left ?? 0
        const top = current.top ?? 0
        const width = current.width ?? 0
        const height = current.height ?? 0
        return {
            x: left,
            y: top,
            left,
            top,
            width,
            height,
            right: left + width,
            bottom: top + height,
            toJSON: () => ({}),
        } as DOMRect
    }

    return {
        get reads() {
            return reads
        },
        reset() {
            reads = 0
        },
        set(next: Partial<DOMRect>) {
            current = next
        },
        restore() {
            Element.prototype.getBoundingClientRect = original
        },
    }
}

/** Captures where the engine actually paints, which is what alignment means. */
function paintedRects() {
    const context = document
        .createElement("canvas")
        .getContext("2d") as unknown as CanvasRenderingContext2D
    const calls: [number, number][] = []
    const original = context.fillRect
    context.fillRect = ((x: number, y: number) => {
        calls.push([Math.round(x), Math.round(y)])
    }) as typeof context.fillRect

    return {
        rects: () => calls,
        restore() {
            context.fillRect = original
        },
    }
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
        const node = document.createElement("canvas")
        host.appendChild(node)

        const stop = stubRect({ left: 0, top: 0, width: 800, height: 600 })
        const engine = new GridTrailEngine(node, host, { ...GRID_TRAIL_DEFAULTS })

        const move = () => {
            for (let i = 0; i < 50; i += 1) {
                host.dispatchEvent(
                    new PointerEvent("pointermove", { clientX: 10 + i, clientY: 20 }),
                )
            }
        }

        stop.reset()
        move()
        expect(stop.reads).toBeLessThanOrEqual(1)

        window.dispatchEvent(new Event("scroll"))
        stop.reset()
        move()
        expect(stop.reads).toBe(1)

        stop.restore()
        engine.destroy()
        host.remove()
    })

    describe("pointer mapping", () => {
        const CONFIG = {
            ...GRID_TRAIL_DEFAULTS,
            cellSize: 20,
            gap: 0,
            cornerRadius: 0,
            shape: "square" as const,
            neighborFalloff: 0,
            showGrid: false,
        }

        function litCells(rect: Partial<DOMRect>, points: [number, number][]) {
            const node = document.createElement("canvas")
            document.body.appendChild(node)
            const stop = stubRect(rect)
            const engine = new GridTrailEngine(node, null, CONFIG)
            const painted = paintedRects()

            for (const [x, y] of points) {
                window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y }))
            }
            frames.advance()

            const cells = painted.rects()
            painted.restore()
            stop.restore()
            engine.destroy()
            node.remove()
            return cells
        }

        it("lights the cell directly under the pointer", () => {
            const cells = litCells({ left: 300, top: 120, width: 400, height: 200 }, [[310, 130]])

            expect(cells).toContainEqual([0, 0])
        })

        it("maps the centre and the far corner of its own box", () => {
            const cells = litCells({ left: 300, top: 120, width: 400, height: 200 }, [
                [505, 225],
                [699, 319],
            ])

            expect(cells).toContainEqual([200, 100])
            expect(cells).toContainEqual([380, 180])
        })

        it("ignores a pointer outside its own box", () => {
            const cells = litCells({ left: 300, top: 120, width: 400, height: 200 }, [
                [299, 130],
                [310, 119],
                [710, 130],
                [310, 330],
            ])

            expect(cells).toHaveLength(0)
        })

        it("follows the box after the page scrolls", () => {
            const node = document.createElement("canvas")
            document.body.appendChild(node)
            const stop = stubRect({ left: 300, top: 120, width: 400, height: 200 })
            const engine = new GridTrailEngine(node, null, CONFIG)

            stop.set({ left: 300, top: 20, width: 400, height: 200 })
            window.dispatchEvent(new Event("scroll"))

            const painted = paintedRects()
            window.dispatchEvent(new PointerEvent("pointermove", { clientX: 310, clientY: 30 }))
            frames.advance()

            expect(painted.rects()).toContainEqual([0, 0])

            painted.restore()
            stop.restore()
            engine.destroy()
            node.remove()
        })
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
