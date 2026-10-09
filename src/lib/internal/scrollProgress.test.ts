import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { frameCount } from "./frames"
import { scrollPort } from "./scrollPort"
import { driveScroll, pinProgress, rangeProgress, smoothstep } from "./scrollProgress"

describe("rangeProgress", () => {
    it("is 0 before the range, 1 after it and linear inside", () => {
        expect(rangeProgress(-10, 0, 100)).toBe(0)
        expect(rangeProgress(25, 0, 100)).toBe(0.25)
        expect(rangeProgress(150, 0, 100)).toBe(1)
        expect(rangeProgress(150, 100, 100)).toBe(0.5)
    })

    it("treats a range of no length as a step rather than dividing by zero", () => {
        expect(rangeProgress(9, 10, 0)).toBe(0)
        expect(rangeProgress(10, 10, 0)).toBe(1)
        expect(rangeProgress(10, 10, -5)).toBe(1)
    })
})

describe("smoothstep", () => {
    it("starts and ends flat and passes through the middle", () => {
        expect(smoothstep(0)).toBe(0)
        expect(smoothstep(0.5)).toBe(0.5)
        expect(smoothstep(1)).toBe(1)
        expect(smoothstep(2)).toBe(1)
        expect(smoothstep(0.1)).toBeLessThan(0.1)
    })
})

describe("pinProgress", () => {
    const timeline = { lead: 0.5, travel: 2, hold: 1 }

    it("holds at 0 until the lead has been scrolled", () => {
        expect(pinProgress(-3, timeline)).toEqual({ phase: "before", progress: 0 })
        expect(pinProgress(0.4, timeline)).toEqual({ phase: "before", progress: 0 })
    })

    it("moves through the travel", () => {
        expect(pinProgress(1.5, timeline)).toEqual({ phase: "moving", progress: 0.5 })
    })

    it("pins the finished state for the hold, then releases it", () => {
        expect(pinProgress(2.5, timeline)).toEqual({ phase: "holding", progress: 1 })
        expect(pinProgress(3.5, timeline)).toEqual({ phase: "holding", progress: 1 })
        expect(pinProgress(3.6, timeline)).toEqual({ phase: "after", progress: 1 })
    })
})

describe("driveScroll", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
    })

    it("coalesces a burst of scroll events into one frame and goes idle when settled", () => {
        const host = document.createElement("div")
        let calls = 0
        const driver = driveScroll(scrollPort(host), () => {
            calls += 1
            return false
        })

        host.dispatchEvent(new Event("scroll"))
        host.dispatchEvent(new Event("scroll"))
        expect(frames.pending()).toBe(1)

        frames.advance()
        expect(calls).toBe(1)
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)

        driver.dispose()
    })

    it("keeps stepping while the step is still moving", () => {
        const host = document.createElement("div")
        let left = 3
        const driver = driveScroll(scrollPort(host), () => {
            left -= 1
            return left > 0
        })

        driver.wake()
        frames.advance(5)

        expect(left).toBe(0)
        expect(frameCount()).toBe(0)
        driver.dispose()
    })

    it("stops listening and cancels a pending frame on dispose", () => {
        const host = document.createElement("div")
        let calls = 0
        const driver = driveScroll(scrollPort(host), () => {
            calls += 1
            return true
        })

        driver.wake()
        driver.dispose()
        host.dispatchEvent(new Event("scroll"))
        frames.advance(3)

        expect(calls).toBe(0)
        expect(frameCount()).toBe(0)
    })
})
