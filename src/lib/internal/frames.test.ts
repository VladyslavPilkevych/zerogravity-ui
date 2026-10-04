import { afterEach, describe, expect, it, vi } from "vitest"

import { frameCount, onFrame } from "./frames"

afterEach(() => {
    vi.restoreAllMocks()
})

describe("onFrame", () => {
    it("drives every subscriber from a single loop", () => {
        const request = vi.spyOn(globalThis, "requestAnimationFrame")

        const stopA = onFrame(() => {})
        const stopB = onFrame(() => {})
        const stopC = onFrame(() => {})

        expect(frameCount()).toBe(3)
        // one loop for three subscribers, not three loops
        expect(request).toHaveBeenCalledTimes(1)

        stopA()
        stopB()
        stopC()
    })

    it("stops the loop once the last subscriber leaves", () => {
        const cancel = vi.spyOn(globalThis, "cancelAnimationFrame")

        const stopA = onFrame(() => {})
        const stopB = onFrame(() => {})

        stopA()
        expect(cancel).not.toHaveBeenCalled()
        stopB()
        expect(cancel).toHaveBeenCalled()
        expect(frameCount()).toBe(0)
    })

    it("hands every tick a bounded delta", () => {
        const queue: FrameRequestCallback[] = []
        vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
            queue.push(callback)
            return 1
        })
        vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {})

        const seen: number[] = []
        const stop = onFrame((dt) => seen.push(dt))

        queue.at(-1)?.(0)
        queue.at(-1)?.(1_000_000)

        expect(seen).toHaveLength(2)
        for (const dt of seen) expect(dt).toBeLessThanOrEqual(0.05)
        stop()
    })

    it("lets a tick unsubscribe itself without skipping its neighbours", () => {
        const queue: FrameRequestCallback[] = []
        vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
            queue.push(callback)
            return 1
        })
        vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {})

        let second = 0
        const stopFirst = onFrame(() => stopFirst())
        const stopSecond = onFrame(() => {
            second += 1
        })

        queue.at(-1)?.(16)
        expect(second).toBe(1)
        stopSecond()
    })

    it("survives an environment with no rAF at all", () => {
        const original = globalThis.requestAnimationFrame
        // @ts-expect-error deliberately removing the API
        globalThis.requestAnimationFrame = undefined

        const stop = onFrame(() => {})
        expect(() => stop()).not.toThrow()

        globalThis.requestAnimationFrame = original
    })
})
