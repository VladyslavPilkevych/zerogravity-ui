"use client"

import { useMemo, useRef, type CSSProperties } from "react"

import { cx, useIsomorphicLayoutEffect, useLatestRef } from "../internal"
import { usePointerFxEnabled } from "../pointer-fx"
import "./Kern.css"

export interface KernProps {
    text: string
    radius?: number
    spread?: number
    lift?: number
    weight?: number
    ease?: number
    size?: number
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Kern({
    text,
    radius = 160,
    spread = 0.34,
    lift = 12,
    weight = 320,
    ease = 0.18,
    size = 88,
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    style,
}: KernProps) {
    const rootRef = useRef<HTMLSpanElement>(null)
    const glyphsRef = useRef<(HTMLSpanElement | null)[]>([])
    const frameRef = useRef(0)
    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
    const settings = useLatestRef({ radius, ease })

    const characters = useMemo(() => Array.from(text), [text])

    useIsomorphicLayoutEffect(() => {
        glyphsRef.current.length = characters.length
    }, [characters.length])

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root || !enabled) return

        const count = glyphsRef.current.length
        const centers = new Float32Array(count)
        const values = new Float32Array(count)
        let pointerX = 0
        let active = false
        let stale = true
        let rootRect: DOMRect | null = null

        const measure = () => {
            const rootBox = root.getBoundingClientRect()
            for (let i = 0; i < count; i += 1) {
                const glyph = glyphsRef.current[i]
                if (!glyph) continue
                const box = glyph.getBoundingClientRect()
                centers[i] = box.left - rootBox.left + box.width / 2
            }
            stale = false
        }

        const paint = () => {
            const config = settings.current
            rootRect = null
            if (stale) measure()

            const factor = Math.min(Math.max(config.ease, 0.02), 1)
            let moving = false

            for (let i = 0; i < count; i += 1) {
                const glyph = glyphsRef.current[i]
                if (!glyph) continue

                let target = 0
                if (active) {
                    const distance = Math.abs(pointerX - centers[i])
                    if (distance < config.radius) {
                        const near = 1 - distance / config.radius
                        target = near * near * (3 - 2 * near)
                    }
                }

                values[i] += (target - values[i]) * factor
                if (Math.abs(target - values[i]) > 0.004) moving = true
                glyph.style.setProperty("--k", values[i].toFixed(3))
            }

            frameRef.current = moving ? requestAnimationFrame(paint) : 0
        }

        const wake = () => {
            if (frameRef.current === 0) frameRef.current = requestAnimationFrame(paint)
        }

        const onMove = (event: PointerEvent) => {
            if (!rootRect) rootRect = root.getBoundingClientRect()
            pointerX = event.clientX - rootRect.left
            active = true
            wake()
        }

        const onLeave = () => {
            active = false
            wake()
        }

        const invalidate = () => {
            stale = true
            rootRect = null
        }

        const observer =
            typeof ResizeObserver === "function" ? new ResizeObserver(invalidate) : null
        observer?.observe(root)

        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerleave", onLeave, { passive: true })
        window.addEventListener("resize", invalidate)
        window.addEventListener("scroll", invalidate, { passive: true, capture: true })

        return () => {
            observer?.disconnect()
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("resize", invalidate)
            window.removeEventListener("scroll", invalidate, { capture: true })
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [enabled, settings, characters.length])

    const rootStyle: CSSProperties = {
        ...style,
        fontSize: `${size}px`,
        ["--kern-spread" as string]: spread,
        ["--kern-lift" as string]: `${lift}px`,
        ["--kern-weight" as string]: weight,
    }

    return (
        <span ref={rootRef} className={cx("xp-kern", className)} style={rootStyle} role="text">
            <span className="xp-kern-label">{text}</span>
            {characters.map((character, index) => (
                <span
                    key={index}
                    className={character === " " ? "xp-kern-space" : "xp-kern-glyph"}
                    aria-hidden="true"
                    ref={(node) => {
                        glyphsRef.current[index] = node
                    }}
                >
                    {character === " " ? " " : character}
                </span>
            ))}
        </span>
    )
}
