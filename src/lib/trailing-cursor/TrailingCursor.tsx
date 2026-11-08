"use client"

import { useEffect, useRef, type CSSProperties, type RefObject } from "react"

import { clamp, cx, finite, useLatestRef, wakeLoop } from "../internal"
import { resolveColor, usePointerFxEnabled, type PointerFxPreset } from "../pointer-fx"
import { pointerFxTokens } from "../pointer-fx/presets"
import "./TrailingCursor.css"

export type TrailingCursorVariant = "dot-ring" | "ring-only" | "dot-only"

export interface TrailingCursorProps {
    /** Scope the effect to one element. Without it the cursor covers the page. */
    container?: RefObject<HTMLElement | null>
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
    dotEase?: number
    dotHoverScale?: number
    dotPressScale?: number
    hideNativeCursor?: boolean
    preserveTextCursor?: boolean
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
const KEEP_TEXT_CLASS = "trailing-cursor-keep-text"
const DEFAULT_SELECTOR = "a, button, input, select, textarea, [role='button'], [data-cursor]"
const NON_TEXT_INPUTS = [
    "button",
    "submit",
    "reset",
    "checkbox",
    "radio",
    "range",
    "color",
    "file",
    "image",
    "hidden",
]
const TEXT_ENTRY_SELECTOR = [
    "textarea",
    `input:not(${NON_TEXT_INPUTS.map((type) => `[type="${type}"]`).join(", ")})`,
    "[contenteditable]:not([contenteditable='false'])",
].join(", ")
const NO_OFFSET = { left: 0, top: 0 } as DOMRect

function rate(value: number | undefined, fallback: number): number {
    return clamp(finite(value, fallback), 0.01, 1)
}

function scaleOf(value: number | undefined): number {
    return clamp(finite(value, 1), 0, 10)
}

function approach(factor: number, dt: number): number {
    return factor >= 1 ? 1 : 1 - Math.pow(1 - factor, dt * 60)
}

export function TrailingCursor({
    container,
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
    dotEase = 1,
    dotHoverScale = 1,
    dotPressScale = 1,
    hideNativeCursor = true,
    preserveTextCursor = true,
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
    const wakeRef = useRef<(() => void) | null>(null)

    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
    const scoped = Boolean(container)

    const tokens = pointerFxTokens(preset)
    const settings = useLatestRef({
        variant,
        ease: rate(ease, 0.16),
        dotEase: rate(dotEase, 1),
        ringSize,
        ringHoverSize,
        ringPressSize,
        interactiveSelector,
        dot: dotColor ?? tokens.dot,
        ring: ringColor ?? tokens.ring,
        border: ringBorderColor ?? tokens.ringBorder,
    })

    useEffect(() => {
        if (!enabled) return

        const root = rootRef.current
        const dot = dotRef.current
        const ring = ringRef.current
        const shape = shapeRef.current
        const label = labelRef.current
        if (!root || !ring || !shape) return

        const host = container?.current ?? null
        if (container && !host) return

        // the host is the coordinate frame when scoped, the viewport otherwise
        let frame: DOMRect | null = null
        const box = (): DOMRect => {
            if (!host) return NO_OFFSET
            if (!frame) frame = host.getBoundingClientRect()
            return frame
        }
        const forget = () => {
            frame = null
        }

        let targetX = window.innerWidth / 2
        let targetY = window.innerHeight / 2
        if (host) {
            targetX = host.clientWidth / 2
            targetY = host.clientHeight / 2
        }
        let ringX = targetX
        let ringY = targetY
        let dotX = targetX
        let dotY = targetY
        let placed = false
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

        const loop = wakeLoop((dt) => {
            const config = settings.current
            const showRing = config.variant !== "dot-only"
            const showDot = config.variant !== "ring-only"
            let settled = true

            if (showRing) {
                const step = approach(config.ease, dt)
                ringX += (targetX - ringX) * step
                ringY += (targetY - ringY) * step
                if (
                    Math.abs(targetX - ringX) < SETTLE_PX &&
                    Math.abs(targetY - ringY) < SETTLE_PX
                ) {
                    ringX = targetX
                    ringY = targetY
                } else {
                    settled = false
                }
                ring.style.translate = `${ringX}px ${ringY}px`
            } else {
                ringX = targetX
                ringY = targetY
            }

            if (showDot && dot) {
                const step = approach(config.dotEase, dt)
                dotX += (targetX - dotX) * step
                dotY += (targetY - dotY) * step
                if (Math.abs(targetX - dotX) < SETTLE_PX && Math.abs(targetY - dotY) < SETTLE_PX) {
                    dotX = targetX
                    dotY = targetY
                } else {
                    settled = false
                }
                dot.style.translate = `${dotX}px ${dotY}px`
            } else {
                dotX = targetX
                dotY = targetY
            }

            return !settled
        })

        const onMove = (event: PointerEvent) => {
            if (!enableOnTouch && event.pointerType !== "mouse") return

            const rect = box()
            targetX = event.clientX - rect.left
            targetY = event.clientY - rect.top
            if (!placed) {
                placed = true
                dotX = targetX
                dotY = targetY
            }
            root.dataset.visible = "true"
            loop.wake()
        }

        const onOver = (event: PointerEvent) => {
            const target = event.target
            if (!(target instanceof Element)) return

            const scoped = target.closest(
                "[data-cursor], [data-cursor-scale], [data-cursor-color], [data-cursor-label]",
            )
            const mode = scoped?.getAttribute("data-cursor") ?? ""
            const editing = preserveTextCursor && target.closest(TEXT_ENTRY_SELECTOR) !== null
            root.dataset.hidden = mode === "hidden" || editing ? "true" : "false"

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
            root.dataset.hovering = hovering ? "true" : "false"
            applyRingSize()
        }

        const release = () => {
            window.removeEventListener("pointerup", release)
            window.removeEventListener("pointercancel", release)
            window.removeEventListener("blur", release)
            if (!pressed) return
            pressed = false
            root.dataset.pressed = "false"
            applyRingSize()
        }

        const onDown = () => {
            window.addEventListener("pointerup", release, { passive: true })
            window.addEventListener("pointercancel", release, { passive: true })
            window.addEventListener("blur", release)
            pressed = true
            root.dataset.pressed = "true"
            applyRingSize()
        }

        const onLeave = () => {
            root.dataset.visible = "false"
        }

        applyRingSize()
        resizeRef.current = applyRingSize
        wakeRef.current = () => {
            if (placed) loop.wake()
        }

        const surface: EventTarget = host ?? window
        const leaveOn: EventTarget = host ?? document
        const hideOn = host ?? document.body

        if (hideNativeCursor) {
            hideOn.classList.add(HIDE_CLASS)
            if (preserveTextCursor) hideOn.classList.add(KEEP_TEXT_CLASS)
        }
        surface.addEventListener("pointermove", onMove as EventListener, { passive: true })
        surface.addEventListener("pointerover", onOver as EventListener, { passive: true })
        surface.addEventListener("pointerdown", onDown, { passive: true })
        leaveOn.addEventListener("pointerleave", onLeave, { passive: true })
        window.addEventListener("scroll", forget, { passive: true, capture: true })
        window.addEventListener("resize", forget, { passive: true })

        return () => {
            resizeRef.current = null
            wakeRef.current = null
            hideOn.classList.remove(HIDE_CLASS, KEEP_TEXT_CLASS)
            surface.removeEventListener("pointermove", onMove as EventListener)
            surface.removeEventListener("pointerover", onOver as EventListener)
            surface.removeEventListener("pointerdown", onDown)
            leaveOn.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("scroll", forget, { capture: true })
            window.removeEventListener("resize", forget)
            window.removeEventListener("pointerup", release)
            window.removeEventListener("pointercancel", release)
            window.removeEventListener("blur", release)
            loop.sleep()
        }
    }, [enabled, hideNativeCursor, preserveTextCursor, enableOnTouch, settings, container])

    useEffect(() => {
        resizeRef.current?.()
    }, [enabled, ringSize, ringHoverSize, ringPressSize])

    useEffect(() => {
        wakeRef.current?.()
    }, [enabled, variant, ease, dotEase])

    if (!enabled) return null

    const style = {
        zIndex,
        "--tc-dot": dotColor ?? tokens.dot,
        "--tc-ring": ringColor ?? tokens.ring,
        "--tc-border": ringBorderColor ?? tokens.ringBorder,
        "--tc-dot-size": `${dotSize}px`,
        "--tc-dot-hover-scale": scaleOf(dotHoverScale),
        "--tc-dot-press-scale": scaleOf(dotPressScale),
        ...(mixBlendMode ? { mixBlendMode } : null),
    } as CSSProperties

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            className={cx("trailing-cursor", className)}
            data-variant={variant}
            data-scoped={scoped ? "true" : "false"}
            data-visible="false"
            data-hidden="false"
            data-labelled="false"
            data-hovering="false"
            data-pressed="false"
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
