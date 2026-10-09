import { bayer4, clamp, quantize } from "../../internal"

export interface SpectrumScene {
    /** where the light enters, 0..1 in the slab's own box */
    x: number
    y: number
    /** how far the slab leans on each axis, -1..1 */
    leanX: number
    leanY: number
    dispersion: number
    sheen: number
    /** cell edge in CSS px */
    cell: number
    /** how loud every layer is, 0 to 2; 1 is the reference picture */
    gain?: number
}

export type SpectrumTarget = Pick<
    CanvasRenderingContext2D,
    "setTransform" | "clearRect" | "fillRect" | "fillStyle" | "globalAlpha"
>

export const SPECTRUM = ["#ff3b5c", "#ff9f1c", "#ffe53b", "#3bff8a", "#29c7ff", "#8a5bff"]

const WARM_EDGE = "#ff2f78"
const COOL_EDGE = "#28dcff"
const WHITE = "#ffffff"
const FACET = 7
const BEAM_ANGLE = (24 * Math.PI) / 180
const MAX_CELLS = 9000

export function cellSize(width: number, height: number, cell: number, dpr: number): number {
    let size = Math.max(1, Math.round(cell * dpr))
    while ((width / size) * (height / size) > MAX_CELLS) size += 1
    return size
}

function facetLight(column: number, row: number, lightX: number, lightY: number): number {
    const u = (column + row) / FACET
    const v = (column - row) / FACET
    const fu = u - Math.floor(u) - 0.5
    const fv = v - Math.floor(v) - 0.5
    const along = Math.abs(fu) > Math.abs(fv)
    const sign = (along ? fu : fv) < 0 ? -1 : 1
    const normalX = sign * Math.SQRT1_2
    const normalY = (along ? sign : -sign) * Math.SQRT1_2
    return normalX * lightX + normalY * lightY
}

export function paintSpectrum(
    context: SpectrumTarget,
    width: number,
    height: number,
    dpr: number,
    scene: SpectrumScene,
): number {
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)

    const size = cellSize(width, height, scene.cell, dpr)
    const gap = size >= 6 * dpr ? Math.max(1, Math.round(dpr)) : 0
    const columns = Math.ceil(width / size)
    const rows = Math.ceil(height / size)
    const lightColumn = (scene.x * width) / size
    const lightRow = (scene.y * height) / size
    const sparkColumn = Math.floor(lightColumn)
    const sparkRow = Math.floor(lightRow)

    const headX = (0.5 - scene.x + Math.cos(BEAM_ANGLE) * 0.3) * columns
    const headY = (0.5 - scene.y + Math.sin(BEAM_ANGLE) * 0.3) * rows
    const headLength = Math.hypot(headX, headY) || 1
    const beamX = headX / headLength
    const beamY = headY / headLength
    const gain = clamp(scene.gain ?? 1, 0, 2)
    const reach = Math.max(columns, rows) * (0.55 + 0.25 * Math.min(gain, 1.6))
    const glow = reach * 0.45
    const spread = clamp(scene.dispersion, 0, 1)
    const sheen = clamp(scene.sheen, 0, 1)
    const arm = 1 + Math.round(sheen * 2)

    const leanLength = Math.hypot(scene.leanX, scene.leanY)
    const lightX = leanLength > 0.05 ? -scene.leanX / leanLength : -0.6
    const lightY = leanLength > 0.05 ? -scene.leanY / leanLength : -0.8

    const warmEdge = Math.round(spread * (1.5 + 3 * Math.max(0, scene.leanX)))
    const coolEdge = Math.round(spread * (1.5 + 3 * Math.max(0, -scene.leanX)))

    let drawn = 0
    const fill = (column: number, row: number, color: string, alpha: number) => {
        const level = Math.min(1, alpha * gain)
        if (level <= 0) return
        context.globalAlpha = level
        context.fillStyle = color
        context.fillRect(column * size, row * size, size - gap, size - gap)
        drawn += 1
    }

    for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
            const threshold = bayer4(column, row)

            const dx = column + 0.5 - lightColumn
            const dy = row + 0.5 - lightRow

            if (sheen > 0) {
                const near = 1 - Math.hypot(dx, dy) / glow
                if (near > threshold && facetLight(column, row, lightX, lightY) > 0.35) {
                    fill(column, row, WHITE, (0.04 + 0.08 * quantize(near, 2)) * sheen)
                }
            }

            if (column < warmEdge && 1 - column / warmEdge > threshold) {
                fill(column, row, WARM_EDGE, 0.15 + 0.45 * spread)
            }
            const fromRight = columns - 1 - column
            if (fromRight < coolEdge && 1 - fromRight / coolEdge > threshold) {
                fill(column, row, COOL_EDGE, 0.15 + 0.45 * spread)
            }

            const along = dx * beamX + dy * beamY
            const across = dy * beamX - dx * beamY

            if (along >= 0 && along < reach) {
                const fade = 1 - along / reach
                const band = spread * (0.4 + along * 0.09)
                if (fade > threshold * 0.85) {
                    if (band >= 0.34) {
                        const half = band * 3
                        if (Math.abs(across) < half) {
                            const index = clamp(Math.floor((across + half) / band), 0, 5)
                            fill(column, row, SPECTRUM[index], 0.18 + 0.42 * quantize(fade, 3))
                        }
                    } else if (Math.abs(across) < 0.75) {
                        fill(column, row, WHITE, 0.15 + 0.4 * quantize(fade, 3))
                    }
                }
            } else if (along < 0 && along > -reach * 0.5 && Math.abs(across) < 0.75) {
                const fade = 1 + along / (reach * 0.5)
                if (fade > threshold) fill(column, row, WHITE, 0.32 * sheen * quantize(fade, 2))
            }

            if (sheen > 0) {
                const offsetX = Math.abs(column - sparkColumn)
                const offsetY = Math.abs(row - sparkRow)
                const onArm = (offsetX === 0 && offsetY <= arm) || (offsetY === 0 && offsetX <= arm)
                if (onArm) {
                    const reachShare = (offsetX + offsetY) / (arm + 1)
                    fill(column, row, WHITE, sheen * (0.95 - 0.6 * quantize(reachShare, 2)))
                } else if (offsetX === 1 && offsetY === 1) {
                    fill(column, row, WHITE, 0.3 * sheen)
                }
            }
        }
    }

    context.globalAlpha = 1
    return drawn
}
