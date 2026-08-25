"use client"

import {
    Children,
    useCallback,
    useEffect,
    useRef,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from "react"

import { cx, scrollPort, useLatestRef, usePrefersReducedMotion } from "../../internal"
import "./Eclipse.css"

export type EclipseFrom = "up" | "left" | "right"

export interface EclipseProps {
    children: ReactNode
    /** drive it from a scrollable element instead of the page */
    scrollContainer?: RefObject<HTMLElement | null>
    /** how tall each section is; every section is pinned for exactly this long */
    height?: string
    /** which edge the incoming section arrives from */
    from?: EclipseFrom
    /** how far the section being covered pulls back, 0 to 0.2 */
    recede?: number
    /** how far the covered section dims, 0 to 1 */
    dim?: number
    dimColor?: string
    /** how far the covered section blurs, in px */
    blur?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
    onActiveChange?: (index: number) => void
}

export interface EclipseSectionProps {
    children: ReactNode
    className?: string
    style?: CSSProperties
}

/** A single full-height panel. Eclipse handles the pinning and the stacking. */
export function EclipseSection({ children, className, style }: EclipseSectionProps) {
    return (
        <div className={cx("xp-eclipse-inner", className)} style={style}>
            {children}
        </div>
    )
}

function clamp01(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value
}

export function Eclipse({
    children,
    scrollContainer,
    height = "100vh",
    from = "up",
    recede = 0.06,
    dim = 0.45,
    dimColor = "#05050a",
    blur = 0,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
    onActiveChange,
}: EclipseProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const panelsRef = useRef<(HTMLDivElement | null)[]>([])
    const veilsRef = useRef<(HTMLDivElement | null)[]>([])
    const metricsRef = useRef<{ top: number; step: number } | null>(null)
    const activeRef = useRef(-1)
    const frameRef = useRef(0)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const items = Children.toArray(children)
    const count = items.length

    const settings = useLatestRef({ from, recede, dim, blur, still, count })
    const report = useLatestRef(onActiveChange)

    const measure = useCallback(() => {
        const track = trackRef.current
        if (!track) {
            metricsRef.current = null
            return
        }
        const port = scrollPort(scrollContainer?.current)
        const first = panelsRef.current[0]
        if (!first) return

        metricsRef.current = {
            top: port.top(track) + port.scroll(),
            // one panel's worth of scroll buys one full cover
            step: Math.max(1, first.getBoundingClientRect().height),
        }
    }, [scrollContainer])

    const paint = useCallback(() => {
        const metrics = metricsRef.current
        if (!metrics) return

        const config = settings.current
        const port = scrollPort(scrollContainer?.current)
        const travelled = port.scroll() - metrics.top

        for (let index = 0; index < config.count; index += 1) {
            const panel = panelsRef.current[index]
            if (!panel) continue

            if (config.still) {
                panel.style.transform = ""
                panel.style.filter = ""
                const veil = veilsRef.current[index]
                if (veil) veil.style.opacity = "0"
                continue
            }

            // how far this panel has slid over the one before it
            const entering = clamp01(travelled / metrics.step - (index - 1))
            // and how far the next panel has covered this one
            const covered = clamp01(travelled / metrics.step - index)

            if (index === 0) {
                panel.style.transform = coveredTransform(covered, config.recede)
            } else {
                const slide = 1 - entering
                panel.style.transform =
                    covered > 0
                        ? coveredTransform(covered, config.recede)
                        : arrive(config.from, slide)
            }

            panel.style.filter =
                config.blur > 0 && covered > 0
                    ? `blur(${(covered * config.blur).toFixed(2)}px)`
                    : ""

            const veil = veilsRef.current[index]
            if (veil) veil.style.opacity = (covered * config.dim).toFixed(3)
        }

        const active = Math.min(config.count - 1, Math.max(0, Math.round(travelled / metrics.step)))
        if (active !== activeRef.current) {
            activeRef.current = active
            report.current?.(active)
        }
    }, [scrollContainer, settings, report])

    const schedule = useCallback(() => {
        if (frameRef.current !== 0) return
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0
            paint()
        })
    }, [paint])

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const port = scrollPort(scrollContainer?.current)

        const onResize = () => {
            measure()
            paint()
        }

        measure()
        paint()

        port.target.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", onResize)

        const sizer = typeof ResizeObserver === "function" ? new ResizeObserver(onResize) : null
        sizer?.observe(track)

        return () => {
            port.target.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", onResize)
            sizer?.disconnect()
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [measure, paint, schedule, scrollContainer])

    return (
        <div
            ref={trackRef}
            className={cx("xp-eclipse", className)}
            data-from={from}
            data-still={still ? "true" : undefined}
            style={style}
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    ref={(node) => {
                        panelsRef.current[index] = node
                    }}
                    className="xp-eclipse-panel"
                    // later sections sit above earlier ones, so covering is
                    // simply a matter of sliding in
                    style={{ height, zIndex: index + 1 } as CSSProperties}
                >
                    {item}
                    <div
                        ref={(node) => {
                            veilsRef.current[index] = node
                        }}
                        className="xp-eclipse-veil"
                        style={{ background: dimColor }}
                        aria-hidden="true"
                    />
                </div>
            ))}
        </div>
    )
}

/** The panel being covered eases back a little, so the cover reads as depth. */
function coveredTransform(covered: number, recede: number): string {
    const scale = 1 - covered * recede
    return `scale(${scale.toFixed(4)})`
}

function arrive(from: EclipseFrom, slide: number): string {
    if (slide <= 0) return "translate3d(0,0,0)"
    const amount = (slide * 100).toFixed(3)

    if (from === "left") return `translate3d(-${amount}%,0,0)`
    if (from === "right") return `translate3d(${amount}%,0,0)`
    return `translate3d(0,${amount}%,0)`
}
