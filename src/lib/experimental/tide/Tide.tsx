"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    cx,
    finite,
    onFrame,
    onResize,
    onVisible,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import { contourPath, type TideEdge } from "./contour"
import "./Tide.css"

export interface TideProps {
    /** whatever gets the moving contour; it stays fully interactive */
    children?: ReactNode
    /** which edges ripple: one side, both opposite sides (`x`, `y`) or the whole perimeter */
    edge?: TideEdge
    /** how deep the wavy band reaches into the box, in px */
    amplitude?: number
    /** the length of the main wave, in px */
    wavelength?: number
    /** how fast the contour drifts, 0 to 4 */
    speed?: number
    /** hold the contour where it is */
    paused?: boolean
    /** a line drawn along the contour, in any CSS colour */
    stroke?: string
    /** hold a static wavy contour */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const DRIFT = 1.4

interface Contour {
    width: number
    height: number
    phase: number
    draw: () => void
}

export function Tide({
    children,
    edge = "all",
    amplitude = 12,
    wavelength = 140,
    speed = 1,
    paused = false,
    stroke,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: TideProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const lineRef = useRef<SVGPathElement>(null)
    const contour = useRef<Contour>({ width: 0, height: 0, phase: 0, draw: () => {} })

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const animated = !still && !paused

    const band = clamp(finite(amplitude, 12), 0, 64)
    const length = clamp(finite(wavelength, 140), 24, 2000)
    const settings = useLatestRef({ edge, band, length, speed: clamp(finite(speed, 1), 0, 4) })

    useIsomorphicLayoutEffect(() => {
        const host = hostRef.current
        if (!host) return
        const view = contour.current
        if (still) view.phase = 0

        view.draw = () => {
            if (view.width <= 0 || view.height <= 0) return
            const config = settings.current
            const d = contourPath(
                view.width,
                view.height,
                config.edge,
                config.band,
                config.length,
                view.phase,
            )
            host.style.clipPath = `path("${d}")`
            lineRef.current?.setAttribute("d", d)
        }

        const measure = () => {
            view.width = host.offsetWidth
            view.height = host.offsetHeight
            view.draw()
        }

        measure()
        return onResize(host, measure)
    }, [edge, band, length, still, stroke, settings])

    useEffect(() => {
        const host = hostRef.current
        if (!host || !animated) return
        const view = contour.current
        let stopFrame: (() => void) | null = null

        const run = (visible: boolean) => {
            if (visible && !stopFrame) {
                stopFrame = onFrame((dt) => {
                    view.phase += dt * settings.current.speed * DRIFT
                    view.draw()
                })
            } else if (!visible && stopFrame) {
                stopFrame()
                stopFrame = null
            }
        }

        run(true)
        const stopVisible = onVisible(host, run)

        return () => {
            stopVisible()
            run(false)
        }
    }, [animated, settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-tide", className)}
            data-edge={edge}
            data-still={still ? "true" : undefined}
            data-animated={animated ? "true" : undefined}
            style={{ ...style, "--tide-band": `${band}px` } as CSSProperties}
        >
            {children}
            {stroke ? (
                <svg className="xp-tide-line" aria-hidden="true" focusable="false">
                    <path ref={lineRef} style={{ stroke }} />
                </svg>
            ) : null}
        </div>
    )
}
