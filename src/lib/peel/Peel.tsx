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
    clamp01,
    cx,
    damp,
    driveScroll,
    finite,
    onResize,
    scrollPort,
    useLatestRef,
    usePrefersReducedMotion,
    type PinPhase,
    type ScrollDriver,
} from "../internal"
import { peelState, peelTiming } from "./timeline"
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
    /** scroll spent pinned on the cover before it starts to lift, in stage heights */
    lead?: number
    /** scroll the peel itself takes, in stage heights */
    travel?: number
    /** scroll spent pinned on the uncovered layer before the section moves on, in stage heights */
    hold?: number
    /** drive the lift yourself, 0 to 1; scroll is then ignored */
    progress?: number
    /** how hard the curl shades the sheet, 0 to 1 */
    curl?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const FOLLOW_RATE = 14
const SETTLED = 0.0005

export function Peel({
    front,
    back,
    scrollContainer,
    corner = "top-right",
    height = "100vh",
    lead,
    travel,
    hold,
    progress,
    curl = 0.7,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PeelProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const sheetRef = useRef<HTMLDivElement>(null)
    const driverRef = useRef<ScrollDriver | null>(null)
    const liftRef = useRef(-1)
    const phaseRef = useRef<PinPhase | null>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const timing = peelTiming(lead, travel, hold)
    const controlled = typeof progress === "number" ? clamp01(finite(progress, 0)) : null

    const settings = useLatestRef({ timing, still, controlled })

    const write = useCallback((lift: number, phase: PinPhase) => {
        const track = trackRef.current
        const sheet = sheetRef.current
        if (!track || !sheet) return

        if (lift !== liftRef.current) {
            sheet.style.setProperty(
                "--pe-lift",
                lift > 0 && lift < 1 ? lift.toFixed(4) : String(lift),
            )
            liftRef.current = lift
        }

        if (phase !== phaseRef.current) {
            phaseRef.current = phase
            track.dataset.phase = phase
        }
    }, [])

    const step = useCallback(
        (dt: number) => {
            const track = trackRef.current
            if (!track) return false
            const { timing, still, controlled } = settings.current

            if (still) {
                write(0, "before")
                return false
            }

            if (controlled !== null) {
                write(
                    controlled,
                    controlled <= 0 ? "before" : controlled < 1 ? "moving" : "holding",
                )
                return false
            }

            const port = scrollPort(scrollContainer?.current)
            // relative to the port, never to the viewport: the two only agree when
            // the port is the page
            const stage = stageRef.current?.offsetHeight || port.height()
            const target = peelState(-port.top(track), stage, timing)

            const current = liftRef.current
            const next =
                current < 0 || dt <= 0 ? target.lift : damp(current, target.lift, FOLLOW_RATE, dt)
            const settled = Math.abs(next - target.lift) < SETTLED

            write(settled ? target.lift : next, target.phase)
            return !settled
        },
        [scrollContainer, settings, write],
    )

    useEffect(() => {
        const driver = driveScroll(scrollPort(scrollContainer?.current), step)
        driverRef.current = driver
        liftRef.current = -1
        step(0)
        // a container or the stage can change size without the window doing so
        const track = trackRef.current
        const stopResize = track ? onResize(track, driver.wake) : () => {}

        return () => {
            stopResize()
            driver.dispose()
            driverRef.current = null
        }
    }, [step, scrollContainer])

    useEffect(() => {
        if (!driverRef.current) return
        if (controlled !== null || still) step(0)
        else driverRef.current.wake()
    }, [timing.lead, timing.travel, timing.hold, controlled, still, step])

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
                    "--pe-span": timing.lead + timing.travel + timing.hold,
                    "--pe-curl": clamp(finite(curl, 0.7), 0, 1),
                } as CSSProperties
            }
        >
            <div ref={stageRef} className="xp-peel-stage">
                <div className="xp-peel-back">{back}</div>
                <div ref={sheetRef} className="xp-peel-sheet">
                    <div className="xp-peel-face">{front}</div>
                    <span className="xp-peel-crease" aria-hidden="true" />
                </div>
            </div>
        </div>
    )
}
