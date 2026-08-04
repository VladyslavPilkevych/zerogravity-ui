"use client"

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    type CSSProperties,
} from "react"

import { buildPattern, type StencilFill } from "./patterns"
import "./Stencil.css"

export type StencilHover = "none" | "lift" | "pop" | "wave" | "tilt" | "shift" | "glow"

export interface StencilProps {
    text: string
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

export function Stencil({
    text,
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

        lettersRef.current.forEach((letter) => {
            if (!letter) return
            const offset = letter.getBoundingClientRect().left - rootBox.left
            letter.style.setProperty("--stencil-offset", continuous ? `${-offset}` : "0")
            if (fill === "image") {
                letter.style.backgroundSize = `${rootBox.width}px ${rootBox.height}px`
            }
        })
    }, [continuous, fill])

    useLayoutEffect(() => {
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

    const applyWave = useCallback(
        (index: number) => {
            lettersRef.current.forEach((letter, i) => {
                if (!letter) return
                const distance = index < 0 ? WAVE_REACH : Math.abs(i - index)
                const value = distance >= WAVE_REACH ? 0 : 1 - distance / WAVE_REACH
                letter.style.setProperty("--stencil-wave", value.toFixed(3))
            })
        },
        [],
    )

    useEffect(() => {
        if (hover !== "wave") return
        const root = rootRef.current
        if (!root) return

        const schedule = (index: number) => {
            pointerRef.current = index
            if (frameRef.current !== 0) return
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = 0
                applyWave(pointerRef.current)
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
    }, [hover, applyWave, characters])

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

    const classes = ["stencil", `stencil-hover-${hover}`]
    if (animate > 0) classes.push("stencil-animated")
    if (outline > 0) classes.push("stencil-outlined")
    if (className) classes.push(className)

    return (
        <div ref={rootRef} className={classes.join(" ")} style={rootStyle} aria-label={text} role="img">
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
                        style={letterStyle}
                        aria-hidden="true"
                    >
                        {character}
                    </span>
                ),
            )}
        </div>
    )
}
