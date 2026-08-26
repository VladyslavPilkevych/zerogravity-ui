import { rngFor } from "../internal"

/**
 * The living layer: pooled flyers, their steering, and the ambient event
 * scheduler. Everything here is pure and frame-driven so it can be stepped in a
 * test without a DOM, a clock or an animation frame.
 */

export type FlyerKind = "bee" | "butterfly"

export type FlyerMode = "away" | "enter" | "wander" | "inspect" | "flee" | "curious" | "leave"

export type EventName =
    "beeGather" | "butterflyLand" | "shootingStar" | "fireflyGather" | "ufoAbduction"

export type EventPace = "rare" | "normal" | "frequent"

export interface Flyer {
    kind: FlyerKind
    /** index into the variant set; changes when the pool recycles this slot */
    variant: number
    /** scene percent */
    x: number
    y: number
    /** scene percent per second */
    vx: number
    vy: number
    /** waypoint in scene percent */
    tx: number
    ty: number
    mode: FlyerMode
    /** seconds left before the mode is reconsidered */
    timer: number
    /** 0..1, back-to-front; drives scale, alpha and how hard it dodges */
    depth: number
    /** radians, eased toward the direction of travel */
    heading: number
    /** wing phase in radians */
    phase: number
    /** its own wander offset, so two flyers never trace the same curve */
    drift: number
    /** eased -1..1 facing, so a bee turns rather than snapping mirror-image */
    face: number
    alpha: number
    /** set while an event owns this flyer, so steering leaves it alone */
    held: boolean
}

export interface Anchor {
    x: number
    y: number
}

export interface LifeConfig {
    bees: number
    butterflies: number
    curious: boolean
    avoid: boolean
    interactionRadius: number
    events: boolean
    pace: EventPace
    night: boolean
}

export interface ActiveEvent {
    name: EventName
    /** seconds elapsed since it began */
    age: number
    /** total seconds it runs for */
    span: number
    x: number
    y: number
    /** the flyer an event has taken hold of, when it needs one */
    subject: number
}

export interface LifeState {
    flyers: Flyer[]
    /** seconds since the scene started, for the settling-in ramp */
    age: number
    anchors: Anchor[]
    /** seconds until the next event may begin */
    countdown: number
    event: ActiveEvent | null
    /** how many events have run; lets a test assert cleanup without timers */
    ran: number
    seed: number
    tick: number
}

export const FLYER_LIMITS = { bees: 12, butterflies: 16 } as const

const EVENT_GAP: Record<EventPace, number> = { rare: 46, normal: 26, frequent: 11 }

const EVENT_SPAN: Record<EventName, number> = {
    beeGather: 7,
    butterflyLand: 6,
    shootingStar: 2.4,
    fireflyGather: 8,
    ufoAbduction: 11,
}

export function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

/**
 * Flower height varies across the scene, so bees get a spread of landing spots
 * rather than one row. Deterministic from the seed.
 */
export function planAnchors(seed: number, count = 7): Anchor[] {
    const anchors: Anchor[] = []

    for (let index = 0; index < count; index += 1) {
        const random = rngFor(seed + 613, index)
        anchors.push({
            x: Math.round((8 + random() * 84) * 10) / 10,
            y: Math.round((68 + random() * 22) * 10) / 10,
        })
    }

    return anchors
}

function seat(flyer: Flyer, kind: FlyerKind, seed: number, slot: number, variants: number): void {
    const random = rngFor(seed + (kind === "bee" ? 101 : 211), slot)

    flyer.kind = kind
    flyer.variant = variants > 0 ? Math.floor(random() * variants) % variants : 0
    flyer.depth = Math.round((0.25 + random() * 0.7) * 100) / 100
    flyer.drift = random() * Math.PI * 2
    flyer.phase = random() * Math.PI * 2
    flyer.heading = 0
    flyer.face = 1
    flyer.held = false

    if (kind === "bee") {
        // bees belong to the flowers, so they start among them and stay low
        flyer.x = Math.round((10 + random() * 80) * 10) / 10
        flyer.y = Math.round((62 + random() * 26) * 10) / 10
        flyer.mode = "wander"
        flyer.timer = 1 + random() * 3
        flyer.alpha = 1
    } else if (slot % 3 === 2) {
        // a third wait offscreen so the pool always has someone to bring in
        flyer.x = random() < 0.5 ? -8 : 108
        flyer.y = Math.round((28 + random() * 52) * 10) / 10
        flyer.mode = "away"
        flyer.timer = 2 + random() * 9
        flyer.alpha = 0
    } else {
        // the rest are already about, so the meadow is never empty on arrival
        flyer.x = Math.round((14 + random() * 72) * 10) / 10
        flyer.y = Math.round((24 + random() * 48) * 10) / 10
        flyer.mode = "wander"
        flyer.timer = 1 + random() * 4
        flyer.alpha = 1
    }

    flyer.vx = 0
    flyer.vy = 0
    flyer.tx = flyer.x
    flyer.ty = flyer.y
}

export function createLife(config: LifeConfig, seed: number): LifeState {
    const flyers: Flyer[] = []

    for (let index = 0; index < config.bees; index += 1) {
        const flyer = {} as Flyer
        seat(flyer, "bee", seed, index, 5)
        flyers.push(flyer)
    }

    for (let index = 0; index < config.butterflies; index += 1) {
        const flyer = {} as Flyer
        seat(flyer, "butterfly", seed, index, 6)
        flyers.push(flyer)
    }

    return {
        flyers,
        age: 0,
        anchors: planAnchors(seed),
        countdown: EVENT_GAP[config.pace] * 0.45,
        event: null,
        ran: 0,
        seed,
        tick: 0,
    }
}

function pickAnchor(state: LifeState, index: number): Anchor {
    const anchors = state.anchors
    if (anchors.length === 0) return { x: 50, y: 78 }
    const random = rngFor(state.seed + 733, index + state.tick)
    return anchors[Math.floor(random() * anchors.length) % anchors.length]
}

/** Chooses what a flyer does next once its current mode runs out. */
function retarget(state: LifeState, flyer: Flyer, index: number, config: LifeConfig): void {
    const random = rngFor(state.seed + 877, index + state.tick)

    if (flyer.kind === "bee") {
        if (flyer.mode === "inspect") {
            const anchor = pickAnchor(state, index)
            flyer.mode = "wander"
            flyer.tx = anchor.x
            flyer.ty = anchor.y - 4 - random() * 10
            flyer.timer = 1.6 + random() * 3.4
            return
        }

        // most trips end with a hover over the flower it just reached
        if (random() < 0.65) {
            flyer.mode = "inspect"
            flyer.timer = 0.9 + random() * 2.2
        } else {
            const anchor = pickAnchor(state, index)
            flyer.mode = "wander"
            flyer.tx = anchor.x
            flyer.ty = anchor.y - 4 - random() * 12
            flyer.timer = 1.4 + random() * 3
        }
        return
    }

    switch (flyer.mode) {
        case "away": {
            const fromLeft = random() < 0.5
            flyer.x = fromLeft ? -8 : 108
            flyer.y = 26 + random() * 52
            flyer.tx = fromLeft ? 20 + random() * 30 : 50 + random() * 30
            flyer.ty = 26 + random() * 48
            flyer.mode = "enter"
            flyer.timer = 3 + random() * 3
            flyer.alpha = 0
            return
        }
        case "enter":
        case "flee":
        case "curious":
        case "inspect":
            flyer.mode = "wander"
            flyer.tx = 12 + random() * 76
            flyer.ty = 22 + random() * 56
            flyer.timer = 2.6 + random() * 4
            return
        case "leave":
            flyer.mode = "away"
            flyer.timer = 4 + random() * 14
            flyer.alpha = 0
            return
        default: {
            // a wandering butterfly eventually drifts off and the slot recycles
            if (random() < 0.18) {
                flyer.mode = "leave"
                flyer.tx = random() < 0.5 ? -12 : 112
                flyer.ty = 16 + random() * 40
                flyer.timer = 5 + random() * 4
                return
            }
            flyer.mode = "wander"
            flyer.tx = 12 + random() * 76
            flyer.ty = 22 + random() * 56
            flyer.timer = 2.6 + random() * 4
            void config
        }
    }
}

/** Fresh variant and depth when a butterfly slot comes back into play. */
function recycle(state: LifeState, flyer: Flyer, index: number, variants: number): void {
    const random = rngFor(state.seed + 419, index + state.ran + state.tick)
    flyer.variant = variants > 0 ? Math.floor(random() * variants) % variants : 0
    flyer.depth = Math.round((0.25 + random() * 0.7) * 100) / 100
    flyer.drift = random() * Math.PI * 2
}

export interface Pointer {
    x: number
    y: number
    /** false when the pointer is outside the scene or the device has no hover */
    live: boolean
}

const AWAY: Pointer = { x: -999, y: -999, live: false }

/**
 * One simulation step. `dt` is seconds; the caller clamps it so a backgrounded
 * tab cannot deliver a single enormous frame.
 */
/** Bees hold back at first, then ease up to speed rather than darting off. */
const BEE_WAIT = 1.6
const SETTLE = 3.2

function warmth(state: LifeState, bee: boolean): number {
    const since = state.age - (bee ? BEE_WAIT : 0)
    if (since <= 0) return 0
    const t = Math.min(1, since / SETTLE)
    return t * t * (3 - 2 * t)
}

export function stepLife(
    state: LifeState,
    dt: number,
    config: LifeConfig,
    pointer: Pointer = AWAY,
): void {
    state.tick += 1
    state.age += dt

    stepEvents(state, dt, config)

    const curious = config.curious && pointer.live ? curiousSlot(state, config) : -1

    for (let index = 0; index < state.flyers.length; index += 1) {
        const flyer = state.flyers[index]

        if (flyer.held) continue

        flyer.timer -= dt
        if (flyer.timer <= 0) retarget(state, flyer, index, config)

        if (flyer.mode === "away") {
            flyer.alpha = 0
            continue
        }

        // fade in on entry and out on exit, so nothing pops
        const bee = flyer.kind === "bee"
        const held = bee && state.age < BEE_WAIT
        const wanted = flyer.mode === "leave" || held ? 0 : 1
        flyer.alpha += (wanted - flyer.alpha) * Math.min(1, dt * (held ? 4 : 1.6))

        steer(state, flyer, index, dt, config, pointer, index === curious)
    }
}

/** At most one butterfly plays the curious game, and only while it wanders. */
function curiousSlot(state: LifeState, config: LifeConfig): number {
    const slot = config.bees + ((state.tick >> 9) % Math.max(1, config.butterflies))
    const flyer = state.flyers[slot]
    if (!flyer || flyer.kind !== "butterfly") return -1
    if (flyer.mode !== "wander" && flyer.mode !== "curious") return -1
    return slot
}

function steer(
    state: LifeState,
    flyer: Flyer,
    index: number,
    dt: number,
    config: LifeConfig,
    pointer: Pointer,
    curious: boolean,
): void {
    const bee = flyer.kind === "bee"
    const base = bee ? 6.4 : 5
    // foreground creatures read as faster because they are nearer, and nobody
    // is at full speed until the scene has settled
    let top = base * (0.7 + flyer.depth * 0.6) * (0.25 + warmth(state, bee) * 0.75)

    let tx = flyer.tx
    let ty = flyer.ty

    if (pointer.live && (config.avoid || curious)) {
        const dx = flyer.x - pointer.x
        const dy = flyer.y - pointer.y
        const near = Math.hypot(dx, dy)
        const radius = config.interactionRadius

        if (curious && near > radius * 0.55 && near < radius * 3.4) {
            // loosely orbit rather than home in, so it never reads as a follower
            const around = state.tick * 0.02 + flyer.drift
            tx = pointer.x + Math.cos(around) * radius * 1.15
            ty = pointer.y + Math.sin(around) * radius * 0.8
            if (flyer.mode === "wander") flyer.mode = "curious"
        } else if (config.avoid && near < radius && near > 0.001) {
            // squared falloff: barely a nudge at the rim, a real dash up close
            const push = (1 - near / radius) ** 2
            const weight = 0.45 + flyer.depth * 0.9
            tx = flyer.x + (dx / near) * radius * push * 2.4 * weight
            ty = flyer.y + (dy / near) * radius * push * 2.4 * weight
            top *= 1 + push * 1.9

            if (push > 0.35 && flyer.mode !== "leave") {
                flyer.mode = "flee"
                flyer.timer = Math.max(flyer.timer, 1.1)
            }
        }
    }

    // a slow perpendicular wobble is what keeps the path curved rather than straight
    flyer.drift += dt * (bee ? 1.1 : 0.9)
    const wobble = Math.sin(flyer.drift) * (bee ? 2.2 : 6.2)

    const dx = tx - flyer.x
    const dy = ty - flyer.y
    const span = Math.hypot(dx, dy) || 1

    const wantX = (dx / span) * top + Math.cos(flyer.drift * 0.7) * wobble * 0.28
    const wantY = (dy / span) * top + Math.sin(flyer.drift) * wobble * 0.22

    // hovering bees hold station instead of pressing on
    const grip = flyer.mode === "inspect" ? 0.6 : bee ? 1.9 : 1.5
    const ease = Math.min(1, dt * grip)

    flyer.vx += (wantX - flyer.vx) * ease
    flyer.vy += (wantY - flyer.vy) * ease

    flyer.x += flyer.vx * dt
    flyer.y += flyer.vy * dt

    if (flyer.mode !== "leave" && flyer.mode !== "enter") {
        flyer.x = clamp(flyer.x, -6, 106)
        flyer.y = clamp(flyer.y, bee ? 40 : 8, bee ? 96 : 92)
    }

    const speed = Math.hypot(flyer.vx, flyer.vy)
    if (speed > 0.4) {
        const want = Math.atan2(flyer.vy, flyer.vx)
        let turn = want - flyer.heading
        while (turn > Math.PI) turn -= Math.PI * 2
        while (turn < -Math.PI) turn += Math.PI * 2
        flyer.heading += turn * Math.min(1, dt * 4)
    }

    /*
     * Facing only follows real travel. A bee holding station over a flower has a
     * `vx` that wanders either side of zero, and turning to face each of those
     * is the twitch — so hovering keeps whatever direction it arrived with, and
     * a genuine turn eases across rather than snapping.
     */
    if (flyer.mode !== "inspect" && speed > 1.8) {
        const want = flyer.vx > 0 ? 1 : -1
        if (Math.abs(flyer.vx) > speed * 0.35) {
            flyer.face += (want - flyer.face) * Math.min(1, dt * 3)
        }
    }

    flyer.phase += dt * (bee ? 15 : 6.5) * (1 + speed * 0.05)

    if (flyer.mode === "leave" && (flyer.x < -10 || flyer.x > 110)) {
        flyer.mode = "away"
        flyer.timer = 4 + rngFor(state.seed + 55, index + state.tick)() * 14
        flyer.alpha = 0
        recycle(state, flyer, index, flyer.kind === "bee" ? 5 : 6)
    }
    void config
}

/* ------------------------------------------------------------------ events */

function candidates(state: LifeState, config: LifeConfig): EventName[] {
    const list: EventName[] = []
    const bees = state.flyers.some((flyer) => flyer.kind === "bee")
    const flying = state.flyers.some(
        (flyer) => flyer.kind === "butterfly" && flyer.mode !== "away" && !flyer.held,
    )

    if (config.night) {
        list.push("shootingStar", "fireflyGather")
        if (flying) list.push("ufoAbduction")
    } else {
        if (bees) list.push("beeGather")
        if (flying) list.push("butterflyLand")
    }

    return list
}

function stepEvents(state: LifeState, dt: number, config: LifeConfig): void {
    if (state.event) {
        state.event.age += dt
        if (state.event.age >= state.event.span) {
            endEvent(state)
            state.countdown = EVENT_GAP[config.pace]
        }
        return
    }

    if (!config.events) return

    state.countdown -= dt
    if (state.countdown > 0) return

    const options = candidates(state, config)
    if (options.length === 0) {
        state.countdown = 4
        return
    }

    const random = rngFor(state.seed + 991, state.ran)
    beginEvent(state, options[Math.floor(random() * options.length) % options.length], config)
}

/**
 * A pose for a scene that will never run a frame. Butterflies wait offscreen by
 * default, so reduced motion has to bring them in and spread everything out or
 * the meadow reads as empty.
 */
export function settleLife(state: LifeState): void {
    const flying = state.flyers.filter((flyer) => flyer.kind === "butterfly")

    state.flyers.forEach((flyer, index) => {
        const random = rngFor(state.seed + 601, index)
        flyer.held = false
        flyer.vx = 0
        flyer.vy = 0
        flyer.alpha = 1

        if (flyer.kind === "bee") {
            flyer.mode = "inspect"
            const anchor = state.anchors[index % Math.max(1, state.anchors.length)]
            flyer.x = anchor ? anchor.x + (random() - 0.5) * 10 : 20 + random() * 60
            flyer.y = (anchor ? anchor.y : 76) - 5 - random() * 8
            return
        }

        // spread them over the sky rather than stacking them in one corner
        const slot = flying.indexOf(flyer)
        const share = flying.length > 1 ? slot / (flying.length - 1) : 0.5
        flyer.mode = "wander"
        flyer.x = Math.round((12 + share * 74 + (random() - 0.5) * 8) * 10) / 10
        flyer.y = Math.round((24 + random() * 46) * 10) / 10
        flyer.heading = random() < 0.5 ? 0 : Math.PI
        flyer.drift = random() * Math.PI * 2
    })
}

export function beginEvent(state: LifeState, name: EventName, config: LifeConfig): boolean {
    if (state.event) return false

    const random = rngFor(state.seed + 313, state.ran)
    let subject = -1

    if (name === "ufoAbduction" || name === "butterflyLand") {
        subject = state.flyers.findIndex(
            (flyer) => flyer.kind === "butterfly" && flyer.mode !== "away" && !flyer.held,
        )
        if (subject === -1) return false
    }

    const anchor = state.anchors[Math.floor(random() * Math.max(1, state.anchors.length))] ?? {
        x: 50,
        y: 78,
    }

    const event: ActiveEvent = {
        name,
        age: 0,
        span: EVENT_SPAN[name],
        x: name === "shootingStar" ? 12 + random() * 60 : anchor.x,
        y: name === "shootingStar" ? 6 + random() * 22 : anchor.y,
        subject,
    }

    if (name === "ufoAbduction") {
        const flyer = state.flyers[subject]
        event.x = clamp(flyer.x, 18, 82)
        event.y = 20
        flyer.held = true
    }

    if (name === "butterflyLand") {
        const flyer = state.flyers[subject]
        flyer.mode = "inspect"
        flyer.tx = anchor.x
        flyer.ty = anchor.y - 6
        flyer.timer = event.span
    }

    if (name === "beeGather") {
        for (const flyer of state.flyers) {
            if (flyer.kind !== "bee") continue
            flyer.mode = "wander"
            flyer.tx = anchor.x + (rngFor(state.seed, state.ran + flyer.drift * 10)() - 0.5) * 14
            flyer.ty = anchor.y - 4
            flyer.timer = event.span
        }
    }

    state.event = event
    void config
    return true
}

/** Every event has to give its flyer back, whatever ended it. */
export function endEvent(state: LifeState): void {
    const event = state.event
    if (!event) return

    if (event.subject >= 0) {
        const flyer = state.flyers[event.subject]
        if (flyer) {
            flyer.held = false
            if (event.name === "ufoAbduction") {
                // taken, not deleted: the slot re-enters as a new butterfly
                flyer.mode = "away"
                flyer.timer = 6 + rngFor(state.seed + 77, state.ran)() * 10
                flyer.alpha = 0
                flyer.vx = 0
                flyer.vy = 0
                recycle(state, flyer, event.subject, 6)
            } else {
                flyer.timer = 0
            }
        }
    }

    state.event = null
    state.ran += 1
}

/** Where the beam has dragged the captive, 0 at the flower and 1 inside the UFO. */
export function abductionLift(event: ActiveEvent): number {
    const t = event.age / event.span
    if (t < 0.28) return 0
    if (t > 0.78) return 1
    return (t - 0.28) / 0.5
}
