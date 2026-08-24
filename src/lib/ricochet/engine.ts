import { textGrid, type TextGrid } from "./font"

export type RicochetPhase = "idle" | "playing" | "cleared" | "missed"

export type RicochetMode = "breakout" | "shooter"

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

export interface RicochetBall {
    x: number
    y: number
    vx: number
    vy: number
    r: number
}

/** A falling bonus. Pooled, so a collected or lost one is reused rather than replaced. */
export interface RicochetDrop {
    bonus: string
    x: number
    y: number
    vy: number
    alive: boolean
}

/** A shooter bolt. Pooled for the same reason. */
export interface RicochetShot {
    x: number
    y: number
    vy: number
    alive: boolean
}

export interface RicochetGame {
    mode: RicochetMode
    width: number
    height: number
    unit: number
    grid: TextGrid
    blocks: RicochetBlock[]
    live: number
    /** paddle in breakout, ship in shooter: the thing the player slides along the bottom */
    actor: { x: number; target: number; w: number; h: number; y: number }
    balls: RicochetBall[]
    ballR: number
    drops: RicochetDrop[]
    dropR: number
    shots: RicochetShot[]
    shotR: number
    sparks: RicochetSpark[]
    phase: RicochetPhase
    speed: number
    shotSpeed: number
    fireRate: number
    actorSpeed: number
    powerUps: boolean
    powerUpChance: number
    /** seconds left before the next bolt is allowed */
    cool: number
    /** fire button or finger held down */
    firing: boolean
    /** counts down before the ball comes back after a miss */
    wait: number
    /** launch counter, keeps the serve deterministic but varied */
    serves: number
    /** seeded generator state, so drops are repeatable in tests */
    roll: number
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

const MAX_BALLS = 7
const SPREAD = [-0.44, 0.3, 0.64]

const DROP_POOL = 4
const DROP_SPEED = 190

const SHOT_POOL = 24
const SHOT_SPEED = 620

/**
 * A bonus is a label plus an effect, listed against the modes it makes sense in.
 * Adding a bigger paddle or a slow ball later means one more entry here.
 */
export interface RicochetBonus {
    id: string
    /** short pixel label drawn on the falling block */
    label: string
    modes: readonly RicochetMode[]
    apply: (game: RicochetGame) => void
}

export const RICOCHET_BONUSES: readonly RicochetBonus[] = [
    {
        id: "multi-ball",
        label: "+3",
        modes: ["breakout"],
        apply: (game) => addBalls(game, 3),
    },
]

export function bonusesFor(mode: RicochetMode): readonly RicochetBonus[] {
    return RICOCHET_BONUSES.filter((bonus) => bonus.modes.includes(mode))
}

export function bonusById(id: string): RicochetBonus | undefined {
    return RICOCHET_BONUSES.find((bonus) => bonus.id === id)
}

export interface RicochetOptions {
    text: string
    mode?: RicochetMode
    width: number
    height: number
    /** preferred block size; the fitted size is never larger than this */
    pixelSize: number
    speed: number
    shotSpeed?: number
    /** bolts per second */
    fireRate?: number
    actorSpeed?: number
    powerUps?: boolean
    powerUpChance?: number
    seed?: number
}

function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

function fit(grid: TextGrid, width: number, height: number, preferred: number): number {
    if (grid.cols === 0) return preferred

    const byWidth = (width * 0.84) / grid.cols
    const byHeight = (height * 0.42) / grid.rows

    return Math.max(3, Math.min(preferred, byWidth, byHeight))
}

function seedFor(text: string): number {
    let hash = 0x811c9dc5
    for (let index = 0; index < text.length; index += 1) {
        hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193)
    }
    return hash >>> 0
}

/** Seeded so a given board always drops the same bonuses on the same hits. */
function nextRandom(game: RicochetGame): number {
    game.roll = (game.roll + 0x6d2b79f5) >>> 0
    let t = Math.imul(game.roll ^ (game.roll >>> 15), 1 | game.roll)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function createGame(options: RicochetOptions): RicochetGame {
    const grid = textGrid(options.text)

    const game: RicochetGame = {
        mode: options.mode ?? "breakout",
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
        actor: { x: 0, target: 0, w: 0, h: 0, y: 0 },
        balls: [],
        ballR: 0,
        drops: Array.from({ length: DROP_POOL }, () => ({
            bonus: "",
            x: 0,
            y: 0,
            vy: 0,
            alive: false,
        })),
        dropR: 0,
        shots: Array.from({ length: SHOT_POOL }, () => ({ x: 0, y: 0, vy: 0, alive: false })),
        shotR: 0,
        sparks: Array.from({ length: SPARK_POOL }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 })),
        phase: "idle",
        speed: options.speed,
        shotSpeed: options.shotSpeed ?? 1,
        fireRate: options.fireRate ?? 5,
        actorSpeed: options.actorSpeed ?? 1,
        powerUps: options.powerUps ?? true,
        powerUpChance: options.powerUpChance ?? 0.05,
        cool: 0,
        firing: false,
        wait: 0,
        serves: 0,
        roll: options.seed ?? seedFor(options.text),
        clearedNow: false,
    }

    layoutGame(game, options.width, options.height, options.pixelSize)
    centreActor(game)
    if (game.mode === "breakout") resetBalls(game)
    // nothing to knock down, so the board starts where it would have ended
    if (game.live === 0) game.phase = "cleared"
    return game
}

/** The ship outline, drawn from this grid so the sprite scales with the board. */
export const SHIP_SPRITE = ["0001000", "0011100", "0111110", "1111111", "1101011"] as const

export const SHIP_COLS = 7
export const SHIP_ROWS = SHIP_SPRITE.length

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

    if (game.mode === "shooter") {
        game.actor.w = clamp(unit * 3.6, 30, width * 0.14)
        game.actor.h = (game.actor.w * SHIP_ROWS) / SHIP_COLS
        game.actor.y = height - game.actor.h - Math.max(8, unit * 0.5)
    } else {
        game.actor.w = Math.max(unit * 5, width * 0.16)
        game.actor.h = Math.max(6, unit * 0.7)
        game.actor.y = height - game.actor.h * 2.4
    }

    game.ballR = Math.max(4, unit * 0.42)
    game.dropR = Math.max(7, unit * 0.62)
    game.shotR = Math.max(2, unit * 0.16)

    const scale = previous > 0 ? unit / previous : 1

    for (const ball of game.balls) {
        if (previous > 0) {
            ball.x *= scale
            ball.y *= scale
        }
        ball.r = game.ballR
        ball.x = clamp(ball.x, ball.r, width - ball.r)
        ball.y = clamp(ball.y, ball.r, height - ball.r)
    }

    for (const drop of game.drops) {
        if (!drop.alive || previous <= 0) continue
        drop.x = clamp(drop.x * scale, game.dropR, width - game.dropR)
        drop.y *= scale
    }

    for (const shot of game.shots) {
        if (!shot.alive || previous <= 0) continue
        shot.x = clamp(shot.x * scale, 0, width)
        shot.y *= scale
    }

    game.actor.x = clamp(game.actor.x, game.actor.w / 2, width - game.actor.w / 2)
    game.actor.target = game.actor.x
}

export function centreActor(game: RicochetGame): void {
    game.actor.x = game.width / 2
    game.actor.target = game.actor.x
}

export function resetBalls(game: RicochetGame): void {
    centreActor(game)
    game.balls.length = 0
    game.balls.push({
        x: game.width / 2,
        y: game.actor.y - game.ballR * 3,
        vx: 0,
        vy: 0,
        r: game.ballR,
    })
}

function addBalls(game: RicochetGame, count: number): void {
    const source = game.balls[0]
    if (!source) return

    const speed = Math.hypot(source.vx, source.vy) || BASE_SPEED * game.speed
    const heading = Math.atan2(source.vx, -source.vy)

    for (let index = 0; index < count; index += 1) {
        if (game.balls.length >= MAX_BALLS) return

        const angle = heading + SPREAD[index % SPREAD.length]
        game.balls.push({
            x: source.x,
            y: source.y,
            vx: Math.sin(angle) * speed,
            vy: -Math.abs(Math.cos(angle) * speed),
            r: game.ballR,
        })
    }
}

export function launch(game: RicochetGame): void {
    if (game.phase === "cleared") return

    game.phase = "playing"
    game.wait = 0
    if (game.mode !== "breakout") return

    const angle = SERVE_ANGLES[game.serves % SERVE_ANGLES.length]
    game.serves += 1

    const speed = BASE_SPEED * game.speed
    for (const ball of game.balls) {
        if (ball.vx !== 0 || ball.vy !== 0) continue
        ball.vx = Math.sin(angle) * speed
        ball.vy = -Math.cos(angle) * speed
    }
}

export function moveActor(game: RicochetGame, x: number): void {
    game.actor.target = clamp(x, game.actor.w / 2, game.width - game.actor.w / 2)
}

export function nudgeActor(game: RicochetGame, direction: number): void {
    const step = game.width * (game.mode === "shooter" ? 0.06 : 0.09) * game.actorSpeed
    moveActor(game, game.actor.target + direction * step)
}

/** Pulls a bolt from the pool if the fire rate allows one. Returns whether it fired. */
export function fire(game: RicochetGame): boolean {
    if (game.mode !== "shooter" || game.phase !== "playing") return false
    if (game.cool > 0) return false

    const slot = game.shots.find((shot) => !shot.alive)
    if (!slot) return false

    slot.x = game.actor.x
    slot.y = game.actor.y
    slot.vy = -SHOT_SPEED * game.shotSpeed
    slot.alive = true
    game.cool = 1 / Math.max(0.5, game.fireRate)
    return true
}

export function holdFire(game: RicochetGame, down: boolean): void {
    game.firing = down
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

function maybeDrop(game: RicochetGame, block: RicochetBlock): void {
    if (!game.powerUps || game.powerUpChance <= 0) return

    const pool = bonusesFor(game.mode)
    if (pool.length === 0) return
    if (nextRandom(game) >= game.powerUpChance) return

    const slot = game.drops.find((drop) => !drop.alive)
    if (!slot) return

    const bonus = pool[Math.floor(nextRandom(game) * pool.length) % pool.length]
    slot.bonus = bonus.id
    slot.x = block.x + block.w / 2
    slot.y = block.y + block.h / 2
    slot.vy = DROP_SPEED
    slot.alive = true
}

/**
 * The one way a block dies. Both the ball and the bolt come through here, so the
 * count, the sparks, the bonus roll and the clear check can never drift apart.
 */
function destroyBlock(game: RicochetGame, block: RicochetBlock): void {
    block.alive = false
    game.live -= 1
    spark(game, block.x + block.w / 2, block.y + block.h / 2)
    maybeDrop(game, block)

    if (game.live === 0) {
        game.phase = "cleared"
        game.clearedNow = true
    }
}

/** Keeps a ball off near-horizontal paths, which is the classic way it gets stuck. */
function steady(game: RicochetGame, ball: RicochetBall): void {
    const length = Math.hypot(ball.vx, ball.vy)
    if (length === 0) return

    const speed = BASE_SPEED * game.speed

    ball.vx = (ball.vx / length) * speed
    ball.vy = (ball.vy / length) * speed

    const minimum = speed * MIN_VERTICAL
    if (Math.abs(ball.vy) < minimum) {
        ball.vy = ball.vy < 0 ? -minimum : minimum
        const room = Math.max(0, speed * speed - ball.vy * ball.vy)
        ball.vx = Math.sign(ball.vx || 1) * Math.sqrt(room)
    }
}

function bounceBlocks(game: RicochetGame, ball: RicochetBall): void {
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

        destroyBlock(game, block)
        return
    }
}

function advanceBalls(game: RicochetGame, dt: number): void {
    const { actor } = game

    for (let index = game.balls.length - 1; index >= 0; index -= 1) {
        const ball = game.balls[index]

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

        const overActor =
            ball.vy > 0 &&
            ball.y + ball.r >= actor.y &&
            ball.y - ball.r <= actor.y + actor.h &&
            ball.x >= actor.x - actor.w / 2 - ball.r &&
            ball.x <= actor.x + actor.w / 2 + ball.r

        if (overActor) {
            ball.y = actor.y - ball.r
            const offset = clamp((ball.x - actor.x) / (actor.w / 2), -1, 1)
            const speed = Math.hypot(ball.vx, ball.vy) || BASE_SPEED * game.speed
            const angle = offset * 1.05
            ball.vx = Math.sin(angle) * speed
            ball.vy = -Math.abs(Math.cos(angle) * speed)
        }

        bounceBlocks(game, ball)

        // applied every slice, so a wall or block bounce can never leave a flat path
        if (game.phase === "playing") steady(game, ball)

        if (ball.y - ball.r > game.height) game.balls.splice(index, 1)
    }

    if (game.balls.length === 0 && game.phase === "playing") {
        game.phase = "missed"
        game.wait = RESPAWN
    }
}

function hitBlocks(game: RicochetGame, shot: RicochetShot): boolean {
    let target: RicochetBlock | null = null

    for (const block of game.blocks) {
        if (!block.alive) continue
        const tail = shot.y + game.shotR * 4
        if (
            shot.x + game.shotR <= block.x ||
            shot.x - game.shotR >= block.x + block.w ||
            tail <= block.y ||
            shot.y >= block.y + block.h
        ) {
            continue
        }
        // shots travel up, so the lowest overlapping block is the one they reach first
        if (!target || block.y > target.y) target = block
    }

    if (!target) return false

    destroyBlock(game, target)
    return true
}

function advanceShots(game: RicochetGame, dt: number): void {
    for (const shot of game.shots) {
        if (!shot.alive) continue

        shot.y += shot.vy * dt

        if (shot.y + game.shotR < 0) {
            shot.alive = false
            continue
        }

        if (hitBlocks(game, shot)) shot.alive = false
        if (game.phase !== "playing") return
    }
}

function advanceDrops(game: RicochetGame, dt: number): void {
    const { actor, dropR } = game

    for (const drop of game.drops) {
        if (!drop.alive) continue

        drop.y += drop.vy * dt

        const caught =
            drop.y + dropR >= actor.y &&
            drop.y - dropR <= actor.y + actor.h &&
            drop.x >= actor.x - actor.w / 2 - dropR &&
            drop.x <= actor.x + actor.w / 2 + dropR

        if (caught) {
            drop.alive = false
            if (game.phase === "playing") bonusById(drop.bonus)?.apply(game)
            continue
        }

        // fell past the paddle, so it is simply gone
        if (drop.y - dropR > game.height) drop.alive = false
    }
}

export function stepGame(game: RicochetGame, delta: number): void {
    const dt = Math.min(Math.max(delta, 0), MAX_STEP)

    game.actor.x += (game.actor.target - game.actor.x) * Math.min(1, dt * 18 * game.actorSpeed)

    for (const item of game.sparks) {
        if (item.life <= 0) continue
        item.life -= dt
        item.x += item.vx * dt
        item.y += item.vy * dt
        item.vy += 260 * dt
    }

    if (game.cool > 0) game.cool -= dt
    if (game.mode === "breakout") advanceDrops(game, dt)

    if (game.phase === "missed") {
        game.wait -= dt
        if (game.wait <= 0) {
            resetBalls(game)
            launch(game)
        }
        return
    }

    if (game.phase !== "playing") return
    if (game.firing) fire(game)

    // sub-step so a fast ball or bolt cannot tunnel through a block
    const reach =
        game.mode === "breakout" ? fastestBall(game) * dt : SHOT_SPEED * game.shotSpeed * dt
    const grain = game.mode === "breakout" ? game.ballR * 0.8 : game.unit * 0.6
    const slices = Math.min(4, Math.max(1, Math.ceil(reach / Math.max(1, grain))))

    for (let slice = 0; slice < slices; slice += 1) {
        if (game.mode === "breakout") advanceBalls(game, dt / slices)
        else advanceShots(game, dt / slices)
        if (game.phase !== "playing") break
    }
}

function fastestBall(game: RicochetGame): number {
    let top = 0
    for (const ball of game.balls) top = Math.max(top, Math.hypot(ball.vx, ball.vy))
    return top
}
