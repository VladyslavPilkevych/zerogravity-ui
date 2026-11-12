"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react"

import {
    clamp,
    clamp01,
    cx,
    driveScroll,
    finite,
    onResize,
    rangeProgress,
    scrollPort,
    useLatestRef,
    usePrefersReducedMotion,
} from "../internal"
import "./Tether.css"

export type TetherFit = "contain" | "stretch"
export type TetherLinecap = "round" | "butt" | "square"
export type TetherVariant = "pixel" | "classic" | "minimal"

export interface TetherProps {
    d: string
    variant?: TetherVariant
    viewBox?: string
    fit?: TetherFit
    progress?: number
    start?: number
    end?: number
    stroke?: string
    strokeWidth?: number
    track?: string | false
    trackDash?: string
    linecap?: TetherLinecap
    scrollContainer?: RefObject<HTMLElement | null>
    onProgress?: (progress: number) => void
    disabled?: boolean
    respectReducedMotion?: boolean
    children?: ReactNode
    className?: string
    style?: CSSProperties
}

const SAMPLES = 96

/**
 * The path's length on screen. A non-scaling stroke dashes in screen pixels and
 * ignores `pathLength` in every engine, so the dash has to be sized from this.
 */
export function screenLength(path: SVGPathElement): number {
    if (typeof path.getTotalLength !== "function" || typeof path.getScreenCTM !== "function") {
        return 0
    }
    const matrix = path.getScreenCTM()
    const total = path.getTotalLength()
    if (!matrix || !(total > 0)) return 0

    let length = 0
    let previous: DOMPoint | null = null
    for (let i = 0; i <= SAMPLES; i++) {
        const point = path.getPointAtLength((total * i) / SAMPLES).matrixTransform(matrix)
        if (previous) length += Math.hypot(point.x - previous.x, point.y - previous.y)
        previous = point
    }
    return length
}

/** 0 when the host's top meets `start`, 1 when its bottom meets `end`, as viewport fractions. */
export function tetherProgress(
    top: number,
    height: number,
    viewport: number,
    start: number,
    end: number,
): number {
    return rangeProgress(start * viewport - top, 0, (start - end) * viewport + height)
}

export function Tether({
    d,
    variant = "pixel",
    viewBox = "0 0 100 100",
    fit = "contain",
    progress,
    start = 0.9,
    end = 0.5,
    stroke = "currentColor",
    strokeWidth = 2,
    track = "rgba(127, 127, 127, 0.28)",
    trackDash,
    linecap,
    scrollContainer,
    onProgress,
    disabled = false,
    respectReducedMotion = true,
    children,
    className,
    style,
}: TetherProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const lineRef = useRef<SVGPathElement>(null)
    const headRef = useRef<SVGPathElement>(null)
    const redrawRef = useRef<(() => void) | null>(null)
    const reduced = usePrefersReducedMotion()
    const controlled = progress !== undefined
    const complete = !controlled && (disabled || (respectReducedMotion && reduced))
    const settings = useLatestRef({
        progress: clamp01(finite(progress, 0)),
        start: clamp(finite(start, 0.9), -1, 2),
        end: clamp(finite(end, 0.5), -1, 2),
        onProgress,
    })

    useEffect(() => {
        const host = hostRef.current
        const line = lineRef.current
        if (!host || !line) return

        if (complete) {
            settings.current.onProgress?.(1)
            return
        }

        let length = 0
        let total = 0
        let shown = -1

        const draw = (value: number) => {
            if (length > 0) {
                line.style.strokeDasharray = `${length} ${length}`
                line.style.strokeDashoffset = String(length * (1 - value))
                host.dataset.measured = ""
            }
            const head = headRef.current
            if (head && total > 0) {
                const tip = line.getPointAtLength(total * value)
                if (Number.isFinite(tip.x) && Number.isFinite(tip.y)) {
                    head.setAttribute("d", `M ${tip.x} ${tip.y} h 0.001`)
                    head.toggleAttribute("data-on", value > 0)
                }
            }
            if (value !== shown) {
                shown = value
                settings.current.onProgress?.(value)
            }
        }

        const port = scrollPort(scrollContainer?.current)
        const current = () => {
            if (controlled) return settings.current.progress
            const { start: from, end: to } = settings.current
            const box = host.getBoundingClientRect()
            return tetherProgress(port.top(host), box.height, port.height(), from, to)
        }

        const driver = controlled
            ? null
            : driveScroll(port, () => {
                  draw(current())
                  return false
              })

        const measure = () => {
            length = screenLength(line)
            total = typeof line.getTotalLength === "function" ? line.getTotalLength() : 0
            shown = -1
            draw(current())
        }

        measure()
        const stopResize = onResize(host, measure)
        redrawRef.current = () => draw(current())

        return () => {
            redrawRef.current = null
            stopResize()
            driver?.dispose()
            line.style.strokeDasharray = ""
            line.style.strokeDashoffset = ""
            delete host.dataset.measured
        }
    }, [complete, controlled, scrollContainer, settings, d, viewBox, fit])

    useEffect(() => {
        redrawRef.current?.()
    }, [progress])

    const pixel = variant === "pixel"
    const cap = linecap ?? (pixel ? "square" : "round")
    const dash = trackDash ?? (pixel ? "2 6" : undefined)

    const vars = {
        "--zg-tether-stroke": stroke,
        "--zg-tether-track": track || "transparent",
        "--zg-tether-width": `${clamp(finite(strokeWidth, 2), 0.5, 64)}px`,
    } as CSSProperties

    return (
        <div
            ref={hostRef}
            className={cx("zg-tether", className)}
            data-variant={variant}
            data-mode={controlled ? "controlled" : "scroll"}
            data-complete={complete ? "" : undefined}
            data-motion={respectReducedMotion ? undefined : "always"}
            style={{ ...style, ...vars }}
        >
            <svg
                className="zg-tether-layer"
                viewBox={viewBox}
                preserveAspectRatio={fit === "stretch" ? "none" : "xMidYMid meet"}
                aria-hidden="true"
                focusable="false"
            >
                {track !== false && (
                    <path
                        className="zg-tether-track"
                        d={d}
                        strokeDasharray={dash}
                        vectorEffect="non-scaling-stroke"
                    />
                )}
                <path
                    ref={lineRef}
                    className="zg-tether-line"
                    d={d}
                    strokeLinecap={cap}
                    vectorEffect="non-scaling-stroke"
                />
                {pixel && !complete && (
                    <path
                        ref={headRef}
                        className="zg-tether-head"
                        d="M 0 0"
                        strokeLinecap="square"
                        vectorEffect="non-scaling-stroke"
                    />
                )}
            </svg>
            {children !== undefined && <div className="zg-tether-content">{children}</div>}
        </div>
    )
}
