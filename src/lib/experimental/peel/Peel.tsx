"use client"

import {
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
import "./Peel.css"

export type PeelCorner = "top-right" | "top-left" | "bottom-right" | "bottom-left"

export interface PeelProps {
    /** the sheet on top, the one that lifts away */
    front: ReactNode
    /** what is underneath it */
    back: ReactNode
    scrollContainer?: RefObject<HTMLElement | null>
    /** which corner lifts first */
    corner?: PeelCorner
    /** how tall the pinned section is */
    height?: string
    /** how much scroll it takes to peel, as a share of the viewport */
    travel?: number
    /** how hard the curl shades the sheet, 0 to 1 */
    curl?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export function Peel({
    front,
    back,
    scrollContainer,
    corner = "top-right",
    height = "100vh",
    travel = 1,
    curl = 0.7,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PeelProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const sheetRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        travel: clamp(finite(travel, 1), 0.2, 4),
        still,
    })

    const paint = useCallback(() => {
        const track = trackRef.current
        const sheet = sheetRef.current
        if (!track || !sheet) return

        if (settings.current.still) {
            sheet.style.setProperty("--pe-lift", "0")
            return
        }

        const port = scrollPort(scrollContainer?.current)
        // relative to the port, never to the viewport: the two only agree when
        // the port is the page
        const top = port.top(track)
        const span = Math.max(1, port.height() * settings.current.travel)
        const lifted = clamp(-top / span, 0, 1)

        sheet.style.setProperty("--pe-lift", lifted.toFixed(4))
    }, [scrollContainer, settings])

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
            className={cx("xp-peel", className)}
            data-corner={corner}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--pe-height": height,
                    "--pe-curl": clamp(finite(curl, 0.7), 0, 1),
                } as CSSProperties
            }
        >
            <div className="xp-peel-stage">
                <div className="xp-peel-back">{back}</div>
                <div ref={sheetRef} className="xp-peel-sheet">
                    <div className="xp-peel-face">{front}</div>
                    <span className="xp-peel-crease" aria-hidden="true" />
                </div>
            </div>
        </div>
    )
}
