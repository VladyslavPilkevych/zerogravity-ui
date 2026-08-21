import { textGrid, type TextGrid } from "./font"

export type RicochetPhase = "idle" | "playing" | "cleared" | "missed"

export interface RicochetBlock {
    x: number
    y: number
    w: number
    h: number
    alive: boolean
    /** 0 at the top row, 1 at the bottom, used for shading */
    tone: number
}

export interface RicochetSpark {
    x: number
    y: number
    vx: number
    vy: number
    life: number
}

export interface RicochetGame {
    width: number
    height: number
    unit: number
    grid: TextGrid
    blocks: RicochetBlock[]
    live: number
    ball: { x: number; y: number; vx: number; vy: number; r: number }
    paddle: { x: number; target: number; w: number; h: number; y: number }
    sparks: RicochetSpark[]
    phase: RicochetPhase
    speed: number
    /** counts down before the ball comes back after a miss */
    wait: number
    /** launch counter, keeps the serve deterministic but varied */
    serves: number
    /** set once when the last block falls, for the consumer to read and clear */
    clearedNow: boolean
}

const SPARK_POOL = 28
const SPARK_LIFE = 0.34
const BASE_SPEED = 340
const MIN_VERTICAL = 0.34
const MAX_STEP = 1 / 30
const RESPAWN = 0.85
const SERVE_ANGLES = [-0.55, 0.62, -0.34, 0.45, -0.7, 0.5]

export interface RicochetOptions {
    text: string
    width: number
    height: number
    /** preferred block size; the fitted size is never larger than this */
    pixelSize: number
    speed: number
}

function fit(grid: TextGrid, width: number, height: number, preferred: number): number {
    if (grid.cols === 0) return preferred

    const byWidth = (width * 0.84) / grid.cols
    const byHeight = (height * 0.42) / grid.rows

    return Math.max(3, Math.min(preferred, byWidth, byHeight))
}

export function createGame(options: RicochetOptions): RicochetGame {
    const grid = textGrid(options.text)

    const game: RicochetGame = {
        width: options.width,
        height: options.height,
        unit: 0,
        grid,
        blocks: grid.cells.map((cell) => ({
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            alive: true,
            tone: grid.rows > 1 ? cell.row / (grid.rows - 1) : 0,
        })),
        live: grid.cells.length,
        ball: { x: 0, y: 0, vx: 0, vy: 0, r: 0 },
        paddle: { x: 0, target: 0, w: 0, h: 0, y: 0 },
        sparks: Array.from({ length: SPARK_POOL }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 })),
        phase: "idle",
        speed: options.speed,
        wait: 0,
        serves: 0,
        clearedNow: false,
    }

    layoutGame(game, options.width, options.height, options.pixelSize)
    resetBall(game)
    // nothing to knock down, so the board starts where it would have ended
    if (game.live === 0) game.phase = "cleared"
    return game
}

/** Recomputes every measurement for the current box, keeping destroyed blocks destroyed. */
export function layoutGame(
    game: RicochetGame,
    width: number,
    height: number,
    pixelSize: number,
): void {
    game.width = width
    game.height = height

    const unit = fit(game.grid, width, height, pixelSize)
    const previous = game.unit
    game.unit = unit

    const gridWidth = game.grid.cols * unit
    const left = (width - gridWidth) / 2
    const top = Math.max(unit, height * 0.14)

    game.grid.cells.forEach((cell, index) => {
        const block = game.blocks[index]
        block.x = left + cell.col * unit
        block.y = top + cell.row * unit
        block.w = unit
        block.h = unit
    })

    game.paddle.w = Math.max(unit * 5, width * 0.16)
    game.paddle.h = Math.max(6, unit * 0.7)
    game.paddle.y = height - game.paddle.h * 2.4
    game.ball.r = Math.max(4, unit * 0.42)

    const scale = previous > 0 ? unit / previous : 1
    if (previous > 0) {
        game.ball.x *= scale
        game.ball.y *= scale
    }

    game.paddle.x = clamp(game.paddle.x, game.paddle.w / 2, width - game.paddle.w / 2)
    game.paddle.target = game.paddle.x
    game.ball.x = clamp(game.ball.x, game.ball.r, width - game.ball.r)
    game.ball.y = clamp(game.ball.y, game.ball.r, height - game.ball.r)
}

function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

export function resetBall(game: RicochetGame): void {
    game.paddle.x = game.width / 2
    game.paddle.target = game.paddle.x
    game.ball.x = game.width / 2
    game.ball.y = game.paddle.y - game.ball.r * 3
    game.ball.vx = 0
    game.ball.vy = 0
}

export function launch(game: RicochetGame): void {
    if (game.phase === "cleared") return

    const angle = SERVE_ANGLES[game.serves % SERVE_ANGLES.length]
    game.serves += 1

    const speed = BASE_SPEED * game.speed
    game.ball.vx = Math.sin(angle) * speed
    game.ball.vy = -Math.cos(angle) * speed
    game.phase = "playing"
    game.wait = 0
}

export function movePaddle(game: RicochetGame, x: number): void {
    game.paddle.target = clamp(x, game.paddle.w / 2, game.width - game.paddle.w / 2)
}

export function nudgePaddle(game: RicochetGame, direction: number): void {
    movePaddle(game, game.paddle.target + direction * game.width * 0.09)
}

function spark(game: RicochetGame, x: number, y: number): void {
    let spawned = 0

    for (const item of game.sparks) {
        if (item.life > 0) continue

        const angle = (spawned / 4) * Math.PI * 2 + 0.4
        item.x = x
        item.y = y
        item.vx = Math.cos(angle) * 120
        item.vy = Math.sin(angle) * 120
        item.life = SPARK_LIFE

        spawned += 1
        if (spawned >= 4) return
    }
}

/** Keeps the ball off near-horizontal paths, which is the classic way it gets stuck. */
function steady(game: RicochetGame): void {
    const length = Math.hypot(game.ball.vx, game.ball.vy)
    if (length === 0) return

    const speed = BASE_SPEED * game.speed

    game.ball.vx = (game.ball.vx / length) * speed
    game.ball.vy = (game.ball.vy / length) * speed

    const minimum = speed * MIN_VERTICAL
    if (Math.abs(game.ball.vy) < minimum) {
        game.ball.vy = game.ball.vy < 0 ? -minimum : minimum
        const room = Math.max(0, speed * speed - game.ball.vy * game.ball.vy)
        game.ball.vx = Math.sign(game.ball.vx || 1) * Math.sqrt(room)
    }
}

function bounceBlocks(game: RicochetGame): void {
    const { ball } = game

    for (const block of game.blocks) {
        if (!block.alive) continue
        if (
            ball.x + ball.r <= block.x ||
            ball.x - ball.r >= block.x + block.w ||
            ball.y + ball.r <= block.y ||
            ball.y - ball.r >= block.y + block.h
        ) {
            continue
        }

        const fromLeft = ball.x + ball.r - block.x
        const fromRight = block.x + block.w - (ball.x - ball.r)
        const fromTop = ball.y + ball.r - block.y
        const fromBottom = block.y + block.h - (ball.y - ball.r)
        const least = Math.min(fromLeft, fromRight, fromTop, fromBottom)

        if (least === fromTop || least === fromBottom) {
            ball.vy = -ball.vy
            ball.y += least === fromTop ? -fromTop : fromBottom
        } else {
            ball.vx = -ball.vx
            ball.x += least === fromLeft ? -fromLeft : fromRight
        }

        block.alive = false
        game.live -= 1
        spark(game, block.x + block.w / 2, block.y + block.h / 2)

        if (game.live === 0) {
            game.phase = "cleared"
            game.clearedNow = true
        }
        return
    }
}

function advance(game: RicochetGame, dt: number): void {
    const { ball, paddle } = game

    ball.x += ball.vx * dt
    ball.y += ball.vy * dt

    if (ball.x - ball.r < 0) {
        ball.x = ball.r
        ball.vx = Math.abs(ball.vx)
    } else if (ball.x + ball.r > game.width) {
        ball.x = game.width - ball.r
        ball.vx = -Math.abs(ball.vx)
    }

    if (ball.y - ball.r < 0) {
        ball.y = ball.r
        ball.vy = Math.abs(ball.vy)
    }

    const overPaddle =
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - paddle.w / 2 - ball.r &&
        ball.x <= paddle.x + paddle.w / 2 + ball.r

    if (overPaddle) {
        ball.y = paddle.y - ball.r
        const offset = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1)
        const speed = Math.hypot(ball.vx, ball.vy) || BASE_SPEED * game.speed
        const angle = offset * 1.05
        ball.vx = Math.sin(angle) * speed
        ball.vy = -Math.abs(Math.cos(angle) * speed)
    }

    bounceBlocks(game)

    // applied every slice, so a wall or block bounce can never leave a flat path
    if (game.phase === "playing") steady(game)

    if (ball.y - ball.r > game.height) {
        game.phase = "missed"
        game.wait = RESPAWN
    }
}

export function stepGame(game: RicochetGame, delta: number): void {
    const dt = Math.min(Math.max(delta, 0), MAX_STEP)

    game.paddle.x += (game.paddle.target - game.paddle.x) * Math.min(1, dt * 18)

    for (const item of game.sparks) {
        if (item.life <= 0) continue
        item.life -= dt
        item.x += item.vx * dt
        item.y += item.vy * dt
        item.vy += 260 * dt
    }

    if (game.phase === "missed") {
        game.wait -= dt
        if (game.wait <= 0) {
            resetBall(game)
            launch(game)
        }
        return
    }

    if (game.phase !== "playing") return

    // sub-step so a fast ball cannot tunnel through a block
    const travel = Math.hypot(game.ball.vx, game.ball.vy) * dt
    const slices = Math.min(4, Math.max(1, Math.ceil(travel / (game.ball.r * 0.8))))

    for (let slice = 0; slice < slices; slice += 1) {
        advance(game, dt / slices)
        if (game.phase !== "playing") break
    }
}
