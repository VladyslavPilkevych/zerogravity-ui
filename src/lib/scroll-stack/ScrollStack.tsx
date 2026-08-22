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

import { cx, scrollPort, useIsomorphicLayoutEffect, useLatestRef } from "../internal"
import "./ScrollStack.css"

export type StackEasing = "linear" | "smooth"

export interface ScrollStackProps {
    children: ReactNode
    /** Drive the stack from a scrollable element instead of the page. */
    scrollContainer?: RefObject<HTMLElement | null>
    height?: string
    heights?: (string | undefined)[]
    top?: number
    peek?: number
    scaleTo?: number
    dim?: number
    dimColor?: string
    opacityTo?: number
    liftTo?: number
    blurTo?: number
    rounded?: number
    easing?: StackEasing
    disabled?: boolean
    className?: string
    cardClassName?: string
    style?: CSSProperties
    onActiveChange?: (index: number) => void
}

interface Metrics {
    offsets: number[]
    viewport: number
}

const EPSILON = 0.0005

function clamp01(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value
}

export function ScrollStack({
    children,
    scrollContainer,
    height = "100vh",
    heights,
    top = 0,
    peek = 0,
    scaleTo = 0.92,
    dim = 0.5,
    dimColor = "#05050a",
    opacityTo = 1,
    liftTo = 0,
    blurTo = 0,
    rounded = 0,
    easing = "smooth",
    disabled = false,
    className,
    cardClassName,
    style,
    onActiveChange,
}: ScrollStackProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<(HTMLDivElement | null)[]>([])
    const veilsRef = useRef<(HTMLDivElement | null)[]>([])
    const metricsRef = useRef<Metrics | null>(null)
    const progressRef = useRef<number[]>([])
    const activeRef = useRef(-1)
    const frameRef = useRef(0)

    const items = Children.toArray(children)
    const count = items.length

    const settingsRef = useLatestRef({
        top,
        peek,
        scaleTo,
        dim,
        opacityTo,
        liftTo,
        blurTo,
        easing,
        disabled,
    })
    const activeHandlerRef = useLatestRef(onActiveChange)

    const measure = useCallback(() => {
        const container = containerRef.current
        const cards = cardsRef.current
        if (!container || cards.length === 0 || !cards[0]) {
            metricsRef.current = null
            return
        }

        const port = scrollPort(scrollContainer?.current)
        let cursor = port.top(container) + port.scroll()
        const offsets: number[] = []

        for (const card of cards) {
            offsets.push(cursor)
            cursor += card ? card.getBoundingClientRect().height : 0
        }
        offsets.push(cursor)

        metricsRef.current = { offsets, viewport: port.height() }
    }, [scrollContainer])

    const paint = useCallback(() => {
        const metrics = metricsRef.current
        const cards = cardsRef.current
        if (!metrics || cards.length === 0) return

        const settings = settingsRef.current
        const scrollY = scrollPort(scrollContainer?.current).scroll()
        const viewport = metrics.viewport
        const reduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const flat = settings.disabled || reduced

        let active = 0

        for (let i = 0; i < cards.length; i += 1) {
            const card = cards[i]
            if (!card) continue

            const stickyTop = settings.top + i * settings.peek
            if (metrics.offsets[i] - scrollY <= stickyTop + 1) active = i

            let progress = 0

            if (!flat && i < cards.length - 1) {
                const nextSticky = settings.top + (i + 1) * settings.peek
                const nextStatic = metrics.offsets[i + 1] - scrollY
                const nextTop = nextStatic < nextSticky ? nextSticky : nextStatic
                const travel = viewport - nextSticky
                progress = travel > 0 ? clamp01((viewport - nextTop) / travel) : 0
                if (settings.easing === "smooth")
                    progress = progress * progress * (3 - 2 * progress)
            }

            if (Math.abs(progress - (progressRef.current[i] ?? -1)) < EPSILON) continue
            progressRef.current[i] = progress

            const scale = 1 - (1 - settings.scaleTo) * progress
            const lift = -settings.liftTo * progress

            card.style.transform =
                progress === 0
                    ? ""
                    : `translate3d(0, ${lift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
            card.style.opacity =
                settings.opacityTo === 1 ? "" : String(1 - (1 - settings.opacityTo) * progress)

            if (settings.blurTo > 0) {
                card.style.filter =
                    progress === 0 ? "" : `blur(${(settings.blurTo * progress).toFixed(2)}px)`
            }

            const veil = veilsRef.current[i]
            if (veil) veil.style.opacity = (settings.dim * progress).toFixed(3)
        }

        if (active !== activeRef.current) {
            activeRef.current = active
            activeHandlerRef.current?.(active)
        }
    }, [settingsRef, activeHandlerRef, scrollContainer])

    const schedule = useCallback(() => {
        if (frameRef.current !== 0) return
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0
            paint()
        })
    }, [paint])

    useIsomorphicLayoutEffect(() => {
        cardsRef.current.length = count
        veilsRef.current.length = count
        progressRef.current = new Array(count).fill(-1)
        measure()
        paint()
    }, [count, height, heights?.join("|"), top, peek, measure, paint])

    useEffect(() => {
        progressRef.current.fill(-1)
        schedule()
    }, [scaleTo, dim, opacityTo, liftTo, blurTo, easing, disabled, schedule])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onResize = () => {
            measure()
            progressRef.current.fill(-1)
            schedule()
        }

        const port = scrollPort(scrollContainer?.current)
        port.target.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", onResize)

        const observer = typeof ResizeObserver === "function" ? new ResizeObserver(onResize) : null
        observer?.observe(container)

        return () => {
            port.target.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", onResize)
            observer?.disconnect()
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [measure, schedule, scrollContainer])

    return (
        <div ref={containerRef} className={cx("scroll-stack", className)} style={style}>
            {items.map((item, index) => (
                <div
                    key={index}
                    ref={(node) => {
                        cardsRef.current[index] = node
                    }}
                    className={
                        cardClassName ? `scroll-stack-card ${cardClassName}` : "scroll-stack-card"
                    }
                    style={{
                        height: heights?.[index] ?? height,
                        top: top + index * peek,
                        zIndex: index + 1,
                        borderRadius: rounded || undefined,
                        overflow: rounded ? "hidden" : undefined,
                    }}
                >
                    {item}
                    <div
                        ref={(node) => {
                            veilsRef.current[index] = node
                        }}
                        className="scroll-stack-veil"
                        style={{ background: dimColor }}
                    />
                </div>
            ))}
        </div>
    )
}
