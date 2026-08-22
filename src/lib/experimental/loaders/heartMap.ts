/** Classic 11 x 10 pixel heart. `#` is a filled pixel. */
const HEART = [
    "..##...##..",
    ".####.####.",
    "###########",
    "###########",
    "###########",
    ".#########.",
    "..#######..",
    "...#####...",
    "....###....",
    ".....#.....",
] as const

export interface HeartPixel {
    col: number
    row: number
    /** 0 at the core, 1 at the furthest pixel, used to stagger the ripple */
    reach: number
}

export const HEART_COLS = HEART[0].length
export const HEART_ROWS = HEART.length

function build(): HeartPixel[] {
    const core = { col: (HEART_COLS - 1) / 2, row: 2.6 }
    const raw: { col: number; row: number; span: number }[] = []

    HEART.forEach((line, row) => {
        Array.from(line).forEach((mark, col) => {
            if (mark !== "#") return
            raw.push({ col, row, span: Math.hypot(col - core.col, (row - core.row) * 1.15) })
        })
    })

    const far = Math.max(...raw.map((pixel) => pixel.span)) || 1

    return raw.map((pixel) => ({
        col: pixel.col,
        row: pixel.row,
        reach: Math.round((pixel.span / far) * 1000) / 1000,
    }))
}

export const HEART_PIXELS: readonly HeartPixel[] = build()
