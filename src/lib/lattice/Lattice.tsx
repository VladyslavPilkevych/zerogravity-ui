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
    onVisible,
    pointerBox,
    rngFor,
    useLatestRef,
    usePrefersReducedMotion,
} from "../internal"
import { usePointerFxEnabled } from "../pointer-fx"
import "./Lattice.css"

export interface LatticeProps {
    children?: ReactNode
    /** distance between nodes in px; the grid is capped either way */
    gap?: number
    /** how far the pointer pushes the mesh, 0 to 1 */
    strength?: number
    /** how far its influence reaches, as a share of the shorter side */
    radius?: number
    color?: string
    /** node drift, 0 to 3 */
    speed?: number
    seed?: number
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const MAX_NODES = 900
const REST = 0.05

interface LatticeEngine {
    sync(): void
}

export function Lattice({
    children,
    gap = 56,
    strength = 0.6,
    radius = 0.3,
    color = "#7fd2ff",
    speed = 1,
    seed = 11,
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    style,
}: LatticeProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<LatticeEngine | null>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const interactive = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })

    const settings = useLatestRef({
        gap: clamp(finite(gap, 56), 18, 260),
        strength: clamp(finite(strength, 0.6), 0, 1),
        radius: clamp(finite(radius, 0.3), 0.05, 1),
        speed: clamp(finite(speed, 1), 0, 3),
        color,
        seed,
        still,
        interactive,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const box = pointerBox(host)
        const home = { x: new Float32Array(0), y: new Float32Array(0) }
        const at = { x: new Float32Array(0), y: new Float32Array(0) }
        let drift = new Float32Array(0)
        let columns = 0
        let rows = 0
        let size = fitCanvas(canvas, host)
        let built = { gap: -1, seed: Number.NaN, width: 0, height: 0 }
        let visible = true
        let time = 0
        let stopFrame: (() => void) | null = null
        const aim = { x: -1, y: -1 }
        const light = { x: -1, y: -1 }

        const build = () => {
            const config = settings.current
            const step = config.gap * size.dpr
            columns = Math.max(2, Math.round(size.width / step) + 1)
            rows = Math.max(2, Math.round(size.height / step) + 1)

            while (columns * rows > MAX_NODES) {
                columns = Math.max(2, columns - 1)
                rows = Math.max(2, rows - 1)
            }

            const count = columns * rows
            home.x = new Float32Array(count)
            home.y = new Float32Array(count)
            at.x = new Float32Array(count)
            at.y = new Float32Array(count)
            drift = new Float32Array(count)

            const random = rngFor(config.seed, count)
            for (let row = 0; row < rows; row += 1) {
                for (let column = 0; column < columns; column += 1) {
                    const index = row * columns + column
                    const jitterX = (random() - 0.5) * step * 0.35
                    const jitterY = (random() - 0.5) * step * 0.35
                    home.x[index] = (column / (columns - 1)) * size.width + jitterX
                    home.y[index] = (row / (rows - 1)) * size.height + jitterY
                    at.x[index] = home.x[index]
                    at.y[index] = home.y[index]
                    drift[index] = random() * Math.PI * 2
                }
            }

            built = { gap: config.gap, seed: config.seed, width: size.width, height: size.height }
        }

        const strand = (a: number, b: number, limit: number, reach: number, lit: boolean) => {
            const length = Math.hypot(at.x[b] - at.x[a], at.y[b] - at.y[a])
            if (length > limit) return

            const midX = (at.x[a] + at.x[b]) * 0.5
            const midY = (at.y[a] + at.y[b]) * 0.5
            const near = lit ? Math.hypot(midX - light.x, midY - light.y) / reach : 1

            context.globalAlpha = 0.18 + clamp(1 - near, 0, 1) * 0.82
            context.beginPath()
            context.moveTo(at.x[a], at.y[a])
            context.lineTo(at.x[b], at.y[b])
            context.stroke()
        }

        const paint = () => {
            const config = settings.current
            const step = Math.max(size.width / columns, size.height / rows)
            const limit = step * 2.2
            const reach = Math.min(size.width, size.height) * config.radius
            const lit = light.x >= 0

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            context.lineWidth = Math.max(1, size.dpr * 0.9)
            context.strokeStyle = config.color

            for (let row = 0; row < rows; row += 1) {
                for (let column = 0; column < columns; column += 1) {
                    const index = row * columns + column
                    if (column + 1 < columns) strand(index, index + 1, limit, reach, lit)
                    if (row + 1 < rows) strand(index, index + columns, limit, reach, lit)
                }
            }

            context.globalAlpha = 1
        }

        const settle = (dt: number) => {
            const config = settings.current
            const reach = Math.min(size.width, size.height) * config.radius
            const push = config.strength * reach * 0.42
            const sway = 3 * size.dpr
            time += dt * config.speed
            let moved = 0

            for (let index = 0; index < at.x.length; index += 1) {
                let targetX = home.x[index]
                let targetY = home.y[index]

                if (config.speed > 0) {
                    targetX += Math.sin(time * 0.6 + drift[index]) * sway
                    targetY += Math.cos(time * 0.5 + drift[index]) * sway
                }

                if (light.x >= 0 && push > 0) {
                    const dx = home.x[index] - light.x
                    const dy = home.y[index] - light.y
                    const distance = Math.hypot(dx, dy)
                    if (distance < reach && distance > 0.001) {
                        const force = (1 - distance / reach) ** 2
                        targetX += (dx / distance) * push * force
                        targetY += (dy / distance) * push * force
                    }
                }

                const nextX = damp(at.x[index], targetX, 9, dt)
                const nextY = damp(at.y[index], targetY, 9, dt)
                moved = Math.max(
                    moved,
                    Math.abs(nextX - at.x[index]),
                    Math.abs(nextY - at.y[index]),
                )
                at.x[index] = nextX
                at.y[index] = nextY
            }

            return moved
        }

        const sleep = () => {
            stopFrame?.()
            stopFrame = null
        }

        const tick = (dt: number) => {
            light.x = aim.x < 0 ? -1 : damp(light.x, aim.x, 12, dt)
            light.y = aim.y < 0 ? -1 : damp(light.y, aim.y, 12, dt)
            const moved = settle(dt)
            paint()

            const config = settings.current
            if (config.speed === 0 && aim.x < 0 && moved < REST) sleep()
        }

        const wake = () => {
            if (stopFrame || !visible || settings.current.still) return
            stopFrame = onFrame(tick)
        }

        const sync = () => {
            const config = settings.current
            if (
                built.gap !== config.gap ||
                built.seed !== config.seed ||
                built.width !== size.width ||
                built.height !== size.height
            ) {
                build()
            }

            if (config.still || !config.interactive) {
                aim.x = -1
                aim.y = -1
                light.x = -1
                light.y = -1
            }

            if (config.still) {
                sleep()
                for (let index = 0; index < at.x.length; index += 1) {
                    at.x[index] = home.x[index]
                    at.y[index] = home.y[index]
                }
            }

            paint()
            wake()
        }

        build()
        paint()
        wake()

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            box.invalidate()
            sync()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
            if (seen) wake()
            else sleep()
        })

        const onMove = (event: PointerEvent) => {
            if (!settings.current.interactive) return
            const point = box.px(event)
            if (!point) return
            aim.x = point.x * size.dpr
            aim.y = point.y * size.dpr
            if (light.x < 0) {
                light.x = aim.x
                light.y = aim.y
            }
            wake()
        }

        const onLeave = () => {
            aim.x = -1
            aim.y = -1
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)
        engineRef.current = { sync }

        return () => {
            engineRef.current = null
            sleep()
            stopResize()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            box.dispose()
        }
    }, [settings])

    useEffect(() => {
        engineRef.current?.sync()
    }, [gap, strength, radius, color, speed, seed, still, interactive])

    return (
        <div
            ref={hostRef}
            className={cx("xp-lattice", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            <canvas ref={canvasRef} className="xp-lattice-mesh" aria-hidden="true" />
            {children ? <div className="xp-lattice-content">{children}</div> : null}
        </div>
    )
}
