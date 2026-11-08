import { afterEach, describe, expect, it } from "vitest"

import { OFFSCREEN_ATTRIBUTE, onVisible, pauseOffscreen } from "./observe"

type Report = (entries: Array<{ isIntersecting: boolean }>) => void

function fakeObserver() {
    const original = globalThis.IntersectionObserver
    const created: { report: Report; options: IntersectionObserverInit; disconnected: boolean }[] =
        []
    globalThis.IntersectionObserver = class {
        record: (typeof created)[number]
        constructor(report: Report, options: IntersectionObserverInit) {
            this.record = { report, options, disconnected: false }
            created.push(this.record)
        }
        observe() {}
        disconnect() {
            this.record.disconnected = true
        }
    } as unknown as typeof IntersectionObserver
    return { created, restore: () => (globalThis.IntersectionObserver = original) }
}

let restore = () => {}
afterEach(() => restore())

describe("onVisible", () => {
    it("reports the latest entry and forwards observer options", () => {
        const fake = fakeObserver()
        restore = fake.restore
        const seen: boolean[] = []

        const stop = onVisible(document.body, (visible) => seen.push(visible), {
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.2,
        })
        fake.created[0].report([{ isIntersecting: false }, { isIntersecting: true }])

        expect(seen).toEqual([true])
        expect(fake.created[0].options).toMatchObject({
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.2,
        })
        stop()
        expect(fake.created[0].disconnected).toBe(true)
    })
})

describe("pauseOffscreen", () => {
    it("marks the element only while it is out of view", () => {
        const fake = fakeObserver()
        restore = fake.restore
        const element = document.createElement("div")

        const stop = pauseOffscreen(element)
        expect(element.hasAttribute(OFFSCREEN_ATTRIBUTE)).toBe(false)

        fake.created[0].report([{ isIntersecting: false }])
        expect(element.hasAttribute(OFFSCREEN_ATTRIBUTE)).toBe(true)

        fake.created[0].report([{ isIntersecting: true }])
        expect(element.hasAttribute(OFFSCREEN_ATTRIBUTE)).toBe(false)

        fake.created[0].report([{ isIntersecting: false }])
        stop()
        expect(element.hasAttribute(OFFSCREEN_ATTRIBUTE)).toBe(false)
        expect(fake.created[0].disconnected).toBe(true)
    })
})
