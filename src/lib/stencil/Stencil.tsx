"use client"

import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react"

import { cssUrl, cx, useIsomorphicLayoutEffect } from "../internal"
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

        const rootBox = root.getBoundingClientRect()

        lettersRef.current.forEach((letter, index) => {
            if (!letter) return
            const box = letter.getBoundingClientRect()
            const offset = box.left - rootBox.left
            letter.style.setProperty("--stencil-offset", continuous ? `${-offset}` : "0")
            if (fill === "image") {
                letter.style.backgroundSize = `${rootBox.width}px ${rootBox.height}px`
            }

            const mask = masksRef.current[index]
            if (!mask || box.width === 0) return

            const computed = window.getComputedStyle(letter)
            const glyph = letter.dataset.glyph ?? ""
            const family = computed.fontFamily.replace(/"/g, "'")

            if (!measureRef.current) {
                measureRef.current = document.createElement("canvas").getContext("2d")
            }

            const size = parseFloat(computed.fontSize) || 16
            let ascent = size * 0.8
            let descent = size * 0.2

            const gauge = measureRef.current
            if (gauge) {
                gauge.font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${family}`
                const metrics = gauge.measureText(glyph)
                if (metrics.fontBoundingBoxAscent) ascent = metrics.fontBoundingBoxAscent
                if (metrics.fontBoundingBoxDescent) descent = metrics.fontBoundingBoxDescent
            }

            const baseline = (box.height - (ascent + descent)) / 2 + ascent
            const svg =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}">` +
                `<text x="0" y="${baseline}" text-anchor="start" ` +
                `font-family="${family}" ` +
                `font-size="${computed.fontSize}" font-weight="${computed.fontWeight}" ` +
                `fill="#000">${glyph.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`
            const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
            mask.style.maskImage = url
            mask.style.webkitMaskImage = url
        })
    }, [continuous, fill])

    useIsomorphicLayoutEffect(() => {
        lettersRef.current.length = characters.length
        layout()
    }, [characters, layout, size, tracking, weight, pattern])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const observer = new ResizeObserver(() => layout())
        observer.observe(root)
        window.addEventListener("resize", layout)

        return () => {
            observer.disconnect()
            window.removeEventListener("resize", layout)
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
        const root = rootRef.current
        if (!root) return

        const schedule = (index: number) => {
            pointerRef.current = index
            if (frameRef.current !== 0) return
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = 0
                applyWave(pointerRef.current)
                if (hover === "expand") layout()
            })
        }

        const onMove = (event: PointerEvent) => {
            let nearest = -1
            let best = Infinity
            lettersRef.current.forEach((letter, i) => {
                if (!letter) return
                const box = letter.getBoundingClientRect()
                const distance = Math.abs(event.clientX - (box.left + box.width / 2))
                if (distance < best) {
                    best = distance
                    nearest = i
                }
            })
            schedule(nearest)
        }

        const onLeave = () => schedule(-1)

        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerleave", onLeave, { passive: true })

        return () => {
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerleave", onLeave)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
            applyWave(-1)
        }
    }, [hover, applyWave, layout, characters])

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
                                />
                            </span>
                        ) : null}
                    </span>
                ),
            )}
        </div>
    )
}
