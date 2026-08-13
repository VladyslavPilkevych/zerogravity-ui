"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import { pointerFxTokens, resolveColor, usePointerFxEnabled, type PointerFxPreset } from "../pointer-fx"
import "./TrailingCursor.css"

export type TrailingCursorVariant = "dot-ring" | "ring-only" | "dot-only"

export interface TrailingCursorProps {
    preset?: PointerFxPreset
    variant?: TrailingCursorVariant
    dotColor?: string
    ringColor?: string
    ringBorderColor?: string
    dotSize?: number
    ringSize?: number
    ringHoverSize?: number
    ringPressSize?: number
    ease?: number
    hideNativeCursor?: boolean
    interactiveSelector?: string
    mixBlendMode?: CSSProperties["mixBlendMode"]
    zIndex?: number
    className?: string
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
}

const SETTLE_PX = 0.15
const HIDE_CLASS = "trailing-cursor-none"
const DEFAULT_SELECTOR = "a, button, input, select, textarea, [role='button'], [data-cursor]"

export function TrailingCursor({
    preset,
    variant = "dot-ring",
    dotColor,
    ringColor,
    ringBorderColor,
    dotSize = 6,
    ringSize = 34,
    ringHoverSize = 52,
    ringPressSize = 26,
    ease = 0.16,
    hideNativeCursor = true,
    interactiveSelector = DEFAULT_SELECTOR,
    mixBlendMode,
    zIndex = 2147483000,
    className,
    disabled,
    enableOnTouch,
    respectReducedMotion,
}: TrailingCursorProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const dotRef = useRef<HTMLDivElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)
    const shapeRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLSpanElement>(null)
    const resizeRef = useRef<(() => void) | null>(null)

    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })

    const tokens = pointerFxTokens(preset)
    const settings = useRef({
        ease,
        ringSize,
        ringHoverSize,
        ringPressSize,
        interactiveSelector,
        dot: dotColor ?? tokens.dot,
        ring: ringColor ?? tokens.ring,
        border: ringBorderColor ?? tokens.ringBorder,
    })
    settings.current = {
        ease,
        ringSize,
        ringHoverSize,
        ringPressSize,
        interactiveSelector,
        dot: dotColor ?? tokens.dot,
        ring: ringColor ?? tokens.ring,
        border: ringBorderColor ?? tokens.ringBorder,
    }

    useEffect(() => {
        if (!enabled) return

        const root = rootRef.current
        const dot = dotRef.current
        const ring = ringRef.current
        const shape = shapeRef.current
        const label = labelRef.current
        if (!root || !ring || !shape) return

        let targetX = window.innerWidth / 2
        let targetY = window.innerHeight / 2
        let ringX = targetX
        let ringY = targetY
        let frame: number | null = null
        let scale = 1
        let pressed = false
        let hovering = false

        const applyRingSize = () => {
            const config = settings.current
            const base = pressed
                ? config.ringPressSize
                : hovering
                  ? config.ringHoverSize
                  : config.ringSize
            shape.style.width = `${base * scale}px`
            shape.style.height = `${base * scale}px`
        }

        const render = () => {
            const factor = Math.min(Math.max(settings.current.ease, 0.01), 1)
            ringX += (targetX - ringX) * factor
            ringY += (targetY - ringY) * factor

            if (dot) dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`

            const settled =
                Math.abs(targetX - ringX) < SETTLE_PX && Math.abs(targetY - ringY) < SETTLE_PX

            frame = settled ? null : requestAnimationFrame(render)
        }

        const wake = () => {
            if (frame === null && document.visibilityState !== "hidden") {
                frame = requestAnimationFrame(render)
            }
        }

        const onMove = (event: PointerEvent) => {
            if (!enableOnTouch && event.pointerType !== "mouse") return
            targetX = event.clientX
            targetY = event.clientY
            root.dataset.visible = "true"
            wake()
        }

        const onOver = (event: PointerEvent) => {
            const target = event.target
            if (!(target instanceof Element)) return

            const scoped = target.closest("[data-cursor], [data-cursor-scale], [data-cursor-color], [data-cursor-label]")
            const mode = scoped?.getAttribute("data-cursor") ?? ""
            root.dataset.hidden = mode === "hidden" ? "true" : "false"

            const rawScale = scoped?.getAttribute("data-cursor-scale")
            const parsedScale = rawScale === null || rawScale === undefined ? 1 : Number(rawScale)
            scale = Number.isFinite(parsedScale) && parsedScale > 0 ? parsedScale : 1

            const custom = scoped?.getAttribute("data-cursor-color")
            const resolved = custom ? resolveColor(custom, scoped) : null
            root.style.setProperty("--tc-dot", resolved ?? settings.current.dot)
            root.style.setProperty("--tc-border", resolved ?? settings.current.border)
            if (resolved) root.dataset.tinted = "true"
            else delete root.dataset.tinted

            const text = scoped?.getAttribute("data-cursor-label") ?? ""
            if (label) label.textContent = text
            root.dataset.labelled = text ? "true" : "false"

            hovering = target.closest(settings.current.interactiveSelector) !== null
            applyRingSize()
        }

        const onDown = () => {
            pressed = true
            applyRingSize()
        }

        const onUp = () => {
            pressed = false
            applyRingSize()
        }

        const onLeave = () => {
            root.dataset.visible = "false"
        }

        const onVisibility = () => {
            if (document.visibilityState === "hidden" && frame !== null) {
                cancelAnimationFrame(frame)
                frame = null
            }
        }

        applyRingSize()
        resizeRef.current = applyRingSize

        if (hideNativeCursor) document.body.classList.add(HIDE_CLASS)
        window.addEventListener("pointermove", onMove, { passive: true })
        window.addEventListener("pointerover", onOver, { passive: true })
        window.addEventListener("pointerdown", onDown, { passive: true })
        window.addEventListener("pointerup", onUp, { passive: true })
        document.addEventListener("pointerleave", onLeave, { passive: true })
        document.addEventListener("visibilitychange", onVisibility)

        return () => {
            resizeRef.current = null
            document.body.classList.remove(HIDE_CLASS)
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerover", onOver)
            window.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointerup", onUp)
            document.removeEventListener("pointerleave", onLeave)
            document.removeEventListener("visibilitychange", onVisibility)
            if (frame !== null) cancelAnimationFrame(frame)
        }
    }, [enabled, hideNativeCursor, enableOnTouch])

    useEffect(() => {
        resizeRef.current?.()
    }, [enabled, ringSize, ringHoverSize, ringPressSize])

    if (!enabled) return null

    const style = {
        zIndex,
        "--tc-dot": dotColor ?? tokens.dot,
        "--tc-ring": ringColor ?? tokens.ring,
        "--tc-border": ringBorderColor ?? tokens.ringBorder,
        "--tc-dot-size": `${dotSize}px`,
        ...(mixBlendMode ? { mixBlendMode } : null),
    } as CSSProperties

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            className={className ? `trailing-cursor ${className}` : "trailing-cursor"}
            data-variant={variant}
            data-visible="false"
            data-hidden="false"
            data-labelled="false"
            style={style}
        >
            <div ref={ringRef} className="trailing-cursor-ring">
                <div ref={shapeRef} className="trailing-cursor-ring-shape">
                    <span ref={labelRef} className="trailing-cursor-label" />
                </div>
            </div>
            <div ref={dotRef} className="trailing-cursor-dot" />
        </div>
    )
}
