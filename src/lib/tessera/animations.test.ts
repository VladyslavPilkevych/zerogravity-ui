import { describe, expect, it, vi } from "vitest"

import { whenAnimationsSettle } from "./animations"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe("whenAnimationsSettle", () => {
    it("falls back to the expected duration when the platform reports no animations", async () => {
        const done = vi.fn()
        const element = document.createElement("div")

        whenAnimationsSettle(element, 40, done)

        await wait(20)
        expect(done).not.toHaveBeenCalled()

        await wait(80)
        expect(done).toHaveBeenCalledTimes(1)
    })

    it("resolves as soon as the real animations finish", async () => {
        const done = vi.fn()
        const element = document.createElement("div")
        element.getAnimations = () => [{ finished: Promise.resolve() }] as unknown as Animation[]

        whenAnimationsSettle(element, 5000, done)

        await wait(60)
        expect(done).toHaveBeenCalledTimes(1)
    })

    it("still resolves when an animation is cancelled instead of finishing", async () => {
        const done = vi.fn()
        const element = document.createElement("div")
        element.getAnimations = () =>
            [{ finished: Promise.reject(new Error("aborted")) }] as unknown as Animation[]

        whenAnimationsSettle(element, 5000, done)

        await wait(60)
        expect(done).toHaveBeenCalledTimes(1)
    })

    it("recovers when animations never finish, using the stall margin", async () => {
        const done = vi.fn()
        const element = document.createElement("div")
        element.getAnimations = () =>
            [{ finished: new Promise(() => {}) }] as unknown as Animation[]

        whenAnimationsSettle(element, 10, done)

        await wait(200)
        expect(done).not.toHaveBeenCalled()

        await wait(350)
        expect(done).toHaveBeenCalledTimes(1)
    })

    it("never reports after it has been stopped", async () => {
        const done = vi.fn()
        const element = document.createElement("div")

        const stop = whenAnimationsSettle(element, 20, done)
        stop()

        await wait(120)
        expect(done).not.toHaveBeenCalled()
    })

    it("reports only once", async () => {
        const done = vi.fn()
        const element = document.createElement("div")
        element.getAnimations = () => [{ finished: Promise.resolve() }] as unknown as Animation[]

        whenAnimationsSettle(element, 20, done)

        await wait(200)
        expect(done).toHaveBeenCalledTimes(1)
    })
})
