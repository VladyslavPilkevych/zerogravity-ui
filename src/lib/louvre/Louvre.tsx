"use client"

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from "react"

import {
    cx,
    onResize,
    scrollPort,
    useIsomorphicLayoutEffect,
    usePrefersReducedMotion,
} from "../internal"
import "./Louvre.css"

export interface LouvreProps {
    front: ReactNode
    back: ReactNode
    /** Drive the reveal from a scrollable element instead of the page. */
    scrollContainer?: RefObject<HTMLElement | null>
    slats?: number
    orientation?: "horizontal" | "vertical"
    scrollLength?: string
    phase?: number
    perspective?: number
    gap?: number
    shade?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const REVEAL_AT = 0.55

export function Louvre({
    front,
    back,
    scrollContainer,
    slats = 10,
    orientation = "horizontal",
    scrollLength = "260vh",
    phase = 0.55,
    perspective = 1400,
    gap = 0,
    shade = 0.55,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: LouvreProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const backRef = useRef<HTMLDivElement>(null)
    const blindsRef = useRef<HTMLDivElement>(null)
    const liveRef = useRef<HTMLDivElement>(null)
    const reduced = usePrefersReducedMotion()
    const [revealed, setRevealed] = useState(false)

    const count = Math.max(2, Math.round(slats))
    const still = disabled || (respectReducedMotion && reduced)

    useEffect(() => {
        const root = rootRef.current
        if (!root || still) return

        const port = scrollPort(scrollContainer?.current)
        let progress = -1
        let frame = 0

        const measure = () => {
            frame = 0
            const travel = root.getBoundingClientRect().height - port.height()
            const raw = travel > 0 ? -port.top(root) / travel : 0
            const next = raw < 0 ? 0 : raw > 1 ? 1 : raw

            if (Math.abs(next - progress) <= 0.001) return
            progress = next
            root.style.setProperty("--louvre-progress", next.toFixed(4))
            root.toggleAttribute("data-moving", next > 0.001)
            setRevealed(next > REVEAL_AT)
        }

        const schedule = () => {
            if (frame === 0) frame = requestAnimationFrame(measure)
        }

        measure()
        port.target.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)
        const stopResize = onResize(root, schedule)

        return () => {
            port.target.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            stopResize()
            if (frame !== 0) cancelAnimationFrame(frame)
            root.removeAttribute("data-moving")
        }
    }, [still, scrollContainer])

    const rootStyle: CSSProperties = {
        ...style,
        height: still ? undefined : scrollLength,
        ["--louvre-count" as string]: count,
        ["--louvre-phase" as string]: phase,
        ["--louvre-perspective" as string]: `${perspective}px`,
        ["--louvre-gap" as string]: `${gap}px`,
        ["--louvre-shade" as string]: shade,
    }

    const showBack = still ? true : revealed

    useIsomorphicLayoutEffect(() => {
        backRef.current?.toggleAttribute("inert", !showBack)
        blindsRef.current?.toggleAttribute("inert", true)
        liveRef.current?.toggleAttribute("inert", showBack)
    }, [showBack, still])

    return (
        <div
            ref={rootRef}
            className={cx(
                "xp-louvre",
                `xp-louvre-${orientation}`,
                still && "xp-louvre-still",
                className,
            )}
            style={rootStyle}
        >
            <div className="xp-louvre-viewport">
                <div className="xp-louvre-scene">
                    <div ref={backRef} className="xp-louvre-back">
                        {back}
                    </div>

                    <div ref={blindsRef} className="xp-louvre-blinds" aria-hidden="true">
                        {Array.from({ length: count }, (_, index) => (
                            <div
                                key={index}
                                className="xp-louvre-slat"
                                style={{ ["--i" as string]: index }}
                            >
                                <div className="xp-louvre-face">
                                    <div
                                        className="xp-louvre-front"
                                        style={{ ["--slice" as string]: index }}
                                    >
                                        {front}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {still ? null : (
                        <div ref={liveRef} className="xp-louvre-live">
                            {front}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
