import { cssUrl } from "../internal"

export type StencilFill =
    | "zebra"
    | "leopard"
    | "stripes"
    | "checker"
    | "dots"
    | "grid"
    | "gradient"
    | "rainbow"
    | "image"
    | "custom"

export interface PatternInput {
    fill: StencilFill
    colors: string[]
    scale: number
    angle: number
    image?: string
    background?: string
}

export interface PatternOutput {
    backgroundImage: string
    backgroundSize: string
    tile: number
}

function at(colors: string[], index: number, fallback: string): string {
    return colors[index] ?? fallback
}

export function buildPattern(input: PatternInput): PatternOutput {
    const { fill, colors, angle } = input
    const tile = Math.max(4, input.scale)
    const a = at(colors, 0, "#f5f5f5")
    const b = at(colors, 1, "#111111")
    const c = at(colors, 2, b)

    switch (fill) {
        case "stripes":
            return {
                backgroundImage: `repeating-linear-gradient(${angle}deg, ${a} 0 ${tile / 2}px, ${b} ${tile / 2}px ${tile}px)`,
                backgroundSize: "auto",
                tile,
            }

        case "zebra":
            return {
                backgroundImage: `repeating-linear-gradient(${angle}deg, ${a} 0 ${(tile * 0.2).toFixed(2)}px, ${b} ${(tile * 0.2).toFixed(2)}px ${(tile * 0.31).toFixed(2)}px, ${a} ${(tile * 0.31).toFixed(2)}px ${(tile * 0.39).toFixed(2)}px, ${b} ${(tile * 0.39).toFixed(2)}px ${(tile * 0.66).toFixed(2)}px, ${a} ${(tile * 0.66).toFixed(2)}px ${(tile * 0.75).toFixed(2)}px, ${b} ${(tile * 0.75).toFixed(2)}px ${tile}px)`,
                backgroundSize: "auto",
                tile,
            }

        case "leopard": {
            const spot = (x: number, y: number, r: number) =>
                `radial-gradient(circle at ${x}% ${y}%, ${c} 0 ${r}%, transparent ${r + 1}%), radial-gradient(circle at ${x}% ${y}%, transparent 0 ${r + 3}%, ${b} ${r + 4}% ${r + 11}%, transparent ${r + 12}%)`
            return {
                backgroundImage: [
                    spot(18, 22, 7),
                    spot(63, 14, 5),
                    spot(84, 47, 8),
                    spot(38, 55, 6),
                    spot(12, 78, 5),
                    spot(58, 82, 7),
                    `linear-gradient(${a}, ${a})`,
                ].join(", "),
                backgroundSize: `${tile}px ${tile}px`,
                tile,
            }
        }

        case "checker":
            return {
                backgroundImage: `conic-gradient(${b} 0 25%, ${a} 0 50%, ${b} 0 75%, ${a} 0)`,
                backgroundSize: `${tile}px ${tile}px`,
                tile,
            }

        case "dots":
            return {
                backgroundImage: `radial-gradient(circle at 50% 50%, ${b} 0 28%, transparent 29%), linear-gradient(${a}, ${a})`,
                backgroundSize: `${tile}px ${tile}px`,
                tile,
            }

        case "grid":
            return {
                backgroundImage: `repeating-linear-gradient(${angle}deg, ${b} 0 ${Math.max(1, tile * 0.08)}px, transparent ${Math.max(1, tile * 0.08)}px ${tile}px), repeating-linear-gradient(${angle + 90}deg, ${b} 0 ${Math.max(1, tile * 0.08)}px, transparent ${Math.max(1, tile * 0.08)}px ${tile}px), linear-gradient(${a}, ${a})`,
                backgroundSize: "auto",
                tile,
            }

        case "rainbow":
            return {
                backgroundImage: `linear-gradient(${angle}deg, #ff4d4d, #ffa64d, #ffe74d, #6bff4d, #4dd2ff, #7a4dff, #ff4dd2, #ff4d4d)`,
                backgroundSize: `${tile * 6}px 100%`,
                tile: tile * 6,
            }

        case "image":
            return {
                backgroundImage: cssUrl(input.image ?? ""),
                backgroundSize: "cover",
                tile,
            }

        case "custom":
            return {
                backgroundImage: input.background ?? `linear-gradient(${a}, ${b})`,
                backgroundSize: "auto",
                tile,
            }

        case "gradient":
        default:
            return {
                backgroundImage: `linear-gradient(${angle}deg, ${a}, ${b}, ${c})`,
                backgroundSize: `${tile * 6}px 100%`,
                tile: tile * 6,
            }
    }
}

export const FILL_DEFAULT_COLORS: Record<StencilFill, string[]> = {
    zebra: ["#f7f7f5", "#141414"],
    leopard: ["#e6a94a", "#2b1a08", "#c07a1e"],
    stripes: ["#ff4d6d", "#1b1b2f"],
    checker: ["#f5f5f5", "#111111"],
    dots: ["#ffe066", "#1b1b2f"],
    grid: ["#0b1020", "#6ea8fe"],
    gradient: ["#8ab4ff", "#c77dff", "#ff8fa3"],
    rainbow: [],
    image: [],
    custom: ["#8ab4ff", "#0b1020"],
}
