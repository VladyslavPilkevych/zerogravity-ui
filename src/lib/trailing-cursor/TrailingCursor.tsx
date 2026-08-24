"use client"

import { useEffect, useRef, type CSSProperties, type RefObject } from "react"

import { cx, useLatestRef } from "../internal"
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
const NO_OFFSET = { left: 0, top: 0 } as DOMRect

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
    const scoped = Boolean(container)

    const tokens = pointerFxTokens(preset)
    const settings = useLatestRef({
        ease,
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
        let loop: number | null = null
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

            loop = settled ? null : requestAnimationFrame(render)
        }

        const wake = () => {
            if (loop === null && document.visibilityState !== "hidden") {
                loop = requestAnimationFrame(render)
            }
        }

        const onMove = (event: PointerEvent) => {
            if (!enableOnTouch && event.pointerType !== "mouse") return

            const rect = box()
            targetX = event.clientX - rect.left
            targetY = event.clientY - rect.top
            root.dataset.visible = "true"
            wake()
        }

        const onOver = (event: PointerEvent) => {
            const target = event.target
            if (!(target instanceof Element)) return

            const scoped = target.closest(
                "[data-cursor], [data-cursor-scale], [data-cursor-color], [data-cursor-label]",
            )
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
            if (document.visibilityState === "hidden" && loop !== null) {
                cancelAnimationFrame(loop)
                loop = null
            }
        }

        applyRingSize()
        resizeRef.current = applyRingSize

        const surface: EventTarget = host ?? window
        const leaveOn: EventTarget = host ?? document
        const hideOn = host ?? document.body

        if (hideNativeCursor) hideOn.classList.add(HIDE_CLASS)
        surface.addEventListener("pointermove", onMove as EventListener, { passive: true })
        surface.addEventListener("pointerover", onOver as EventListener, { passive: true })
        surface.addEventListener("pointerdown", onDown, { passive: true })
        surface.addEventListener("pointerup", onUp, { passive: true })
        leaveOn.addEventListener("pointerleave", onLeave, { passive: true })
        document.addEventListener("visibilitychange", onVisibility)
        window.addEventListener("scroll", forget, { passive: true, capture: true })
        window.addEventListener("resize", forget, { passive: true })

        return () => {
            resizeRef.current = null
            hideOn.classList.remove(HIDE_CLASS)
            surface.removeEventListener("pointermove", onMove as EventListener)
            surface.removeEventListener("pointerover", onOver as EventListener)
            surface.removeEventListener("pointerdown", onDown)
            surface.removeEventListener("pointerup", onUp)
            leaveOn.removeEventListener("pointerleave", onLeave)
            document.removeEventListener("visibilitychange", onVisibility)
            window.removeEventListener("scroll", forget, { capture: true })
            window.removeEventListener("resize", forget)
            if (loop !== null) cancelAnimationFrame(loop)
        }
    }, [enabled, hideNativeCursor, enableOnTouch, settings, container])

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
            className={cx("trailing-cursor", className)}
            data-variant={variant}
            data-scoped={scoped ? "true" : "false"}
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
