"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

import { cx, usePrefersReducedMotion } from "../internal"
import "./SplitFlap.css"

export type SplitFlapMode = "text" | "clock" | "countdown"

export interface SplitFlapProps {
    value?: string
    mode?: SplitFlapMode
    target?: number
    length?: number
    alphabet?: string
    stepDuration?: number
    stagger?: number
    gap?: number
    charWidth?: number
    charHeight?: number
    fontSize?: number
    color?: string
    background?: string
    seamColor?: string
    radius?: number
    className?: string
    style?: CSSProperties
    onSettled?: (value: string) => void
}

const LETTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-"
const DIGITS = " 0123456789:."

function pad(value: number, size = 2): string {
    return String(Math.max(0, Math.floor(value))).padStart(size, "0")
}

function clockText(): string {
    const now = new Date()
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function countdownText(target: number): string {
    const left = Math.max(0, target - Date.now())
    const total = Math.floor(left / 1000)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

interface FlapProps {
    target: string
    alphabet: string
    stepDuration: number
    delay: number
    reduced: boolean
}

function Flap({ target, alphabet, stepDuration, delay, reduced }: FlapProps) {
    const [shown, setShown] = useState(target)
    const [previous, setPrevious] = useState(target)
    const shownRef = useRef(target)
    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        if (reduced || shownRef.current === target) return

        const from = alphabet.indexOf(shownRef.current)
        const to = alphabet.indexOf(target)
        const start = from < 0 ? 0 : from
        const end = to < 0 ? 0 : to
        const queue: string[] = []
        let cursor = start

        while (cursor !== end && queue.length < alphabet.length) {
            cursor = (cursor + 1) % alphabet.length
            queue.push(alphabet[cursor])
        }

        const advance = () => {
            const next = queue.shift()
            if (next === undefined) {
                timerRef.current = null
                return
            }
            setPrevious(shownRef.current)
            shownRef.current = next
            setShown(next)
            timerRef.current = window.setTimeout(advance, stepDuration)
        }

        timerRef.current = window.setTimeout(advance, delay)

        return () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [target, alphabet, stepDuration, delay, reduced])

    const visible = reduced ? target : shown

    return (
        <span className="split-flap-cell" data-flipping={visible === target ? "false" : "true"}>
            <span className="split-flap-half split-flap-top">
                <span className="split-flap-face">{visible}</span>
            </span>
            <span className="split-flap-half split-flap-bottom">
                <span className="split-flap-face">{visible}</span>
            </span>
            <span className="split-flap-leaf" key={visible}>
                <span className="split-flap-face">{previous}</span>
            </span>
            <span className="split-flap-seam" />
        </span>
    )
}

export function SplitFlap({
    value = "",
    mode = "text",
    target,
    length,
    alphabet,
    stepDuration = 55,
    stagger = 45,
    gap = 4,
    charWidth = 44,
    charHeight = 64,
    fontSize = 34,
    color = "#f5f5f7",
    background = "#141419",
    seamColor = "rgba(0, 0, 0, 0.55)",
    radius = 6,
    className,
    style,
    onSettled,
}: SplitFlapProps) {
    const [tick, setTick] = useState(() => (mode === "text" ? value : ""))
    const reduced = usePrefersReducedMotion()

    useEffect(() => {
        if (mode === "text") {
            setTick(value)
            return
        }

        const read = () =>
            setTick(mode === "clock" ? clockText() : countdownText(target ?? Date.now()))
        read()
        const id = window.setInterval(read, 1000)
        return () => window.clearInterval(id)
    }, [mode, value, target])

    const set = alphabet ?? (mode === "text" ? LETTERS : DIGITS)

    const cells = useMemo(() => {
        const raw = (mode === "text" ? tick : tick).toUpperCase()
        const width = length ?? raw.length
        const padded = raw.padEnd(width, " ").slice(0, width)
        return Array.from(padded).map((char) => (set.includes(char) ? char : " "))
    }, [tick, length, set, mode])

    const settledRef = useRef("")
    useEffect(() => {
        const joined = cells.join("")
        if (joined === settledRef.current) return
        settledRef.current = joined
        onSettled?.(joined)
    }, [cells, onSettled])

    const rootStyle = {
        ...style,
        gap: `${gap}px`,
        ["--sf-w" as string]: `${charWidth}px`,
        ["--sf-h" as string]: `${charHeight}px`,
        ["--sf-font" as string]: `${fontSize}px`,
        ["--sf-color" as string]: color,
        ["--sf-bg" as string]: background,
        ["--sf-seam" as string]: seamColor,
        ["--sf-radius" as string]: `${radius}px`,
        ["--sf-step" as string]: `${stepDuration}ms`,
    } as CSSProperties

    return (
        <div
            className={cx("split-flap", className)}
            style={rootStyle}
            role="img"
            aria-label={cells.join("").trim()}
        >
            {cells.map((char, index) => (
                <Flap
                    key={index}
                    target={char}
                    alphabet={set}
                    stepDuration={stepDuration}
                    delay={index * stagger}
                    reduced={reduced}
                />
            ))}
        </div>
    )
}
