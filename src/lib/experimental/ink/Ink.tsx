"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    fitCanvas,
    onFrame,
    onResize,
    onVisible,
    rngFor,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Ink.css"

export interface InkProps {
    text: string
    /** the ink */
    color?: string
    /** how far it wicks past the stroke, 0 to 1 */
    bleed?: number
    /** how long one soak takes, in seconds */
    duration?: number
    /** how ragged the edge goes, 0 to 1 */
    feather?: number
    /** soak again on an interval, in seconds; 0 soaks once */
    repeat?: number
    fontFamily?: string
    fontWeight?: number
    seed?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const BLOTS = 220

export function Ink({
    text,
    color = "#1b2a4a",
    bleed = 0.5,
    duration = 2.6,
    feather = 0.6,
    repeat = 6,
    fontFamily = "Georgia, 'Times New Roman', serif",
    fontWeight = 700,
    seed = 12,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: InkProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        text,
        color,
        bleed: clamp(finite(bleed, 0.5), 0, 1),
        duration: clamp(finite(duration, 2.6), 0.3, 20),
        feather: clamp(finite(feather, 0.6), 0, 1),
        repeat: clamp(finite(repeat, 6), 0, 60),
        fontFamily,
        fontWeight,
        seed,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const stencil = document.createElement("canvas")
        const stencilContext = context2d(stencil, { willReadFrequently: true })
        if (!stencilContext) return

        let size = fitCanvas(canvas, host)
        let visible = true
        let soak = 0
        let rest = 0
        // seeded points along the outline, where the fibres take the ink first
        let seeds: { x: number; y: number; reach: number; at: number }[] = []

        const stamp = () => {
            const config = settings.current
            stencil.width = size.width
            stencil.height = size.height

            stencilContext.setTransform(1, 0, 0, 1, 0, 0)
            stencilContext.clearRect(0, 0, size.width, size.height)

            let face = size.height * 0.46
            stencilContext.textAlign = "center"
            stencilContext.textBaseline = "middle"
            for (let attempt = 0; attempt < 24; attempt += 1) {
                stencilContext.font = `${config.fontWeight} ${face}px ${config.fontFamily}`
                if (stencilContext.measureText(config.text).width <= size.width * 0.84) break
                face *= 0.92
            }

            stencilContext.fillStyle = "#fff"
            stencilContext.fillText(config.text, size.width / 2, size.height / 2)

            sow(face)
        }

        const sow = (face: number) => {
            const config = settings.current
            seeds = []

            let pixels: Uint8ClampedArray
            try {
                pixels = stencilContext.getImageData(0, 0, size.width, size.height).data
            } catch {
                return
            }

            const random = rngFor(config.seed, BLOTS)
            let tries = 0

            while (seeds.length < BLOTS && tries < BLOTS * 30) {
                tries += 1
                const x = Math.floor(random() * size.width)
                const y = Math.floor(random() * size.height)
                if (pixels[(y * size.width + x) * 4 + 3] < 40) continue

                seeds.push({
                    x,
                    y,
                    reach: face * (0.04 + random() * 0.16),
                    // ink reaches different fibres at different moments
                    at: random() * 0.7,
                })
            }
        }

        const paint = () => {
            const config = settings.current
            const wet = clamp(soak, 0, 1)

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            if (wet <= 0) return

            // the blots first: ink wicking outward into the paper
            context.globalCompositeOperation = "source-over"
            context.fillStyle = config.color

            for (const spot of seeds) {
                const life = clamp((wet - spot.at) / Math.max(0.05, 1 - spot.at), 0, 1)
                if (life <= 0) continue

                const reach = spot.reach * life * (0.5 + config.bleed * 1.6)
                const blot = context.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, reach)
                blot.addColorStop(0, config.color)
                blot.addColorStop(0.55, config.color)
                blot.addColorStop(1, "rgba(0,0,0,0)")
                context.globalAlpha = 0.16 + config.feather * 0.4
                context.fillStyle = blot
                context.beginPath()
                context.arc(spot.x, spot.y, reach, 0, Math.PI * 2)
                context.fill()
            }

            // then the letter itself, arriving as the paper saturates
            context.globalAlpha = clamp(wet * 1.5, 0, 1)
            context.drawImage(stencil, 0, 0)
            context.globalCompositeOperation = "source-in"
            context.fillStyle = config.color
            context.globalAlpha = 1
            context.fillRect(0, 0, size.width, size.height)
            context.globalCompositeOperation = "source-over"
        }

        stamp()
        if (settings.current.still) {
            soak = 1
            paint()
        }

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            stamp()
            paint()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = settings.current.still
            ? () => {}
            : onFrame((dt) => {
                  if (!visible) return
                  const config = settings.current

                  if (soak < 1) {
                      soak = Math.min(1, soak + dt / config.duration)
                      paint()
                      return
                  }

                  if (config.repeat <= 0) return
                  rest += dt
                  if (rest >= config.repeat) {
                      rest = 0
                      soak = 0
                      paint()
                  }
              })

        return () => {
            stopFrame()
            stopResize()
            stopVisible()
            stencil.width = 0
            stencil.height = 0
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-ink", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            {/* the word stays real text; the canvas is how it is drawn */}
            <span className="xp-ink-word">{text}</span>
            <canvas ref={canvasRef} className="xp-ink-paper" aria-hidden="true" />
        </div>
    )
}
