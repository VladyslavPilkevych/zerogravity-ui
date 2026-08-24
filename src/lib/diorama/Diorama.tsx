"use client"

import { useRef, type CSSProperties, type ReactNode } from "react"

import { cx, useIsomorphicLayoutEffect, useLatestRef, usePrefersReducedMotion } from "../internal"
import "./Diorama.css"

export interface DioramaPlane {
    content: ReactNode
    depth?: number
    blur?: number
    opacity?: number
}

export interface DioramaProps {
    background: ReactNode
    planes?: DioramaPlane[]
    parallax?: number
    blur?: number
    perspective?: number
    ease?: number
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Diorama({
    background,
    planes = [],
    parallax = 46,
    blur = 7,
    perspective = 1200,
    ease = 0.11,
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    style,
}: DioramaProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)
    const reduced = usePrefersReducedMotion()
    const settings = useLatestRef({ ease })

    const still = disabled || (respectReducedMotion && reduced)

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root || still) return

        let targetX = 0
        let targetY = 0
        let x = 0
        let y = 0
        let rect: DOMRect | null = null

        const invalidate = () => {
            rect = null
        }

        const paint = () => {
            const factor = Math.min(Math.max(settings.current.ease, 0.02), 1)
            rect = null
            x += (targetX - x) * factor
            y += (targetY - y) * factor

            root.style.setProperty("--diorama-x", x.toFixed(4))
            root.style.setProperty("--diorama-y", y.toFixed(4))

            const done = Math.abs(targetX - x) < 0.0015 && Math.abs(targetY - y) < 0.0015
            frameRef.current = done ? 0 : requestAnimationFrame(paint)
        }

        const wake = () => {
            if (frameRef.current === 0) frameRef.current = requestAnimationFrame(paint)
        }

        const onMove = (event: PointerEvent) => {
            if (!enableOnTouch && event.pointerType !== "mouse") return
            if (!rect) rect = root.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) return

            const nx = (event.clientX - rect.left) / rect.width - 0.5
            const ny = (event.clientY - rect.top) / rect.height - 0.5
            targetX = Math.max(-0.5, Math.min(0.5, nx))
            targetY = Math.max(-0.5, Math.min(0.5, ny))
            wake()
        }

        const onLeave = () => {
            targetX = 0
            targetY = 0
            wake()
        }

        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerleave", onLeave, { passive: true })
        window.addEventListener("blur", onLeave)
        window.addEventListener("resize", invalidate)
        window.addEventListener("scroll", invalidate, { passive: true, capture: true })

        return () => {
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("blur", onLeave)
            window.removeEventListener("resize", invalidate)
            window.removeEventListener("scroll", invalidate, { capture: true })
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [still, enableOnTouch, settings])

    const rootStyle: CSSProperties = {
        ...style,
        ["--diorama-perspective" as string]: `${perspective}px`,
        ["--diorama-parallax" as string]: parallax,
        ["--diorama-blur" as string]: blur,
    }

    return (
        <div
            ref={rootRef}
            className={cx("xp-diorama", still && "xp-diorama-still", className)}
            style={rootStyle}
        >
            <div className="xp-diorama-far">{background}</div>

            {planes.map((plane, index) => {
                const depth = plane.depth ?? (index + 1) / planes.length
                return (
                    <div
                        key={index}
                        className="xp-diorama-near"
                        style={{
                            ["--depth" as string]: depth,
                            ["--plane-blur" as string]: plane.blur ?? "",
                            opacity: plane.opacity,
                            zIndex: index + 1,
                        }}
                    >
                        {plane.content}
                    </div>
                )
            })}
        </div>
    )
}
