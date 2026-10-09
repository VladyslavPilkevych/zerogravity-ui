import { describe, expect, it } from "vitest"

import {
    EYE_LIMIT,
    aimAt,
    eyeAngles,
    gazeState,
    headAngles,
    rateFor,
    stepGaze,
    type Aim,
} from "./track"

const DEG = Math.PI / 180
const out = (): Aim => ({ x: 0, y: 0 })

function run(state: ReturnType<typeof gazeState>, frames: number, headDelay = 0.6) {
    let settled = false
    for (let i = 0; i < frames; i++) settled = stepGaze(state, 0.1, headDelay, 1 / 60)
    return settled
}

describe("aimAt", () => {
    it("is zero at the centre and full at the edges", () => {
        expect(aimAt(0.5, 0.5, 1, out())).toEqual({ x: 0, y: 0 })
        expect(aimAt(1, 0, 1, out())).toEqual({ x: 1, y: -1 })
    })

    it("never passes the limit, however sensitive", () => {
        const aim = aimAt(1, 1, 3, out())
        expect(aim.x).toBe(1)
        expect(aim.y).toBe(1)
        expect(aimAt(-4, 9, 3, out())).toEqual({ x: -1, y: 1 })
    })
})

describe("angles", () => {
    it("clamps the head to maxYaw and maxPitch", () => {
        const head = headAngles({ x: 5, y: -5 }, 34, 18, out())
        expect(head.x).toBeCloseTo(34 * DEG)
        expect(head.y).toBeCloseTo(-18 * DEG)
    })

    it("caps the eyes so the pupil cannot leave the socket", () => {
        const eyes = eyeAngles({ x: 1, y: 1 }, { x: 0, y: 0 }, 90, 90, out())
        expect(eyes.x).toBe(EYE_LIMIT)
        expect(eyes.y).toBe(EYE_LIMIT)
    })

    it("lets the eyes drift back toward centre as the head catches up", () => {
        const head = headAngles({ x: 1, y: 0 }, 34, 18, out())
        const leading = eyeAngles({ x: 1, y: 0 }, { x: 0, y: 0 }, 34, 18, out())
        const caught = eyeAngles({ x: 1, y: 0 }, head, 34, 18, out())
        expect(caught.x).toBeGreaterThan(0)
        expect(caught.x).toBeLessThan(leading.x)
    })
})

describe("stepGaze", () => {
    it("moves the eyes ahead of the head", () => {
        const state = gazeState()
        state.aim.x = 1
        run(state, 6)
        expect(state.eye.x).toBeGreaterThan(state.head.x)
        expect(state.head.x).toBeGreaterThan(0)
    })

    it("settles on the target and reports it", () => {
        const state = gazeState()
        state.aim.x = 1
        state.aim.y = -0.5
        expect(run(state, 600)).toBe(true)
        expect(state.head.x).toBeCloseTo(1, 3)
        expect(state.eye.y).toBeCloseTo(-0.5, 3)
    })

    it("returns to neutral once the aim is reset, as on pointer leave", () => {
        const state = gazeState()
        state.aim.x = 1
        run(state, 120)
        state.aim.x = 0
        state.aim.y = 0
        expect(run(state, 600)).toBe(true)
        expect(Math.abs(state.head.x)).toBeLessThan(0.001)
        expect(Math.abs(state.eye.x)).toBeLessThan(0.001)
    })

    it("lands the same way at 60 and 120 Hz", () => {
        const a = gazeState()
        const b = gazeState()
        a.aim.x = b.aim.x = 1
        for (let i = 0; i < 30; i++) stepGaze(a, 0.1, 0.6, 1 / 60)
        for (let i = 0; i < 60; i++) stepGaze(b, 0.1, 0.6, 1 / 120)
        expect(a.head.x).toBeCloseTo(b.head.x, 6)
    })

    it("keeps the per-frame damping prop's old meaning at 60 Hz", () => {
        expect(1 - Math.exp(-rateFor(0.12) / 60)).toBeCloseTo(0.12, 6)
    })
})
