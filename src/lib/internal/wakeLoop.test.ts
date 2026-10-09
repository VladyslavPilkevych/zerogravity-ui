import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { installFrameHarness } from "../../test/frames"
import { frameCount } from "./frames"
import { wakeLoop } from "./wakeLoop"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("wakeLoop", () => {
    it("subscribes once however often it is woken", () => {
        const loop = wakeLoop(() => true)

        loop.wake()
        loop.wake()
        loop.wake()
        expect(frameCount()).toBe(1)
        expect(loop.running).toBe(true)

        loop.sleep()
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("lets go of the frame as soon as the tick settles", () => {
        let left = 3
        const loop = wakeLoop(() => (left -= 1) > 0)

        loop.wake()
        frames.advance(10)

        expect(left).toBe(0)
        expect(loop.running).toBe(false)
        expect(frames.pending()).toBe(0)
    })

    it("can be woken again after settling, and slept twice safely", () => {
        let calls = 0
        const loop = wakeLoop(() => {
            calls += 1
            return false
        })

        loop.wake()
        frames.advance(3)
        loop.wake()
        frames.advance(3)
        loop.sleep()
        loop.sleep()

        expect(calls).toBe(2)
        expect(frameCount()).toBe(0)
    })
})
