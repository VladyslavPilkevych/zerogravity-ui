import { describe, expect, it } from "vitest"

import {
    createWorld,
    settled,
    step,
    DRIP_CAP,
    RAIN_CAP,
    SPLASH_CAP,
    TRAIL_CAP,
    type Weather,
    type World,
} from "./sim"

const COLS = 120
const ROWS = 60
const CELL = 4

/** Two thick bars and a crossbar, roughly an "H", in the upper half. */
function mask(): Uint8Array {
    const cells = new Uint8Array(COLS * ROWS)
    for (let row = 10; row < 34; row += 1) {
        for (let col = 20; col < 100; col += 1) {
            const bar = col < 34 || col >= 86 || (row >= 20 && row < 26)
            if (bar) cells[row * COLS + col] = 1
        }
    }
    return cells
}

function world(seed = 3): World {
    return createWorld(COLS * CELL, ROWS * CELL, CELL, 2, COLS, ROWS, mask(), seed)
}

const storm: Weather = { rain: 1, wind: 0.4, fall: 1.5, wetness: 1, evaporation: 0 }

function alive(flags: Uint8Array): number {
    return flags.reduce((sum, flag) => sum + flag, 0)
}

describe("Drench water model", () => {
    it("never holds more drops, drips, splashes or trails than its pools", () => {
        const w = world()
        let peakDrips = 0
        for (let frame = 0; frame < 4000; frame += 1) {
            step(w, 1 / 60, storm)
            expect(w.raining).toBeLessThanOrEqual(RAIN_CAP)
            expect(w.drips).toBeLessThanOrEqual(DRIP_CAP)
            expect(w.splashes).toBeLessThanOrEqual(SPLASH_CAP)
            expect(w.trails).toBeLessThanOrEqual(TRAIL_CAP)
            peakDrips = Math.max(peakDrips, w.drips)
        }

        expect(w.rainX).toHaveLength(RAIN_CAP)
        expect(w.dripX).toHaveLength(DRIP_CAP)
        expect(alive(w.rainAlive)).toBe(w.raining)
        expect(alive(w.dripAlive)).toBe(w.drips)
        // a soaking storm does make water escape the letters
        expect(peakDrips).toBeGreaterThan(0)
        expect(w.water.every((value) => Number.isFinite(value) && value <= 2.6)).toBe(true)
    })

    it("is the same storm for the same seed, and a different one otherwise", () => {
        const a = world(7)
        const b = world(7)
        const c = world(8)
        const weather: Weather = { rain: 0.6, wind: 0.1, fall: 1, wetness: 0.6, evaporation: 0.3 }
        for (let frame = 0; frame < 600; frame += 1) {
            step(a, 1 / 60, weather)
            step(b, 1 / 60, weather)
            step(c, 1 / 60, weather)
        }

        expect(Array.from(a.water)).toEqual(Array.from(b.water))
        expect(Array.from(a.dripY)).toEqual(Array.from(b.dripY))
        expect(Array.from(a.rainX)).toEqual(Array.from(b.rainX))
        expect(Array.from(a.water)).not.toEqual(Array.from(c.water))
    })

    it("runs water down inside a stroke and gathers it on the underside", () => {
        const w = world()
        const top = 10 * COLS + 26
        w.water[top] = 8
        const still: Weather = { rain: 0, wind: 0, fall: 1, wetness: 0, evaporation: 0 }
        for (let frame = 0; frame < 300; frame += 1) step(w, 1 / 60, still)

        // a wet streak the whole height of the stroke, each cell keeping a film
        for (let row = 10; row < 34; row += 1) {
            expect(w.water[row * COLS + 26]).toBeGreaterThan(0.1)
        }
        // the underside holds the most, or has already let a drip go
        const bottom = 33 * COLS + 26
        expect(w.water[bottom] > w.water[top] || w.drips > 0 || w.trails > 0).toBe(true)
        // and nothing leaked onto the glass beside it
        expect(w.water[10 * COLS + 10]).toBe(0)
    })

    it("dries out and settles once the rain stops", () => {
        const w = world()
        for (let frame = 0; frame < 300; frame += 1) step(w, 1 / 60, storm)
        expect(w.total).toBeGreaterThan(1)
        expect(settled(w)).toBe(false)

        const clear: Weather = { ...storm, rain: 0, evaporation: 1 }
        let frames = 0
        while (!settled(w) && frames < 60 * 120) {
            step(w, 1 / 60, clear)
            frames += 1
        }
        expect(settled(w)).toBe(true)
        expect(w.raining).toBe(0)
    })
})
