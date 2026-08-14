"use client"

import { Children, useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import { cx, useIsomorphicLayoutEffect, useLatestRef } from "../internal"
import "./Aperture.css"

export type ApertureDirection = "close" | "open" | "both"

export interface ApertureProps {
    children: ReactNode
    height?: string
    inset?: number
    radius?: number
    direction?: ApertureDirection
    scale?: number
    dim?: number
    dimColor?: string
    easing?: "linear" | "smooth"
    disabled?: boolean
    className?: string
    style?: CSSProperties
    onProgress?: (progress: number) => void
}

const EPSILON = 0.002

function clamp01(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value
}

export function Aperture({
    children,
    height = "160vh",
    inset = 12,
    radius = 28,
    direction = "close",
    scale = 0.06,
    dim = 0,
    dimColor = "#05050a",
    easing = "smooth",
    disabled = false,
    className,
    style,
    onProgress,
}: ApertureProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const veilRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef(0)
    const lastRef = useRef(-1)
    const metricsRef = useRef<{ top: number; span: number } | null>(null)

    const settings = useLatestRef({ inset, radius, direction, scale, dim, easing, disabled })
    const progressRef = useLatestRef(onProgress)

    const measure = useCallback(() => {
        const track = trackRef.current
        if (!track) {
            metricsRef.current = null
            return
        }
        const box = track.getBoundingClientRect()
        metricsRef.current = {
            top: box.top + window.scrollY,
            span: Math.max(1, box.height - window.innerHeight),
        }
    }, [])

    const paint = useCallback(() => {
        const metrics = metricsRef.current
        const frame = frameRef.current
        if (!metrics || !frame) return

        const config = settings.current
        const reduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        let raw = clamp01((window.scrollY - metrics.top) / metrics.span)

        if (config.direction === "open") raw = 1 - raw
        else if (config.direction === "both") raw = 1 - Math.abs(raw * 2 - 1)

        let progress = config.disabled || reduced ? 0 : raw
        if (config.easing === "smooth") progress = progress * progress * (3 - 2 * progress)

        if (Math.abs(progress - lastRef.current) < EPSILON) return
        lastRef.current = progress

        frame.style.setProperty("--aperture-inset", `${config.inset * progress}%`)
        frame.style.setProperty("--aperture-radius", `${config.radius * progress}px`)

        const inner = innerRef.current
        if (inner) inner.style.transform = `scale(${1 - config.scale * progress})`

        const veil = veilRef.current
        if (veil) veil.style.opacity = (config.dim * progress).toFixed(3)

        progressRef.current?.(progress)
    }, [settings, progressRef])

    const schedule = useCallback(() => {
        if (rafRef.current !== 0) return
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0
            paint()
        })
    }, [paint])

    useIsomorphicLayoutEffect(() => {
        measure()
        lastRef.current = -1
        paint()
    }, [measure, paint, height, Children.count(children)])

    useEffect(() => {
        lastRef.current = -1
        schedule()
    }, [inset, radius, direction, scale, dim, easing, disabled, schedule])

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const onResize = () => {
            measure()
            lastRef.current = -1
            schedule()
        }

        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", onResize)
        const observer = new ResizeObserver(onResize)
        observer.observe(track)

        return () => {
            window.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", onResize)
            observer.disconnect()
            if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current)
            rafRef.current = 0
        }
    }, [measure, schedule])

    return (
        <div ref={trackRef} className={cx("aperture", className)} style={{ ...style, height }}>
            <div className="aperture-sticky">
                <div ref={frameRef} className="aperture-frame">
                    <div ref={innerRef} className="aperture-inner">
                        {children}
                    </div>
                    <div
                        ref={veilRef}
                        className="aperture-veil"
                        style={{ background: dimColor }}
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    )
}
