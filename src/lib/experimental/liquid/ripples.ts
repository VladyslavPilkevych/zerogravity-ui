/**
 * The wave field both liquid components run on. A fixed pool of expanding
 * ripples, fed by pointer movement, sampled either as a mask (Undertow) or as
 * light and displacement (Wake).
 *
 * Pure and time-driven: nothing here touches the DOM or a clock, so a test can
 * step it frame by frame.
 */

export interface Ripple {
    /** normalised 0..1 across the surface */
    x: number
    y: number
    /** seconds since the field started, when this one was struck */
    born: number
    /** 0..1, how hard the pointer was moving */
    power: number
    /** its own phase, so two ripples never wobble alike */
    seed: number
    live: boolean
}

export interface RippleField {
    drops: Ripple[]
    /** seconds since the field started */
    now: number
    /** where the pointer was last seen, normalised */
    px: number
    py: number
    /** how fast it was moving, 0..1, eased */
    speed: number
    /** true while the pointer is over the surface */
    over: boolean
    /** next slot to recycle */
    head: number
    /** distance travelled since the last ripple was struck */
    travel: number
}

export interface RippleSettings {
    /** how far a ripple reaches, as a share of the surface */
    radius: number
    /** how long one takes to fade out, in seconds */
    life: number
    /** how far apart, in surface widths, ripples are struck along a drag */
    spacing: number
}

export const RIPPLE_DEFAULTS: RippleSettings = { radius: 0.28, life: 1.5, spacing: 0.035 }

export const RIPPLE_CAPACITY = 24

export function createField(capacity = RIPPLE_CAPACITY): RippleField {
    return {
        drops: Array.from({ length: capacity }, (_, index) => ({
            x: 0.5,
            y: 0.5,
            born: -999,
            power: 0,
            seed: (index * 0.618) % 1,
            live: false,
        })),
        now: 0,
        px: 0.5,
        py: 0.5,
        speed: 0,
        over: false,
        head: 0,
        travel: 0,
    }
}

/** Recycles the oldest slot, so the pool never grows. */
export function strike(field: RippleField, x: number, y: number, power: number): Ripple {
    const drop = field.drops[field.head]
    field.head = (field.head + 1) % field.drops.length

    drop.x = x
    drop.y = y
    drop.born = field.now
    drop.power = Math.max(0, Math.min(1, power))
    drop.live = true

    return drop
}

/**
 * Pointer movement, in normalised surface coordinates. Ripples are struck by
 * distance rather than by event, so a fast flick and a slow drag leave the same
 * spacing — only the power differs.
 */
export function trace(
    field: RippleField,
    x: number,
    y: number,
    dt: number,
    settings: RippleSettings,
): void {
    const dx = x - field.px
    const dy = y - field.py
    const step = Math.hypot(dx, dy)

    const rate = dt > 0 ? step / dt : 0
    field.speed += (Math.min(1, rate / 1.6) - field.speed) * Math.min(1, dt * 8)

    field.px = x
    field.py = y
    field.over = true
    field.travel += step

    if (field.travel >= settings.spacing) {
        field.travel = 0
        strike(field, x, y, 0.35 + field.speed * 0.65)
    }
}

export function stepField(field: RippleField, dt: number, settings: RippleSettings): void {
    field.now += dt

    if (!field.over) field.speed += (0 - field.speed) * Math.min(1, dt * 3)

    for (const drop of field.drops) {
        if (!drop.live) continue
        if (field.now - drop.born > settings.life) drop.live = false
    }
}

/** 0 at birth, 1 when spent. */
export function age(field: RippleField, drop: Ripple, settings: RippleSettings): number {
    return Math.max(0, Math.min(1, (field.now - drop.born) / settings.life))
}

/**
 * A ripple's outline at a given angle. Two harmonics off the ripple's own seed
 * turn the circle into something that reads as liquid rather than as a lens,
 * and the wobble relaxes as the ring spreads.
 */
export function edgeAt(
    drop: Ripple,
    angle: number,
    reach: number,
    wobble: number,
    life: number,
): number {
    const phase = drop.seed * Math.PI * 2
    const ease = 1 - life
    const ring =
        Math.sin(angle * 3 + phase + life * 4) * 0.6 + Math.sin(angle * 5 - phase * 2) * 0.4

    return reach * (1 + ring * wobble * ease)
}

/** How much energy the field carries right now, 0..1. Drives Wake's warp. */
export function energy(field: RippleField, settings: RippleSettings): number {
    let total = 0

    for (const drop of field.drops) {
        if (!drop.live) continue
        const life = age(field, drop, settings)
        total += drop.power * (1 - life) * (1 - life)
    }

    return Math.min(1, total / 4)
}

export function liveCount(field: RippleField): number {
    let count = 0
    for (const drop of field.drops) if (drop.live) count += 1
    return count
}

/**
 * `cover` geometry for a source of `sw`x`sh` inside a `w`x`h` box, so two
 * images drawn through it land on exactly the same pixels.
 */
export function coverBox(
    sw: number,
    sh: number,
    w: number,
    h: number,
    ax = 0.5,
    ay = 0.5,
): { x: number; y: number; w: number; h: number } {
    if (sw <= 0 || sh <= 0) return { x: 0, y: 0, w, h }

    const scale = Math.max(w / sw, h / sh)
    const drawn = { w: sw * scale, h: sh * scale }

    return { x: (w - drawn.w) * ax, y: (h - drawn.h) * ay, w: drawn.w, h: drawn.h }
}
