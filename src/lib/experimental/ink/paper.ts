import { rngFor } from "../../internal"

/**
 * A sheet of paper at low resolution, and the ink moving through it.
 *
 * Water diffuses between neighbouring cells through a conductance that is
 * higher along the fibres, and a dry cell only takes water once a neighbour
 * holds more than the cell's own capillary threshold, so the wet front stalls
 * in some places and runs along fibres in others: that is the feathering.
 * Dye rides the water and is left behind wherever water evaporates. Cells on
 * the edge of the wet patch evaporate faster, which pulls water, and the dye
 * in it, out to the rim: that is the dark tide line. The heavy pigment of the
 * stroke itself sinks in where it was laid and barely moves.
 *
 * Every buffer is allocated once, in `createPaper`; nothing in a step allocates.
 */
export interface Paper {
    readonly width: number
    readonly height: number
    /** conductance to the right and to the lower neighbour */
    readonly ex: Float32Array
    readonly ey: Float32Array
    /** how much water a neighbour must hold before this dry cell wets */
    readonly threshold: Float32Array
    /** 0..1 surface texture, for granulation */
    readonly tooth: Float32Array
    /** how hard the edge of the wet patch dries here; fibres hold their water */
    readonly exposure: Float32Array
    water: Float32Array
    dye: Float32Array
    nextWater: Float32Array
    nextDye: Float32Array
    /** what has dried into the paper for good */
    readonly stain: Float32Array
    /** water still held in the stroke, soaking out over time */
    readonly reservoir: Float32Array
    /** heavy pigment still sinking into the stroke */
    readonly core: Float32Array
    /** working space for shaping a stroke and softening a frame */
    readonly scratch: Float32Array
    readonly spare: Float32Array
    /** x0, y0, x1, y1 of the cells that can change, inclusive; empty when x1 < x0 */
    readonly box: Int32Array
    /** the same for every cell ink has ever reached since the last wipe */
    readonly inked: Int32Array
    /** water lost per step by a wet cell, before the rim adds to it */
    readonly evaporation: number
    /** cells holding water after the last step */
    wet: number
}

export interface PaperGrain {
    seed: number
    /** 0..1, how readily fibres carry water ahead of the front */
    feather: number
    /**
     * Size of a cell relative to the reference the constants were tuned at.
     * Pulp, fibres and drying are scaled by it, so a finer sheet looks the same,
     * only sharper, given proportionally more steps (see `stepsFor`).
     */
    scale?: number
}

/** Steps per second of soak that keep the look the same at any cell scale. */
export function stepsFor(scale: number, base: number): number {
    return base / (scale * scale)
}

export interface InkFlow {
    /** dye speed relative to water, 0..1 */
    mobility: number
    /** extra evaporation on the edge of the wet patch, which darkens it */
    rim: number
    /** fraction of each reservoir released per step */
    release: number
    /** fraction of the stroke's heavy pigment that sinks in per step */
    sink: number
    /** dye carried per unit of water */
    tint: number
}

/** Hard ceilings, so a nib held in one place pools but never overflows. */
export const WATER_CAP = 4
export const DYE_CAP = 4

const CONDUCTANCE = 0.16
const CONDUCTANCE_CAP = 0.24
const EVAPORATION = 0.003
const DRY = 0.012
/** half the water at which a pair of cells conducts freely */
const SATURATION = 1 / 1.6

export function createPaper(width: number, height: number, grain: PaperGrain): Paper {
    const w = Math.max(4, Math.floor(width))
    const h = Math.max(4, Math.floor(height))
    const n = w * h
    const feather = grain.feather < 0 ? 0 : grain.feather > 1 ? 1 : grain.feather
    const k = Math.max(0.25, Math.min(4, grain.scale ?? 1))

    // two octaves of value noise: the pulp is denser in some places
    const pulp = new Float32Array(n)
    addNoise(pulp, w, h, 40 / k, 0.5, rngFor(grain.seed, 1))
    addNoise(pulp, w, h, 12 / k, 0.32, rngFor(grain.seed, 2))
    addNoise(pulp, w, h, Math.max(2, 3 / k), 0.18, rngFor(grain.seed, 4))

    // fibres: curved threads, rasterised 4-connected so water can follow them
    const fibre = new Float32Array(n)
    const random = rngFor(grain.seed, 3)
    const count = Math.round(n * 0.02 * k * k)
    for (let f = 0; f < count; f += 1) {
        let x = random() * w
        let y = random() * h
        let angle = random() * Math.PI * 2
        const length = (6 + random() * random() * 70) / k
        const strength = 0.35 + random() * 0.65
        let px = x | 0
        let py = y | 0
        for (let s = 0; s < length; s += 1) {
            const cx = x | 0
            const cy = y | 0
            if (cx < 0 || cy < 0 || cx >= w || cy >= h) break
            // a diagonal step also takes the cell between, so the path is unbroken
            if (cx !== px && cy !== py) {
                const k = py * w + cx
                fibre[k] = Math.max(fibre[k], strength)
            }
            const i = cy * w + cx
            fibre[i] = Math.max(fibre[i], strength)
            px = cx
            py = cy
            angle += (random() - 0.5) * 0.3
            x += Math.cos(angle) * 0.9
            y += Math.sin(angle) * 0.9
        }
    }

    const reach = 0.3 + feather * 2.2
    const perm = new Float32Array(n)
    for (let i = 0; i < n; i += 1)
        perm[i] = (0.12 + 1.3 * pulp[i] * pulp[i]) * (1 + reach * fibre[i])

    const ex = new Float32Array(n)
    const ey = new Float32Array(n)
    const threshold = new Float32Array(n)
    const tooth = new Float32Array(n)
    const exposure = new Float32Array(n)
    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const i = y * w + x
            const r = x + 1 < w ? i + 1 : i
            const d = y + 1 < h ? i + w : i
            ex[i] = Math.min(CONDUCTANCE_CAP, CONDUCTANCE * Math.min(perm[i], perm[r]))
            ey[i] = Math.min(CONDUCTANCE_CAP, CONDUCTANCE * Math.min(perm[i], perm[d]))
            threshold[i] = Math.max(0.05, 0.9 + 4.75 * (0.5 - pulp[i]) - feather * 2 * fibre[i])
            tooth[i] = Math.min(1, 0.8 * pulp[i] + 0.2 * fibre[i])
            exposure[i] = 1 - 0.85 * feather * fibre[i]
        }
    }

    return {
        width: w,
        height: h,
        ex,
        ey,
        threshold,
        tooth,
        exposure,
        water: new Float32Array(n),
        dye: new Float32Array(n),
        nextWater: new Float32Array(n),
        nextDye: new Float32Array(n),
        stain: new Float32Array(n),
        reservoir: new Float32Array(n),
        core: new Float32Array(n),
        scratch: new Float32Array(n),
        spare: new Float32Array(n),
        box: Int32Array.of(w, h, -1, -1),
        inked: Int32Array.of(w, h, -1, -1),
        evaporation: EVAPORATION * k * k,
        wet: 0,
    }
}

/** Blank paper again, keeping the fibres. */
export function wipe(paper: Paper): void {
    paper.water.fill(0)
    paper.dye.fill(0)
    paper.nextWater.fill(0)
    paper.nextDye.fill(0)
    paper.stain.fill(0)
    paper.reservoir.fill(0)
    paper.core.fill(0)
    empty(paper)
    paper.inked[0] = paper.width
    paper.inked[1] = paper.height
    paper.inked[2] = -1
    paper.inked[3] = -1
}

function empty(paper: Paper): void {
    paper.box[0] = paper.width
    paper.box[1] = paper.height
    paper.box[2] = -1
    paper.box[3] = -1
    paper.wet = 0
}

function grow(paper: Paper, x0: number, y0: number, x1: number, y1: number): void {
    const box = paper.box
    box[0] = Math.max(1, Math.min(box[0], x0))
    box[1] = Math.max(1, Math.min(box[1], y0))
    box[2] = Math.min(paper.width - 2, Math.max(box[2], x1))
    box[3] = Math.min(paper.height - 2, Math.max(box[3], y1))
    reach(paper)
}

/** Widens the inked region to take in the current box. */
function reach(paper: Paper): void {
    const { box, inked } = paper
    if (box[2] < box[0]) return
    if (box[0] < inked[0]) inked[0] = box[0]
    if (box[1] < inked[1]) inked[1] = box[1]
    if (box[2] > inked[2]) inked[2] = box[2]
    if (box[3] > inked[3]) inked[3] = box[3]
}

export interface Charge {
    /** water laid down at once */
    water: number
    /** water held back and soaked out over the reveal */
    held: number
    /** heavy pigment that sinks in where it lands */
    core: number
    /** dye per unit of water */
    tint: number
}

/**
 * A wet stroke from a mask the size of the paper (RGBA; alpha is the ink).
 * The mask is softened and re-cut against the paper's tooth, so the letter's
 * own edge is already ragged where the fibres caught it, and a little heavier
 * along the edge, where a nib leaves more ink.
 */
export function soak(paper: Paper, mask: Uint8ClampedArray, charge: Charge): void {
    const { width: w, height: h, scratch, tooth } = paper
    for (let i = 0; i < scratch.length; i += 1) scratch[i] = mask[i * 4 + 3] / 255
    blur(scratch, paper.spare, w, h)
    blur(scratch, paper.spare, w, h)

    let x0 = w
    let y0 = h
    let x1 = -1
    let y1 = -1
    for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
            const i = y * w + x
            const soft = scratch[i]
            if (soft < 0.02) continue
            const cut = soft + (tooth[i] - 0.5) * 0.45
            const a =
                cut <= 0.3
                    ? 0
                    : cut >= 0.6
                      ? 1
                      : ((cut - 0.3) / 0.3) ** 2 * (3 - 2 * ((cut - 0.3) / 0.3))
            const wetting = Math.max(a, soft * 0.6)
            const water = Math.min(WATER_CAP - paper.water[i], wetting * charge.water)
            paper.water[i] += water
            paper.dye[i] = Math.min(DYE_CAP, paper.dye[i] + water * charge.tint)
            paper.reservoir[i] = Math.min(WATER_CAP, paper.reservoir[i] + wetting * charge.held)
            const rim = 1 + 0.6 * (1 - soft)
            paper.core[i] = Math.min(DYE_CAP, paper.core[i] + a * rim * charge.core)
            if (x < x0) x0 = x
            if (y < y0) y0 = y
            if (x > x1) x1 = x
            if (y > y1) y1 = y
        }
    }
    if (x1 >= 0) grow(paper, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
}

/** 3×3 box blur in place, through a buffer of the same size. */
function blur(field: Float32Array, temp: Float32Array, w: number, h: number): void {
    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const i = y * w + x
            const l = x > 0 ? field[i - 1] : field[i]
            const r = x < w - 1 ? field[i + 1] : field[i]
            temp[i] = (l + field[i] + r) / 3
        }
    }
    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const i = y * w + x
            const u = y > 0 ? temp[i - w] : temp[i]
            const d = y < h - 1 ? temp[i + w] : temp[i]
            field[i] = (u + temp[i] + d) / 3
        }
    }
}

/** A round touch of the nib at a cell position, soft at the edge, capped. */
export function dab(paper: Paper, cx: number, cy: number, radius: number, charge: Charge): void {
    const { width: w, height: h } = paper
    const r = Math.max(0.75, radius)
    const x0 = Math.max(1, Math.floor(cx - r))
    const y0 = Math.max(1, Math.floor(cy - r))
    const x1 = Math.min(w - 2, Math.ceil(cx + r))
    const y1 = Math.min(h - 2, Math.ceil(cy + r))
    if (x1 < x0 || y1 < y0) return
    for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
            const dx = x - cx
            const dy = y - cy
            const d = (dx * dx + dy * dy) / (r * r)
            if (d >= 1) continue
            const i = y * w + x
            const k = 1 - d
            const water = Math.max(0, Math.min(WATER_CAP - paper.water[i], charge.water * k))
            paper.water[i] += water
            paper.dye[i] = Math.min(DYE_CAP, paper.dye[i] + water * charge.tint)
            paper.reservoir[i] = Math.min(WATER_CAP, paper.reservoir[i] + charge.held * k)
            paper.core[i] = Math.min(DYE_CAP, paper.core[i] + charge.core * k)
        }
    }
    grow(paper, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
}

/** One step of flow, evaporation and settling. Returns how many cells are wet. */
export function step(paper: Paper, flow: InkFlow): number {
    const { width: w, ex, ey, threshold, exposure, stain, reservoir, core, box } = paper
    const water = paper.water
    const dye = paper.dye
    const nextWater = paper.nextWater
    const nextDye = paper.nextDye
    const x0 = box[0]
    const y0 = box[1]
    const x1 = box[2]
    const y1 = box[3]
    if (x1 < x0 || y1 < y0) {
        paper.wet = 0
        return 0
    }

    const mobility = flow.mobility
    const rim = flow.rim * 0.25
    const release = flow.release
    const sinking = flow.sink
    const evaporation = paper.evaporation
    const tint = flow.tint
    let wet = 0
    let nx0 = paper.width
    let ny0 = paper.height
    let nx1 = -1
    let ny1 = -1

    for (let y = y0; y <= y1; y += 1) {
        let i = y * w + x0
        for (let x = x0; x <= x1; x += 1, i += 1) {
            const wi = water[i]
            const l = i - 1
            const r = i + 1
            const u = i - w
            const d = i + w
            const wl = water[l]
            const wr = water[r]
            const wu = water[u]
            const wd = water[d]
            const pi = dye[i]

            if (wi === 0 && wl === 0 && wr === 0 && wu === 0 && wd === 0) {
                nextWater[i] = 0
                nextDye[i] = pi
                continue
            }

            const ti = threshold[i]
            const ci = wi > 0 ? (pi / wi) * mobility : 0
            let dw = 0
            let dp = 0
            let dry = 0
            let f = 0
            let delta = 0

            // each edge is gated the same way from both sides, so water is conserved
            delta = wl - wi
            if (wl === 0) dry += 1
            if (delta > 0) {
                if (wi > 0 || wl > ti) {
                    f = ex[l] * delta * wetness(wi + wl)
                    dw += f
                    dp += f * (dye[l] / wl) * mobility
                }
            } else if (delta < 0 && (wl > 0 || wi > threshold[l])) {
                f = ex[l] * delta * wetness(wi + wl)
                dw += f
                dp += f * ci
            }

            delta = wr - wi
            if (wr === 0) dry += 1
            if (delta > 0) {
                if (wi > 0 || wr > ti) {
                    f = ex[i] * delta * wetness(wi + wr)
                    dw += f
                    dp += f * (dye[r] / wr) * mobility
                }
            } else if (delta < 0 && (wr > 0 || wi > threshold[r])) {
                f = ex[i] * delta * wetness(wi + wr)
                dw += f
                dp += f * ci
            }

            delta = wu - wi
            if (wu === 0) dry += 1
            if (delta > 0) {
                if (wi > 0 || wu > ti) {
                    f = ey[u] * delta * wetness(wi + wu)
                    dw += f
                    dp += f * (dye[u] / wu) * mobility
                }
            } else if (delta < 0 && (wu > 0 || wi > threshold[u])) {
                f = ey[u] * delta * wetness(wi + wu)
                dw += f
                dp += f * ci
            }

            delta = wd - wi
            if (wd === 0) dry += 1
            if (delta > 0) {
                if (wi > 0 || wd > ti) {
                    f = ey[i] * delta * wetness(wi + wd)
                    dw += f
                    dp += f * (dye[d] / wd) * mobility
                }
            } else if (delta < 0 && (wd > 0 || wi > threshold[d])) {
                f = ey[i] * delta * wetness(wi + wd)
                dw += f
                dp += f * ci
            }

            let nw = wi + dw
            let np = pi + dp

            const held = reservoir[i]
            if (held > 0 && nw < WATER_CAP) {
                // a full cell takes nothing more until it drains
                const out = Math.min(held > 0.004 ? held * release : held, WATER_CAP - nw)
                reservoir[i] = held - out
                nw += out
                np += out * tint
            }

            const heavy = core[i]
            if (heavy > 0) {
                const sink = heavy > 0.004 ? heavy * sinking : heavy
                core[i] = heavy - sink
                stain[i] += sink
            }

            if (nw > 0) {
                // the rim dries first and the interior refills it; whatever
                // water leaves, it leaves its share of dye behind
                const loss = evaporation * (1 + rim * dry * exposure[i])
                const share = loss >= nw ? 1 : loss / nw
                const settle = np * share
                stain[i] += settle
                np -= settle
                nw -= loss
            }

            if (nw <= DRY && dw <= 0 && reservoir[i] === 0 && core[i] === 0) {
                if (np > 0) stain[i] += np
                nw = 0
                np = 0
            } else {
                if (nw < DRY) nw = DRY
                wet += 1
                if (x < nx0) nx0 = x
                if (y < ny0) ny0 = y
                if (x > nx1) nx1 = x
                if (y > ny1) ny1 = y
            }

            nextWater[i] = nw
            nextDye[i] = np < 0 ? 0 : np > DYE_CAP ? DYE_CAP : np
        }
    }

    paper.water = nextWater
    paper.nextWater = water
    paper.dye = nextDye
    paper.nextDye = dye

    if (wet === 0) {
        empty(paper)
    } else {
        box[0] = Math.max(1, nx0 - 1)
        box[1] = Math.max(1, ny0 - 1)
        box[2] = Math.min(paper.width - 2, nx1 + 1)
        box[3] = Math.min(paper.height - 2, ny1 + 1)
        paper.wet = wet
        reach(paper)
    }

    // outside the box both buffers must agree, so the cells it just let go of
    // are copied across before the stale buffer is read again
    for (let y = y0; y <= y1; y += 1) {
        const inside = y >= box[1] && y <= box[3]
        for (let x = x0, i = y * w + x0; x <= x1; x += 1, i += 1) {
            if (inside && x >= box[0] && x <= box[2]) continue
            water[i] = nextWater[i]
            dye[i] = nextDye[i]
        }
    }

    return wet
}

/** Lets whatever is still wet dry where it lies. */
export function dryOut(paper: Paper): void {
    const { water, dye, stain, reservoir, core, nextWater, nextDye } = paper
    for (let i = 0; i < water.length; i += 1) {
        if (water[i] === 0 && dye[i] === 0 && core[i] === 0 && reservoir[i] === 0) continue
        stain[i] += dye[i] + core[i] + reservoir[i] * 0.5
        water[i] = 0
        dye[i] = 0
        nextWater[i] = 0
        nextDye[i] = 0
        reservoir[i] = 0
        core[i] = 0
    }
    empty(paper)
}

/**
 * The ink as RGBA at paper resolution. Optical density follows Beer–Lambert,
 * so overlapping ink darkens without clipping flat; the paper's tooth breaks
 * it up a little, and wet ink reads a shade darker than dry. The result is
 * softened by a cell and its faintest fringe cut away, which turns the grid's
 * stair-steps into a smooth edge once it is scaled up.
 */
export function paint(
    paper: Paper,
    out: Uint8ClampedArray,
    rgb: readonly [number, number, number],
    density: number,
): void {
    const { width: w, height: h, water, dye, stain, tooth, scratch, spare, inked } = paper
    if (inked[2] < inked[0]) return
    // only the inked part of the sheet, plus a margin for the blur
    const x0 = Math.max(0, inked[0] - 2)
    const y0 = Math.max(0, inked[1] - 2)
    const x1 = Math.min(w - 1, inked[2] + 2)
    const y1 = Math.min(h - 1, inked[3] + 2)

    for (let y = y0; y <= y1; y += 1) {
        for (let x = x0, i = y * w + x0; x <= x1; x += 1, i += 1) {
            const amount = stain[i] + dye[i]
            const wet = water[i]
            if (amount === 0 && wet === 0) {
                scratch[i] = 0
                continue
            }
            let a = 1 - Math.exp(-amount * density * (0.8 + 0.4 * tooth[i]))
            if (wet > 0) a += (1 - a) * Math.min(0.08, wet * 0.05)
            scratch[i] = a
        }
    }

    soften(scratch, spare, w, x0, y0, x1, y1, 0.5)

    const [r, g, b] = rgb
    for (let y = y0; y <= y1; y += 1) {
        for (let x = x0, i = y * w + x0, o = i * 4; x <= x1; x += 1, i += 1, o += 4) {
            let a = scratch[i]
            // the faintest fringe is cut, which keeps the scaled-up edge crisp
            if (a < 0.1) a = a < 0.03 ? 0 : ((a - 0.03) / 0.07) * a
            out[o] = r
            out[o + 1] = g
            out[o + 2] = b
            out[o + 3] = a * 255
        }
    }
}

/**
 * A separable [1 2 1] blur over a region, in place, mixed back over the
 * original by `amount`. Edges of the region repeat, which is harmless because
 * the region's margin holds no ink.
 */
function soften(
    field: Float32Array,
    temp: Float32Array,
    w: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    amount: number,
): void {
    for (let y = y0; y <= y1; y += 1) {
        for (let x = x0, i = y * w + x0; x <= x1; x += 1, i += 1) {
            const l = x > x0 ? field[i - 1] : field[i]
            const r = x < x1 ? field[i + 1] : field[i]
            temp[i] = (l + 2 * field[i] + r) / 4
        }
    }
    const keep = 1 - amount
    for (let y = y0; y <= y1; y += 1) {
        const up = y > y0 ? -w : 0
        const down = y < y1 ? w : 0
        for (let x = x0, i = y * w + x0; x <= x1; x += 1, i += 1) {
            const blurred = (temp[i + up] + 2 * temp[i] + temp[i + down]) / 4
            field[i] = field[i] * keep + blurred * amount
        }
    }
}

/**
 * Damp paper conducts, nearly dry paper barely does: flow scales with how
 * saturated the pair is, which keeps the front from going soft.
 */
function wetness(pair: number): number {
    const s = pair * SATURATION
    return s >= 1 ? 1 : s
}

function addNoise(
    into: Float32Array,
    w: number,
    h: number,
    cell: number,
    weight: number,
    random: () => number,
): void {
    const gw = Math.ceil(w / cell) + 2
    const gh = Math.ceil(h / cell) + 2
    const lattice = new Float32Array(gw * gh)
    for (let i = 0; i < lattice.length; i += 1) lattice[i] = random()
    for (let y = 0; y < h; y += 1) {
        const fy = y / cell
        const iy = fy | 0
        let ty = fy - iy
        ty = ty * ty * (3 - 2 * ty)
        for (let x = 0; x < w; x += 1) {
            const fx = x / cell
            const ix = fx | 0
            let tx = fx - ix
            tx = tx * tx * (3 - 2 * tx)
            const a = lattice[iy * gw + ix]
            const b = lattice[iy * gw + ix + 1]
            const c = lattice[(iy + 1) * gw + ix]
            const d = lattice[(iy + 1) * gw + ix + 1]
            into[y * w + x] += weight * (a + (b - a) * tx + (c - a + (d - c - b + a) * tx) * ty)
        }
    }
}
