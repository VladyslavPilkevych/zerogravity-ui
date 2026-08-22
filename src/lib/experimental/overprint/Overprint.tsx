"use client"

import { useRef, type CSSProperties } from "react"

import {
    cx,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Overprint.css"

export interface OverprintProps {
    text: string
    inks?: string[]
    spread?: number
    converge?: number
    size?: number
    weight?: number
    blend?: CSSProperties["mixBlendMode"]
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

const DEFAULT_INKS = ["#00b7c8", "#e6007e", "#ffd400"]
const SETTLED = 0.3

export function Overprint({
    text,
    inks = DEFAULT_INKS,
    spread = 10,
    converge = 5,
    size = 96,
    weight = 800,
    blend = "screen",
    disabled = false,
    className,
    style,
}: OverprintProps) {
    const rootRef = useRef<HTMLSpanElement>(null)
    const frameRef = useRef(0)
    const reduced = usePrefersReducedMotion()
    const settings = useLatestRef({ spread, converge })

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root || disabled || reduced) return

        let lastY = window.scrollY
        let velocity = 0
        let offset = 0
        let lastTime = 0

        const paint = (now: number) => {
            const config = settings.current
            const dt = lastTime === 0 ? 1 / 60 : Math.min((now - lastTime) / 1000, 1 / 15)
            lastTime = now

            const target = Math.max(-1, Math.min(1, velocity * 0.03))
            offset += (target - offset) * Math.min(1, config.converge * dt)
            velocity *= Math.exp(-6 * dt)

            root.style.setProperty("--overprint-shift", offset.toFixed(4))

            if (Math.abs(velocity) > SETTLED || Math.abs(offset) > 0.004) {
                frameRef.current = requestAnimationFrame(paint)
            } else {
                frameRef.current = 0
                lastTime = 0
                root.style.setProperty("--overprint-shift", "0")
            }
        }

        const wake = () => {
            if (frameRef.current !== 0) return
            lastTime = 0
            frameRef.current = requestAnimationFrame(paint)
        }

        const onScroll = () => {
            const y = window.scrollY
            velocity += y - lastY
            lastY = y
            wake()
        }

        window.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            window.removeEventListener("scroll", onScroll)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [disabled, reduced, settings])

    const plates = inks.length > 0 ? inks : DEFAULT_INKS

    const rootStyle: CSSProperties = {
        ...style,
        fontSize: `${size}px`,
        fontWeight: weight,
        ["--overprint-spread" as string]: `${spread}px`,
        ["--overprint-blend" as string]: blend,
    }

    return (
        <span ref={rootRef} className={cx("xp-overprint", className)} style={rootStyle}>
            <span className="xp-overprint-text">{text}</span>
            {plates.map((ink, index) => (
                <span
                    key={index}
                    className="xp-overprint-plate"
                    aria-hidden="true"
                    style={{
                        color: ink,
                        ["--plate" as string]: index - (plates.length - 1) / 2,
                    }}
                >
                    {text}
                </span>
            ))}
        </span>
    )
}
