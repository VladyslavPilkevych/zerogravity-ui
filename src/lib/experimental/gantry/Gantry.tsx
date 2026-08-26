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
    clamp,
    cx,
    finite,
    scrollPort,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Gantry.css"

export interface GantryProps {
    children: ReactNode
    scrollContainer?: RefObject<HTMLElement | null>
    /** how tall the pinned stage is */
    height?: string
    /** the width of one car */
    itemWidth?: string
    gap?: string
    /** how much page scroll one screen of travel costs, 1 is one viewport */
    pace?: number
    /** cars lean into the direction of travel, in degrees */
    lean?: number
    /** names the rail once it becomes an ordinary scroller */
    label?: string
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
    onProgress?: (progress: number) => void
}

export function Gantry({
    children,
    scrollContainer,
    height = "80vh",
    itemWidth = "clamp(220px, 32vw, 420px)",
    gap = "24px",
    pace = 1,
    lean = 6,
    label = "Horizontal gallery",
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
    onProgress,
}: GantryProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const railRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)
    const lastRef = useRef(-1)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const items = Children.toArray(children)
    const settings = useLatestRef({ lean: clamp(finite(lean, 6), 0, 30), still })
    const report = useLatestRef(onProgress)

    const paint = useCallback(() => {
        const track = trackRef.current
        const rail = railRef.current
        if (!track || !rail) return

        if (settings.current.still) {
            rail.style.transform = ""
            return
        }

        const port = scrollPort(scrollContainer?.current)
        const top = port.top(track)
        const span = Math.max(1, track.offsetHeight - port.height())
        const progress = clamp(-top / span, 0, 1)
        const distance = Math.max(0, rail.scrollWidth - rail.parentElement!.clientWidth)

        rail.style.transform = `translate3d(${(-progress * distance).toFixed(2)}px,0,0)`

        // how fast the rail is moving right now, in degrees, clamped so a jump
        // in scroll position cannot throw the cards on their side
        const previous = lastRef.current < 0 ? progress : lastRef.current
        const swing = clamp(
            (progress - previous) * 320 * settings.current.lean,
            -settings.current.lean,
            settings.current.lean,
        )
        rail.style.setProperty("--gy-lean", swing.toFixed(3))
        lastRef.current = progress

        if (report.current) report.current(progress)
    }, [scrollContainer, settings, report])

    const schedule = useCallback(() => {
        if (frameRef.current !== 0) return
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0
            paint()
        })
    }, [paint])

    useEffect(() => {
        const port = scrollPort(scrollContainer?.current)
        paint()

        port.target.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)

        return () => {
            port.target.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [paint, schedule, scrollContainer])

    return (
        <div
            ref={trackRef}
            className={cx("xp-gantry", className)}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--gy-height": height,
                    "--gy-width": itemWidth,
                    "--gy-gap": gap,
                    "--gy-pace": clamp(finite(pace, 1), 0.2, 4),
                } as CSSProperties
            }
        >
            <div className="xp-gantry-stage">
                {/* under reduced motion the rail is a real scroller, so it has
                    to be reachable from the keyboard like any other one */}
                <div
                    className="xp-gantry-window"
                    tabIndex={still ? 0 : undefined}
                    role={still ? "region" : undefined}
                    aria-label={still ? label : undefined}
                >
                    <div ref={railRef} className="xp-gantry-rail">
                        {items.map((item, index) => (
                            <div key={index} className="xp-gantry-car">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
