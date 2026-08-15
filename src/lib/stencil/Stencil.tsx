"use client"

import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react"

import { cssUrl, cx, useIsomorphicLayoutEffect, usePrefersReducedMotion } from "../internal"
import { buildPattern, type StencilFill } from "./patterns"
import "./Stencil.css"

export type StencilHover =
    "none" | "lift" | "pop" | "wave" | "tilt" | "shift" | "glow" | "expand" | "reveal"

export interface StencilProps {
    text: string
    media?: (string | undefined)[]
    fill?: StencilFill
    colors?: string[]
    image?: string
    background?: string
    scale?: number
    angle?: number
    size?: number
    weight?: number
    tracking?: number
    font?: string
    hover?: StencilHover
    strength?: number
    animate?: number
    continuous?: boolean
    outline?: number
    outlineColor?: string
    className?: string
    style?: CSSProperties
}

interface LetterFont {
    size: string
    weight: string
    style: string
    stretch: string
    family: string
    spacing: string
    variations: string
}

const WAVE_REACH = 2.2
const VIDEO_PATTERN = /\.(mp4|webm|ogv|mov)(\?|#|$)/i

export function Stencil({
    text,
    media,
    fill = "zebra",
    colors,
    image,
    background,
    scale = 64,
    angle = 68,
    size = 140,
    weight = 800,
    tracking = -0.02,
    font,
    hover = "lift",
    strength = 1,
    animate = 0,
    continuous = true,
    outline = 0,
    outlineColor = "#ffffff",
    className,
    style,
}: StencilProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
    const masksRef = useRef<(HTMLSpanElement | null)[]>([])
    const measureRef = useRef<CanvasRenderingContext2D | null>(null)
    const frameRef = useRef(0)
    const pointerRef = useRef(-1)
    const centersRef = useRef<number[]>([])
    const maskSigRef = useRef<string[]>([])

    const reducedMotion = usePrefersReducedMotion()

    const characters = useMemo(() => Array.from(text), [text])

    const pattern = useMemo(
        () =>
            buildPattern({
                fill,
                colors: colors ?? [],
                scale,
                angle,
                image,
                background,
            }),
        [fill, colors, scale, angle, image, background],
    )

    const layout = useCallback(() => {
        const root = rootRef.current
        if (!root) return

        const letters = lettersRef.current
        const rootBox = root.getBoundingClientRect()
        const boxes: (DOMRect | null)[] = []
        const fonts: (LetterFont | null)[] = []
        const centers = centersRef.current
        centers.length = letters.length

        for (let index = 0; index < letters.length; index += 1) {
            const letter = letters[index]
            if (!letter) {
                boxes.push(null)
                fonts.push(null)
                continue
            }
            const box = letter.getBoundingClientRect()
            boxes.push(box)
            centers[index] = box.left - rootBox.left + box.width / 2

            if (!masksRef.current[index] || box.width === 0) {
                fonts.push(null)
                continue
            }

            const computed = window.getComputedStyle(letter)
            fonts.push({
                size: computed.fontSize,
                weight: computed.fontWeight,
                style: computed.fontStyle,
                stretch: computed.fontStretch,
                family: computed.fontFamily.replace(/"/g, "'"),
                spacing: computed.letterSpacing === "normal" ? "0" : computed.letterSpacing,
                variations:
                    computed.fontVariationSettings !== "normal"
                        ? computed.fontVariationSettings
                        : "",
            })
        }

        for (let index = 0; index < letters.length; index += 1) {
            const letter = letters[index]
            const box = boxes[index]
            if (!letter || !box) continue

            const offset = box.left - rootBox.left
            letter.style.setProperty("--stencil-offset", continuous ? `${-offset}` : "0")
            if (fill === "image") {
                letter.style.backgroundSize = `${rootBox.width}px ${rootBox.height}px`
            }

            const mask = masksRef.current[index]
            const metrics = fonts[index]
            if (!mask || !metrics) continue

            const glyph = letter.dataset.glyph ?? ""
            const { family, spacing, variations } = metrics
            const font = `${metrics.style} ${metrics.weight} ${metrics.size} ${family}`
            const signature = `${glyph}|${box.width}|${box.height}|${font}|${metrics.stretch}|${spacing}|${variations}`

            if (maskSigRef.current[index] === signature) continue
            maskSigRef.current[index] = signature

            if (!measureRef.current) {
                measureRef.current = document.createElement("canvas").getContext("2d")
            }

            const fontSize = parseFloat(metrics.size) || 16
            let ascent = fontSize * 0.8
            let descent = fontSize * 0.2
            let advance = box.width

            const gauge = measureRef.current
            if (gauge) {
                gauge.font = font
                const glyphBox = gauge.measureText(glyph)
                if (glyphBox.fontBoundingBoxAscent) ascent = glyphBox.fontBoundingBoxAscent
                if (glyphBox.fontBoundingBoxDescent) descent = glyphBox.fontBoundingBoxDescent
                if (glyphBox.width) advance = glyphBox.width
            }

            const maskWidth = Math.max(box.width, advance)
            const baseline = (box.height - (ascent + descent)) / 2 + ascent
            const attributes = [
                `x="0"`,
                `y="${baseline}"`,
                `text-anchor="start"`,
                `font-family="${family}"`,
                `font-size="${metrics.size}"`,
                `font-weight="${metrics.weight}"`,
                `font-style="${metrics.style}"`,
                `font-stretch="${metrics.stretch}"`,
                `letter-spacing="${spacing}"`,
                variations ? `font-variation-settings="${variations}"` : "",
                `fill="#000"`,
            ]
                .filter(Boolean)
                .join(" ")

            const svg =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${maskWidth}" height="${box.height}">` +
                `<text ${attributes}>${glyph.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`
            const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`

            mask.style.width = `${maskWidth}px`
            mask.style.maskImage = url
            mask.style.webkitMaskImage = url
        }
    }, [continuous, fill])

    useIsomorphicLayoutEffect(() => {
        lettersRef.current.length = characters.length
        layout()
    }, [characters, layout, size, tracking, weight, pattern])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const observer =
            typeof ResizeObserver === "function" ? new ResizeObserver(() => layout()) : null
        observer?.observe(root)
        window.addEventListener("resize", layout)

        return () => {
            observer?.disconnect()
            window.removeEventListener("resize", layout)
        }
    }, [layout])

    useEffect(() => {
        const fonts = document.fonts
        if (!fonts) return

        let cancelled = false
        const remeasure = () => {
            if (!cancelled) layout()
        }

        fonts.ready.then(remeasure)
        fonts.addEventListener("loadingdone", remeasure)

        return () => {
            cancelled = true
            fonts.removeEventListener("loadingdone", remeasure)
        }
    }, [layout])

    const applyWave = useCallback((index: number) => {
        lettersRef.current.forEach((letter, i) => {
            if (!letter) return
            const distance = index < 0 ? WAVE_REACH : Math.abs(i - index)
            const value = distance >= WAVE_REACH ? 0 : 1 - distance / WAVE_REACH
            letter.style.setProperty("--stencil-wave", value.toFixed(3))
        })
    }, [])

    useEffect(() => {
        if (hover !== "wave" && hover !== "expand") return
        if (hover === "wave" && reducedMotion) return
        const root = rootRef.current
        if (!root) return

        let pointerX = 0
        let hasPointer = false

        const resolve = () => {
            if (!hasPointer) return -1
            const centers = centersRef.current
            const local = pointerX - root.getBoundingClientRect().left
            let nearest = -1
            let best = Infinity
            for (let i = 0; i < centers.length; i += 1) {
                if (!lettersRef.current[i]) continue
                const distance = Math.abs(local - centers[i])
                if (distance < best) {
                    best = distance
                    nearest = i
                }
            }
            return nearest
        }

        const schedule = () => {
            if (frameRef.current !== 0) return
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = 0
                pointerRef.current = resolve()
                applyWave(pointerRef.current)
                if (hover === "expand") layout()
            })
        }

        const onMove = (event: PointerEvent) => {
            pointerX = event.clientX
            hasPointer = true
            schedule()
        }

        const onLeave = () => {
            hasPointer = false
            schedule()
        }

        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerleave", onLeave, { passive: true })

        return () => {
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerleave", onLeave)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
            applyWave(-1)
        }
    }, [hover, applyWave, layout, characters, reducedMotion])

    const rootStyle: CSSProperties = {
        ...style,
        fontSize: `${size}px`,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        fontFamily: font,
        ["--stencil-strength" as string]: strength,
        ["--stencil-tile" as string]: pattern.tile,
        ["--stencil-outline" as string]: `${outline}px`,
        ["--stencil-outline-color" as string]: outlineColor,
        ["--stencil-duration" as string]: animate > 0 ? `${animate}s` : "0s",
    }

    const letterStyle: CSSProperties = {
        backgroundImage: pattern.backgroundImage,
        backgroundSize: pattern.backgroundSize,
    }

    return (
        <div
            ref={rootRef}
            className={cx(
                "stencil",
                `stencil-hover-${hover}`,
                animate > 0 && "stencil-animated",
                outline > 0 && "stencil-outlined",
                className,
            )}
            style={rootStyle}
            aria-label={text}
            role="img"
        >
            {characters.map((character, index) =>
                character === " " ? (
                    <span key={index} className="stencil-space" aria-hidden="true">
                        &nbsp;
                    </span>
                ) : (
                    <span
                        key={index}
                        ref={(node) => {
                            lettersRef.current[index] = node
                        }}
                        className="stencil-letter"
                        style={
                            hover === "reveal" &&
                            media?.[index] &&
                            !VIDEO_PATTERN.test(media[index] as string)
                                ? {
                                      ...letterStyle,
                                      ["--stencil-media" as string]: cssUrl(media[index] as string),
                                  }
                                : letterStyle
                        }
                        data-glyph={character}
                        aria-hidden="true"
                    >
                        {character}
                        {hover === "reveal" &&
                        media?.[index] &&
                        VIDEO_PATTERN.test(media[index] as string) ? (
                            <span
                                className="stencil-media"
                                ref={(node) => {
                                    masksRef.current[index] = node
                                }}
                            >
                                <video
                                    src={media[index]}
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    preload="metadata"
                                    tabIndex={-1}
                                    aria-hidden="true"
                                />
                            </span>
                        ) : null}
                    </span>
                ),
            )}
        </div>
    )
}
