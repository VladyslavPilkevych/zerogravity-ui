import { bayer4, quantize } from "../internal"

export type DitherOrigin = "pointer" | "center" | "left" | "right" | "top" | "bottom"

export interface DitherGrid {
    cols: number
    rows: number
    cell: number
    keys: Float32Array
    rest: Float32Array
    tint: Uint8Array
}

export const BAND = 0.22
export const JITTER = 0.34
const PEAK = 0.8

export function restAlpha(order: number, density: number, depth: number): number {
    const local = density * (0.3 + 0.7 * quantize(depth, 3))
    if (order >= local) return 0
    return order < local * 0.4 ? 0.28 : 0.12
}

export function makeGrid(
    width: number,
    height: number,
    cell: number,
    density: number,
    colors: number,
): DitherGrid {
    const size = Math.max(2, Math.round(cell))
    const cols = Math.max(1, Math.ceil(width / size))
    const rows = Math.max(1, Math.ceil(height / size))
    const count = cols * rows
    const rest = new Float32Array(count)
    const tint = new Uint8Array(count)

    for (let row = 0; row < rows; row += 1) {
        const depth = rows > 1 ? row / (rows - 1) : 1
        for (let col = 0; col < cols; col += 1) {
            const i = row * cols + col
            rest[i] = restAlpha(bayer4(col, row), density, depth)
            tint[i] =
                colors > 1
                    ? ((Math.imul(col + 1, 73856093) ^ Math.imul(row + 1, 19349663)) >>> 0) % colors
                    : 0
        }
    }

    return { cols, rows, cell: size, keys: new Float32Array(count), rest, tint }
}

export function aim(grid: DitherGrid, origin: DitherOrigin, x: number, y: number): void {
    const { cols, rows, cell, keys } = grid
    const width = cols * cell
    const height = rows * cell
    const across = origin === "left" || origin === "right"
    const down = origin === "top" || origin === "bottom"
    const ox = origin === "left" ? 0 : origin === "right" ? width : x
    const oy = origin === "top" ? 0 : origin === "bottom" ? height : y
    const reach = across
        ? width
        : down
          ? height
          : Math.hypot(Math.max(ox, width - ox), Math.max(oy, height - oy))

    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const cx = (col + 0.5) * cell
            const cy = (row + 0.5) * cell
            const d = across
                ? Math.abs(cx - ox)
                : down
                  ? Math.abs(cy - oy)
                  : Math.hypot(cx - ox, cy - oy)
            keys[row * cols + col] =
                Math.min(d / Math.max(reach, 1), 1) * (1 - JITTER) + bayer4(col, row) * JITTER
        }
    }
}

export function cellAlpha(key: number, rest: number, level: number): number {
    if (key > level) return 0
    const age = (level - key) / BAND
    if (age >= 1) return rest
    return quantize(PEAK + (rest - PEAK) * age, 5)
}

export function paint(
    context: CanvasRenderingContext2D,
    grid: DitherGrid,
    level: number,
    colors: readonly string[],
    dpr: number,
): void {
    const { cols, rows, cell, keys, rest, tint } = grid
    context.clearRect(0, 0, Math.ceil(cols * cell * dpr), Math.ceil(rows * cell * dpr))
    if (level <= 0) return

    const gap = Math.max(1, Math.round(cell * dpr * 0.14))
    let last = -1

    for (let row = 0; row < rows; row += 1) {
        const y = Math.round(row * cell * dpr)
        const h = Math.round((row + 1) * cell * dpr) - y - gap
        for (let col = 0; col < cols; col += 1) {
            const i = row * cols + col
            const alpha = cellAlpha(keys[i], rest[i], level)
            if (alpha <= 0) continue
            if (tint[i] !== last) {
                context.fillStyle = colors[tint[i]] ?? colors[0]
                last = tint[i]
            }
            context.globalAlpha = alpha
            const x = Math.round(col * cell * dpr)
            context.fillRect(x, y, Math.round((col + 1) * cell * dpr) - x - gap, h)
        }
    }

    context.globalAlpha = 1
}
