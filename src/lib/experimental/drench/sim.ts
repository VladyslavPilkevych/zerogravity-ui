import { rngFor } from "../../internal"

/**
 * The water model, kept free of the DOM so it can be stepped in a test.
 *
 * A low-resolution grid holds `water` on the cells inside the glyph mask: it is
 * what reveals the letters. Rain, the drips that escape a letter, the runoff
 * trails they leave on the glass and splashes are fixed pools of typed arrays,
 * so a long storm never grows memory and a frame never allocates.
 */
export const RAIN_CAP = 240
export const DRIP_CAP = 40
export const SPLASH_CAP = 36
export const TRAIL_CAP = 56

/** Water a cell keeps as a film instead of passing on. */
const HOLD = 0.2
const MAX_WATER = 2.6

const DOWN = 0
const LEFT = -1
const RIGHT = 1
const EDGE = 2
const EITHER = 3
const OUTSIDE = 4

export interface Weather {
    rain: number
    wind: number
    fall: number
    wetness: number
    evaporation: number
}

export interface World {
    readonly width: number
    readonly height: number
    /** device pixels per grid cell */
    readonly cell: number
    /** device pixels per CSS pixel, so speeds read the same at any density */
    readonly scale: number
    readonly cols: number
    readonly rows: number
    readonly route: Int8Array
    /** inside cells, bottom row first, so water moves at most one cell a step */
    readonly order: Int32Array
    /** cells on the underside of a stroke, where beads gather and let go */
    readonly edges: Int32Array
    /** how much a bead can hold before it falls, varied per cell */
    readonly limit: Float32Array
    readonly water: Float32Array

    readonly rainX: Float32Array
    readonly rainY: Float32Array
    readonly rainVX: Float32Array
    readonly rainVY: Float32Array
    readonly rainLength: Float32Array
    /** 0 far and faint, 1 near and heavy */
    readonly rainDepth: Float32Array
    /** where a drop meets the pane, or -1 for one that passes behind it */
    readonly rainLand: Float32Array
    readonly rainAlive: Uint8Array

    readonly dripX: Float32Array
    readonly dripY: Float32Array
    readonly dripFrom: Float32Array
    readonly dripVY: Float32Array
    readonly dripMass: Float32Array
    readonly dripAge: Float32Array
    readonly dripHang: Float32Array
    readonly dripAlive: Uint8Array
    /** the runoff trail this drip is drawing, or -1 */
    readonly dripTrail: Int16Array

    readonly trailX: Float32Array
    readonly trailTop: Float32Array
    readonly trailBottom: Float32Array
    /** 1 freshly wet, 0 dry */
    readonly trailWet: Float32Array
    readonly trailWidth: Float32Array
    /** a stable number per trail, for where the residue beads sit */
    readonly trailSeed: Float32Array
    /** the drip still drawing this trail, or -1 */
    readonly trailOwner: Int16Array

    readonly splashX: Float32Array
    readonly splashY: Float32Array
    readonly splashAge: Float32Array
    readonly splashSize: Float32Array
    readonly splashAlive: Uint8Array

    random: () => number
    raining: number
    drips: number
    splashes: number
    trails: number
    trailCursor: number
    /** water standing anywhere, letters and glass together */
    total: number
    primed: boolean
}

export function createWorld(
    width: number,
    height: number,
    cell: number,
    scale: number,
    cols: number,
    rows: number,
    mask: Uint8Array,
    seed: number,
): World {
    const cells = cols * rows
    const route = new Int8Array(cells).fill(OUTSIDE)
    const limit = new Float32Array(cells)
    const random = rngFor(seed, 0)
    const inside = (col: number, row: number) =>
        col >= 0 && col < cols && row >= 0 && row < rows && mask[row * cols + col] === 1

    const order: number[] = []
    const edges: number[] = []
    const shape = rngFor(seed, 1)

    for (let row = rows - 1; row >= 0; row -= 1) {
        for (let col = 0; col < cols; col += 1) {
            const index = row * cols + col
            if (mask[index] !== 1) continue
            order.push(index)

            if (inside(col, row + 1)) route[index] = DOWN
            else {
                const left = inside(col - 1, row + 1)
                const right = inside(col + 1, row + 1)
                route[index] = left && right ? EITHER : left ? LEFT : right ? RIGHT : EDGE
            }

            if (route[index] === EDGE) {
                edges.push(index)
                limit[index] = 1.1 + shape() * 1.3
            }
        }
    }

    return {
        width,
        height,
        cell,
        scale,
        cols,
        rows,
        route,
        order: Int32Array.from(order),
        edges: Int32Array.from(edges),
        limit,
        water: new Float32Array(cells),

        rainX: new Float32Array(RAIN_CAP),
        rainY: new Float32Array(RAIN_CAP),
        rainVX: new Float32Array(RAIN_CAP),
        rainVY: new Float32Array(RAIN_CAP),
        rainLength: new Float32Array(RAIN_CAP),
        rainDepth: new Float32Array(RAIN_CAP),
        rainLand: new Float32Array(RAIN_CAP),
        rainAlive: new Uint8Array(RAIN_CAP),

        dripX: new Float32Array(DRIP_CAP),
        dripY: new Float32Array(DRIP_CAP),
        dripFrom: new Float32Array(DRIP_CAP),
        dripVY: new Float32Array(DRIP_CAP),
        dripMass: new Float32Array(DRIP_CAP),
        dripAge: new Float32Array(DRIP_CAP),
        dripHang: new Float32Array(DRIP_CAP),
        dripAlive: new Uint8Array(DRIP_CAP),
        dripTrail: new Int16Array(DRIP_CAP).fill(-1),

        trailX: new Float32Array(TRAIL_CAP),
        trailTop: new Float32Array(TRAIL_CAP),
        trailBottom: new Float32Array(TRAIL_CAP),
        trailWet: new Float32Array(TRAIL_CAP),
        trailWidth: new Float32Array(TRAIL_CAP),
        trailSeed: new Float32Array(TRAIL_CAP),
        trailOwner: new Int16Array(TRAIL_CAP).fill(-1),

        splashX: new Float32Array(SPLASH_CAP),
        splashY: new Float32Array(SPLASH_CAP),
        splashAge: new Float32Array(SPLASH_CAP),
        splashSize: new Float32Array(SPLASH_CAP),
        splashAlive: new Uint8Array(SPLASH_CAP),

        random,
        raining: 0,
        drips: 0,
        splashes: 0,
        trails: 0,
        trailCursor: 0,
        total: 0,
        primed: false,
    }
}

/** Nothing is falling, nothing is wet: the loop can stop. */
export function settled(world: World): boolean {
    return (
        world.raining === 0 &&
        world.drips === 0 &&
        world.splashes === 0 &&
        world.trails === 0 &&
        world.total < 0.02
    )
}

function seat(world: World, slot: number, weather: Weather, anywhere: boolean): void {
    const { random, height, width, scale } = world
    const depth = random()
    // three populations: a faint far curtain, a middle layer, and a few heavy
    // near drops that actually hit the pane
    const far = depth < 0.5
    const heavy = depth > 0.86
    const speed =
        (far ? 620 + random() * 260 : heavy ? 1500 + random() * 420 : 980 + random() * 380) * scale
    const slant = clampWind(weather.wind) * 0.42
    const drift = slant * height

    world.rainDepth[slot] = depth
    world.rainVY[slot] = speed
    world.rainVX[slot] = speed * slant
    world.rainLength[slot] = speed * (far ? 0.016 : heavy ? 0.03 : 0.024) * (0.7 + random() * 0.6)
    world.rainX[slot] = random() * (width + Math.abs(drift)) - (drift > 0 ? drift : 0)
    world.rainY[slot] = anywhere ? random() * height : -random() * height * 0.5
    world.rainLand[slot] =
        heavy || (!far && random() < 0.45) ? (0.04 + random() * 0.96) * height : -1
    world.rainAlive[slot] = 1
}

function clampWind(wind: number): number {
    return wind < -1 ? -1 : wind > 1 ? 1 : wind
}

/** Water landing on the grid: a soft splat, kept only where there is a letter. */
function splat(world: World, x: number, y: number, amount: number, radius: number): void {
    const { cols, rows, cell, route, water } = world
    const cx = Math.floor(x / cell)
    const cy = Math.floor(y / cell)
    const reach = (radius + 1) * (radius + 1)

    for (let dy = -radius; dy <= radius; dy += 1) {
        const row = cy + dy
        if (row < 0 || row >= rows) continue
        for (let dx = -radius; dx <= radius; dx += 1) {
            const col = cx + dx
            if (col < 0 || col >= cols) continue
            const index = row * cols + col
            if (route[index] === OUTSIDE) continue
            const fall = 1 - (dx * dx + dy * dy) / reach
            if (fall <= 0) continue
            water[index] = Math.min(MAX_WATER, water[index] + amount * fall)
        }
    }
}

function spawnSplash(world: World, x: number, y: number, size: number): void {
    for (let slot = 0; slot < SPLASH_CAP; slot += 1) {
        if (world.splashAlive[slot]) continue
        world.splashAlive[slot] = 1
        world.splashX[slot] = x
        world.splashY[slot] = y
        world.splashAge[slot] = 0
        world.splashSize[slot] = size
        world.splashes += 1
        return
    }
}

function spawnDrip(world: World, index: number, mass: number): boolean {
    for (let slot = 0; slot < DRIP_CAP; slot += 1) {
        if (world.dripAlive[slot]) continue
        const col = index % world.cols
        const row = (index - col) / world.cols
        world.dripAlive[slot] = 1
        world.dripX[slot] = (col + 0.5) * world.cell
        world.dripY[slot] = (row + 1) * world.cell
        world.dripFrom[slot] = world.dripY[slot]
        world.dripVY[slot] = 0
        world.dripMass[slot] = mass
        world.dripAge[slot] = 0
        world.dripHang[slot] = 0.18 + world.random() * 0.35
        world.dripTrail[slot] = -1
        world.drips += 1
        return true
    }
    return false
}

/** A ring: under a downpour the oldest trail is the one that gives way. */
function startTrail(world: World, drip: number): void {
    const slot = world.trailCursor
    world.trailCursor = (slot + 1) % TRAIL_CAP
    const owner = world.trailOwner[slot]
    if (owner >= 0) world.dripTrail[owner] = -1
    world.trailOwner[slot] = drip
    world.dripTrail[drip] = slot
    world.trailX[slot] = world.dripX[drip]
    world.trailTop[slot] = world.dripFrom[drip]
    world.trailBottom[slot] = world.dripY[drip]
    world.trailWet[slot] = 1
    world.trailWidth[slot] = (0.7 + Math.min(1, world.dripMass[drip]) * 0.9) * world.scale
    world.trailSeed[slot] = world.random()
}

export function step(world: World, dt: number, weather: Weather): void {
    const { cols, cell, route, water, order, limit, random, scale } = world
    const rain = weather.rain < 0 ? 0 : weather.rain > 1 ? 1 : weather.rain
    const soak = weather.wetness < 0 ? 0 : weather.wetness > 1 ? 1 : weather.wetness
    const fall = Math.max(0.1, weather.fall)
    const dry = Math.max(0, Math.min(1, weather.evaporation))

    // --- rain -------------------------------------------------------------
    const wanted = Math.round(RAIN_CAP * rain)
    let raining = 0
    for (let slot = 0; slot < RAIN_CAP; slot += 1) {
        if (!world.rainAlive[slot]) {
            if (slot < wanted) seat(world, slot, weather, !world.primed)
            else continue
        }

        world.rainX[slot] += world.rainVX[slot] * fall * dt
        world.rainY[slot] += world.rainVY[slot] * fall * dt
        const y = world.rainY[slot]
        const land = world.rainLand[slot]

        if (land >= 0 && y >= land) {
            const x = world.rainX[slot]
            const heavy = world.rainDepth[slot] > 0.86
            splat(world, x, y, (heavy ? 0.9 : 0.5) * (0.4 + soak * 0.9), heavy ? 3 : 2)
            spawnSplash(world, x, y, (heavy ? 3.5 : 2) * scale)
            world.rainAlive[slot] = 0
        } else if (y - world.rainLength[slot] > world.height) {
            world.rainAlive[slot] = 0
        }

        if (world.rainAlive[slot]) raining += 1
        else if (slot < wanted) {
            seat(world, slot, weather, false)
            raining += 1
        }
    }
    world.raining = raining
    world.primed = true

    // a fine mist of droplets too small to draw, so a letter wets all over
    // rather than only where a heavy drop happened to land
    if (order.length > 0 && rain > 0) {
        const mist = rain * (1 + soak * 2.6) * dt * 60
        let count = Math.floor(mist)
        if (random() < mist - count) count += 1
        for (let k = 0; k < count; k += 1) {
            const index = order[Math.floor(random() * order.length)]
            const col = index % cols
            const amount = 0.3 + soak * 0.4
            splat(world, (col + 0.5) * cell, ((index - col) / cols + 0.5) * cell, amount, 1)
        }
    }

    // --- flow inside the letters -----------------------------------------
    const pass = Math.min(1, dt * 16)
    for (let k = 0; k < order.length; k += 1) {
        const index = order[k]
        const w = water[index]
        if (w < 0.001) continue
        const way = route[index]

        if (way === EDGE) {
            // beads pull water from a drier neighbour, so the underside
            // breaks into separate drops instead of a uniform line
            const col = index % cols
            if (col > 0 && route[index - 1] === EDGE && water[index - 1] < w) {
                const take = water[index - 1] * pass * 0.6
                water[index - 1] -= take
                water[index] += take
            }
            if (col < cols - 1 && route[index + 1] === EDGE && water[index + 1] < w) {
                const take = water[index + 1] * pass * 0.6
                water[index + 1] -= take
                water[index] += take
            }
            if (water[index] > limit[index]) {
                const mass = water[index] - HOLD * 1.5
                if (spawnDrip(world, index, mass)) water[index] = HOLD * 1.5
                else water[index] = limit[index]
            }
            continue
        }

        const excess = w - HOLD
        if (excess <= 0) continue
        const move = excess * pass
        let target = index + cols
        if (way === LEFT) target -= 1
        else if (way === RIGHT) target += 1
        else if (way === EITHER) target += water[target - 1] <= water[target + 1] ? -1 : 1
        water[index] = w - move
        water[target] = Math.min(MAX_WATER, water[target] + move)
    }

    // --- drips that escaped the letters ----------------------------------
    let drips = 0
    for (let slot = 0; slot < DRIP_CAP; slot += 1) {
        if (!world.dripAlive[slot]) continue
        world.dripAge[slot] += dt
        if (world.dripAge[slot] > world.dripHang[slot]) {
            if (world.dripTrail[slot] < 0 && world.dripVY[slot] === 0) startTrail(world, slot)
            const mass = world.dripMass[slot]
            // a heavy drop runs fast, a light one creeps and stalls
            const terminal = (50 + mass * 300) * scale * fall
            const vy = Math.min(terminal, world.dripVY[slot] + 900 * scale * dt)
            world.dripVY[slot] = vy
            const from = world.dripY[slot]
            const to = from + vy * dt
            world.dripY[slot] = to
            // every cell of glass it crosses keeps a little of it
            world.dripMass[slot] = mass - ((to - from) / cell) * 0.045

            const trail = world.dripTrail[slot]
            if (trail >= 0) world.trailBottom[trail] = to

            if (world.dripMass[slot] < 0.1 || to > world.height + cell * 4) {
                if (trail >= 0) world.trailOwner[trail] = -1
                world.dripTrail[slot] = -1
                world.dripAlive[slot] = 0
                continue
            }
        }
        drips += 1
    }
    world.drips = drips

    // --- splashes ----------------------------------------------------------
    let splashes = 0
    for (let slot = 0; slot < SPLASH_CAP; slot += 1) {
        if (!world.splashAlive[slot]) continue
        world.splashAge[slot] += dt
        if (world.splashAge[slot] > 0.22) world.splashAlive[slot] = 0
        else splashes += 1
    }
    world.splashes = splashes

    // --- evaporation ---------------------------------------------------------
    let total = 0
    const fade = dry * dt
    for (let k = 0; k < order.length; k += 1) {
        const index = order[k]
        const w = water[index]
        if (w <= 0) continue
        const next = w - fade * (0.022 + w * 0.09)
        water[index] = next > 0.004 ? next : 0
        total += water[index]
    }
    // runoff on the glass is thinner and goes sooner
    let trails = 0
    for (let slot = 0; slot < TRAIL_CAP; slot += 1) {
        const wet = world.trailWet[slot]
        if (wet <= 0 || world.trailOwner[slot] >= 0) {
            if (wet > 0) trails += 1
            continue
        }
        const next = wet - fade * (0.12 + wet * 0.2)
        world.trailWet[slot] = next > 0.01 ? next : 0
        if (next > 0.01) trails += 1
    }
    world.trails = trails
    world.total = total
}
