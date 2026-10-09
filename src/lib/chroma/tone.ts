import { context2d } from "../internal"
import { resolveColor } from "../pointer-fx/colors"

export type Rgb = [number, number, number]

/**
 * Any CSS colour as sRGB channels. Hex is read directly; everything else is
 * rasterised by a 1px canvas, which already understands every colour syntax
 * the browser does. A value the canvas rejects keeps the fallback.
 */
export function toRgb(value: string, fallback: Rgb, element?: Element | null): Rgb {
    const raw = resolveColor(value, element)
    const hex = parseHex(raw)
    if (hex) return hex
    if (typeof document === "undefined") return fallback

    const probe = context2d(document.createElement("canvas"), { willReadFrequently: true })
    if (!probe) return fallback

    probe.fillStyle = `rgb(${fallback.join(",")})`
    probe.fillStyle = raw
    probe.clearRect(0, 0, 1, 1)
    probe.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
    return a === 0 ? fallback : [r, g, b]
}

function parseHex(value: string): Rgb | null {
    const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value)
    if (!hex) return null
    const digits =
        hex[1].length === 3
            ? hex[1]
                  .split("")
                  .map((d) => d + d)
                  .join("")
            : hex[1]
    return [
        parseInt(digits.slice(0, 2), 16),
        parseInt(digits.slice(2, 4), 16),
        parseInt(digits.slice(4, 6), 16),
    ]
}
