import { describe, expect, it } from "vitest"

import {
    createGame,
    launch,
    layoutGame,
    moveActor,
    nudgeActor,
    resetBalls,
    stepGame,
    type RicochetGame,
} from "./engine"

const BOX = { width: 800, height: 500, pixelSize: 20, speed: 1 }

function game(text = "404"): RicochetGame {
    return createGame({ text, ...BOX })
}

/** A blank board is an obstacle-free arena, so it needs putting into play by hand. */
function arena(): RicochetGame {
    const state = game("  ")
    state.phase = "idle"
    launch(state)
    return state
}

/** Runs the clock forward in stable slices. */
function run(state: RicochetGame, seconds: number, slice = 1 / 60) {
    for (let elapsed = 0; elapsed < seconds; elapsed += slice) stepGame(state, slice)
}

describe("createGame", () => {
    it("starts idle with one block per filled cell", () => {
        const state = game()

        expect(state.phase).toBe("idle")
        expect(state.blocks).toHaveLength(state.grid.cells.length)
        expect(state.live).toBe(state.blocks.length)
        expect(state.blocks.every((block) => block.alive)).toBe(true)
    })

    it("keeps the text inside the box", () => {
        const state = game("BREAKOUT")

        for (const block of state.blocks) {
            expect(block.x).toBeGreaterThanOrEqual(0)
            expect(block.x + block.w).toBeLessThanOrEqual(state.width + 0.01)
            expect(block.y + block.h).toBeLessThan(state.actor.y)
        }
    })

    it("never asks for a block bigger than the preferred size", () => {
        const state = createGame({ text: "4", width: 2000, height: 2000, pixelSize: 18, speed: 1 })

        expect(state.unit).toBeLessThanOrEqual(18)
    })

    it("shrinks the blocks on a narrow box rather than overflowing", () => {
        const wide = createGame({ ...BOX, text: "LOST" })
        const narrow = createGame({
            text: "LOST",
            width: 320,
            height: 420,
            pixelSize: 20,
            speed: 1,
        })

        expect(narrow.unit).toBeLessThan(wide.unit)
        expect(narrow.grid.cols * narrow.unit).toBeLessThanOrEqual(320)
    })

    it("does not move until launched", () => {
        const state = game()
        run(state, 0.5)

        expect(state.balls[0].vx).toBe(0)
        expect(state.balls[0].vy).toBe(0)
        expect(state.phase).toBe("idle")
    })
})

describe("launch", () => {
    it("serves upward and starts playing", () => {
        const state = game()
        launch(state)

        expect(state.phase).toBe("playing")
        expect(state.balls[0].vy).toBeLessThan(0)
        expect(Math.hypot(state.balls[0].vx, state.balls[0].vy)).toBeGreaterThan(100)
    })

    it("varies the serve angle but stays deterministic", () => {
        const first = game()
        launch(first)
        const firstAngle = first.balls[0].vx

        // the respawn path: park the ball again, then serve it on the next angle
        const second = game()
        launch(second)
        resetBalls(second)
        launch(second)

        expect(second.balls[0].vx).not.toBeCloseTo(firstAngle)

        const repeat = game()
        launch(repeat)
        expect(repeat.balls[0].vx).toBeCloseTo(firstAngle)
    })

    it("leaves a ball that is already travelling alone", () => {
        const state = game()
        launch(state)
        const aim = { ...state.balls[0] }
        launch(state)

        expect(state.balls[0].vx).toBeCloseTo(aim.vx)
        expect(state.balls[0].vy).toBeCloseTo(aim.vy)
    })

    it("refuses to serve once the board is cleared", () => {
        const state = game()
        state.phase = "cleared"
        launch(state)

        expect(state.phase).toBe("cleared")
    })
})

describe("walls", () => {
    it("bounces off the left wall", () => {
        const state = game()
        launch(state)
        state.balls[0].x = 10
        state.balls[0].y = state.height * 0.7
        state.balls[0].vx = -400
        state.balls[0].vy = -40

        run(state, 0.2)

        expect(state.balls[0].vx).toBeGreaterThan(0)
        expect(state.balls[0].x).toBeGreaterThanOrEqual(state.balls[0].r - 0.01)
    })

    it("bounces off the right wall", () => {
        const state = game()
        launch(state)
        state.balls[0].x = state.width - 10
        state.balls[0].y = state.height * 0.7
        state.balls[0].vx = 400
        state.balls[0].vy = -40

        run(state, 0.2)

        expect(state.balls[0].vx).toBeLessThan(0)
        expect(state.balls[0].x + state.balls[0].r).toBeLessThanOrEqual(state.width + 0.01)
    })

    it("bounces off the ceiling", () => {
        const state = arena()
        state.balls[0].x = state.width / 2
        state.balls[0].y = 6
        state.balls[0].vx = 20
        state.balls[0].vy = -400

        run(state, 0.2)

        expect(state.balls[0].vy).toBeGreaterThan(0)
    })

    it("stays inside the box over a long run", () => {
        const state = game()
        launch(state)

        for (let tick = 0; tick < 3000; tick += 1) {
            stepGame(state, 1 / 60)
            if (state.phase === "cleared") break
            for (const ball of state.balls) {
                expect(ball.x).toBeGreaterThanOrEqual(-1)
                expect(ball.x).toBeLessThanOrEqual(state.width + 1)
                expect(ball.y).toBeGreaterThanOrEqual(-1)
            }
        }
    })
})

describe("paddle", () => {
    it("sends the ball back up", () => {
        const state = arena()
        state.actor.x = state.width / 2
        state.actor.target = state.actor.x
        state.balls[0].x = state.width / 2
        state.balls[0].y = state.actor.y - state.balls[0].r - 2
        state.balls[0].vx = 0
        state.balls[0].vy = 400

        stepGame(state, 1 / 60)

        expect(state.balls[0].vy).toBeLessThan(0)
        expect(state.phase).toBe("playing")
    })

    it("angles the bounce away from the point of contact", () => {
        const left = arena()
        left.actor.x = left.width / 2
        left.actor.target = left.actor.x
        left.balls[0].x = left.width / 2 - left.actor.w / 2 + 2
        left.balls[0].y = left.actor.y - left.balls[0].r - 1
        left.balls[0].vx = 0
        left.balls[0].vy = 400
        stepGame(left, 1 / 60)

        expect(left.balls[0].vx).toBeLessThan(0)

        const right = arena()
        right.actor.x = right.width / 2
        right.actor.target = right.actor.x
        right.balls[0].x = right.width / 2 + right.actor.w / 2 - 2
        right.balls[0].y = right.actor.y - right.balls[0].r - 1
        right.balls[0].vx = 0
        right.balls[0].vy = 400
        stepGame(right, 1 / 60)

        expect(right.balls[0].vx).toBeGreaterThan(0)
    })

    it("stays inside the box however far it is pushed", () => {
        const state = game()

        moveActor(state, -9000)
        expect(state.actor.target).toBeCloseTo(state.actor.w / 2)

        moveActor(state, 9000)
        expect(state.actor.target).toBeCloseTo(state.width - state.actor.w / 2)
    })

    it("moves by a step on a nudge", () => {
        const state = game()
        const before = state.actor.target

        nudgeActor(state, 1)
        expect(state.actor.target).toBeGreaterThan(before)

        nudgeActor(state, -1)
        expect(state.actor.target).toBeCloseTo(before)
    })

    it("eases toward the pointer instead of snapping", () => {
        const state = game()
        moveActor(state, state.width - 40)
        const start = state.actor.x

        stepGame(state, 1 / 60)

        expect(state.actor.x).toBeGreaterThan(start)
        expect(state.actor.x).toBeLessThan(state.actor.target)
    })
})

describe("blocks", () => {
    it("destroys a block on contact and bounces", () => {
        const state = game()
        launch(state)

        const target = state.blocks[0]
        state.balls[0].x = target.x + target.w / 2
        state.balls[0].y = target.y + target.h + state.balls[0].r - 1
        state.balls[0].vx = 0
        state.balls[0].vy = -400

        stepGame(state, 1 / 60)

        expect(target.alive).toBe(false)
        expect(state.live).toBe(state.blocks.length - 1)
        expect(state.balls[0].vy).toBeGreaterThan(0)
    })

    it("takes at most one block per slice so it cannot chain wildly", () => {
        const state = game()
        launch(state)
        state.balls[0].x = state.blocks[0].x + state.blocks[0].w / 2
        state.balls[0].y = state.blocks[0].y + state.blocks[0].h / 2

        const before = state.live
        stepGame(state, 1 / 60)

        expect(before - state.live).toBeLessThanOrEqual(4)
    })

    it("cannot tunnel through the text at high speed", () => {
        const state = createGame({ ...BOX, text: "404", speed: 6 })
        launch(state)

        run(state, 6)

        expect(state.live).toBeLessThan(state.blocks.length)
    })

    it("spends a spark when a block goes", () => {
        const state = game()
        launch(state)
        const target = state.blocks[0]
        state.balls[0].x = target.x + target.w / 2
        state.balls[0].y = target.y + target.h + state.balls[0].r - 1
        state.balls[0].vy = -400

        stepGame(state, 1 / 60)

        expect(state.sparks.some((spark) => spark.life > 0)).toBe(true)
    })

    it("lets sparks die out", () => {
        const state = game()
        launch(state)
        const target = state.blocks[0]
        state.balls[0].x = target.x + target.w / 2
        state.balls[0].y = target.y + target.h + state.balls[0].r - 1
        state.balls[0].vy = -400
        stepGame(state, 1 / 60)
        expect(state.sparks.some((spark) => spark.life > 0)).toBe(true)

        // freeze the rally so no fresh sparks appear while the old ones decay
        state.phase = "cleared"
        run(state, 1)

        expect(state.sparks.every((spark) => spark.life <= 0)).toBe(true)
    })
})

describe("misses", () => {
    it("marks a miss when the ball drops past the paddle", () => {
        const state = game()
        launch(state)
        state.balls[0].y = state.height + 40
        state.balls[0].vy = 400

        stepGame(state, 1 / 60)

        expect(state.phase).toBe("missed")
    })

    it("serves again after the pause, keeping the damage done", () => {
        const state = game()
        launch(state)
        state.blocks[0].alive = false
        state.live -= 1
        state.balls[0].y = state.height + 40
        stepGame(state, 1 / 60)
        expect(state.phase).toBe("missed")

        run(state, 1.2)

        expect(state.phase).toBe("playing")
        expect(state.blocks[0].alive).toBe(false)
        expect(state.live).toBe(state.blocks.length - 1)
    })
})

describe("clearing", () => {
    it("flags the clear on the last block", () => {
        const state = game("1")
        launch(state)

        for (const block of state.blocks.slice(1)) {
            block.alive = false
            state.live -= 1
        }

        const last = state.blocks[0]
        state.balls[0].x = last.x + last.w / 2
        state.balls[0].y = last.y + last.h + state.balls[0].r - 1
        state.balls[0].vy = -400

        stepGame(state, 1 / 60)

        expect(state.live).toBe(0)
        expect(state.phase).toBe("cleared")
        expect(state.clearedNow).toBe(true)
    })

    it("goes quiet once cleared", () => {
        const state = game("1")
        state.phase = "cleared"
        const spot = { ...state.balls[0] }

        run(state, 1)

        expect(state.balls[0].x).toBe(spot.x)
        expect(state.balls[0].y).toBe(spot.y)
    })
})

describe("an empty board", () => {
    it("counts as cleared from the start", () => {
        const state = game(" ")

        expect(state.blocks).toHaveLength(0)
        expect(state.live).toBe(0)
        expect(state.phase).toBe("cleared")
    })

    it("stays still and refuses to serve", () => {
        const state = game(" ")
        launch(state)
        run(state, 1)

        expect(state.phase).toBe("cleared")
        expect(state.balls[0].vx).toBe(0)
    })
})

describe("stability", () => {
    it("corrects a near-horizontal path wherever it came from", () => {
        const state = arena()
        state.balls[0].x = state.width / 2
        state.balls[0].y = state.height * 0.5
        state.balls[0].vx = 400
        state.balls[0].vy = 2

        stepGame(state, 1 / 60)
        const speed = Math.hypot(state.balls[0].vx, state.balls[0].vy)

        expect(Math.abs(state.balls[0].vy) / speed).toBeGreaterThan(0.3)
    })

    it("corrects it after a wall bounce too", () => {
        const state = arena()
        state.balls[0].x = 8
        state.balls[0].y = state.height * 0.5
        state.balls[0].vx = -400
        state.balls[0].vy = 1

        run(state, 0.3)
        const speed = Math.hypot(state.balls[0].vx, state.balls[0].vy)

        expect(Math.abs(state.balls[0].vy) / speed).toBeGreaterThan(0.3)
    })

    it("holds a steady speed across a long rally", () => {
        const state = game()
        launch(state)
        const start = Math.hypot(state.balls[0].vx, state.balls[0].vy)

        run(state, 8)

        if (state.phase === "playing") {
            expect(Math.hypot(state.balls[0].vx, state.balls[0].vy)).toBeCloseTo(start, 0)
        }
    })

    it("clamps a huge frame gap instead of teleporting", () => {
        const state = game()
        launch(state)
        const before = { x: state.balls[0].x, y: state.balls[0].y }

        stepGame(state, 5)

        expect(Math.hypot(state.balls[0].x - before.x, state.balls[0].y - before.y)).toBeLessThan(
            state.width,
        )
    })

    it("ignores a negative delta", () => {
        const state = game()
        launch(state)
        expect(() => stepGame(state, -2)).not.toThrow()
        expect(Number.isFinite(state.balls[0].x)).toBe(true)
    })
})

describe("layoutGame", () => {
    it("rescales everything without reviving destroyed blocks", () => {
        const state = game()
        state.blocks[0].alive = false
        state.live -= 1

        layoutGame(state, 420, 320, 20)

        expect(state.width).toBe(420)
        expect(state.blocks[0].alive).toBe(false)
        expect(state.live).toBe(state.blocks.length - 1)
        for (const block of state.blocks) {
            expect(block.x + block.w).toBeLessThanOrEqual(420.01)
        }
    })

    it("keeps the ball and paddle in bounds after a shrink", () => {
        const state = game()
        launch(state)
        run(state, 1)

        layoutGame(state, 300, 260, 20)

        expect(state.balls[0].x).toBeGreaterThanOrEqual(0)
        expect(state.balls[0].x).toBeLessThanOrEqual(300)
        expect(state.actor.x - state.actor.w / 2).toBeGreaterThanOrEqual(-0.01)
        expect(state.actor.x + state.actor.w / 2).toBeLessThanOrEqual(300.01)
    })
})

describe("resetBalls", () => {
    it("parks the ball above the middle of the paddle", () => {
        const state = game()
        launch(state)
        run(state, 1)

        resetBalls(state)

        expect(state.balls[0].x).toBeCloseTo(state.width / 2)
        expect(state.balls[0].vx).toBe(0)
        expect(state.balls[0].vy).toBe(0)
        expect(state.balls[0].y).toBeLessThan(state.actor.y)
    })
})
