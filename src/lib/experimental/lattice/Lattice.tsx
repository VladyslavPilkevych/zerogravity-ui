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
} from "../../internal"
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
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

/** A wall-sized mesh is still only this many nodes. */
const MAX_NODES = 900

export function Lattice({
    children,
    gap = 56,
    strength = 0.6,
    radius = 0.3,
    color = "#7fd2ff",
    speed = 1,
    seed = 11,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: LatticeProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        gap: clamp(finite(gap, 56), 18, 260),
        strength: clamp(finite(strength, 0.6), 0, 1),
        radius: clamp(finite(radius, 0.3), 0.05, 1),
        speed: clamp(finite(speed, 1), 0, 3),
        color,
        seed,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const box = pointerBox(host)
        // one flat pool, rebuilt only when the grid shape changes
        const home = { x: new Float32Array(0), y: new Float32Array(0) }
        const at = { x: new Float32Array(0), y: new Float32Array(0) }
        const phase = new Float32Array(0)
        let nodes = { columns: 0, rows: 0, count: 0, phase }
        let size = fitCanvas(canvas, host)
        let visible = true
        let time = 0
        const aim = { x: -1, y: -1 }
        const light = { x: -1, y: -1 }

        const build = () => {
            const config = settings.current
            const step = config.gap * size.dpr
            let columns = Math.max(2, Math.round(size.width / step) + 1)
            let rows = Math.max(2, Math.round(size.height / step) + 1)

            while (columns * rows > MAX_NODES) {
                columns = Math.max(2, columns - 1)
                rows = Math.max(2, rows - 1)
            }

            const count = columns * rows
            home.x = new Float32Array(count)
            home.y = new Float32Array(count)
            at.x = new Float32Array(count)
            at.y = new Float32Array(count)
            const drift = new Float32Array(count)

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

            nodes = { columns, rows, count, phase: drift }
        }

        const paint = () => {
            const config = settings.current
            const { columns, rows } = nodes
            const step = Math.max(size.width / columns, size.height / rows)

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            context.lineWidth = Math.max(1, size.dpr * 0.9)

            const reach = Math.min(size.width, size.height) * config.radius
            const lit = light.x >= 0

            for (let row = 0; row < rows; row += 1) {
                for (let column = 0; column < columns; column += 1) {
                    const index = row * columns + column

                    if (column + 1 < columns) strand(index, index + 1, step, reach, lit, config)
                    if (row + 1 < rows) strand(index, index + columns, step, reach, lit, config)
                }
            }
        }

        const strand = (
            a: number,
            b: number,
            step: number,
            reach: number,
            lit: boolean,
            config: { color: string; strength: number },
        ) => {
            const midX = (at.x[a] + at.x[b]) * 0.5
            const midY = (at.y[a] + at.y[b]) * 0.5
            const near = lit ? Math.hypot(midX - light.x, midY - light.y) / reach : 1
            const glow = clamp(1 - near, 0, 1)
            const alpha = 0.18 + glow * 0.82

            const length = Math.hypot(at.x[b] - at.x[a], at.y[b] - at.y[a])
            // a strand that has been stretched too far simply lets go
            if (length > step * 2.2) return

            context.globalAlpha = alpha
            context.strokeStyle = config.color
            context.beginPath()
            context.moveTo(at.x[a], at.y[a])
            context.lineTo(at.x[b], at.y[b])
            context.stroke()
            context.globalAlpha = 1
        }

        const settle = (dt: number) => {
            const config = settings.current
            const reach = Math.min(size.width, size.height) * config.radius
            const push = config.strength * reach * 0.42
            time += dt * config.speed

            for (let index = 0; index < nodes.count; index += 1) {
                let targetX = home.x[index]
                let targetY = home.y[index]

                if (config.speed > 0) {
                    const wobble = nodes.phase[index]
                    targetX += Math.sin(time * 0.6 + wobble) * 3 * size.dpr
                    targetY += Math.cos(time * 0.5 + wobble) * 3 * size.dpr
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

                at.x[index] = damp(at.x[index], targetX, 9, dt)
                at.y[index] = damp(at.y[index], targetY, 9, dt)
            }
        }

        build()
        paint()

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            box.invalidate()
            build()
            paint()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = settings.current.still
            ? () => {}
            : onFrame((dt) => {
                  if (!visible) return
                  light.x = damp(light.x, aim.x, 12, dt)
                  light.y = damp(light.y, aim.y, 12, dt)
                  settle(dt)
                  paint()
              })

        const onMove = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.px(event)
            if (!point) return
            aim.x = point.x * size.dpr
            aim.y = point.y * size.dpr
            if (light.x < 0) {
                light.x = aim.x
                light.y = aim.y
            }
        }

        const onLeave = () => {
            aim.x = -1
            aim.y = -1
            light.x = -1
            light.y = -1
        }

        host.addEventListener("pointermove", onMove, { passive: true })
        host.addEventListener("pointerleave", onLeave)

        return () => {
            stopFrame()
            stopResize()
            stopVisible()
            host.removeEventListener("pointermove", onMove)
            host.removeEventListener("pointerleave", onLeave)
            box.dispose()
        }
    }, [settings])

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
