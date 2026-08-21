export interface RasterCell {
    col: number
    row: number
    r: number
    g: number
    b: number
    /** perceptual luminance, 0 dark to 1 light */
    lum: number
}

export interface RasterGrid {
    cols: number
    rows: number
}

export const RASTER_GLYPH_SETS = {
    blocks: " ░▒▓█",
    ascii: " .:-=+*#%@",
    dots: " .·:•◦●",
    ink: " ,;/([#8&@",
} as const

export type RasterGlyphSet = keyof typeof RASTER_GLYPH_SETS

/**
 * Cells are `cell` tall and `cell * aspect` wide. Pixel mode wants square cells;
 * glyph mode passes the font's advance ratio so glyphs fill their cell without
 * being stretched.
 */
export function gridFor(width: number, height: number, cell: number, aspect = 1): RasterGrid {
    const size = Math.max(2, cell)
    const wide = Math.max(1, size * aspect)

    return {
        cols: Math.max(1, Math.round(width / wide)),
        rows: Math.max(1, Math.round(height / size)),
    }
}

export function cellsFrom(data: Uint8ClampedArray, cols: number, rows: number): RasterCell[] {
    const cells: RasterCell[] = []

    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const at = (row * cols + col) * 4
            const r = data[at] ?? 0
            const g = data[at + 1] ?? 0
            const b = data[at + 2] ?? 0

            cells.push({
                col,
                row,
                r,
                g,
                b,
                lum: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255,
            })
        }
    }

    return cells
}

/**
 * Gradient magnitude over the downsampled grid, so contours can pull denser
 * glyphs. Cheap: the grid is already tiny by the time this runs.
 */
export function edgeMap(cells: readonly RasterCell[], cols: number, rows: number): number[] {
    const at = (col: number, row: number) => {
        const x = Math.min(cols - 1, Math.max(0, col))
        const y = Math.min(rows - 1, Math.max(0, row))
        return cells[y * cols + x]?.lum ?? 0
    }

    return cells.map((cell) => {
        const dx = at(cell.col + 1, cell.row) - at(cell.col - 1, cell.row)
        const dy = at(cell.col, cell.row + 1) - at(cell.col, cell.row - 1)
        return Math.min(1, Math.hypot(dx, dy))
    })
}

function clamp(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value
}

/**
 * Sets run sparse to dense. The board is dark and the ink is light, so brighter
 * cells take denser glyphs; contours nudge a cell one step denser.
 */
export function glyphFor(lum: number, edge: number, set: string, contrast = 1): string {
    if (set.length === 0) return " "

    const lifted = clamp((clamp(lum) - 0.5) * contrast + 0.5)
    const weight = clamp(lifted + edge * 0.35)
    const index = Math.round(weight * (set.length - 1))

    return set[Math.min(set.length - 1, Math.max(0, index))]
}

/** Keeps glyph ink readable without washing out the source colour. */
export function inkFor(cell: RasterCell, lift = 1.25): string {
    const boost = (channel: number) => Math.round(Math.min(255, 40 + channel * lift))
    return `rgb(${boost(cell.r)},${boost(cell.g)},${boost(cell.b)})`
}

export function resolveGlyphs(set: string | RasterGlyphSet | undefined): string {
    if (!set) return RASTER_GLYPH_SETS.blocks
    if (set in RASTER_GLYPH_SETS) return RASTER_GLYPH_SETS[set as RasterGlyphSet]
    return set
}
