"use client"

import { useId, useRef, type CSSProperties } from "react"

import { cssUrl, cx, useIsomorphicLayoutEffect, usePrefersReducedMotion } from "../../internal"
import {
    cellsFrom,
    edgeMap,
    glyphFor,
    gridFor,
    inkFor,
    resolveGlyphs,
    type RasterGlyphSet,
} from "./sample"
import "./Raster.css"

export type RasterMode = "blur" | "glass" | "glyph" | "pixel"

export interface RasterProps {
    src: string
    /** Pass an empty string when the picture is purely decorative. */
    alt: string
    mode?: RasterMode
    aspectRatio?: string | number
    animated?: boolean
    /** Reveal the untouched picture on hover or focus. */
    interactive?: boolean
    disabled?: boolean
    blurStrength?: number
    distortion?: number
    glyphSet?: string | RasterGlyphSet
    cellSize?: number
    contrast?: number
    pixelSize?: number
    gridGap?: number
    /** 0 for square blocks, 1 for circles, or true/false for the defaults */
    rounded?: number | boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const MAX_DPR = 2
const MAX_CELLS = 24_000

export function Raster({
    src,
    alt,
    mode = "blur",
    aspectRatio = "16 / 10",
    animated = true,
    interactive = false,
    disabled = false,
    blurStrength = 22,
    distortion = 14,
    glyphSet = "ascii",
    cellSize = 10,
    contrast = 1.15,
    pixelSize = 18,
    gridGap = 2,
    rounded = 0.28,
    respectReducedMotion = true,
    className,
    style,
}: RasterProps) {
    const plateRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const reduced = usePrefersReducedMotion()
    const warp = useId().replace(/[:]/g, "")

    const still = !animated || (respectReducedMotion && reduced)
    const active = disabled ? null : mode
    const painted = active === "glyph" || active === "pixel"

    useIsomorphicLayoutEffect(() => {
        if (!painted) return

        const canvas = canvasRef.current
        const plate = plateRef.current
        if (!canvas || !plate) return

        let frame = 0

        const paint = () => {
            frame = 0
            const box = canvas.getBoundingClientRect()
            if (box.width < 4 || box.height < 4) return

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            canvas.width = Math.round(box.width * dpr)
            canvas.height = Math.round(box.height * dpr)

            const glyphs = resolveGlyphs(glyphSet)
            const cell = active === "pixel" ? pixelSize : cellSize

            let aspect = 1
            if (active === "glyph") {
                ctx.font = `${cell}px ui-monospace, SFMono-Regular, Menlo, monospace`
                const advance = Math.max(
                    1,
                    ...Array.from(glyphs, (glyph) => ctx.measureText(glyph).width),
                )
                aspect = advance / cell
            }

            let { cols, rows } = gridFor(box.width, box.height, cell, aspect)
            while (cols * rows > MAX_CELLS) {
                cols = Math.max(1, Math.round(cols * 0.8))
                rows = Math.max(1, Math.round(rows * 0.8))
            }

            // one downscale lets the browser average each block for us
            const shrunk = document.createElement("canvas")
            shrunk.width = cols
            shrunk.height = rows
            const small = shrunk.getContext("2d")
            if (!small) return

            small.imageSmoothingEnabled = true
            small.imageSmoothingQuality = "high"
            try {
                small.drawImage(plate, 0, 0, cols, rows)
            } catch {
                return
            }

            let data: Uint8ClampedArray
            try {
                data = small.getImageData(0, 0, cols, rows).data
            } catch {
                // a cross-origin source taints the canvas; leave the plate visible
                canvas.dataset.blocked = "true"
                return
            }

            delete canvas.dataset.blocked
            const cells = cellsFrom(data, cols, rows)
            const width = canvas.width / cols
            const height = canvas.height / rows

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (active === "pixel") {
                const gap = Math.max(0, gridGap) * dpr
                const roundness =
                    rounded === true
                        ? 0.28
                        : rounded === false
                          ? 0
                          : Math.min(1, Math.max(0, rounded))
                const radius =
                    roundness > 0 ? Math.min(width - gap, height - gap) * 0.5 * roundness : 0

                for (const item of cells) {
                    ctx.fillStyle = `rgb(${item.r},${item.g},${item.b})`
                    const x = item.col * width + gap / 2
                    const y = item.row * height + gap / 2
                    const w = Math.max(1, width - gap)
                    const h = Math.max(1, height - gap)

                    ctx.beginPath()
                    if (radius > 0 && typeof ctx.roundRect === "function") {
                        ctx.roundRect(x, y, w, h, radius)
                    } else {
                        ctx.rect(x, y, w, h)
                    }
                    ctx.fill()
                }
                return
            }

            const edges = edgeMap(cells, cols, rows)

            ctx.font = `${height * 1.04}px ui-monospace, SFMono-Regular, Menlo, monospace`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            for (const [index, item] of cells.entries()) {
                const glyph = glyphFor(item.lum, edges[index] ?? 0, glyphs, contrast)
                if (glyph === " ") continue

                ctx.fillStyle = inkFor(item)
                ctx.fillText(glyph, item.col * width + width / 2, item.row * height + height / 2)
            }
        }

        const schedule = () => {
            if (frame !== 0) return
            frame = requestAnimationFrame(paint)
        }

        if (plate.complete) schedule()
        plate.addEventListener("load", schedule)

        let watcher: ResizeObserver | undefined
        if (typeof ResizeObserver === "function") {
            watcher = new ResizeObserver(schedule)
            watcher.observe(canvas)
        }

        return () => {
            plate.removeEventListener("load", schedule)
            watcher?.disconnect()
            if (frame !== 0) cancelAnimationFrame(frame)
        }
    }, [painted, active, src, cellSize, pixelSize, gridGap, rounded, glyphSet, contrast])

    const shell: CSSProperties = {
        ...style,
        aspectRatio: typeof aspectRatio === "number" ? String(aspectRatio) : aspectRatio,
        // encoded, so a source containing a quote cannot close the url()
        ["--raster-src" as string]: cssUrl(src),
        ["--raster-blur" as string]: `${Math.max(0, blurStrength)}px`,
        ["--raster-bleed" as string]: Math.max(0, distortion) + 8,
    }

    return (
        <div
            className={cx(
                "xp-raster",
                interactive && "xp-raster-interactive",
                still && "xp-raster-still",
                className,
            )}
            data-mode={active ?? "off"}
            style={shell}
        >
            <img ref={plateRef} className="xp-raster-plate" src={src} alt={alt} />

            {active === "blur" ? (
                <div className="xp-raster-veil" aria-hidden="true">
                    <div className="xp-raster-haze" data-step="near" />
                    <div className="xp-raster-haze" data-step="far" />
                </div>
            ) : null}

            {active === "glass" ? (
                <div className="xp-raster-veil" aria-hidden="true">
                    <svg className="xp-raster-defs" aria-hidden="true" focusable="false">
                        <filter id={warp} x="-14%" y="-14%" width="128%" height="128%">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.004 0.006"
                                numOctaves="2"
                                seed="9"
                                result="ripple"
                            />
                            <feGaussianBlur in="ripple" stdDeviation="4" result="soft" />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="soft"
                                scale={Math.max(0, distortion)}
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </svg>

                    <img
                        className="xp-raster-lens"
                        src={src}
                        alt=""
                        aria-hidden="true"
                        style={{ ["--raster-warp" as string]: `url(#${warp})` }}
                    />
                    <div className="xp-raster-bend" data-edge="inner" />
                    <div className="xp-raster-bend" data-edge="outer" />
                    <div className="xp-raster-rim" />
                    {still ? null : <div className="xp-raster-sheen" />}
                </div>
            ) : null}

            {painted ? (
                <div className="xp-raster-veil" aria-hidden="true">
                    <canvas ref={canvasRef} className="xp-raster-canvas" />
                </div>
            ) : null}
        </div>
    )
}
