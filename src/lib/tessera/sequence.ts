export type TesseraSequence = "row" | "column" | "reverse" | "center" | "random"

export interface TesseraTile {
    cover: number
    reveal: number
}

const SEED = 0x2f6a5c1d

function mulberry32(seed: number): () => number {
    let a = seed >>> 0

    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function scrambleWeights(count: number, seed: number): number[] {
    const order = Array.from({ length: count }, (_, index) => index)
    const random = mulberry32(SEED + count + seed * 0x9e37)

    for (let i = count - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1))
        const swap = order[i]
        order[i] = order[j]
        order[j] = swap
    }

    const weights = new Array<number>(count)
    for (let rank = 0; rank < count; rank += 1) weights[order[rank]] = rank
    return weights
}

function normalize(weights: number[]): number[] {
    let min = Infinity
    let max = -Infinity

    for (const weight of weights) {
        if (weight < min) min = weight
        if (weight > max) max = weight
    }

    const span = max - min
    if (span <= 0) return weights.map(() => 0)
    return weights.map((weight) => (weight - min) / span)
}

export function delayFactors(
    rows: number,
    columns: number,
    sequence: TesseraSequence,
    seed = 0,
): readonly number[] {
    const count = rows * columns
    if (count <= 0) return []

    if (sequence === "random") return normalize(scrambleWeights(count, seed))

    const weights = new Array<number>(count)

    for (let index = 0; index < count; index += 1) {
        const column = index % columns
        const row = Math.floor(index / columns)

        if (sequence === "column") weights[index] = column * rows + row
        else if (sequence === "reverse") weights[index] = count - 1 - index
        else if (sequence === "center")
            weights[index] = Math.hypot(column - (columns - 1) / 2, row - (rows - 1) / 2)
        else weights[index] = index
    }

    return normalize(weights)
}

export function buildTiles(
    rows: number,
    columns: number,
    cover: TesseraSequence,
    reveal: TesseraSequence,
    seed = 0,
): readonly TesseraTile[] {
    const coverFactors = delayFactors(rows, columns, cover, seed)
    const revealFactors =
        reveal === cover ? coverFactors : delayFactors(rows, columns, reveal, seed)

    return coverFactors.map((factor, index) => ({
        cover: factor,
        reveal: revealFactors[index],
    }))
}
