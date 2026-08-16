"use client"

import { useRef, useState, type CSSProperties, type ReactNode } from "react"

import {
    cx,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Louvre.css"

export interface LouvreProps {
    front: ReactNode
    back: ReactNode
    slats?: number
    orientation?: "horizontal" | "vertical"
    scrollLength?: string
    phase?: number
    perspective?: number
    gap?: number
    shade?: number
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

export function Louvre({
    front,
    back,
    slats = 10,
    orientation = "horizontal",
    scrollLength = "260vh",
    phase = 0.55,
    perspective = 1400,
    gap = 0,
    shade = 0.55,
    disabled = false,
    className,
    style,
}: LouvreProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)
    const reduced = usePrefersReducedMotion()
    const settings = useLatestRef({ phase })
    const [revealed, setRevealed] = useState(false)

    const count = Math.max(2, Math.round(slats))
    const still = disabled || reduced

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root || still) return

        let progress = -1

        const measure = () => {
            const rect = root.getBoundingClientRect()
            const travel = rect.height - window.innerHeight
            const raw = travel > 0 ? -rect.top / travel : 0
            const next = raw < 0 ? 0 : raw > 1 ? 1 : raw

            if (Math.abs(next - progress) > 0.001) {
                progress = next
                root.style.setProperty("--louvre-progress", next.toFixed(4))
                setRevealed(next > 0.55)
            }
            frameRef.current = 0
        }

        const schedule = () => {
            if (frameRef.current !== 0) return
            frameRef.current = requestAnimationFrame(measure)
        }

        measure()
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)

        return () => {
            window.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [still, settings])

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
                    <div className="xp-louvre-back" inert={showBack ? undefined : true}>
                        {back}
                    </div>

                    <div className="xp-louvre-blinds" inert={showBack ? true : undefined}>
                        {Array.from({ length: count }, (_, index) => (
                            <div
                                key={index}
                                className="xp-louvre-slat"
                                style={{ ["--i" as string]: index }}
                            >
                                <div className="xp-louvre-face">
                                    <div
                                        className="xp-louvre-front"
                                        inert={index === 0 ? undefined : true}
                                        style={{ ["--slice" as string]: index }}
                                    >
                                        {front}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
