"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    cx,
    onFrame,
    onVisible,
    rngFor,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Perseid.css"

export interface PerseidProps {
    children?: ReactNode
    /** how many meteors are in the sky at once, clamped to 0..60 */
    count?: number
    /** how fast they fall, 0.2 to 3 */
    speed?: number
    /** the palette they are drawn from */
    colors?: readonly string[]
    /** the fall angle in degrees; 0 is straight down, 30 leans right */
    angle?: number
    /** the field leans a little with the pointer */
    parallax?: boolean
    /** fix the sky, so the same seed gives the same meteors every time */
    seed?: number
    /** hold a still sky instead of animating */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export const PERSEID_COLORS: readonly string[] = [
    "#eaf4ff",
    "#8fc4ff",
    "#5ce1e6",
    "#ff8f6b",
    "#ff5f6d",
]

export const PERSEID_LIMIT = 60

interface Meteor {
    x: number
    y: number
    /** 0 far, 1 near: drives size, speed, brightness and trail */
    depth: number
    length: number
    speed: number
    color: string
    /** counts up to 1 as it crosses, then the slot is reused */
    life: number
    span: number
}

function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

export function Perseid({
    children,
    count = 18,
    speed = 1,
    colors = PERSEID_COLORS,
    angle = 24,
    parallax = false,
    seed,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PerseidProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({ count, speed, colors, angle, parallax, seed, still })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        // one pool, sized to the ceiling and never resized; `count` only
        // decides how many of them are drawn
        const pool: Meteor[] = Array.from({ length: PERSEID_LIMIT }, () => ({
            x: 0,
            y: 0,
            depth: 0,
            length: 0,
            speed: 0,
            color: "#fff",
            life: 1,
            span: 1,
        }))

        let width = 1
        let height = 1
        let dpr = 1
        let seen = true
        let lean = { x: 0, y: 0 }
        const drift = { x: 0, y: 0 }
        // how many times each slot has been reused, so a seeded sky still
        // varies from one crossing to the next without ever being random
        const cycles = new Array<number>(PERSEID_LIMIT).fill(0)

        const seat = (meteor: Meteor, index: number, fresh: boolean) => {
            const config = settings.current
            const roll =
                config.seed === undefined
                    ? Math.floor(Math.random() * 100000)
                    : config.seed + cycles[index]
            cycles[index] += 1
            const random = rngFor(index * 977 + 13, roll)
            const palette = config.colors.length > 0 ? config.colors : PERSEID_COLORS

            meteor.depth = random()
            meteor.color = palette[Math.floor(random() * palette.length) % palette.length]
            meteor.length = (0.06 + meteor.depth * 0.22) * Math.hypot(width, height)
            // just far enough to leave the frame, so a meteor spends its whole
            // life on screen instead of most of it below the fold
            meteor.speed = height * 1.9 + meteor.length
            meteor.span = (3.4 - meteor.depth * 1.9) * (0.75 + random() * 0.6)
            meteor.life = fresh ? -random() * 0.5 : 0

            // start off the top edge, spread wide enough that the lean still fills
            meteor.x = (-0.35 + random() * 1.7) * width
            meteor.y = -0.2 * height - random() * 0.4 * height
        }

        const measure = () => {
            const box = host.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = Math.max(1, Math.round(box.width * dpr))
            height = Math.max(1, Math.round(box.height * dpr))
            canvas.width = width
            canvas.height = height
            canvas.style.width = `${Math.max(1, Math.round(box.width))}px`
            canvas.style.height = `${Math.max(1, Math.round(box.height))}px`
            pool.forEach((meteor, index) => seat(meteor, index, true))
        }

        measure()

        const draw = (meteor: Meteor, tilt: number) => {
            const shown = clamp(meteor.life, 0, 1)
            // fade in and out at the ends of the run, so nothing pops
            const alpha =
                (shown < 0.12 ? shown / 0.12 : shown > 0.82 ? (1 - shown) / 0.18 : 1) *
                (0.28 + meteor.depth * 0.72)
            if (alpha <= 0.01) return

            const dx = Math.sin(tilt)
            const dy = Math.cos(tilt)
            const tailX = meteor.x - dx * meteor.length
            const tailY = meteor.y - dy * meteor.length

            const trail = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY)
            trail.addColorStop(0, meteor.color)
            trail.addColorStop(0.35, meteor.color)
            trail.addColorStop(1, "rgba(0,0,0,0)")

            context.globalAlpha = alpha
            context.strokeStyle = trail
            context.lineCap = "round"
            context.lineWidth = (0.6 + meteor.depth * 2.4) * dpr
            context.beginPath()
            context.moveTo(meteor.x, meteor.y)
            context.lineTo(tailX, tailY)
            context.stroke()

            // the head, brighter than the trail it drags
            const head = (1.4 + meteor.depth * 3.4) * dpr
            const bloom = context.createRadialGradient(
                meteor.x,
                meteor.y,
                0,
                meteor.x,
                meteor.y,
                head * 3,
            )
            bloom.addColorStop(0, "#ffffff")
            bloom.addColorStop(0.35, meteor.color)
            bloom.addColorStop(1, "rgba(0,0,0,0)")
            context.fillStyle = bloom
            context.beginPath()
            context.arc(meteor.x, meteor.y, head * 3, 0, Math.PI * 2)
            context.fill()
            context.globalAlpha = 1
        }

        const paint = (dt: number) => {
            const config = settings.current
            const active = Math.round(clamp(config.count, 0, PERSEID_LIMIT))
            const tilt = (clamp(config.angle, -70, 70) * Math.PI) / 180

            drift.x += (lean.x - drift.x) * Math.min(1, dt * 2)
            drift.y += (lean.y - drift.y) * Math.min(1, dt * 2)

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, width, height)
            context.globalCompositeOperation = "lighter"

            for (let index = 0; index < active; index += 1) {
                const meteor = pool[index]
                meteor.life += (dt * config.speed) / meteor.span

                if (meteor.life >= 1) seat(meteor, index, false)
                if (meteor.life < 0) continue

                const travelled = meteor.speed * meteor.life
                const px = meteor.x + Math.sin(tilt) * travelled + drift.x * meteor.depth * 40 * dpr
                const py = meteor.y + Math.cos(tilt) * travelled + drift.y * meteor.depth * 40 * dpr

                draw({ ...meteor, x: px, y: py }, tilt)
            }

            context.globalCompositeOperation = "source-over"
        }

        /** A still sky is still a sky: the meteors hold mid-streak. */
        const freeze = () => {
            const config = settings.current
            const active = Math.round(clamp(config.count, 0, PERSEID_LIMIT))
            const tilt = (clamp(config.angle, -70, 70) * Math.PI) / 180

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, width, height)
            context.globalCompositeOperation = "lighter"

            for (let index = 0; index < active; index += 1) {
                const meteor = pool[index]
                const spot = rngFor(index * 131 + 7, index)
                const at = 0.2 + spot() * 0.6
                const travelled = meteor.speed * at
                draw(
                    {
                        ...meteor,
                        life: at,
                        x: meteor.x + Math.sin(tilt) * travelled,
                        y: meteor.y + Math.cos(tilt) * travelled,
                    },
                    tilt,
                )
            }

            context.globalCompositeOperation = "source-over"
        }

        const onMove = (event: PointerEvent) => {
            if (!settings.current.parallax) return
            const box = host.getBoundingClientRect()
            if (box.width === 0) return
            lean = {
                x: (event.clientX - box.left) / box.width - 0.5,
                y: (event.clientY - box.top) / box.height - 0.5,
            }
        }
        const onLeave = () => {
            lean = { x: 0, y: 0 }
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)

        const sizer =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(() => {
                      measure()
                      if (settings.current.still) freeze()
                  })
                : null
        sizer?.observe(host)

        if (settings.current.still) {
            freeze()
            return () => {
                host.removeEventListener("pointermove", onMove)
                host.removeEventListener("pointerleave", onLeave)
                sizer?.disconnect()
            }
        }

        const stopVisible = onVisible(host, (visible) => {
            seen = visible
        })

        const stopFrame = onFrame((dt) => {
            if (!seen) return
            paint(dt)
        })

        return () => {
            stopFrame()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            sizer?.disconnect()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-perseid", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            <canvas ref={canvasRef} className="xp-perseid-sky" aria-hidden="true" />
            {children ? <div className="xp-perseid-content">{children}</div> : null}
        </div>
    )
}
