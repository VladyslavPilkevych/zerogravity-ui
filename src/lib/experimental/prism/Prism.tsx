"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    damp,
    finite,
    fitCanvas,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    usePrefersReducedMotion,
    wakeLoop,
} from "../../internal"
import { paintSpectrum, SPECTRUM } from "./spectrum"
import "./Prism.css"

export type PrismFacets = "pixel" | "smooth"

export interface PrismPoint {
    x: number
    y: number
}

export interface PrismProps {
    children?: ReactNode
    /** how hard the glass refracts, 0 to 2: 0.2 is restrained, 1 is clear, 2 is dramatic */
    strength?: number
    /** `pixel` draws the beam in square cells; `smooth` in gradients */
    facets?: PrismFacets
    /** cell edge in px for the pixel facets */
    pixel?: number
    /** how far the slab leans toward the light, in degrees */
    tilt?: number
    /** how thick the glass is, in px: the coloured edge and how far behind the caustic falls */
    depth?: number
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

/** where the light rests: up and to the left, so a still slab already splits it */
const REST: PrismPoint = { x: 0.24, y: 0.22 }
/** the edge is a stack of tinted outlines, one per band */
const EDGE = SPECTRUM.length
/** whole pixels of channel offset at strength 1, dispersion 1 */
const SPLIT = 5

let filters = 0

function restingPoint(pointer: PrismPoint | undefined): PrismPoint {
    if (!pointer) return REST
    return { x: clamp(finite(pointer.x, 0.5), 0, 1), y: clamp(finite(pointer.y, 0.5), 0, 1) }
}

/** strength as the component reads it: finite, never negative, never past 2 */
export function prismStrength(value: unknown): number {
    return clamp(finite(value, 0.6), 0, 2)
}

/**
 * The light, as the glass sees it: the unit direction from the light to the
 * slab's centre, and how far off-centre the light is (0 at the centre, 1 at a
 * corner). A light dead in the middle keeps a default direction instead of
 * spinning on a zero vector.
 */
export function lightPath(x: number, y: number): { dx: number; dy: number; reach: number } {
    const vx = 0.5 - x
    const vy = 0.5 - y
    const length = Math.hypot(vx, vy)
    if (length < 0.02) return { dx: 0.6, dy: 0.8, reach: 0 }
    return { dx: vx / length, dy: vy / length, reach: Math.min(1, length * 1.6) }
}

export function Prism({
    children,
    strength = 0.6,
    facets = "pixel",
    pixel = 8,
    tilt = 12,
    depth = 14,
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
    const redOffsetRef = useRef<SVGFEOffsetElement>(null)
    const blueOffsetRef = useRef<SVGFEOffsetElement>(null)
    const filterRef = useRef<SVGFilterElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)
    const refreshRef = useRef<() => void>(() => {})

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const pixelated = facets !== "smooth"
    const rest = restingPoint(pointer)
    const power = prismStrength(strength)
    const split = clamp(finite(dispersion, 0.6), 0, 1)
    const shine = clamp(finite(sheen, 0.7), 0, 1)
    const cell = clamp(finite(pixel, 8), 3, 32)
    const lean = clamp(finite(tilt, 12), 0, 30)
    const thickness = clamp(finite(depth, 14), 0, 48)
    const aberrates = power * split > 0

    const settings = useLatestRef({
        tilt: lean,
        tracking: !still && !pointer,
        rest,
        dispersion: split,
        sheen: shine,
        cell,
        power,
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
        const written = new Map<string, string>()
        let size = canvas && context ? fitCanvas(canvas, host) : null
        let shown = true
        // the filter is wired up on the client only, so the server never has to agree on an id
        const filter = filterRef.current
        const body = bodyRef.current
        if (filter && body) {
            filters += 1
            filter.id = `xp-prism-split-${filters}`
            body.style.filter = `url(#${filter.id})`
        }
        let redShift = ""
        let blueShift = ""

        const put = (name: string, value: string) => {
            if (written.get(name) === value) return
            written.set(name, value)
            host.style.setProperty(name, value)
        }

        const paint = () => {
            const config = settings.current
            const leanX = (at.x - 0.5) * 2
            const leanY = (at.y - 0.5) * 2
            const path = lightPath(at.x, at.y)
            put("--pr-x", at.x.toFixed(4))
            put("--pr-y", at.y.toFixed(4))
            put("--pr-rx", (-leanY * config.tilt).toFixed(2))
            put("--pr-ry", (leanX * config.tilt).toFixed(2))
            put("--pr-dx", (path.dx * (0.35 + 0.65 * path.reach)).toFixed(3))
            put("--pr-dy", (path.dy * (0.35 + 0.65 * path.reach)).toFixed(3))
            put("--pr-angle", `${Math.round((Math.atan2(path.dy, path.dx) * 180) / Math.PI)}deg`)

            // whole pixels only, so the filter is invalidated a handful of times per sweep, not every frame
            const shift = SPLIT * config.power * config.dispersion * (0.45 + 0.55 * path.reach)
            const sx = Math.round(path.dx * shift)
            const sy = Math.round(path.dy * shift)
            const red = `${sx},${sy}`
            if (red !== redShift) {
                redShift = red
                redOffsetRef.current?.setAttribute("dx", String(sx))
                redOffsetRef.current?.setAttribute("dy", String(sy))
            }
            const blue = `${-sx},${-sy}`
            if (blue !== blueShift) {
                blueShift = blue
                blueOffsetRef.current?.setAttribute("dx", String(-sx))
                blueOffsetRef.current?.setAttribute("dy", String(-sy))
            }

            if (!context || !size) return
            paintSpectrum(context, size.width, size.height, size.dpr, {
                x: at.x,
                y: at.y,
                leanX,
                leanY,
                dispersion: config.dispersion,
                sheen: config.sheen,
                cell: config.cell,
                gain: config.power * 1.6,
            })
        }

        const loop = wakeLoop((dt) => {
            at.x = damp(at.x, aim.x, 9, dt)
            at.y = damp(at.y, aim.y, 9, dt)
            const settled = Math.abs(aim.x - at.x) < 0.001 && Math.abs(aim.y - at.y) < 0.001
            if (settled) {
                at.x = aim.x
                at.y = aim.y
            }
            paint()
            return !settled
        })

        const jump = () => {
            at.x = aim.x
            at.y = aim.y
            paint()
        }

        const follow = (event: PointerEvent) => {
            if (!settings.current.tracking) return
            const point = box.at(event)
            if (!point) return
            aim.x = clamp(point.x, 0, 1)
            aim.y = clamp(point.y, 0, 1)
            if (shown) loop.wake()
            else jump()
        }

        // a touch only reports moves while it is down, and leaves as soon as it lifts,
        // so a tap or a drag places the light and the light stays there
        const onMove = (event: PointerEvent) => {
            if (event.pointerType === "touch" && event.buttons === 0) return
            follow(event)
        }

        const settle = (event?: PointerEvent) => {
            if (event?.pointerType === "touch") return
            const home = settings.current.rest
            aim.x = home.x
            aim.y = home.y
            if (!settings.current.tracking || !shown) {
                loop.sleep()
                jump()
                return
            }
            loop.wake()
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

        const stopVisible = onVisible(host, (visible) => {
            shown = visible
            if (!visible && loop.running) {
                loop.sleep()
                jump()
            }
        })

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerdown", follow, { passive: true })
        host.addEventListener("pointerleave", settle)

        return () => {
            loop.sleep()
            refreshRef.current = () => {}
            stopResize()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerdown", follow)
            host.removeEventListener("pointerleave", settle)
            box.dispose()
            if (body) body.style.filter = ""
        }
    }, [settings, pixelated, aberrates])

    useEffect(() => {
        refreshRef.current()
    }, [lean, split, shine, cell, power, still, rest.x, rest.y])

    return (
        <div
            ref={hostRef}
            className={cx("xp-prism", className)}
            data-facets={pixelated ? "pixel" : "smooth"}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--pr-radius": `${clamp(finite(radius, 4), 0, 96)}px`,
                    "--pr-strength": power,
                    "--pr-glow": Math.min(1, power * 0.85).toFixed(3),
                    "--pr-split": split,
                    "--pr-sheen": shine,
                    "--pr-depth": `${thickness}px`,
                } as CSSProperties
            }
        >
            {aberrates ? (
                <svg className="xp-prism-defs" aria-hidden="true" focusable="false">
                    <filter
                        ref={filterRef}
                        x="-10%"
                        y="-10%"
                        width="120%"
                        height="120%"
                        colorInterpolationFilters="sRGB"
                    >
                        <feColorMatrix
                            in="SourceGraphic"
                            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                            result="red"
                        />
                        <feOffset ref={redOffsetRef} in="red" dx="0" dy="0" result="red-out" />
                        <feColorMatrix
                            in="SourceGraphic"
                            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                            result="green"
                        />
                        <feColorMatrix
                            in="SourceGraphic"
                            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                            result="blue"
                        />
                        <feOffset ref={blueOffsetRef} in="blue" dx="0" dy="0" result="blue-out" />
                        <feBlend in="red-out" in2="green" mode="screen" result="warm" />
                        <feBlend in="warm" in2="blue-out" mode="screen" />
                    </filter>
                </svg>
            ) : null}
            <div className="xp-prism-slab">
                <span className="xp-prism-caustic" aria-hidden="true" />
                {Array.from({ length: EDGE }, (_, index) => (
                    <span
                        key={index}
                        className="xp-prism-edge"
                        aria-hidden="true"
                        style={
                            {
                                "--pr-layer": (index + 1) / EDGE,
                                "--pr-tint": SPECTRUM[EDGE - 1 - index],
                            } as CSSProperties
                        }
                    />
                ))}
                <div className="xp-prism-face">
                    <div ref={bodyRef} className="xp-prism-body">
                        {children}
                    </div>
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
                <span className="xp-prism-glare" aria-hidden="true" />
            </div>
        </div>
    )
}
