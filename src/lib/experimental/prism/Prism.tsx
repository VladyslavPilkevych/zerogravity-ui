"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    damp,
    finite,
    fitCanvas,
    onFrame,
    onResize,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
} from "../../internal"
import { paintSpectrum } from "./spectrum"
import "./Prism.css"

export type PrismFacets = "pixel" | "smooth"

export interface PrismPoint {
    x: number
    y: number
}

export interface PrismProps {
    children?: ReactNode
    /** `pixel` refracts through a grid of square cells; `smooth` through gradients */
    facets?: PrismFacets
    /** cell edge in px for the pixel facets */
    pixel?: number
    /** how far the slab leans, in degrees */
    tilt?: number
    /** how far the colours separate, 0 to 1 */
    dispersion?: number
    /** how bright the specular highlight is, 0 to 1 */
    sheen?: number
    /** corner radius in px; every layer shares it */
    radius?: number
    /** pins the light to a point, 0 to 1 in the slab's own box, instead of following the pointer */
    pointer?: PrismPoint
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const REST: PrismPoint = { x: 0.5, y: 0.5 }

function restingPoint(pointer: PrismPoint | undefined): PrismPoint {
    if (!pointer) return REST
    return { x: clamp(finite(pointer.x, 0.5), 0, 1), y: clamp(finite(pointer.y, 0.5), 0, 1) }
}

export function Prism({
    children,
    facets = "pixel",
    pixel = 8,
    tilt = 12,
    dispersion = 0.6,
    sheen = 0.7,
    radius = 4,
    pointer,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PrismProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const refreshRef = useRef<() => void>(() => {})

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)
    const pixelated = facets !== "smooth"
    const rest = restingPoint(pointer)
    const split = clamp(finite(dispersion, 0.6), 0, 1)
    const shine = clamp(finite(sheen, 0.7), 0, 1)
    const cell = clamp(finite(pixel, 8), 3, 32)

    const settings = useLatestRef({
        tilt: finite(tilt, 12),
        still,
        tracking: !still && fine && !pointer,
        rest,
        dispersion: split,
        sheen: shine,
        cell,
    })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const canvas = pixelated ? canvasRef.current : null
        const context = canvas ? context2d(canvas) : null
        const box = pointerBox(host)
        const start = settings.current.rest
        const aim = { ...start }
        const at = { ...start }
        let size = canvas && context ? fitCanvas(canvas, host) : null
        let stopFrame: (() => void) | null = null

        const paint = () => {
            const config = settings.current
            const lean = config.still ? 0 : config.tilt
            const leanX = (at.x - 0.5) * 2
            const leanY = (at.y - 0.5) * 2
            host.style.setProperty("--pr-x", at.x.toFixed(4))
            host.style.setProperty("--pr-y", at.y.toFixed(4))
            host.style.setProperty("--pr-rx", (-leanY * lean).toFixed(3))
            host.style.setProperty("--pr-ry", (leanX * lean).toFixed(3))

            if (!context || !size) return
            paintSpectrum(context, size.width, size.height, size.dpr, {
                x: at.x,
                y: at.y,
                leanX,
                leanY,
                dispersion: config.dispersion,
                sheen: config.sheen,
                cell: config.cell,
            })
        }

        const tick = (dt: number) => {
            at.x = damp(at.x, aim.x, 9, dt)
            at.y = damp(at.y, aim.y, 9, dt)
            if (Math.abs(aim.x - at.x) < 0.001 && Math.abs(aim.y - at.y) < 0.001) {
                at.x = aim.x
                at.y = aim.y
                stopFrame?.()
                stopFrame = null
            }
            paint()
        }

        const wake = () => {
            if (!stopFrame) stopFrame = onFrame(tick)
        }

        const onMove = (event: PointerEvent) => {
            if (!settings.current.tracking) return
            const point = box.at(event)
            if (!point) return
            aim.x = clamp(point.x, 0, 1)
            aim.y = clamp(point.y, 0, 1)
            wake()
        }

        const settle = () => {
            const home = settings.current.rest
            aim.x = home.x
            aim.y = home.y
            const there = Math.abs(aim.x - at.x) < 0.001 && Math.abs(aim.y - at.y) < 0.001
            if (settings.current.still || there) {
                at.x = home.x
                at.y = home.y
                paint()
                return
            }
            wake()
        }

        refreshRef.current = () => {
            if (!settings.current.tracking) settle()
            else paint()
        }

        paint()

        const stopResize = onResize(host, () => {
            box.invalidate()
            if (canvas && context) size = fitCanvas(canvas, host)
            paint()
        })

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", settle)

        return () => {
            stopFrame?.()
            stopFrame = null
            refreshRef.current = () => {}
            stopResize()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", settle)
            box.dispose()
        }
    }, [settings, pixelated])

    useEffect(() => {
        refreshRef.current()
    }, [tilt, split, shine, cell, still, fine, rest.x, rest.y])

    return (
        <div
            ref={hostRef}
            className={cx("xp-prism", className)}
            data-facets={pixelated ? "pixel" : "smooth"}
            data-still={still ? "true" : undefined}
            data-touch={!fine ? "true" : undefined}
            style={
                {
                    ...style,
                    "--pr-radius": `${clamp(finite(radius, 4), 0, 96)}px`,
                    "--pr-split": split,
                    "--pr-sheen": shine,
                } as CSSProperties
            }
        >
            <div className="xp-prism-slab">
                <div className="xp-prism-body">{children}</div>
                {pixelated ? (
                    <canvas ref={canvasRef} className="xp-prism-cells" aria-hidden="true" />
                ) : (
                    <>
                        <span className="xp-prism-split" aria-hidden="true" />
                        <span className="xp-prism-sheen" aria-hidden="true" />
                    </>
                )}
                <span className="xp-prism-rim" aria-hidden="true" />
            </div>
        </div>
    )
}
