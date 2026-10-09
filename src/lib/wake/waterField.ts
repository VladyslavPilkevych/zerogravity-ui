/**
 * A height field run through the discrete wave equation, plus the procedural
 * surfaces it refracts. Pure: typed arrays in, typed arrays out, no DOM.
 */
export interface Water {
    cols: number
    rows: number
    current: Float32Array
    previous: Float32Array
    /** the largest absolute height left by the last step */
    peak: number
}

export type WakeSurface = "tiles" | "grid" | "checker"

export type Rgb = readonly [number, number, number]

export interface Palette {
    deep: Rgb
    shallow: Rgb
    line: Rgb
}

const HEIGHT_CAP = 3

export function createWater(cols: number, rows: number): Water {
    const water: Water = {
        cols: 0,
        rows: 0,
        current: new Float32Array(0),
        previous: new Float32Array(0),
        peak: 0,
    }
    sizeWater(water, cols, rows)
    return water
}

/** Reallocates only when the size actually changes. Returns whether it did. */
export function sizeWater(water: Water, cols: number, rows: number): boolean {
    const c = Math.max(3, Math.floor(cols))
    const r = Math.max(3, Math.floor(rows))
    if (c === water.cols && r === water.rows) return false
    water.cols = c
    water.rows = r
    water.current = new Float32Array(c * r)
    water.previous = new Float32Array(c * r)
    water.peak = 0
    return true
}

export function clearWater(water: Water): void {
    water.current.fill(0)
    water.previous.fill(0)
    water.peak = 0
}

/** One step of `next = (n + s + e + w) / 2 - prev`, damped. Edges stay at rest. */
export function stepWater(water: Water, damping: number): number {
    const { cols, rows, current, previous } = water
    let peak = 0

    for (let y = 1; y < rows - 1; y += 1) {
        const row = y * cols
        for (let x = 1; x < cols - 1; x += 1) {
            const i = row + x
            const v =
                ((current[i - 1] + current[i + 1] + current[i - cols] + current[i + cols]) * 0.5 -
                    previous[i]) *
                damping
            previous[i] = v
            const a = v < 0 ? -v : v
            if (a > peak) peak = a
        }
    }

    water.previous = current
    water.current = previous
    water.peak = peak
    return peak
}

/** A smooth cosine bump of `radius` cells centred on (x, y), in cell units. */
export function stamp(water: Water, x: number, y: number, radius: number, amount: number): void {
    const { cols, rows, current } = water
    const r = Math.max(1, radius)
    const x0 = Math.max(1, Math.floor(x - r))
    const x1 = Math.min(cols - 2, Math.ceil(x + r))
    const y0 = Math.max(1, Math.floor(y - r))
    const y1 = Math.min(rows - 2, Math.ceil(y + r))
    const inv = Math.PI / r

    for (let cy = y0; cy <= y1; cy += 1) {
        const dy = cy - y
        for (let cx = x0; cx <= x1; cx += 1) {
            const dx = cx - x
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d >= r) continue
            const i = cy * cols + cx
            const v = current[i] + amount * 0.5 * (1 + Math.cos(d * inv))
            current[i] = v > HEIGHT_CAP ? HEIGHT_CAP : v < -HEIGHT_CAP ? -HEIGHT_CAP : v
        }
    }
    if (Math.abs(amount) > water.peak) water.peak = Math.abs(amount)
}

/**
 * Stamps from (x0, y0) to (x1, y1) at most half a radius apart, so a fast
 * stroke leaves a continuous wake rather than a row of dots. Returns the count.
 */
export function stampSegment(
    water: Water,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    radius: number,
    amount: number,
): number {
    const length = Math.hypot(x1 - x0, y1 - y0)
    const spacing = Math.max(0.5, radius * 0.5)
    const count = Math.max(1, Math.ceil(length / spacing))
    const share = amount / Math.max(1, (radius * 2) / spacing)

    for (let index = 1; index <= count; index += 1) {
        const t = index / count
        stamp(water, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, radius, share)
    }
    return count
}

export function waterEnergy(water: Water): number {
    const { current, previous } = water
    let sum = 0
    for (let i = 0; i < current.length; i += 1) {
        const h = current[i]
        const v = h - previous[i]
        sum += h * h + v * v
    }
    return sum
}

/**
 * Refracts `texture` through the field into `out`, both RGBA at field size.
 * `bend` is the texture offset in cells per unit of slope, `light` how much a
 * slope facing the upper left brightens.
 */
/** One RGBA buffer seen as bytes and as whole pixels, made once per size. */
export interface Pixels {
    bytes: Uint8ClampedArray
    words: Uint32Array
}

export function pixels(bytes: Uint8ClampedArray): Pixels {
    return { bytes, words: new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.length >> 2) }
}

export function shade(
    water: Water,
    source: Pixels,
    target: Pixels,
    bend: number,
    light: number,
): void {
    const { cols, rows, current } = water
    const words = source.words
    const into = target.words
    const maxX = cols - 1
    const maxY = rows - 1
    const flat = 0.02 / Math.max(bend, light * 300, 1e-6)

    for (let y = 0; y < rows; y += 1) {
        const row = y * cols
        for (let x = 0; x < cols; x += 1) {
            const i = row + x

            if (x === 0 || y === 0 || x === maxX || y === maxY) {
                into[i] = words[i]
                continue
            }

            const dx = current[i - 1] - current[i + 1]
            const dy = current[i - cols] - current[i + cols]

            if ((dx < 0 ? -dx : dx) + (dy < 0 ? -dy : dy) < flat) {
                into[i] = words[i]
                continue
            }

            let fx = x + dx * bend
            let fy = y + dy * bend
            fx = fx < 0 ? 0 : fx > maxX - 1 ? maxX - 1 : fx
            fy = fy < 0 ? 0 : fy > maxY - 1 ? maxY - 1 : fy
            const qx = (fx * 256) | 0
            const qy = (fy * 256) | 0
            const ax = qx & 255
            const ay = qy & 255
            const w00 = (256 - ax) * (256 - ay)
            const w10 = ax * (256 - ay)
            const w01 = (256 - ax) * ay
            const w11 = ax * ay
            const j = (qy >> 8) * cols + (qx >> 8)
            const p00 = words[j]
            const p10 = words[j + 1]
            const p01 = words[j + cols]
            const p11 = words[j + cols + 1]

            const facing = (dx + dy) * light
            const glint = (facing > 0 ? facing * 150 + facing * facing * 900 : facing * 90) | 0

            // pixels are packed little-endian, ABGR from the high byte down
            let r =
                (((p00 & 255) * w00 + (p10 & 255) * w10 + (p01 & 255) * w01 + (p11 & 255) * w11) >>
                    16) +
                glint
            let g =
                ((((p00 >> 8) & 255) * w00 +
                    ((p10 >> 8) & 255) * w10 +
                    ((p01 >> 8) & 255) * w01 +
                    ((p11 >> 8) & 255) * w11) >>
                    16) +
                glint
            let b =
                ((((p00 >> 16) & 255) * w00 +
                    ((p10 >> 16) & 255) * w10 +
                    ((p01 >> 16) & 255) * w01 +
                    ((p11 >> 16) & 255) * w11) >>
                    16) +
                glint
            r = r < 0 ? 0 : r > 255 ? 255 : r
            g = g < 0 ? 0 : g > 255 ? 255 : g
            b = b < 0 ? 0 : b > 255 ? 255 : b
            into[i] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0
        }
    }
}

function hash(x: number, y: number): number {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263)
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function put(out: Uint8ClampedArray, o: number, r: number, g: number, b: number): void {
    out[o] = r
    out[o + 1] = g
    out[o + 2] = b
    out[o + 3] = 255
}

/**
 * Draws one of the built-in surfaces into `out` (RGBA, `cols` × `rows`), with
 * `pitch` cells between lines or tiles.
 */
export function paintSurface(
    out: Uint8ClampedArray,
    cols: number,
    rows: number,
    surface: WakeSurface,
    palette: Palette,
    pitch: number,
): void {
    const { deep, shallow, line } = palette
    const p = Math.max(3, Math.round(pitch))

    for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
            const t = Math.min(1, (x / cols) * 0.35 + (y / rows) * 0.65)
            let r = deep[0] + (shallow[0] - deep[0]) * t
            let g = deep[1] + (shallow[1] - deep[1]) * t
            let b = deep[2] + (shallow[2] - deep[2]) * t
            const o = (y * cols + x) * 4
            const u = x % p
            const v = y % p

            if (surface === "grid") {
                const major = x % (p * 4) === 0 || y % (p * 4) === 0
                const minor = u === 0 || v === 0
                const a = major ? 0.85 : minor ? 0.4 : 0
                r += (line[0] - r) * a
                g += (line[1] - g) * a
                b += (line[2] - b) * a
            } else if (surface === "checker") {
                const odd = (Math.floor(x / p) + Math.floor(y / p)) % 2 === 1
                const a = odd ? 0.32 : 0
                r += (line[0] - r) * a
                g += (line[1] - g) * a
                b += (line[2] - b) * a
            } else {
                const tx = Math.floor(x / p)
                const ty = Math.floor(y / p)
                if (u === 0 || v === 0) {
                    r += (line[0] - r) * 0.7
                    g += (line[1] - g) * 0.7
                    b += (line[2] - b) * 0.7
                } else {
                    const lift = (hash(tx, ty) - 0.5) * 0.16
                    const edge = u === 1 || v === 1 ? 0.14 : u === p - 1 || v === p - 1 ? -0.12 : 0
                    const k = 1 + lift + edge
                    r *= k
                    g *= k
                    b *= k
                }
            }

            put(out, o, r, g, b)
        }
    }
}

/** `#rgb`, `#rrggbb` or `rgb(a)(…)` as a triple, or null. */
export function parseRgb(value: string): Rgb | null {
    const text = value.trim()
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)
    if (hex) {
        const h = hex[1]
        const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h
        return [
            Number.parseInt(full.slice(0, 2), 16),
            Number.parseInt(full.slice(2, 4), 16),
            Number.parseInt(full.slice(4, 6), 16),
        ]
    }
    const fn = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(text)
    if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])]
    return null
}
