import { describe, expect, it } from "vitest"

import {
    abductionLift,
    beginEvent,
    createLife,
    endEvent,
    settleLife,
    stepLife,
    type LifeConfig,
    type LifeState,
} from "./life"

const BASE: LifeConfig = {
    bees: 4,
    butterflies: 5,
    curious: false,
    avoid: false,
    interactionRadius: 16,
    events: false,
    pace: "rare",
    night: false,
}

/** Runs the simulation for `seconds` at a steady 60fps. */
function run(
    state: LifeState,
    seconds: number,
    config: LifeConfig,
    pointer?: Parameters<typeof stepLife>[3],
) {
    const step = 1 / 60
    for (let elapsed = 0; elapsed < seconds; elapsed += step) {
        stepLife(state, step, config, pointer)
    }
}

describe("the pool", () => {
    it("seats exactly the creatures it was asked for", () => {
        const state = createLife({ ...BASE, bees: 3, butterflies: 6 }, 7)

        expect(state.flyers.filter((flyer) => flyer.kind === "bee")).toHaveLength(3)
        expect(state.flyers.filter((flyer) => flyer.kind === "butterfly")).toHaveLength(6)
    })

    it("never grows or shrinks, however long it runs", () => {
        const state = createLife(BASE, 5)
        const size = state.flyers.length

        run(state, 240, BASE)

        expect(state.flyers).toHaveLength(size)
    })

    it("recycles a butterfly that leaves instead of dropping it", () => {
        const state = createLife({ ...BASE, bees: 0, butterflies: 4 }, 11)
        const flyer = state.flyers[0]

        flyer.mode = "leave"
        flyer.tx = -40
        flyer.ty = 40
        flyer.timer = 30
        run(state, 30, { ...BASE, bees: 0, butterflies: 4 })

        // the slot is still there; it is simply waiting to come back
        expect(state.flyers).toHaveLength(4)
        expect(["away", "enter", "wander", "leave"]).toContain(flyer.mode)
    })

    it("keeps every creature inside the scene once it has settled in", () => {
        const state = createLife(BASE, 3)
        run(state, 90, BASE)

        for (const flyer of state.flyers) {
            if (flyer.mode === "away" || flyer.mode === "leave" || flyer.mode === "enter") continue
            expect(flyer.x).toBeGreaterThan(-10)
            expect(flyer.x).toBeLessThan(110)
            expect(flyer.y).toBeGreaterThan(0)
            expect(flyer.y).toBeLessThan(100)
        }
    })

    it("gives the same scene for the same seed", () => {
        const a = createLife(BASE, 21)
        const b = createLife(BASE, 21)
        run(a, 12, BASE)
        run(b, 12, BASE)

        expect(a.flyers.map((flyer) => [flyer.x, flyer.y, flyer.variant])).toEqual(
            b.flyers.map((flyer) => [flyer.x, flyer.y, flyer.variant]),
        )
    })

    it("gives a different scene for a different seed", () => {
        const a = createLife(BASE, 4)
        const b = createLife(BASE, 5)

        expect(a.flyers.map((flyer) => flyer.x)).not.toEqual(b.flyers.map((flyer) => flyer.x))
    })
})

describe("bees", () => {
    it("works the flowers rather than the sky", () => {
        const state = createLife({ ...BASE, butterflies: 0 }, 9)
        run(state, 60, { ...BASE, butterflies: 0 })

        for (const flyer of state.flyers) {
            expect(flyer.y).toBeGreaterThan(35)
        }
    })

    it("pauses to inspect a flower between trips", () => {
        const state = createLife({ ...BASE, butterflies: 0 }, 9)
        const seen = new Set<string>()

        for (let index = 0; index < 60 * 90; index += 1) {
            stepLife(state, 1 / 60, { ...BASE, butterflies: 0 })
            state.flyers.forEach((flyer) => seen.add(flyer.mode))
        }

        expect(seen.has("inspect")).toBe(true)
        expect(seen.has("wander")).toBe(true)
    })
})

describe("settling in", () => {
    it("holds the bees back, then brings them in", () => {
        const state = createLife(BASE, 5)
        const bee = () => state.flyers.find((flyer) => flyer.kind === "bee")!

        expect(bee().alpha).toBe(1)
        run(state, 0.5, BASE)
        expect(bee().alpha).toBeLessThan(0.4)

        run(state, 6, BASE)
        expect(bee().alpha).toBeGreaterThan(0.9)
    })

    it("eases up to speed rather than darting off at the first frame", () => {
        const state = createLife(BASE, 5)
        const far = () => Math.hypot(state.flyers[0].vx, state.flyers[0].vy)

        run(state, 0.4, BASE)
        const early = far()
        run(state, 10, BASE)

        expect(early).toBeLessThan(far())
    })

    it("does not mirror a bee that is hovering over a flower", () => {
        const config = { ...BASE, butterflies: 0 }
        const state = createLife(config, 9)
        run(state, 6, config)

        // the twitch was here: a hovering bee has a `vx` that drifts either side
        // of zero, and the old renderer mirrored it on every crossing
        let raw = 0
        let eased = 0

        for (let index = 0; index < 60 * 40; index += 1) {
            const before = state.flyers.map((flyer) => ({
                raw: Math.sign(flyer.vx),
                eased: Math.sign(flyer.face),
                idle: flyer.mode === "inspect",
            }))
            stepLife(state, 1 / 60, config)
            state.flyers.forEach((flyer, slot) => {
                if (!before[slot].idle) return
                if (Math.sign(flyer.vx) !== before[slot].raw) raw += 1
                if (Math.sign(flyer.face) !== before[slot].eased) eased += 1
            })
        }

        expect(raw).toBeGreaterThan(10)
        expect(eased).toBe(0)
    })

    it("keeps the facing away from zero, so a bee never renders edge-on", () => {
        const config = { ...BASE, butterflies: 0 }
        const state = createLife(config, 9)

        for (let index = 0; index < 60 * 40; index += 1) {
            stepLife(state, 1 / 60, config)
            for (const flyer of state.flyers) {
                expect(Math.abs(flyer.face)).toBeLessThanOrEqual(1)
            }
        }
    })
})

describe("pointer reactions", () => {
    const near = { ...BASE, avoid: true }

    it("leaves creatures alone when the pointer is not reacting", () => {
        const state = createLife(BASE, 13)
        run(state, 3, BASE)
        const before = state.flyers.map((flyer) => ({ x: flyer.x, y: flyer.y }))

        const same = createLife(BASE, 13)
        run(same, 3, BASE, { x: 50, y: 50, live: true })

        expect(same.flyers.map((flyer) => ({ x: flyer.x, y: flyer.y }))).toEqual(before)
    })

    it("pushes a creature away from a pointer that comes close", () => {
        const state = createLife({ ...near, bees: 0, butterflies: 2 }, 3)
        const flyer = state.flyers[0]
        flyer.mode = "wander"
        flyer.alpha = 1
        flyer.x = 50
        flyer.y = 50
        flyer.tx = 50
        flyer.ty = 50

        const gap = () => Math.hypot(flyer.x - 50, flyer.y - 50)
        run(state, 2.5, { ...near, bees: 0, butterflies: 2 }, { x: 50, y: 50, live: true })

        expect(gap()).toBeGreaterThan(4)
    })

    it("eases away rather than teleporting", () => {
        const config = { ...near, bees: 0, butterflies: 1 }
        const state = createLife(config, 3)
        const flyer = state.flyers[0]
        flyer.mode = "wander"
        flyer.x = 50
        flyer.y = 50

        let biggest = 0
        for (let index = 0; index < 90; index += 1) {
            const from = { x: flyer.x, y: flyer.y }
            stepLife(state, 1 / 60, config, { x: 50, y: 50, live: true })
            biggest = Math.max(biggest, Math.hypot(flyer.x - from.x, flyer.y - from.y))
        }

        // a whole scene is 100 units across, so a single frame must stay small
        expect(biggest).toBeLessThan(2)
    })

    it("comes back to its own business once the pointer leaves", () => {
        const config = { ...near, bees: 0, butterflies: 2 }
        const state = createLife(config, 3)
        const flyer = state.flyers[0]
        flyer.mode = "wander"
        flyer.x = 50
        flyer.y = 50

        run(state, 1.5, config, { x: 50, y: 50, live: true })
        run(state, 8, config)

        expect(flyer.mode).not.toBe("flee")
    })
})

describe("ambient events", () => {
    const lively = { ...BASE, events: true, pace: "frequent" as const }

    it("runs nothing while events are switched off", () => {
        const state = createLife(BASE, 6)
        run(state, 200, BASE)

        expect(state.event).toBeNull()
        expect(state.ran).toBe(0)
    })

    it("runs one at a time and cleans up after each", () => {
        const state = createLife(lively, 6)
        run(state, 300, lively)

        expect(state.ran).toBeGreaterThan(1)
        // whatever is mid-flight, no flyer is left held by a finished event
        const stuck = state.flyers.filter(
            (flyer, index) => flyer.held && state.event?.subject !== index,
        )
        expect(stuck).toHaveLength(0)
    })

    it("chooses day events by day and night events at night", () => {
        const day = createLife(lively, 8)
        const night = createLife({ ...lively, night: true }, 8)
        const seenDay = new Set<string>()
        const seenNight = new Set<string>()

        for (let index = 0; index < 60 * 400; index += 1) {
            stepLife(day, 1 / 60, lively)
            stepLife(night, 1 / 60, { ...lively, night: true })
            if (day.event) seenDay.add(day.event.name)
            if (night.event) seenNight.add(night.event.name)
        }

        expect([...seenDay].every((name) => name === "beeGather" || name === "butterflyLand")).toBe(
            true,
        )
        expect([...seenNight].some((name) => name !== "beeGather")).toBe(true)
        expect(seenNight.has("beeGather")).toBe(false)
    })

    it("gives the flyer back when an event is ended early", () => {
        const state = createLife({ ...BASE, night: true }, 6)
        state.flyers.forEach((flyer) => {
            if (flyer.kind === "butterfly") flyer.mode = "wander"
        })

        expect(beginEvent(state, "ufoAbduction", BASE)).toBe(true)
        const subject = state.event?.subject ?? -1
        expect(state.flyers[subject].held).toBe(true)

        endEvent(state)

        expect(state.event).toBeNull()
        expect(state.flyers[subject].held).toBe(false)
    })
})

describe("the abduction", () => {
    const night = { ...BASE, night: true, events: true }

    it("needs a butterfly that is actually in the scene", () => {
        const empty = createLife({ ...night, butterflies: 0 }, 6)

        expect(beginEvent(empty, "ufoAbduction", night)).toBe(false)
        expect(empty.event).toBeNull()
    })

    it("lifts its captive and then hands the slot back to the pool", () => {
        const state = createLife(night, 6)
        state.flyers.forEach((flyer) => {
            if (flyer.kind === "butterfly") {
                flyer.mode = "wander"
                flyer.alpha = 1
            }
        })
        const before = state.flyers.length

        beginEvent(state, "ufoAbduction", night)
        const subject = state.event?.subject ?? -1
        expect(abductionLift(state.event!)).toBe(0)

        run(state, 6, night)
        expect(abductionLift(state.event!)).toBeGreaterThan(0)

        run(state, 8, night)

        // taken, not deleted
        expect(state.flyers).toHaveLength(before)
        expect(state.flyers[subject].held).toBe(false)
        expect(state.event?.name).not.toBe("ufoAbduction")
    })

    it("puts the same number of butterflies back in the air afterwards", () => {
        const config = { ...night, events: false }
        const state = createLife(config, 6)
        state.flyers.forEach((flyer) => {
            if (flyer.kind === "butterfly") {
                flyer.mode = "wander"
                flyer.alpha = 1
            }
        })

        beginEvent(state, "ufoAbduction", config)
        run(state, 14, config)
        run(state, 90, config)

        const butterflies = state.flyers.filter((flyer) => flyer.kind === "butterfly")
        expect(butterflies).toHaveLength(config.butterflies)
        expect(butterflies.some((flyer) => flyer.mode !== "away")).toBe(true)
    })
})

describe("a scene that never runs a frame", () => {
    it("puts every creature somewhere worth looking at", () => {
        const state = createLife(BASE, 12)
        settleLife(state)

        for (const flyer of state.flyers) {
            expect(flyer.alpha).toBe(1)
            expect(flyer.x).toBeGreaterThan(0)
            expect(flyer.x).toBeLessThan(100)
            expect(flyer.held).toBe(false)
        }
    })

    it("spreads the butterflies out instead of stacking them", () => {
        const state = createLife({ ...BASE, butterflies: 6 }, 12)
        settleLife(state)

        const spots = state.flyers.filter((flyer) => flyer.kind === "butterfly").map((f) => f.x)
        expect(Math.max(...spots) - Math.min(...spots)).toBeGreaterThan(40)
    })
})
