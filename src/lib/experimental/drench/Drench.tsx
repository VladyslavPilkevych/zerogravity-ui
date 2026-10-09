"use client"

import { useEffect, useRef, type CSSProperties, type ElementType } from "react"

import {
    context2d,
    cx,
    rngFor,
    fitCanvas,
    onResize,
    onVisible,
    useLatestRef,
    usePrefersReducedMotion,
    wakeLoop,
    type WakeLoop,
} from "../../internal"
import {
    createWorld,
    settled,
    step,
    DRIP_CAP,
    RAIN_CAP,
    SPLASH_CAP,
    TRAIL_CAP,
    type World,
} from "./sim"
import "./Drench.css"

export interface DrenchProps {
    /** the words the rain finds; kept in the DOM as real, selectable text */
    text: string
    /** the element the text is rendered as */
    as?: ElementType
    /** how hard it rains, 0 to 1; at 0 the loop stops once the glass is dry */
    rain?: number
    /** slant of the rain, -1 (to the left) to 1 (to the right) */
    wind?: number
    /** how fast the rain falls, 0.2 to 3 */
    fall?: number
    /** how much water a hit leaves on a letter, 0 to 1 */
    wetness?: number
    /** how quickly the letters dry and disappear again, 0 to 1 */
    evaporation?: number
    /** the tint of water standing on the letters */
    color?: string
    fontFamily?: string
    fontWeight?: number
    /** fixes every drop, bead and drip */
    seed?: number
    /** simulate this many frames (at 60 fps), draw once and hold */
    freezeAt?: number
    /** hold a still, soaked state with no falling rain */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** CSS pixels per water cell. Coarse enough to be cheap, fine enough to bead. */
const CELL = 2
const MAX_CELLS = 150_000
const STILL_FRAMES = 360
const SPRITE = 64

interface Rgb {
    r: number
    g: number
    b: number
}

function parseColor(probe: CanvasRenderingContext2D | null, color: string): Rgb {
    let value = color
    if (probe) {
        probe.fillStyle = "#9fd8ff"
        probe.fillStyle = color
        if (typeof probe.fillStyle === "string") value = probe.fillStyle
    }
    const hex = /^#([0-9a-f]{6})$/i.exec(value)
    if (hex) {
        const n = parseInt(hex[1], 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const rgb = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value)
    if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] }
    return { r: 159, g: 216, b: 255 }
}

/** A 3x3 blur over the inside cells only. */
function blur(from: Float32Array, to: Float32Array, order: Int32Array, cols: number): void {
    for (let k = 0; k < order.length; k += 1) {
        const i = order[k]
        to[i] =
            (from[i] * 4 +
                ((from[i - 1] || 0) +
                    (from[i + 1] || 0) +
                    (from[i - cols] || 0) +
                    (from[i + cols] || 0)) *
                    2 +
                (from[i - cols - 1] || 0) +
                (from[i - cols + 1] || 0) +
                (from[i + cols - 1] || 0) +
                (from[i + cols + 1] || 0)) /
            16
    }
}

function makeLayer(): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D | null } {
    const canvas = document.createElement("canvas")
    return { canvas, context: context2d(canvas) }
}

export function Drench({
    text,
    as: Tag = "p",
    rain = 0.6,
    wind = 0.12,
    fall = 1,
    wetness = 0.6,
    evaporation = 0.3,
    color = "#9fd8ff",
    fontFamily = "system-ui, sans-serif",
    fontWeight = 800,
    seed = 1,
    freezeAt,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: DrenchProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const textRef = useRef<HTMLElement>(null)
    const loopRef = useRef<WakeLoop | null>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const frozen = freezeAt === undefined ? null : Math.max(0, Math.round(freezeAt))

    const settings = useLatestRef({ rain, wind, fall, wetness, evaporation })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        const label = textRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        // full resolution: the crisp letter shape; then, cropped to the word,
        // its wet sheen and the composite of water through that shape
        const glyph = makeLayer()
        const sheen = makeLayer()
        const wet = makeLayer()
        // grid resolution: the water field and the mask it comes from
        const field = makeLayer()
        const maskLayer = document.createElement("canvas")
        const maskContext = context2d(maskLayer, { willReadFrequently: true })
        const sprite = makeLayer()
        if (!glyph.context || !sheen.context || !wet.context || !field.context) {
            return
        }

        const tint = parseColor(sprite.context, color)
        const trailTone = `rgb(${Math.round(150 + tint.r * 0.4)},${Math.round(165 + tint.g * 0.35)},${Math.round(180 + tint.b * 0.3)})`
        let world: World | null = null
        let fieldImage: ImageData | null = null
        let smooth = new Float32Array(0)
        let spare = new Float32Array(0)
        let width = 0
        let height = 0
        let dpr = 1
        // the word's box in device pixels, on the grid, where all compositing happens
        let boxX = 0
        let boxY = 0
        let boxW = 1
        let boxH = 1
        let measured = 0
        let seen = true
        let disposed = false

        const paintSprite = () => {
            const s = sprite.context
            sprite.canvas.width = SPRITE
            sprite.canvas.height = SPRITE
            if (!s) return
            const half = SPRITE / 2
            const { r, g, b } = tint
            // a bead on glass: clear in the middle, a dark refracted rim, a
            // caustic crescent underneath and one sharp highlight
            const body = s.createRadialGradient(half, half * 0.9, 0, half, half, half)
            body.addColorStop(0, `rgba(${r},${g},${b},0.22)`)
            body.addColorStop(0.62, `rgba(${r},${g},${b},0.38)`)
            body.addColorStop(0.86, "rgba(3,8,18,0.62)")
            body.addColorStop(1, "rgba(3,8,18,0)")
            s.fillStyle = body
            s.beginPath()
            s.arc(half, half, half, 0, Math.PI * 2)
            s.fill()

            s.strokeStyle = `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 40)},${Math.min(255, b + 20)},0.75)`
            s.lineWidth = SPRITE * 0.07
            s.beginPath()
            s.arc(half, half, half * 0.66, Math.PI * 0.2, Math.PI * 0.8)
            s.stroke()

            s.fillStyle = "rgba(255,255,255,0.95)"
            s.beginPath()
            s.arc(half * 0.68, half * 0.62, SPRITE * 0.085, 0, Math.PI * 2)
            s.fill()
        }

        const layoutText = (): {
            size: number
            x: number
            y: number
            left: number
            right: number
            top: number
            bottom: number
        } => {
            const g = glyph.context!
            const font = (size: number) => `${fontWeight} ${size}px ${fontFamily}`
            let size = 100 * dpr
            g.font = font(size)
            measured = g.measureText(text).width
            const probe = measured || size * text.length * 0.6
            size = Math.max(8 * dpr, Math.min(height * 0.56, (size * width * 0.86) / probe))
            g.font = font(size)
            const metrics = g.measureText(text)
            const textWidth = metrics.width || size * text.length * 0.6
            const ascent = metrics.actualBoundingBoxAscent || size * 0.72
            const descent = metrics.actualBoundingBoxDescent || 0
            // a little above centre: the drips need room underneath
            const x = (width - textWidth) / 2
            const y = Math.round(height * 0.46 + (ascent - descent) / 2)

            if (label) {
                const css = size / dpr
                const fontAscent = (metrics.fontBoundingBoxAscent || size * 0.9) / dpr
                const fontDescent = (metrics.fontBoundingBoxDescent || size * 0.22) / dpr
                const baseline = (css - (fontAscent + fontDescent)) / 2 + fontAscent
                label.style.fontSize = `${css}px`
                label.style.left = `${x / dpr}px`
                label.style.top = `${y / dpr - baseline}px`
                label.style.transform = "none"
            }
            return {
                size,
                x,
                y,
                left: x - (metrics.actualBoundingBoxLeft || 0),
                right: x + (metrics.actualBoundingBoxRight || textWidth),
                top: y - ascent,
                bottom: y + descent,
            }
        }

        const rebuild = () => {
            const surface = fitCanvas(canvas, host)
            width = surface.width
            height = surface.height
            dpr = surface.dpr
            glyph.canvas.width = width
            glyph.canvas.height = height

            let cell = CELL * dpr
            while ((width / cell) * (height / cell) > MAX_CELLS) cell *= 1.25
            const cols = Math.max(1, Math.ceil(width / cell))
            const rows = Math.max(1, Math.ceil(height / cell))

            const { size, x, y, left, right, top, bottom } = layoutText()
            const pad = cell * 3
            boxX = Math.max(0, Math.floor((left - pad) / cell) * cell)
            boxY = Math.max(0, Math.floor((top - pad) / cell) * cell)
            boxW = Math.max(cell, Math.min(width, Math.ceil((right + pad) / cell) * cell) - boxX)
            boxH = Math.max(cell, Math.min(height, Math.ceil((bottom + pad) / cell) * cell) - boxY)
            for (const layer of [sheen.canvas, wet.canvas]) {
                layer.width = boxW
                layer.height = boxH
            }
            const g = glyph.context!
            g.setTransform(1, 0, 0, 1, 0, 0)
            g.clearRect(0, 0, width, height)
            g.fillStyle = "#fff"
            g.textBaseline = "alphabetic"
            g.textAlign = "left"
            g.fillText(text, x, y)

            // the same word at grid scale, read back once for the water model
            const mask = new Uint8Array(cols * rows)
            maskLayer.width = cols
            maskLayer.height = rows
            if (maskContext) {
                maskContext.setTransform(1 / cell, 0, 0, 1 / cell, 0, 0)
                maskContext.clearRect(0, 0, width, height)
                maskContext.fillStyle = "#fff"
                maskContext.textBaseline = "alphabetic"
                maskContext.textAlign = "left"
                maskContext.font = `${fontWeight} ${size}px ${fontFamily}`
                maskContext.fillText(text, x, y)
                try {
                    const alpha = maskContext.getImageData(0, 0, cols, rows).data
                    if (alpha.length === cols * rows * 4) {
                        for (let i = 0; i < mask.length; i += 1)
                            mask[i] = alpha[i * 4 + 3] > 110 ? 1 : 0
                    }
                } catch {
                    // a tainted or missing canvas just leaves nothing to wet
                }
            }

            buildSheen()

            field.canvas.width = cols
            field.canvas.height = rows
            fieldImage = field.context!.createImageData(cols, rows)
            smooth = new Float32Array(cols * rows)
            spare = new Float32Array(cols * rows)
            world = createWorld(width, height, cell, dpr, cols, rows, mask, seed)
        }

        /**
         * Everything about wet glass that does not move: light on the upper
         * edges, a meniscus along the lower ones, and a seeded scatter of tiny
         * beads. It only ever shows where the water is.
         */
        const buildSheen = () => {
            const r = sheen.context!
            const temp = wet.context!
            const thin = 1.2 * dpr
            const band = 3 * dpr
            const stamp = (target: CanvasRenderingContext2D, dx: number, dy: number) =>
                target.drawImage(glyph.canvas, dx - boxX, dy - boxY)

            r.globalCompositeOperation = "source-over"
            r.clearRect(0, 0, boxW, boxH)
            stamp(r, 0, 0)
            r.globalCompositeOperation = "destination-out"
            stamp(r, thin, thin)
            r.globalCompositeOperation = "source-in"
            r.fillStyle = "rgba(255,255,255,0.7)"
            r.fillRect(0, 0, boxW, boxH)

            const under = (offset: number, fill: string) => {
                temp.globalCompositeOperation = "source-over"
                temp.clearRect(0, 0, boxW, boxH)
                stamp(temp, 0, 0)
                temp.globalCompositeOperation = "destination-out"
                stamp(temp, 0, -offset)
                temp.globalCompositeOperation = "source-in"
                temp.fillStyle = fill
                temp.fillRect(0, 0, boxW, boxH)
                r.globalCompositeOperation = "source-over"
                r.drawImage(wet.canvas, 0, 0)
            }
            under(band, "rgba(2,8,20,0.42)")
            const { r: tr, g: tg, b: tb } = tint
            under(
                thin,
                `rgba(${Math.min(255, tr + 70)},${Math.min(255, tg + 50)},${Math.min(255, tb + 30)},0.8)`,
            )
            temp.globalCompositeOperation = "source-over"

            // rain on glass is never a flat film
            const random = rngFor(seed, 9)
            const count = Math.round(((boxW * boxH) / (dpr * dpr)) * 0.012)
            for (let i = 0; i < count; i += 1) {
                const radius = (0.6 + random() ** 3 * 3.2) * dpr
                const x = random() * boxW
                const y = random() * boxH
                r.globalAlpha = 0.55 + random() * 0.45
                r.drawImage(sprite.canvas, x - radius, y - radius, radius * 2, radius * 2.1)
            }
            r.globalAlpha = 1
        }

        const paintField = (w: World) => {
            if (!fieldImage) return
            const data = fieldImage.data
            const { water, order, cols } = w
            const { r, g, b } = tint
            // two light blurs for drawing only, so cells read as water, not tiles
            blur(water, spare, order, cols)
            blur(spare, smooth, order, cols)
            for (let k = 0; k < order.length; k += 1) {
                const index = order[k]
                const amount = smooth[index]
                const px = index * 4
                if (amount < 0.01) {
                    data[px + 3] = 0
                    continue
                }
                // the water surface leans where its depth changes: light from
                // the upper left catches the slopes that face it
                const gx = (smooth[index + 1] || 0) - (smooth[index - 1] || 0)
                const gy = (smooth[index + cols] || 0) - (smooth[index - cols] || 0)
                let shine = (gx * 0.45 + gy * 0.6) * 0.9
                shine = shine < 0 ? 0 : shine > 1 ? 1 : shine
                const deep = amount > 1 ? 1 : amount
                const cover = amount > 0.22 ? 1 : amount / 0.22
                const tone = 0.55 + deep * 0.35
                data[px] = r * tone + 255 * shine
                data[px + 1] = g * tone + 255 * shine
                data[px + 2] = b * tone + 255 * shine
                data[px + 3] = 255 * Math.min(1, cover * (0.6 + deep * 0.3) + shine * 0.45)
            }
            field.context!.putImageData(fieldImage, 0, 0)
        }

        const bead = (x: number, y: number, rx: number, ry: number, alpha: number) => {
            context.globalAlpha = alpha
            context.drawImage(sprite.canvas, x - rx, y - ry, rx * 2, ry * 2)
        }

        /** Runoff on the glass: a thin wet line with a few beads left along it. */
        const drawTrails = (w: World) => {
            context.lineCap = "round"
            for (let level = 1; level <= 4; level += 1) {
                const low = (level - 1) / 4
                const high = level / 4
                context.globalAlpha = 0.1 * level
                context.strokeStyle = trailTone
                context.beginPath()
                let any = false
                for (let slot = 0; slot < TRAIL_CAP; slot += 1) {
                    const wetness = w.trailWet[slot]
                    if (wetness <= low || wetness > high) continue
                    const x = w.trailX[slot]
                    context.moveTo(x, w.trailTop[slot])
                    context.lineTo(x, w.trailBottom[slot])
                    any = true
                }
                if (!any) continue
                context.lineWidth = 0.9 * dpr
                context.stroke()
            }
            for (let slot = 0; slot < TRAIL_CAP; slot += 1) {
                const wetness = w.trailWet[slot]
                if (wetness <= 0.05) continue
                const top = w.trailTop[slot]
                const span = w.trailBottom[slot] - top
                const pick = w.trailSeed[slot]
                const size = w.trailWidth[slot]
                // residue the drip shed on its way down, at stable spots
                const shed = pick < 0.3 ? 0 : pick < 0.75 ? 1 : 2
                for (let k = 0; k < shed; k += 1) {
                    const at = (pick * (k + 1) * 7.31) % 1
                    const radius = size * (0.9 + ((pick * (k + 3) * 3.7) % 1) * 0.8)
                    bead(
                        w.trailX[slot],
                        top + span * (0.25 + at * 0.75),
                        radius,
                        radius * 1.1,
                        wetness,
                    )
                }
            }
            context.globalAlpha = 1
        }

        const render = (w: World, showRain: boolean) => {
            paintField(w)

            const wc = wet.context!
            wc.imageSmoothingEnabled = true
            const cell = w.cell
            wc.globalCompositeOperation = "copy"
            wc.drawImage(
                field.canvas,
                boxX / cell,
                boxY / cell,
                boxW / cell,
                boxH / cell,
                0,
                0,
                boxW,
                boxH,
            )
            wc.globalCompositeOperation = "destination-in"
            wc.drawImage(glyph.canvas, boxX, boxY, boxW, boxH, 0, 0, boxW, boxH)
            wc.globalCompositeOperation = "source-atop"
            wc.drawImage(sheen.canvas, 0, 0)
            wc.globalCompositeOperation = "source-over"

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.globalAlpha = 1
            context.clearRect(0, 0, width, height)
            context.imageSmoothingEnabled = true
            drawTrails(w)
            context.drawImage(wet.canvas, boxX, boxY)

            // beads hanging from the undersides, one per local maximum
            const { water, edges, cols } = w
            for (let k = 0; k < edges.length; k += 1) {
                const index = edges[k]
                const amount = water[index]
                if (amount < 0.7) continue
                // one bead per few cells: the wettest spot wins its stretch
                let peak = true
                for (let d = 1; d <= 3 && peak; d += 1) {
                    if ((water[index - d] || 0) > amount || (water[index + d] || 0) >= amount)
                        peak = false
                }
                if (!peak) continue
                const col = index % cols
                const row = (index - col) / cols
                const radius = cell * (0.7 + Math.min(1.6, amount) * 0.75)
                bead(
                    (col + 0.5) * cell,
                    (row + 1) * cell - radius * 0.15,
                    radius,
                    radius * 1.05,
                    0.95,
                )
            }

            for (let slot = 0; slot < DRIP_CAP; slot += 1) {
                if (!w.dripAlive[slot]) continue
                const mass = Math.min(1.6, w.dripMass[slot])
                const base = cell * (0.8 + mass * 0.7)
                const hang = w.dripHang[slot]
                const age = w.dripAge[slot]
                if (age <= hang) {
                    const swell = 0.7 + 0.4 * (age / hang)
                    bead(
                        w.dripX[slot],
                        w.dripY[slot] + base * swell * 0.6,
                        base * swell,
                        base * swell * 1.12,
                        1,
                    )
                } else {
                    const stretch = 1 + Math.min(1, w.dripVY[slot] / (700 * dpr)) * 0.8
                    bead(w.dripX[slot], w.dripY[slot], base * 0.9, base * 0.9 * stretch, 1)
                }
            }
            context.globalAlpha = 1

            if (!showRain) return

            // a hit is a bright fleck that shrinks as it spreads into the glass
            context.fillStyle = "rgb(215,234,252)"
            context.globalAlpha = 0.4
            context.beginPath()
            for (let slot = 0; slot < SPLASH_CAP; slot += 1) {
                if (!w.splashAlive[slot]) continue
                const radius = w.splashSize[slot] * 0.4 * (1 - w.splashAge[slot] / 0.22)
                if (radius <= 0.2) continue
                const x = w.splashX[slot]
                const y = w.splashY[slot]
                context.moveTo(x + radius, y)
                context.arc(x, y, radius, 0, Math.PI * 2)
            }
            context.fill()

            context.lineCap = "round"
            context.strokeStyle = "rgb(205,228,250)"
            // three depths of rain, each one path and one stroke
            for (let layer = 0; layer < 3; layer += 1) {
                const low = layer === 0 ? 0 : layer === 1 ? 0.5 : 0.86
                const high = layer === 0 ? 0.5 : layer === 1 ? 0.86 : 1.01
                context.globalAlpha = layer === 0 ? 0.13 : layer === 1 ? 0.22 : 0.36
                context.lineWidth = (layer === 0 ? 0.7 : layer === 1 ? 1 : 1.6) * dpr
                context.beginPath()
                for (let slot = 0; slot < RAIN_CAP; slot += 1) {
                    if (!w.rainAlive[slot]) continue
                    const depth = w.rainDepth[slot]
                    if (depth < low || depth >= high) continue
                    const vx = w.rainVX[slot]
                    const vy = w.rainVY[slot]
                    const length = w.rainLength[slot] / Math.sqrt(1 + (vx * vx) / (vy * vy))
                    const x = w.rainX[slot]
                    const y = w.rainY[slot]
                    context.moveTo(x - (vx / vy) * length, y - length)
                    context.lineTo(x, y)
                }
                context.stroke()
            }
            context.globalAlpha = 1
        }

        /** Fonts load for the whole page; only one that reshapes this word matters. */
        const fontChanged = () => {
            const g = glyph.context!
            g.font = `${fontWeight} ${100 * dpr}px ${fontFamily}`
            return g.measureText(text).width !== measured
        }

        const simulate = (frames: number, weather = settings.current) => {
            if (!world) return
            for (let i = 0; i < frames; i += 1) step(world, 1 / 60, weather)
        }

        const holdStill = () => {
            if (!world) return
            if (frozen !== null) {
                simulate(frozen)
                render(world, true)
                return
            }
            // a soaked word after a shower: plenty of water, nothing falling
            const weather = settings.current
            simulate(STILL_FRAMES, {
                ...weather,
                rain: Math.max(0.6, weather.rain),
                wetness: Math.max(0.6, weather.wetness),
                evaporation: Math.min(0.2, weather.evaporation),
            })
            render(world, false)
        }

        paintSprite()
        rebuild()

        if (still || frozen !== null) {
            holdStill()
            const stopResize = onResize(host, () => {
                const box = host.getBoundingClientRect()
                if (
                    Math.round(box.width * dpr) === width &&
                    Math.round(box.height * dpr) === height
                )
                    return
                rebuild()
                holdStill()
            })
            const refit = () => {
                if (disposed || !fontChanged()) return
                rebuild()
                holdStill()
            }
            if (document.fonts && document.fonts.status !== "loaded") {
                document.fonts.ready.then(refit, () => {})
            }
            return () => {
                disposed = true
                stopResize()
            }
        }

        const loop = wakeLoop((dt) => {
            if (!world || !seen) return false
            step(world, dt, settings.current)
            render(world, true)
            return !(settings.current.rain <= 0 && settled(world))
        })
        loopRef.current = loop
        loop.wake()

        const stopVisible = onVisible(host, (visible) => {
            seen = visible
            if (visible) loop.wake()
        })
        const stopResize = onResize(host, () => {
            const box = host.getBoundingClientRect()
            const d = Math.min(window.devicePixelRatio || 1, 2)
            if (Math.round(box.width * d) === width && Math.round(box.height * d) === height) return
            rebuild()
            loop.wake()
        })

        // a web font that arrives late changes every glyph: measure again
        const fonts = typeof document !== "undefined" ? document.fonts : undefined
        const pending = fonts && fonts.status !== "loaded"
        const refit = () => {
            if (disposed || !fontChanged()) return
            rebuild()
            loop.wake()
        }
        if (pending) fonts.ready.then(refit, () => {})
        fonts?.addEventListener?.("loadingdone", refit)

        return () => {
            disposed = true
            loop.sleep()
            loopRef.current = null
            stopVisible()
            stopResize()
            fonts?.removeEventListener?.("loadingdone", refit)
        }
    }, [settings, text, fontFamily, fontWeight, color, seed, still, frozen])

    // new weather may need a sleeping loop back
    useEffect(() => {
        loopRef.current?.wake()
    }, [rain, wind, fall, wetness, evaporation])

    return (
        <div
            ref={hostRef}
            className={cx("xp-drench", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            <canvas ref={canvasRef} className="xp-drench-canvas" aria-hidden="true" />
            <Tag ref={textRef} className="xp-drench-text" style={{ fontFamily, fontWeight }}>
                {text}
            </Tag>
        </div>
    )
}
