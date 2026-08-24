"use client"

import { useRef, type CSSProperties, type ReactNode } from "react"

import { cx, useIsomorphicLayoutEffect, useLatestRef } from "../internal"
import { usePointerFxEnabled } from "../pointer-fx"
import "./Vellum.css"

export interface VellumHighlight {
    dent?: number
    sheen?: number
    color?: string
    sheenColor?: string
}

export interface VellumProps {
    children: ReactNode
    tilt?: number
    highlight?: boolean | VellumHighlight
    radius?: number
    ease?: number
    perspective?: number
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const HIGHLIGHT_DEFAULTS = {
    dent: 0.35,
    sheen: 0.5,
    color: "rgba(0, 0, 0, 1)",
    sheenColor: "rgba(255, 255, 255, 1)",
}

export function Vellum({
    children,
    tilt = 9,
    highlight = true,
    radius = 22,
    ease = 0.14,
    perspective = 900,
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    style,
}: VellumProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)
    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
    const settings = useLatestRef({ ease })

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root || !enabled) return

        let targetX = 0.5
        let targetY = 0.5
        let targetPress = 0
        let x = 0.5
        let y = 0.5
        let press = 0
        let rect: DOMRect | null = null

        const invalidate = () => {
            rect = null
        }

        const paint = () => {
            const factor = Math.min(Math.max(settings.current.ease, 0.02), 1)
            x += (targetX - x) * factor
            y += (targetY - y) * factor
            press += (targetPress - press) * factor

            root.style.setProperty("--vellum-x", x.toFixed(4))
            root.style.setProperty("--vellum-y", y.toFixed(4))
            root.style.setProperty("--vellum-press", press.toFixed(4))

            const done =
                Math.abs(targetX - x) < 0.002 &&
                Math.abs(targetY - y) < 0.002 &&
                Math.abs(targetPress - press) < 0.002

            frameRef.current = done ? 0 : requestAnimationFrame(paint)
        }

        const wake = () => {
            if (frameRef.current === 0) frameRef.current = requestAnimationFrame(paint)
        }

        const onMove = (event: PointerEvent) => {
            if (!rect) rect = root.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) return
            targetX = (event.clientX - rect.left) / rect.width
            targetY = (event.clientY - rect.top) / rect.height
            targetPress = 1
            wake()
        }

        const onLeave = () => {
            targetX = 0.5
            targetY = 0.5
            targetPress = 0
            wake()
        }

        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerleave", onLeave, { passive: true })
        window.addEventListener("scroll", invalidate, { passive: true, capture: true })
        window.addEventListener("resize", invalidate)

        return () => {
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("scroll", invalidate, { capture: true })
            window.removeEventListener("resize", invalidate)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [enabled, settings])

    const lighting =
        highlight === false
            ? null
            : { ...HIGHLIGHT_DEFAULTS, ...(highlight === true ? {} : highlight) }

    const rootStyle: CSSProperties = {
        ...style,
        ["--vellum-tilt" as string]: `${tilt}deg`,
        ["--vellum-radius" as string]: `${radius}px`,
        ["--vellum-perspective" as string]: `${perspective}px`,
        ...(lighting
            ? {
                  ["--vellum-dent" as string]: lighting.dent,
                  ["--vellum-sheen" as string]: lighting.sheen,
                  ["--vellum-dent-color" as string]: lighting.color,
                  ["--vellum-sheen-color" as string]: lighting.sheenColor,
              }
            : {}),
    }

    return (
        <div ref={rootRef} className={cx("xp-vellum", className)} style={rootStyle}>
            <div className="xp-vellum-sheet">
                <div className="xp-vellum-content">{children}</div>
                {lighting ? (
                    <>
                        <div className="xp-vellum-dent" aria-hidden="true" />
                        <div className="xp-vellum-sheen" aria-hidden="true" />
                    </>
                ) : null}
            </div>
        </div>
    )
}
