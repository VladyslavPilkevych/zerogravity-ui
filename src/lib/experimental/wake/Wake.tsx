"use client"

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react"

import {
    cx,
    onFrame,
    onVisible,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
} from "../../internal"
import {
    RIPPLE_DEFAULTS,
    createField,
    edgeAt,
    energy,
    age as rippleAge,
    stepField,
    strike,
    trace,
    type RippleSettings,
} from "../liquid/ripples"
import "./Wake.css"

export type WakeMode = "highlight" | "distortion"

export interface WakeProps {
    children?: ReactNode
    /** `highlight` draws light on the surface, `distortion` bends it */
    mode?: WakeMode
    /** how far one ripple reaches, as a share of the shorter side */
    radius?: number
    /** how strongly the surface answers, 0 to 1 */
    strength?: number
    /** how quickly it settles, 0.2 to 3 */
    speed?: number
    /** the light a ripple carries */
    color?: string
    /** react to a finger as well as a pointer */
    enableOnTouch?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const FRAME_CAP = 0.05

export function Wake({
    children,
    mode = "highlight",
    radius = 0.26,
    strength = 0.6,
    speed = 1,
    color = "#cfe8ff",
    enableOnTouch = true,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: WakeProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const skinRef = useRef<HTMLDivElement>(null)
    const warpRef = useRef<SVGFEDisplacementMapElement>(null)

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const still = disabled || (respectReducedMotion && reduced)
    const live = !still && (fine || enableOnTouch)

    const filterId = `${useId().replace(/:/g, "")}w`
    const settings = useLatestRef({ mode, radius, strength, speed, color, live })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        const field = createField()
        const rule: RippleSettings = { ...RIPPLE_DEFAULTS }
        let moved = 0
        let seen = true
        let dpr = 1

        const measure = () => {
            const box = host.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            canvas.width = Math.max(1, Math.round(box.width * dpr))
            canvas.height = Math.max(1, Math.round(box.height * dpr))
            canvas.style.width = `${Math.max(1, Math.round(box.width))}px`
            canvas.style.height = `${Math.max(1, Math.round(box.height))}px`
        }

        measure()

        const paint = () => {
            const config = settings.current
            const w = canvas.width
            const h = canvas.height
            const short = Math.min(w, h)

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, w, h)
            // light adds rather than covers, which is what reads as refraction
            context.globalCompositeOperation = "lighter"

            for (const drop of field.drops) {
                if (!drop.live) continue

                const life = rippleAge(field, drop, rule)
                const reach = short * config.radius * (0.3 + life * 1.05)
                // additive light stacks fast: two dozen overlapping rings at
                // full strength wash the surface out completely
                const glow = (1 - life) * (1 - life) * drop.power * config.strength * 0.24
                if (reach <= 0 || glow <= 0.005) continue

                const cx_ = drop.x * w
                const cy = drop.y * h

                const gradient = context.createRadialGradient(cx_, cy, 0, cx_, cy, reach)
                // a thin band rather than a filled disc: it is the crest that
                // catches the light, not the whole ripple
                gradient.addColorStop(0, "rgba(0,0,0,0)")
                gradient.addColorStop(0.74, "rgba(0,0,0,0)")
                gradient.addColorStop(0.88, tint(config.color, glow))
                gradient.addColorStop(1, "rgba(0,0,0,0)")
                context.fillStyle = gradient

                // the same wobbling outline the reveal uses, so both surfaces
                // disturb in the same language
                context.beginPath()
                const steps = 40
                for (let index = 0; index <= steps; index += 1) {
                    const angle = (index / steps) * Math.PI * 2
                    const edge = edgeAt(drop, angle, reach, 0.3, life)
                    const px = cx_ + Math.cos(angle) * edge
                    const py = cy + Math.sin(angle) * edge
                    if (index === 0) context.moveTo(px, py)
                    else context.lineTo(px, py)
                }
                context.closePath()
                context.fill()
            }

            context.globalCompositeOperation = "source-over"

            // in distortion mode the field's energy drives an SVG warp over the
            // content, so the surface itself bends where the pointer passed
            const warp = warpRef.current
            if (warp) {
                const scale =
                    config.mode === "distortion" ? energy(field, rule) * 46 * config.strength : 0
                warp.setAttribute("scale", scale.toFixed(2))
            }
        }

        const local = (event: PointerEvent) => {
            const box = host.getBoundingClientRect()
            if (box.width === 0 || box.height === 0) return null
            return {
                x: (event.clientX - box.left) / box.width,
                y: (event.clientY - box.top) / box.height,
            }
        }

        const onMove = (event: PointerEvent) => {
            if (!settings.current.live) return
            const at = local(event)
            if (!at) return
            const now = performance.now()
            const dt = moved === 0 ? 0.016 : Math.min((now - moved) / 1000, FRAME_CAP)
            moved = now
            trace(field, at.x, at.y, dt, rule)
        }

        const onLeave = () => {
            field.over = false
        }

        const onDown = (event: PointerEvent) => {
            if (!settings.current.live) return
            const at = local(event)
            if (at) strike(field, at.x, at.y, 1)
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)
        host.addEventListener("pointerdown", onDown, { passive: true })

        const sizer =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(() => {
                      measure()
                      paint()
                  })
                : null
        sizer?.observe(host)

        const stopVisible = onVisible(host, (visible) => {
            seen = visible
        })

        const stopFrame = onFrame((dt) => {
            if (!seen) return
            stepField(field, dt * settings.current.speed, rule)
            paint()
        })

        return () => {
            stopFrame()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            host.removeEventListener("pointerdown", onDown)
            sizer?.disconnect()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-wake", className)}
            data-mode={mode}
            data-still={still ? "true" : undefined}
            style={style}
        >
            {mode === "distortion" && !still ? (
                <svg className="xp-wake-defs" aria-hidden="true" focusable="false">
                    <filter id={filterId} x="-8%" y="-8%" width="116%" height="116%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.012 0.016"
                            numOctaves={2}
                            seed={7}
                            result="noise"
                        />
                        <feDisplacementMap
                            ref={warpRef}
                            in="SourceGraphic"
                            in2="noise"
                            scale="0"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </svg>
            ) : null}

            <div
                ref={skinRef}
                className="xp-wake-skin"
                style={
                    mode === "distortion" && !still
                        ? ({ filter: `url(#${filterId})` } as CSSProperties)
                        : undefined
                }
            >
                {children}
            </div>

            <canvas ref={canvasRef} className="xp-wake-light" aria-hidden="true" />
        </div>
    )
}

/** `#rrggbb` or any CSS colour, carried through at a given alpha. */
function tint(color: string, alpha: number): string {
    const value = Math.max(0, Math.min(1, alpha))

    if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
        const full =
            color.length === 4
                ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
                : color
        const r = Number.parseInt(full.slice(1, 3), 16)
        const g = Number.parseInt(full.slice(3, 5), 16)
        const b = Number.parseInt(full.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${value})`
    }

    return `color-mix(in srgb, ${color} ${(value * 100).toFixed(1)}%, transparent)`
}
