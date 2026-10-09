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
    clamp01,
    cx,
    damp,
    driveScroll,
    finite,
    mix,
    onResize,
    scrollPort,
    useLatestRef,
    usePrefersReducedMotion,
    type PinPhase,
    type ScrollDriver,
} from "../internal"
import { gantryState, gantryTiming, railOffset, railStops, type GantryEasing } from "./timeline"
import "./Gantry.css"

export type { GantryEasing }

export interface GantryProps {
    children: ReactNode
    scrollContainer?: RefObject<HTMLElement | null>
    /** how tall the pinned stage is */
    height?: string
    /** the width of one car */
    itemWidth?: string
    gap?: string
    /** scroll each stop along the rail takes, in stage heights */
    pace?: number
    /** share of each stop spent moving rather than resting, 0.1 to 1 */
    transition?: number
    /** scroll spent pinned on the last car before the section moves on, in stage heights */
    hold?: number
    /** curve of each move between two stops */
    easing?: GantryEasing
    /** drive the rail yourself, 0 to 1 along it; scroll is then ignored */
    progress?: number
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

interface Rail {
    stops: number[]
    distance: number
    pitch: number
    /** each car's centre along the rail, from the first car's left edge */
    centres: number[]
}

const FOLLOW_RATE = 9
const SETTLED = 0.25

export function Gantry({
    children,
    scrollContainer,
    height = "80vh",
    itemWidth = "clamp(220px, 32vw, 420px)",
    gap = "24px",
    pace,
    transition,
    hold,
    easing,
    progress,
    lean = 6,
    label = "Horizontal gallery",
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
    onProgress,
}: GantryProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const railRef = useRef<HTMLDivElement>(null)
    const driverRef = useRef<ScrollDriver | null>(null)
    const metricsRef = useRef<Rail | null>(null)
    const offsetRef = useRef(-1)
    const leanRef = useRef(0)
    const reportedRef = useRef(-1)
    const stopRef = useRef(-1)
    const phaseRef = useRef<PinPhase | null>(null)
    const activeRef = useRef(-1)
    const portRef = useRef<ReturnType<typeof scrollPort> | null>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const items = Children.toArray(children)
    const timing = gantryTiming(pace, transition, hold, easing)
    const controlled = typeof progress === "number" ? clamp01(finite(progress, 0)) : null
    const settings = useLatestRef({
        timing,
        controlled,
        lean: clamp(finite(lean, 6), 0, 30),
        still,
    })
    const report = useLatestRef(onProgress)

    const measure = useCallback(() => {
        const track = trackRef.current
        const rail = railRef.current
        if (!track || !rail) return

        const view = rail.parentElement?.clientWidth ?? 0
        const cars = [...rail.children] as HTMLElement[]
        const lefts = cars.map((car) => car.offsetLeft)
        const base = lefts[0] ?? 0
        const last = cars.length - 1

        // the rail's scrollWidth leaves out its end padding, which would park
        // the last car flush against the edge, so measure the run of cars
        const pad = getComputedStyle(rail)
        const run =
            last >= 0
                ? lefts[last] -
                  base +
                  cars[last].offsetWidth +
                  (parseFloat(pad.paddingLeft) || 0) +
                  (parseFloat(pad.paddingRight) || 0)
                : 0
        const distance = Math.max(0, run - view)
        const stops = railStops(lefts, distance)

        metricsRef.current = {
            stops,
            distance,
            pitch: Math.max(1, (lefts[1] ?? view) - base),
            centres: cars.map((car, index) => lefts[index] - base + car.offsetWidth / 2),
        }
        track.style.setProperty("--gy-steps", String(stops.length - 1))

        // the cars may have been replaced since the last mark
        cars.forEach((car, index) => {
            if (index === activeRef.current) car.setAttribute("data-active", "true")
            else car.removeAttribute("data-active")
        })
    }, [])

    const mark = useCallback((active: number) => {
        const rail = railRef.current
        if (!rail || active === activeRef.current) return
        rail.children[activeRef.current]?.removeAttribute("data-active")
        rail.children[active]?.setAttribute("data-active", "true")
        activeRef.current = active
    }, [])

    const write = useCallback(
        (offset: number, swing: number, stop: number, phase: PinPhase, metrics: Rail) => {
            const track = trackRef.current
            const rail = railRef.current
            if (!track || !rail) return
            const { distance, centres } = metrics

            if (offset !== offsetRef.current) {
                offsetRef.current = offset
                rail.style.transform = `translate3d(${(-offset).toFixed(2)}px,0,0)`
            }
            if (swing !== leanRef.current) {
                leanRef.current = swing
                rail.style.setProperty("--gy-lean", swing.toFixed(3))
            }
            if (stop !== stopRef.current) {
                stopRef.current = stop
                track.dataset.stop = String(stop)
            }
            if (phase !== phaseRef.current) {
                phaseRef.current = phase
                track.dataset.phase = phase
            }

            const share = distance > 0 ? clamp01(offset / distance) : 0

            // a focus line that sweeps from the first car's centre to the last
            // one's as the rail travels, so every car gets its turn in order
            // even when the rail runs out before the last ones reach the start
            if (centres.length > 0) {
                const focus = mix(centres[0], centres[centres.length - 1], share)
                let active = 0
                for (let index = 1; index < centres.length; index++) {
                    if (Math.abs(centres[index] - focus) < Math.abs(centres[active] - focus)) {
                        active = index
                    }
                }
                mark(active)
            }

            if (Math.abs(share - reportedRef.current) > 0.0001) {
                reportedRef.current = share
                report.current?.(share)
            }
        },
        [mark, report],
    )

    const step = useCallback(
        (dt: number) => {
            const track = trackRef.current
            const rail = railRef.current
            if (!track || !rail) return false

            const { timing, controlled, lean, still } = settings.current

            if (still) {
                rail.style.transform = ""
                offsetRef.current = -1
                mark(-1)
                return false
            }

            if (!metricsRef.current) measure()
            const metrics = metricsRef.current
            if (!metrics) return false
            const steps = metrics.stops.length - 1

            let target: number
            let phase: PinPhase
            if (controlled !== null) {
                target = controlled * metrics.distance
                phase = controlled <= 0 ? "before" : controlled < 1 ? "moving" : "holding"
            } else {
                const port = portRef.current ?? scrollPort(scrollContainer?.current)
                const stage = stageRef.current?.offsetHeight || port.height()
                const state = gantryState(-port.top(track), stage, steps, timing)
                target = railOffset(state.position, metrics.stops)
                phase = state.phase
            }

            const current = offsetRef.current
            const snap = current < 0 || dt <= 0 || controlled !== null
            const next = snap ? target : damp(current, target, FOLLOW_RATE, dt)
            const settled = Math.abs(next - target) < SETTLED
            const offset = settled ? target : next

            const speed = snap || settled ? 0 : (offset - current) / dt / metrics.pitch
            const swing = clamp(speed * lean * 0.6, -lean, lean)
            let stop = 0
            for (let index = 1; index < metrics.stops.length; index++) {
                if (
                    Math.abs(metrics.stops[index] - offset) < Math.abs(metrics.stops[stop] - offset)
                ) {
                    stop = index
                }
            }

            write(offset, Math.round(swing * 1000) / 1000, stop, phase, metrics)
            return !settled
        },
        [mark, measure, scrollContainer, settings, write],
    )

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const port = scrollPort(scrollContainer?.current)
        portRef.current = port
        const driver = driveScroll(port, step)
        driverRef.current = driver

        const refit = () => {
            measure()
            driver.wake()
        }
        const stopTrack = onResize(track, refit)
        const stopRail = railRef.current ? onResize(railRef.current, refit) : () => {}
        window.addEventListener("resize", refit)

        measure()
        offsetRef.current = -1
        step(0)

        return () => {
            driver.dispose()
            driverRef.current = null
            portRef.current = null
            stopTrack()
            stopRail()
            window.removeEventListener("resize", refit)
        }
    }, [measure, step, scrollContainer])

    useEffect(() => {
        measure()
        if (controlled !== null || still) step(0)
        else driverRef.current?.wake()
    }, [
        items.length,
        itemWidth,
        gap,
        timing.pace,
        timing.transition,
        timing.hold,
        timing.easing,
        controlled,
        still,
        measure,
        step,
    ])

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
                    "--gy-pace": timing.pace,
                    "--gy-hold": timing.hold,
                    "--gy-count": Math.max(0, items.length - 1),
                } as CSSProperties
            }
        >
            <div ref={stageRef} className="xp-gantry-stage">
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
