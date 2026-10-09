import { bayer4, clamp, quantize } from "../internal"

export interface SheetScene {
    /** where the sheet is pressed, 0..1 in its own box */
    x: number
    y: number
    /** how far it is pressed in, 0..1 */
    press: number
    dent: number
    sheen: number
    /** cell edge in CSS px */
    cell: number
    shadow: string
    light: string
}

export type SheetTarget = Pick<
    CanvasRenderingContext2D,
    "setTransform" | "clearRect" | "fillRect" | "fillStyle" | "globalAlpha"
>

const LIGHT_X = -0.55
const LIGHT_Y = -0.65
const STEPS = 3
const PEAK_SLOPE = 1.54
const MAX_CELLS = 6000

export function sheetCell(width: number, height: number, cell: number, dpr: number): number {
    let size = Math.max(2, Math.round(cell * dpr))
    while ((width / size) * (height / size) > MAX_CELLS) size += 1
    return size
}

/**
 * The stepped light on one cell of a dented sheet, -1 (deepest shadow) to 1
 * (brightest catch), and how far the cell is pulled toward the dent, in cells.
 */
export function shadeAt(
    dx: number,
    dy: number,
    reach: number,
    press: number,
): { shade: number; pull: number; depth: number } {
    const distance = Math.hypot(dx, dy)
    if (press <= 0 || distance >= reach) return { shade: 0, pull: 0, depth: 0 }

    const q = 1 - (distance / reach) ** 2
    const slope = (4 * q) / (reach * reach)
    const facing = (-(dx * slope) * LIGHT_X - dy * slope * LIGHT_Y) * (reach / PEAK_SLOPE)
    const raw = clamp(facing * press, -1, 1)
    const shade = Math.sign(raw) * quantize(Math.abs(raw), STEPS)

    return { shade, pull: q * q * press, depth: q * q * press }
}

export function paintSheet(
    context: SheetTarget,
    width: number,
    height: number,
    dpr: number,
    scene: SheetScene,
): void {
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)

    const size = sheetCell(width, height, scene.cell, dpr)
    const gap = Math.max(1, Math.round(dpr))
    const columns = Math.ceil(width / size)
    const rows = Math.ceil(height / size)
    const pressColumn = (scene.x * width) / size
    const pressRow = (scene.y * height) / size
    const reach = Math.max(3, (columns + rows) * 0.14)
    const press = clamp(scene.press, 0, 1)
    const dent = clamp(scene.dent, 0, 1)
    const sheen = clamp(scene.sheen, 0, 1)
    const tile = size - gap

    for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
            const dx = column + 0.5 - pressColumn
            const dy = row + 0.5 - pressRow
            const { shade, pull, depth } = shadeAt(dx, dy, reach, press)
            const distance = Math.hypot(dx, dy) || 1
            const shift = pull * size * (0.5 + dent)
            const left = column * size - Math.round((dx / distance) * shift)
            const top = row * size - Math.round((dy / distance) * shift)

            context.fillStyle = scene.light
            context.globalAlpha = 0.04
            context.fillRect(left, top, tile, tile)

            if (shade < 0) {
                context.fillStyle = scene.shadow
                context.globalAlpha = -shade * (0.2 + 0.6 * dent)
                context.fillRect(left, top, tile, tile)
            } else if (shade > 0 && sheen > 0) {
                context.fillStyle = scene.light
                context.globalAlpha = shade >= 1 ? 0.35 + 0.55 * sheen : shade * (0.1 + 0.4 * sheen)
                context.fillRect(left, top, tile, tile)
            }

            if (depth * dent * 1.6 > bayer4(column, row)) {
                context.fillStyle = scene.shadow
                context.globalAlpha = 0.25
                context.fillRect(left, top, tile, tile)
            }
        }
    }

    context.globalAlpha = 1
}
