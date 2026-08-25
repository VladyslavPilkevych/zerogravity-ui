"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import { cx, useLatestRef, useMediaQuery, usePrefersReducedMotion } from "../../internal"
import {
    RIPPLE_DEFAULTS,
    coverBox,
    createField,
    edgeAt,
    age as rippleAge,
    stepField,
    strike,
    trace,
    type RippleSettings,
} from "../liquid/ripples"
import "./Undertow.css"

export interface UndertowProps {
    /** the image on top, the one the pointer parts */
    frontSrc: string
    /** the image underneath, revealed where the surface is disturbed */
    backSrc: string
    /** describes the pair; both images render into one canvas */
    alt: string
    /** how far a disturbance reaches, as a share of the shorter side */
    radius?: number
    /** how far the boundary strays from a circle, 0 to 1 */
    strength?: number
    /** how soft the edge is, 0 to 1 */
    softness?: number
    /** how quickly the surface settles, 0.2 to 3 */
    speed?: number
    /** how long the parted trail stays open, in seconds */
    linger?: number
    /** where the images sit when the box crops them, as `x y` in percent */
    objectPosition?: string
    /** lock the box to a ratio, for example `16 / 9` */
    aspect?: string
    interactive?: boolean
    /** hold the still, composed state instead of animating */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const FRAME_CAP = 0.05

function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

function anchor(position: string): { x: number; y: number } {
    const parts = position.trim().split(/\s+/)
    const read = (token: string | undefined, fallback: number) => {
        if (!token) return fallback
        if (token === "left" || token === "top") return 0
        if (token === "right" || token === "bottom") return 1
        if (token === "center") return 0.5
        const percent = Number.parseFloat(token)
        return Number.isFinite(percent) ? clamp(percent / 100, 0, 1) : fallback
    }

    return { x: read(parts[0], 0.5), y: read(parts[1] ?? parts[0], 0.5) }
}

export function Undertow({
    frontSrc,
    backSrc,
    alt,
    radius = 0.3,
    strength = 0.55,
    softness = 0.38,
    speed = 1,
    linger = 2.4,
    objectPosition = "50% 50%",
    aspect,
    interactive = true,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: UndertowProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const coarse = useMediaQuery("(pointer: coarse)")
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        radius,
        strength,
        softness,
        speed,
        linger,
        objectPosition,
        interactive,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        const field = createField()
        const front = new Image()
        const back = new Image()
        let loaded = 0
        let frame = 0
        let last = 0
        let seen = true

        front.crossOrigin = "anonymous"
        back.crossOrigin = "anonymous"

        const onLoad = () => {
            loaded += 1
            host.dataset.ready = loaded >= 2 ? "true" : "false"
        }
        front.addEventListener("load", onLoad)
        back.addEventListener("load", onLoad)
        front.src = frontSrc
        back.src = backSrc

        // one offscreen layer holds the front image while the field punches
        // holes in it, so the two never drift apart by a pixel
        const veil = document.createElement("canvas")
        const veilContext = veil.getContext("2d")

        // and one more holds the opening itself. The trail accumulates here and
        // heals a little every frame, so what was parted stays parted instead of
        // following the pointer around and vanishing behind it
        const mask = document.createElement("canvas")
        const maskContext = mask.getContext("2d")

        let width = 0
        let height = 0
        let dpr = 1

        const measure = () => {
            const box = host.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = Math.max(1, Math.round(box.width))
            height = Math.max(1, Math.round(box.height))
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
            veil.width = canvas.width
            veil.height = canvas.height
            mask.width = canvas.width
            mask.height = canvas.height
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
        }

        measure()

        const rule: RippleSettings = { ...RIPPLE_DEFAULTS }

        /** Every live ripple adds to the opening; nothing ever removes it here. */
        const stamp = () => {
            if (!maskContext) return

            const config = settings.current
            const w = mask.width
            const h = mask.height
            const short = Math.min(w, h)

            maskContext.setTransform(1, 0, 0, 1, 0, 0)
            maskContext.globalCompositeOperation = "source-over"

            for (const drop of field.drops) {
                if (!drop.live) continue

                const life = rippleAge(field, drop, rule)
                const spread = 0.35 + life * 0.9
                const reach = short * config.radius * spread
                // the middle has to be a real hole, or the rear image reads as
                // a smudge through gauze rather than an opening in a membrane
                const fade = clamp((1 - life) * 1.7 * (0.55 + drop.power * 0.45), 0, 1)
                if (reach <= 0 || fade <= 0.01) continue

                const cx_ = drop.x * w
                const cy = drop.y * h
                const inner = clamp(1 - config.softness, 0.05, 0.92)

                const gradient = maskContext.createRadialGradient(cx_, cy, 0, cx_, cy, reach)
                gradient.addColorStop(0, `rgba(0,0,0,${fade})`)
                gradient.addColorStop(inner, `rgba(0,0,0,${fade})`)
                gradient.addColorStop(1, "rgba(0,0,0,0)")
                maskContext.fillStyle = gradient

                // a wobbling outline rather than a circle: this is what makes it
                // read as a disturbed membrane instead of a magnifying glass
                maskContext.beginPath()
                const steps = 36
                for (let index = 0; index <= steps; index += 1) {
                    const angle = (index / steps) * Math.PI * 2
                    const edge = edgeAt(drop, angle, reach, config.strength * 0.5, life)
                    const px = cx_ + Math.cos(angle) * edge
                    const py = cy + Math.sin(angle) * edge
                    if (index === 0) maskContext.moveTo(px, py)
                    else maskContext.lineTo(px, py)
                }
                maskContext.closePath()
                maskContext.fill()
            }
        }

        /** The surface closing over itself: one even decay across the whole mask,
         *  so the oldest part of a trail is always the faintest. */
        const heal = (dt: number) => {
            if (!maskContext || dt <= 0) return

            const half = clamp(settings.current.linger, 0.2, 12) * 0.32
            const gone = 1 - Math.pow(0.5, dt / half)
            if (gone <= 0) return

            maskContext.setTransform(1, 0, 0, 1, 0, 0)
            maskContext.globalCompositeOperation = "destination-out"
            maskContext.fillStyle = `rgba(0,0,0,${gone.toFixed(4)})`
            maskContext.fillRect(0, 0, mask.width, mask.height)
            maskContext.globalCompositeOperation = "source-over"
        }

        const paint = () => {
            if (!veilContext || loaded < 2) return

            const config = settings.current
            const spot = anchor(config.objectPosition)
            const w = canvas.width
            const h = canvas.height

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, w, h)

            const backBox = coverBox(back.naturalWidth, back.naturalHeight, w, h, spot.x, spot.y)
            context.drawImage(back, backBox.x, backBox.y, backBox.w, backBox.h)

            veilContext.setTransform(1, 0, 0, 1, 0, 0)
            veilContext.globalCompositeOperation = "source-over"
            veilContext.clearRect(0, 0, w, h)

            const frontBox = coverBox(front.naturalWidth, front.naturalHeight, w, h, spot.x, spot.y)
            veilContext.drawImage(front, frontBox.x, frontBox.y, frontBox.w, frontBox.h)

            // the accumulated opening takes its bite out of the front image
            veilContext.globalCompositeOperation = "destination-out"
            veilContext.drawImage(mask, 0, 0)
            veilContext.globalCompositeOperation = "source-over"

            context.drawImage(veil, 0, 0)
        }

        const loop = (time: number) => {
            frame = requestAnimationFrame(loop)
            if (!seen) return

            const dt = last === 0 ? 0.016 : Math.min((time - last) / 1000, FRAME_CAP)
            last = time

            stepField(field, dt * settings.current.speed, rule)
            heal(dt)
            stamp()
            paint()
        }

        const local = (event: PointerEvent) => {
            const box = host.getBoundingClientRect()
            if (box.width === 0 || box.height === 0) return null
            return {
                x: clamp((event.clientX - box.left) / box.width, 0, 1),
                y: clamp((event.clientY - box.top) / box.height, 0, 1),
            }
        }

        let moved = 0
        const onMove = (event: PointerEvent) => {
            if (!settings.current.interactive || settings.current.still) return
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
            if (!settings.current.interactive || settings.current.still) return
            const at = local(event)
            // a tap is a single strong drop, so touch is not left without the effect
            if (at) strike(field, at.x, at.y, 1)
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)
        host.addEventListener("pointerdown", onDown, { passive: true })

        const sizer =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(() => {
                      measure()
                      stamp()
                      paint()
                  })
                : null
        sizer?.observe(host)

        const watcher =
            typeof IntersectionObserver === "function"
                ? new IntersectionObserver(
                      ([entry]) => {
                          seen = entry.isIntersecting
                          if (seen) last = 0
                      },
                      { threshold: 0 },
                  )
                : null
        watcher?.observe(host)

        if (settings.current.still) {
            // a settled scene still shows what lies underneath, just not moving
            const onReady = () => {
                if (loaded < 2) return
                strike(field, 0.5, 0.5, 1)
                field.drops[(field.head + field.drops.length - 1) % field.drops.length].born = -0.35
                stepField(field, 0, rule)
                stamp()
                paint()
            }
            front.addEventListener("load", onReady)
            back.addEventListener("load", onReady)
            onReady()

            return () => {
                front.removeEventListener("load", onLoad)
                back.removeEventListener("load", onLoad)
                front.removeEventListener("load", onReady)
                back.removeEventListener("load", onReady)
                host.removeEventListener("pointermove", onMove)
                host.removeEventListener("pointerleave", onLeave)
                host.removeEventListener("pointerdown", onDown)
                sizer?.disconnect()
                watcher?.disconnect()
            }
        }

        frame = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(frame)
            front.removeEventListener("load", onLoad)
            back.removeEventListener("load", onLoad)
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            host.removeEventListener("pointerdown", onDown)
            sizer?.disconnect()
            watcher?.disconnect()
        }
    }, [frontSrc, backSrc, settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-undertow", className)}
            data-ready="false"
            data-touch={coarse ? "true" : undefined}
            data-still={still ? "true" : undefined}
            style={aspect ? ({ ...style, aspectRatio: aspect } as CSSProperties) : style}
            role="img"
            aria-label={alt}
        >
            <canvas ref={canvasRef} className="xp-undertow-face" aria-hidden="true" />
        </div>
    )
}
