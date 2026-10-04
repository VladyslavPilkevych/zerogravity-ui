import { rngFor } from "./rng"

/**
 * A seeded noise tile, rendered once and handed back as a data URI. Grain that
 * repeats a small tile costs one paint; grain from a live turbulence filter
 * costs one every frame, and at this size nobody can tell them apart.
 */
export interface GrainOptions {
    size?: number
    seed?: number
    /** 0 monochrome, 1 fully coloured speckle */
    colour?: number
}

export function noiseTile(canvas: HTMLCanvasElement, options: GrainOptions = {}): string | null {
    const size = Math.max(8, Math.min(256, Math.round(options.size ?? 128)))
    const seed = options.seed ?? 1
    const colour = Math.max(0, Math.min(1, options.colour ?? 0))

    canvas.width = size
    canvas.height = size

    let context: CanvasRenderingContext2D | null = null
    try {
        context = canvas.getContext("2d")
    } catch {
        return null
    }
    if (!context) return null

    const image = context.createImageData(size, size)
    const data = image.data
    const random = rngFor(seed, size)

    for (let index = 0; index < data.length; index += 4) {
        const base = random() * 255
        data[index] = base + (random() - 0.5) * 255 * colour
        data[index + 1] = base + (random() - 0.5) * 255 * colour
        data[index + 2] = base + (random() - 0.5) * 255 * colour
        data[index + 3] = 255
    }

    context.putImageData(image, 0, 0)

    try {
        return canvas.toDataURL("image/png")
    } catch {
        return null
    }
}
