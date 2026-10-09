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

import {
    cx,
    driveScroll,
    finite,
    scrollPort,
    smoothstep,
    useIsomorphicLayoutEffect,
    useLatestRef,
    type ScrollDriver,
} from "../internal"
import { coverProgress, releaseSpace } from "./stack"
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
    /** how long the finished stack stays pinned before it scrolls away, in viewports */
    hold?: number
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
    heights: number[]
    viewport: number
}

const EPSILON = 0.0005

export function ScrollStack({
    children,
    scrollContainer,
    height = "100vh",
    heights,
    top = 0,
    peek = 0,
    hold = 0.3,
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
    const holdRef = useRef<HTMLDivElement>(null)
    const driverRef = useRef<ScrollDriver | null>(null)
    const cardsRef = useRef<(HTMLDivElement | null)[]>([])
    const veilsRef = useRef<(HTMLDivElement | null)[]>([])
    const metricsRef = useRef<Metrics | null>(null)
    const progressRef = useRef<number[]>([])
    const activeRef = useRef(-1)

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
    const holdShare = Math.max(0, finite(hold, 0.3))

    const measure = useCallback(() => {
        const container = containerRef.current
        const cards = cardsRef.current
        if (!container || cards.length === 0 || !cards[0]) {
            metricsRef.current = null
            return
        }

        const port = scrollPort(scrollContainer?.current)
        const viewport = port.height()
        let cursor = port.top(container) + port.scroll()
        const offsets: number[] = []
        const heights: number[] = []

        for (const card of cards) {
            const height = card ? card.offsetHeight : 0
            offsets.push(cursor)
            heights.push(height)
            cursor += height
        }
        offsets.push(cursor)

        const { top: stickyTop, peek: step } = settingsRef.current
        const space = releaseSpace(
            heights.map((_, i) => stickyTop + i * step),
            heights,
            holdShare * viewport,
        )
        if (holdRef.current) holdRef.current.style.height = `${space.toFixed(1)}px`

        metricsRef.current = { offsets, heights, viewport }
    }, [scrollContainer, settingsRef, holdShare])

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
                progress = coverProgress(
                    nextTop,
                    stickyTop,
                    metrics.heights[i],
                    nextSticky,
                    viewport,
                )
                if (settings.easing === "smooth") progress = smoothstep(progress)
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

    const schedule = useCallback(() => driverRef.current?.wake(), [])

    useIsomorphicLayoutEffect(() => {
        cardsRef.current.length = count
        veilsRef.current.length = count
        progressRef.current = new Array(count).fill(-1)
        measure()
        paint()
    }, [count, height, heights?.join("|"), top, peek, holdShare, measure, paint])

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

        const driver = driveScroll(scrollPort(scrollContainer?.current), () => {
            paint()
            return false
        })
        driverRef.current = driver
        window.addEventListener("resize", onResize)

        const observer = typeof ResizeObserver === "function" ? new ResizeObserver(onResize) : null
        observer?.observe(container)

        return () => {
            driver.dispose()
            driverRef.current = null
            window.removeEventListener("resize", onResize)
            observer?.disconnect()
        }
    }, [measure, paint, schedule, scrollContainer])

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
            <div
                ref={holdRef}
                className="scroll-stack-hold"
                aria-hidden="true"
                style={{ height: `${holdShare * 100}vh` }}
            />
        </div>
    )
}
