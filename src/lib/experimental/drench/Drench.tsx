"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import { cx, useLatestRef, usePrefersReducedMotion } from "../../internal"
import "./Drench.css"

export interface DrenchProps {
    /** the word the rain finds; kept as real text for screen readers */
    text: string
    /** how many drops fall at once, 0 to 1 */
    rain?: number
    /** how fast they fall, 0.2 to 3 */
    fall?: number
    /** how much water a hit leaves behind, 0 to 1 */
    wetness?: number
    /** how quickly it dries, 0 to 1 */
    evaporation?: number
    /** how thick the glyph outline is, as a share of the cap height */
    outline?: number
    /** the colour of the water on the glyphs */
    color?: string
    fontFamily?: string
    fontWeight?: number
    /** hold the still, soaked state instead of animating */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

interface Drop {
    x: number
    y: number
    speed: number
    length: number
    thickness: number
    /** 0 far, 1 near */
    depth: number
}

interface Drip {
    x: number
    y: number
    /** where it let go, so the streak can be drawn behind it */
    from: number
    fall: number
    size: number
    /** below zero while it is still gathering */
    life: number
}

const DROPS = 160
const DRIPS = 26
const FRAME_CAP = 0.05

function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

export function Drench({
    text,
    rain = 0.55,
    fall = 1,
    wetness = 0.6,
    evaporation = 0.35,
    outline = 0.045,
    color = "#9fd8ff",
    fontFamily = "system-ui, sans-serif",
    fontWeight = 800,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: DrenchProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        text,
        rain,
        fall,
        wetness,
        evaporation,
        outline,
        color,
        fontFamily,
        fontWeight,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        // three layers: the glyph shape, the water that has landed on it, and
        // the visible scene. Compositing the water through the glyph is what
        // makes the letters appear only where they already invisibly are.
        const glyph = document.createElement("canvas")
        const wet = document.createElement("canvas")
        // the stencil is read back to find where water can hang from
        const glyphContext = glyph.getContext("2d", { willReadFrequently: true })
        const wetContext = wet.getContext("2d")
        if (!glyphContext || !wetContext) return

        const drops: Drop[] = Array.from({ length: DROPS }, () => ({
            x: 0,
            y: 0,
            speed: 0,
            length: 0,
            thickness: 1,
            depth: 0,
        }))

        // water that has gathered on the underside of a letter and let go
        const drips: Drip[] = Array.from({ length: DRIPS }, () => ({
            x: 0,
            y: 0,
            from: 0,
            fall: 0,
            size: 1,
            life: -1,
        }))
        // the lowest point of the outline in each column: where a drop hangs
        let ledges: { x: number; y: number }[] = []

        let width = 1
        let height = 1
        let dpr = 1
        let frame = 0
        let last = 0
        let seen = true

        const seat = (drop: Drop, top: boolean) => {
            drop.depth = Math.random()
            drop.x = Math.random() * width
            drop.y = top ? -Math.random() * height * 0.4 : Math.random() * height
            drop.speed = (0.55 + drop.depth * 1.4) * height
            drop.length = (0.02 + drop.depth * 0.06) * height
            drop.thickness = 0.6 + drop.depth * 1.7
        }

        const measure = () => {
            const box = host.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = Math.max(1, Math.round(box.width * dpr))
            height = Math.max(1, Math.round(box.height * dpr))

            for (const layer of [canvas, glyph, wet]) {
                layer.width = width
                layer.height = height
            }
            canvas.style.width = `${Math.max(1, Math.round(box.width))}px`
            canvas.style.height = `${Math.max(1, Math.round(box.height))}px`

            stampGlyph()
            drops.forEach((drop) => seat(drop, false))
        }

        /**
         * The word as an outline, never as a solid. Water can only survive on
         * this band, so what appears is the contour of a letter that is not
         * drawn — not the letter itself.
         */
        const stampGlyph = () => {
            const config = settings.current
            glyphContext.setTransform(1, 0, 0, 1, 0, 0)
            glyphContext.clearRect(0, 0, width, height)

            let size = height * 0.5
            glyphContext.textAlign = "center"
            glyphContext.textBaseline = "middle"

            // shrink until the word fits the box with a margin
            for (let attempt = 0; attempt < 24; attempt += 1) {
                glyphContext.font = `${config.fontWeight} ${size}px ${config.fontFamily}`
                if (glyphContext.measureText(config.text).width <= width * 0.88) break
                size *= 0.92
            }

            glyphContext.lineJoin = "round"
            glyphContext.lineWidth = Math.max(1.5, size * clamp(config.outline, 0.008, 0.18))
            glyphContext.strokeStyle = "#fff"
            glyphContext.strokeText(config.text, width / 2, height / 2)

            findLedges()
        }

        /** The lowest lit pixel in each column: the underside of the outline. */
        const findLedges = () => {
            ledges = []
            if (width < 2 || height < 2) return

            let pixels: Uint8ClampedArray
            try {
                pixels = glyphContext.getImageData(0, 0, width, height).data
            } catch {
                return
            }

            const stride = Math.max(2, Math.round(width / 260))
            for (let x = 0; x < width; x += stride) {
                for (let y = height - 1; y >= 0; y -= 1) {
                    if (pixels[(y * width + x) * 4 + 3] > 48) {
                        ledges.push({ x, y })
                        break
                    }
                }
            }
        }

        measure()

        const paint = (dt: number) => {
            const config = settings.current

            // water dries a little every frame
            const dry = clamp(config.evaporation, 0, 1) * dt * 1.35
            if (dry > 0) {
                wetContext.setTransform(1, 0, 0, 1, 0, 0)
                wetContext.globalCompositeOperation = "destination-out"
                wetContext.fillStyle = `rgba(0,0,0,${Math.min(0.5, dry)})`
                wetContext.fillRect(0, 0, width, height)
                wetContext.globalCompositeOperation = "source-over"
            }

            const speed = config.fall
            const soak = clamp(config.wetness, 0, 1)
            const active = Math.round(DROPS * clamp(config.rain, 0, 1))

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, width, height)

            for (let index = 0; index < active; index += 1) {
                const drop = drops[index]
                const from = drop.y
                drop.y += drop.speed * speed * dt

                // ambient rain, faint and behind everything
                context.strokeStyle = `rgba(190, 220, 245, ${0.05 + drop.depth * 0.16})`
                context.lineWidth = drop.thickness
                context.beginPath()
                context.moveTo(drop.x, from)
                context.lineTo(drop.x, drop.y + drop.length)
                context.stroke()

                // the trail it leaves, which only shows where a glyph is
                wetContext.strokeStyle = `rgba(255,255,255,${0.05 + soak * 0.3 * drop.depth})`
                wetContext.lineWidth = drop.thickness * 1.5
                wetContext.beginPath()
                wetContext.moveTo(drop.x, from)
                wetContext.lineTo(drop.x, drop.y + drop.length)
                wetContext.stroke()

                // and a bead where it lands
                if (Math.random() < 0.12) {
                    const bead = wetContext.createRadialGradient(
                        drop.x,
                        drop.y,
                        0,
                        drop.x,
                        drop.y,
                        drop.thickness * 4.5,
                    )
                    bead.addColorStop(0, `rgba(255,255,255,${0.14 + soak * 0.5})`)
                    bead.addColorStop(1, "rgba(255,255,255,0)")
                    wetContext.fillStyle = bead
                    wetContext.beginPath()
                    wetContext.arc(drop.x, drop.y, drop.thickness * 4.5, 0, Math.PI * 2)
                    wetContext.fill()
                }

                if (drop.y - drop.length > height) seat(drop, true)
            }

            // water gathering on the undersides, then letting go
            if (ledges.length > 0) {
                for (const drip of drips) {
                    if (drip.life < 0) {
                        // one seat at a time, at a rate the rain sets
                        if (Math.random() < config.rain * dt * 2.4) {
                            const spot = ledges[Math.floor(Math.random() * ledges.length)]
                            drip.x = spot.x
                            drip.y = spot.y
                            drip.from = spot.y
                            drip.fall = 0
                            drip.size = (1.4 + Math.random() * 1.8) * dpr
                            drip.life = 0
                        }
                        continue
                    }

                    drip.life += dt
                    // it hangs and swells first, then falls and picks up speed
                    const hanging = drip.life < 0.45
                    if (hanging) {
                        drip.y = drip.from + drip.life * 6 * dpr
                    } else {
                        drip.fall += 900 * dpr * dt * speed
                        drip.y += drip.fall * dt
                    }

                    const swell = hanging ? 0.6 + drip.life * 0.9 : 1
                    const shine = 0.35 + soak * 0.5

                    // the streak it leaves behind on the way down
                    if (!hanging) {
                        const tail = context.createLinearGradient(drip.x, drip.from, drip.x, drip.y)
                        tail.addColorStop(0, "rgba(255,255,255,0)")
                        tail.addColorStop(1, `rgba(255,255,255,${shine * 0.32})`)
                        context.strokeStyle = tail
                        context.lineWidth = drip.size * 0.8
                        context.beginPath()
                        context.moveTo(drip.x, drip.from)
                        context.lineTo(drip.x, drip.y)
                        context.stroke()
                    }

                    const bead = context.createRadialGradient(
                        drip.x,
                        drip.y,
                        0,
                        drip.x,
                        drip.y,
                        drip.size * 2.6 * swell,
                    )
                    bead.addColorStop(0, `rgba(255,255,255,${shine + 0.25})`)
                    bead.addColorStop(0.6, `rgba(255,255,255,${shine * 0.5})`)
                    bead.addColorStop(1, "rgba(255,255,255,0)")
                    context.fillStyle = bead
                    context.beginPath()
                    context.arc(drip.x, drip.y, drip.size * 2.6 * swell, 0, Math.PI * 2)
                    context.fill()

                    // while it hangs it keeps that stretch of outline wet
                    if (hanging) {
                        const soakSpot = wetContext.createRadialGradient(
                            drip.x,
                            drip.from,
                            0,
                            drip.x,
                            drip.from,
                            drip.size * 5,
                        )
                        soakSpot.addColorStop(0, `rgba(255,255,255,${0.1 + soak * 0.35})`)
                        soakSpot.addColorStop(1, "rgba(255,255,255,0)")
                        wetContext.fillStyle = soakSpot
                        wetContext.beginPath()
                        wetContext.arc(drip.x, drip.from, drip.size * 5, 0, Math.PI * 2)
                        wetContext.fill()
                    }

                    if (drip.y - drip.from > height) drip.life = -1
                }
            }

            // keep only the water that is sitting on a letter
            wetContext.globalCompositeOperation = "destination-in"
            wetContext.drawImage(glyph, 0, 0)
            wetContext.globalCompositeOperation = "source-over"

            // the wet letters, tinted, with a light edge so they read as water
            context.globalCompositeOperation = "source-over"
            context.save()
            context.globalAlpha = 0.92
            context.drawImage(wet, 0, 0)
            context.restore()

            context.globalCompositeOperation = "source-atop"
            context.fillStyle = config.color
            context.globalAlpha = 0.55
            context.fillRect(0, 0, width, height)
            context.globalAlpha = 1
            context.globalCompositeOperation = "source-over"
        }

        /** Reduced motion still shows the word, already soaked, standing still. */
        const soakStill = () => {
            wetContext.setTransform(1, 0, 0, 1, 0, 0)
            wetContext.clearRect(0, 0, width, height)
            wetContext.fillStyle = "rgba(255,255,255,0.82)"
            wetContext.fillRect(0, 0, width, height)

            for (let index = 0; index < 90; index += 1) {
                const x = ((index * 61) % 100) / 100
                const y = ((index * 37) % 100) / 100
                const r = 3 + ((index * 13) % 9)
                const bead = wetContext.createRadialGradient(
                    x * width,
                    y * height,
                    0,
                    x * width,
                    y * height,
                    r * dpr,
                )
                bead.addColorStop(0, "rgba(255,255,255,0.9)")
                bead.addColorStop(1, "rgba(255,255,255,0)")
                wetContext.fillStyle = bead
                wetContext.beginPath()
                wetContext.arc(x * width, y * height, r * dpr, 0, Math.PI * 2)
                wetContext.fill()
            }

            wetContext.globalCompositeOperation = "destination-in"
            wetContext.drawImage(glyph, 0, 0)
            wetContext.globalCompositeOperation = "source-over"

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, width, height)
            context.drawImage(wet, 0, 0)
            context.globalCompositeOperation = "source-atop"
            context.fillStyle = settings.current.color
            context.globalAlpha = 0.55
            context.fillRect(0, 0, width, height)
            context.globalAlpha = 1
            context.globalCompositeOperation = "source-over"
        }

        const sizer =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(() => {
                      measure()
                      if (settings.current.still) soakStill()
                  })
                : null
        sizer?.observe(host)

        if (settings.current.still) {
            soakStill()
            return () => sizer?.disconnect()
        }

        const loop = (stamp: number) => {
            frame = requestAnimationFrame(loop)
            if (!seen) return

            const dt = last === 0 ? 0.016 : Math.min((stamp - last) / 1000, FRAME_CAP)
            last = stamp
            paint(dt)
        }

        const watcher =
            typeof IntersectionObserver === "function"
                ? new IntersectionObserver(
                      ([entry]) => {
                          seen = entry.isIntersecting
                          if (seen) last = 0
                      },
                      { threshold: 0 },
                  )
                : null
        watcher?.observe(host)

        frame = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(frame)
            sizer?.disconnect()
            watcher?.disconnect()
        }
    }, [settings, text, fontFamily, fontWeight])

    return (
        <div
            ref={hostRef}
            className={cx("xp-drench", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            {/* the word itself, for anything that reads rather than looks */}
            <span className="xp-drench-word">{text}</span>
            <canvas ref={canvasRef} className="xp-drench-rain" aria-hidden="true" />
        </div>
    )
}
