import { describe, expect, it } from "vitest"

import {
    bonusById,
    bonusesFor,
    createGame,
    fire,
    holdFire,
    launch,
    moveActor,
    nudgeActor,
    stepGame,
    type RicochetBlock,
    type RicochetGame,
    type RicochetMode,
} from "./engine"

const BOX = { width: 800, height: 500, pixelSize: 20, speed: 1 }

function game(mode: RicochetMode, extra: Partial<Parameters<typeof createGame>[0]> = {}) {
    return createGame({ text: "404", mode, ...BOX, seed: 7, ...extra })
}

function run(state: RicochetGame, seconds: number, slice = 1 / 60) {
    for (let elapsed = 0; elapsed < seconds; elapsed += slice) stepGame(state, slice)
}

function lowest(state: RicochetGame): RicochetBlock {
    return state.blocks.filter((block) => block.alive).reduce((a, b) => (b.y > a.y ? b : a))
}

/** Parks a ball on top of the first live block so the next step destroys exactly one. */
function smash(state: RicochetGame): RicochetBlock {
    const block = state.blocks.find((item) => item.alive) as RicochetBlock
    const ball = state.balls[0]
    ball.x = block.x + block.w / 2
    ball.y = block.y + block.h + ball.r - 1
    ball.vx = 0
    ball.vy = -300
    stepGame(state, 1 / 60)
    return block
}

/** Steps until something happens, so a check can land on the frame it happens. */
function runUntil(state: RicochetGame, done: () => boolean, limit = 8): boolean {
    for (let elapsed = 0; elapsed < limit; elapsed += 1 / 60) {
        stepGame(state, 1 / 60)
        if (done()) return true
    }
    return false
}

/** Slides the actor under a point and lets it settle there. */
function park(state: RicochetGame, x: number): void {
    moveActor(state, x)
    state.actor.x = state.actor.target
}

describe("the shared field", () => {
    it("builds the same blocks for both modes", () => {
        const breakout = game("breakout")
        const shooter = game("shooter")

        expect(shooter.blocks).toHaveLength(breakout.blocks.length)
        expect(shooter.live).toBe(breakout.live)
        expect(shooter.grid.cols).toBe(breakout.grid.cols)
    })

    it("only gives breakout a ball", () => {
        expect(game("breakout").balls).toHaveLength(1)
        expect(game("shooter").balls).toHaveLength(0)
    })

    it("starts every mode with no bolts and no bonuses in the air", () => {
        for (const mode of ["breakout", "shooter"] as const) {
            const state = game(mode)
            expect(state.shots.some((shot) => shot.alive)).toBe(false)
            expect(state.drops.some((drop) => drop.alive)).toBe(false)
        }
    })

    it("runs the same destruction for a ball and for a bolt", () => {
        const hit = game("breakout", { powerUps: false })
        launch(hit)
        const byBall = smash(hit)

        const shot = game("shooter")
        launch(shot)
        const target = lowest(shot)
        park(shot, target.x + target.w / 2)
        fire(shot)
        expect(runUntil(shot, () => !target.alive)).toBe(true)

        expect(byBall.alive).toBe(false)
        expect(target.alive).toBe(false)
        expect(hit.live).toBe(hit.blocks.length - 1)
        expect(shot.live).toBe(shot.blocks.length - 1)
        // both routes leave the same trace behind
        expect(hit.sparks.filter((item) => item.life > 0)).toHaveLength(4)
        expect(shot.sparks.filter((item) => item.life > 0)).toHaveLength(4)
    })

    it("detects a clear from a bolt as well as from a ball", () => {
        const state = game("shooter")
        launch(state)
        for (const block of state.blocks) {
            if (block === lowest(state)) continue
            block.alive = false
            state.live -= 1
        }

        const last = lowest(state)
        park(state, last.x + last.w / 2)
        fire(state)
        run(state, 1)

        expect(last.alive).toBe(false)
        expect(state.live).toBe(0)
        expect(state.phase).toBe("cleared")
        expect(state.clearedNow).toBe(true)
    })
})

/** Leaves one block standing, so a miss cannot be hidden by the block next to it. */
function isolate(state: RicochetGame): RicochetBlock {
    const keep = lowest(state)
    for (const block of state.blocks) {
        if (block === keep || !block.alive) continue
        block.alive = false
        state.live -= 1
    }
    return keep
}

describe("sub-stepping", () => {
    it("catches a block a fast ball would otherwise jump over", () => {
        const state = game("breakout", { speed: 10, powerUps: false })
        launch(state)
        const target = isolate(state)

        // one frame of travel is wider than the block, so only slicing can land the hit
        const ball = state.balls[0]
        ball.x = target.x + target.w / 2
        ball.y = target.y + target.h + ball.r + 5
        ball.vx = 0
        ball.vy = -340 * state.speed
        stepGame(state, 1 / 60)

        expect(target.alive).toBe(false)
    })

    it("catches a block a fast bolt would otherwise jump over", () => {
        const state = game("shooter", { shotSpeed: 4 })
        launch(state)
        const target = isolate(state)

        const shot = state.shots[0]
        shot.alive = true
        shot.x = target.x + target.w / 2
        shot.y = target.y + target.h + 2
        shot.vy = -620 * state.shotSpeed
        stepGame(state, 1 / 60)

        expect(target.alive).toBe(false)
    })

    it("takes the nearer block when one frame overlaps two", () => {
        const state = game("shooter")
        launch(state)

        const stacked = state.blocks.filter((block) => block.alive)
        const near = stacked.find((block) =>
            stacked.some(
                (other) =>
                    Math.abs(other.x - block.x) < 0.5 &&
                    Math.abs(other.y - (block.y - block.h)) < 0.5,
            ),
        ) as RicochetBlock
        const far = stacked.find(
            (block) =>
                Math.abs(block.x - near.x) < 0.5 && Math.abs(block.y - (near.y - near.h)) < 0.5,
        ) as RicochetBlock

        // the bolt straddles the seam, with its tip in the far block and its tail in the near one
        const shot = state.shots[0]
        shot.alive = true
        shot.x = near.x + near.w / 2
        shot.y = near.y - 1
        shot.vy = 0
        stepGame(state, 1 / 60)

        expect(near.alive).toBe(false)
        expect(far.alive).toBe(true)
    })
})

describe("bonus drops", () => {
    it("never drops anything at zero chance", () => {
        const state = game("breakout", { powerUpChance: 0 })
        launch(state)
        run(state, 4)

        expect(state.live).toBeLessThan(state.blocks.length)
        expect(state.drops.some((drop) => drop.alive)).toBe(false)
    })

    it("never drops anything when they are switched off", () => {
        const state = game("breakout", { powerUps: false, powerUpChance: 1 })
        launch(state)
        smash(state)

        expect(state.drops.some((drop) => drop.alive)).toBe(false)
    })

    it("leaves the ball on its normal path at the default chance", () => {
        const state = game("breakout")
        launch(state)
        run(state, 6)

        // a whole rally at 5% should stay a game of breakout, not a shower of bonuses
        expect(state.drops.filter((drop) => drop.alive).length).toBeLessThanOrEqual(2)
    })

    it("starts the drop at the block that produced it", () => {
        const state = game("breakout", { powerUpChance: 1 })
        launch(state)
        const block = smash(state)

        const drop = state.drops.find((item) => item.alive)
        expect(drop).toBeDefined()
        expect(drop?.x).toBeCloseTo(block.x + block.w / 2)
        expect(drop?.y).toBeCloseTo(block.y + block.h / 2, 0)
    })

    it("falls downward", () => {
        const state = game("breakout", { powerUpChance: 1 })
        launch(state)
        smash(state)

        const drop = state.drops.find((item) => item.alive) as NonNullable<
            (typeof state.drops)[number]
        >
        const from = drop.y
        state.balls[0].vx = 0
        state.balls[0].vy = 0
        run(state, 0.3)

        expect(drop.y).toBeGreaterThan(from)
    })

    it("is gone once it falls past the paddle", () => {
        const state = game("breakout", { powerUpChance: 1 })
        launch(state)
        smash(state)
        expect(state.drops.some((drop) => drop.alive)).toBe(true)

        // park the paddle in a corner so the bonus cannot be caught on the way down
        state.powerUpChance = 0
        state.balls[0].vx = 0
        state.balls[0].vy = 0
        park(state, 0)
        run(state, 6)

        expect(state.drops.some((drop) => drop.alive)).toBe(false)
        expect(state.balls).toHaveLength(1)
    })

    it("reuses the slot a lost drop leaves behind", () => {
        const state = game("breakout", { powerUpChance: 1 })
        launch(state)
        smash(state)
        state.balls[0].vx = 0
        state.balls[0].vy = 0
        park(state, 0)
        run(state, 6)

        state.powerUpChance = 1
        smash(state)

        expect(state.drops.filter((drop) => drop.alive)).toHaveLength(1)
    })

    it("drops the same bonuses again for the same seed", () => {
        const first = game("breakout", { powerUpChance: 0.5 })
        const second = game("breakout", { powerUpChance: 0.5 })
        launch(first)
        launch(second)
        run(first, 5)
        run(second, 5)

        expect(first.drops.some((drop) => drop.bonus !== "")).toBe(true)
        expect(
            first.drops.map((drop) => `${drop.alive}:${drop.bonus}:${Math.round(drop.y)}`),
        ).toEqual(second.drops.map((drop) => `${drop.alive}:${drop.bonus}:${Math.round(drop.y)}`))
    })

    it("keeps multi-ball out of the shooter pool", () => {
        expect(bonusesFor("breakout").map((bonus) => bonus.id)).toContain("multi-ball")
        expect(bonusesFor("shooter")).toHaveLength(0)
    })

    it("drops nothing in shooter, because nothing there fits yet", () => {
        const state = game("shooter", { powerUpChance: 1 })
        launch(state)
        const target = lowest(state)
        park(state, target.x + target.w / 2)
        fire(state)
        run(state, 1)

        expect(target.alive).toBe(false)
        expect(state.drops.some((drop) => drop.alive)).toBe(false)
    })
})

describe("catching a bonus", () => {
    it("collects it with the paddle", () => {
        const state = game("breakout", { powerUpChance: 1 })
        launch(state)
        smash(state)
        const drop = state.drops.find((item) => item.alive) as NonNullable<
            (typeof state.drops)[number]
        >

        state.powerUpChance = 0
        state.balls[0].vx = 0
        state.balls[0].vy = 0
        park(state, drop.x)

        expect(runUntil(state, () => !drop.alive)).toBe(true)
        expect(state.balls).toHaveLength(4)
    })

    it("adds exactly three balls and keeps the original", () => {
        const state = game("breakout")
        launch(state)
        const first = state.balls[0]

        bonusById("multi-ball")?.apply(state)

        expect(state.balls).toHaveLength(4)
        expect(state.balls[0]).toBe(first)
    })

    it("sends the new balls off on their own headings", () => {
        const state = game("breakout")
        launch(state)
        bonusById("multi-ball")?.apply(state)

        const headings = state.balls.map((ball) => Math.atan2(ball.vx, -ball.vy).toFixed(3))

        expect(new Set(headings).size).toBe(4)
        for (const ball of state.balls) expect(ball.vy).toBeLessThan(0)
    })

    it("holds every extra ball at the serve speed", () => {
        const state = game("breakout", { speed: 1.4 })
        launch(state)
        const before = Math.hypot(state.balls[0].vx, state.balls[0].vy)
        bonusById("multi-ball")?.apply(state)

        for (const ball of state.balls) {
            expect(Math.hypot(ball.vx, ball.vy)).toBeCloseTo(before, 0)
        }
    })

    it("caps how many balls can be in the air", () => {
        const state = game("breakout")
        launch(state)
        for (let round = 0; round < 8; round += 1) bonusById("multi-ball")?.apply(state)

        expect(state.balls.length).toBeLessThanOrEqual(7)
    })

    it("only misses once the last ball is gone", () => {
        const state = game("breakout")
        launch(state)
        bonusById("multi-ball")?.apply(state)

        state.balls[0].y = state.height + 40
        state.balls[0].vy = 400
        stepGame(state, 1 / 60)

        expect(state.balls).toHaveLength(3)
        expect(state.phase).toBe("playing")
    })

    it("respawns a single ball after the last one drops", () => {
        const state = game("breakout")
        launch(state)
        bonusById("multi-ball")?.apply(state)
        for (const ball of state.balls) {
            ball.y = state.height + 40
            ball.vy = 400
        }
        stepGame(state, 1 / 60)

        expect(state.phase).toBe("missed")

        run(state, 1.2)

        expect(state.phase).toBe("playing")
        expect(state.balls).toHaveLength(1)
    })
})

describe("the ship", () => {
    it("stays inside the box", () => {
        const state = game("shooter")

        moveActor(state, -900)
        expect(state.actor.target).toBeCloseTo(state.actor.w / 2)

        moveActor(state, 9000)
        expect(state.actor.target).toBeCloseTo(state.width - state.actor.w / 2)
    })

    it("moves on the arrow keys and stops at the wall", () => {
        const state = game("shooter")
        const from = state.actor.target

        nudgeActor(state, 1)
        expect(state.actor.target).toBeGreaterThan(from)

        nudgeActor(state, -1)
        expect(state.actor.target).toBeCloseTo(from)

        for (let press = 0; press < 40; press += 1) nudgeActor(state, -1)
        expect(state.actor.target).toBeCloseTo(state.actor.w / 2)
    })

    it("slides toward the pointer instead of snapping", () => {
        const state = game("shooter")
        launch(state)
        moveActor(state, state.width - 40)
        const start = state.actor.x

        stepGame(state, 1 / 60)
        const mid = state.actor.x
        run(state, 1)

        expect(mid).toBeGreaterThan(start)
        expect(mid).toBeLessThan(state.actor.target)
        expect(state.actor.x).toBeCloseTo(state.actor.target, 0)
    })

    it("never loses, because there is nothing to drop", () => {
        const state = game("shooter")
        launch(state)
        run(state, 4)

        expect(state.phase).toBe("playing")
        expect(state.balls).toHaveLength(0)
    })
})

describe("shooting", () => {
    it("fires a bolt upward from the ship", () => {
        const state = game("shooter")
        launch(state)

        expect(fire(state)).toBe(true)

        const shot = state.shots.find((item) => item.alive)
        expect(shot?.x).toBeCloseTo(state.actor.x)
        expect(shot?.y).toBeCloseTo(state.actor.y)
        expect(shot?.vy).toBeLessThan(0)
    })

    it("refuses to fire before the game starts", () => {
        const state = game("shooter")

        expect(fire(state)).toBe(false)
        expect(state.shots.some((shot) => shot.alive)).toBe(false)
    })

    it("refuses to fire in breakout", () => {
        const state = game("breakout")
        launch(state)

        expect(fire(state)).toBe(false)
    })

    it("throttles a second shot until the cooldown passes", () => {
        const state = game("shooter", { fireRate: 5 })
        launch(state)

        expect(fire(state)).toBe(true)
        expect(fire(state)).toBe(false)

        run(state, 0.1)
        expect(fire(state)).toBe(false)

        run(state, 0.15)
        expect(fire(state)).toBe(true)
    })

    it("caps a held fire button at the fire rate", () => {
        // near-still bolts, so every shot fired in the window is still countable
        const state = game("shooter", { fireRate: 5, shotSpeed: 0.001 })
        launch(state)
        holdFire(state, true)
        run(state, 1)

        expect(state.shots.filter((shot) => shot.alive)).toHaveLength(5)
    })

    it("stops firing when the button comes up", () => {
        const state = game("shooter", { fireRate: 8, shotSpeed: 0.001 })
        launch(state)
        holdFire(state, true)
        run(state, 0.5)
        const fired = state.shots.filter((shot) => shot.alive).length
        holdFire(state, false)
        run(state, 1)

        expect(fired).toBeGreaterThan(0)
        expect(state.shots.filter((shot) => shot.alive)).toHaveLength(fired)
    })

    it("cannot flood the pool", () => {
        const state = game("shooter", { fireRate: 400, shotSpeed: 0.001 })
        launch(state)
        holdFire(state, true)
        run(state, 4)

        expect(state.shots.filter((shot) => shot.alive).length).toBeLessThanOrEqual(
            state.shots.length,
        )
    })

    it("destroys the block it reaches and then disappears", () => {
        const state = game("shooter")
        launch(state)
        const target = lowest(state)
        park(state, target.x + target.w / 2)
        fire(state)

        // gone on the same frame it lands, not left drifting up the board
        expect(runUntil(state, () => !target.alive)).toBe(true)
        expect(state.shots.some((shot) => shot.alive)).toBe(false)
    })

    it("takes the nearest block in its path first", () => {
        const state = game("shooter")
        launch(state)
        const target = lowest(state)
        const above = state.blocks.find(
            (block) => block.alive && block !== target && Math.abs(block.x - target.x) < 1,
        )
        park(state, target.x + target.w / 2)
        fire(state)
        run(state, 0.4)

        expect(target.alive).toBe(false)
        expect(above?.alive).toBe(true)
    })

    it("clears a bolt that leaves the top of the board", () => {
        const state = game("shooter")
        launch(state)
        park(state, state.actor.w / 2)
        expect(fire(state)).toBe(true)

        run(state, 2)

        expect(state.shots.some((shot) => shot.alive)).toBe(false)
        expect(state.live).toBe(state.blocks.length)
    })

    it("does not tunnel through the text at a high bolt speed", () => {
        const state = game("shooter", { shotSpeed: 4, fireRate: 1 })
        launch(state)
        const target = lowest(state)
        park(state, target.x + target.w / 2)
        fire(state)
        run(state, 1)

        expect(state.live).toBe(state.blocks.length - 1)
    })
})
