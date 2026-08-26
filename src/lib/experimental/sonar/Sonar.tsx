"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    fitCanvas,
    onFrame,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Sonar.css"

export interface SonarProps {
    children?: ReactNode
    /** distance between dots in px */
    gap?: number
    /** how far a wave shoves a dot, in px */
    amplitude?: number
    /** how fast a wave crosses, in px per second */
    speed?: number
    /** how wide the crest is, in px */
    band?: number
    color?: string
    /** send a wave on hover as well as on press */
    onHover?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const MAX_DOTS = 2400
const WAVES = 6

export function Sonar({
    children,
    gap = 26,
    amplitude = 16,
    speed = 620,
    band = 90,
    color = "#8ab4ff",
    onHover = false,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: SonarProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        gap: clamp(finite(gap, 26), 8, 120),
        amplitude: clamp(finite(amplitude, 16), 0, 90),
        speed: clamp(finite(speed, 620), 40, 3000),
        band: clamp(finite(band, 90), 10, 400),
        color,
        onHover,
        still,
    })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const box = pointerBox(host)
        let size = fitCanvas(canvas, host)
        let visible = true
        let columns = 0
        let rows = 0
        let stepX = 0
        let stepY = 0

        // a fixed ring of waves: the oldest is always the one reused
        const waveX = new Float32Array(WAVES)
        const waveY = new Float32Array(WAVES)
        const waveAge = new Float32Array(WAVES).fill(Number.POSITIVE_INFINITY)
        let next = 0

        const layout = () => {
            const config = settings.current
            const step = config.gap * size.dpr
            columns = clamp(Math.round(size.width / step) + 1, 2, 200)
            rows = clamp(Math.round(size.height / step) + 1, 2, 200)

            while (columns * rows > MAX_DOTS) {
                columns = Math.max(2, columns - 1)
                rows = Math.max(2, rows - 1)
            }

            stepX = size.width / Math.max(1, columns - 1)
            stepY = size.height / Math.max(1, rows - 1)
        }

        const ring = (x: number, y: number) => {
            waveX[next] = x
            waveY[next] = y
            waveAge[next] = 0
            next = (next + 1) % WAVES
        }

        const paint = () => {
            const config = settings.current
            const reach = config.amplitude * size.dpr
            const band = config.band * size.dpr
            const radius = Math.max(1, size.dpr * 1.1)

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            context.fillStyle = config.color

            for (let row = 0; row < rows; row += 1) {
                for (let column = 0; column < columns; column += 1) {
                    const baseX = column * stepX
                    const baseY = row * stepY
                    let shiftX = 0
                    let shiftY = 0
                    let lift = 0

                    for (let wave = 0; wave < WAVES; wave += 1) {
                        const age = waveAge[wave]
                        if (!Number.isFinite(age)) continue

                        const front = age * config.speed * size.dpr
                        const dx = baseX - waveX[wave]
                        const dy = baseY - waveY[wave]
                        const distance = Math.hypot(dx, dy)
                        const offset = distance - front
                        if (Math.abs(offset) > band) continue

                        // one smooth crest, fading as the wave spends itself
                        const crest = Math.cos((offset / band) * Math.PI) * 0.5 + 0.5
                        const fade = Math.max(
                            0,
                            1 - front / (Math.hypot(size.width, size.height) * 1.1),
                        )
                        const force = crest * fade
                        if (distance > 0.001) {
                            shiftX += (dx / distance) * reach * force
                            shiftY += (dy / distance) * reach * force
                        }
                        lift += force
                    }

                    context.globalAlpha = clamp(0.18 + lift * 0.75, 0, 1)
                    context.beginPath()
                    context.arc(
                        baseX + shiftX,
                        baseY + shiftY,
                        radius * (1 + Math.min(lift, 1) * 1.4),
                        0,
                        Math.PI * 2,
                    )
                    context.fill()
                }
            }

            context.globalAlpha = 1
        }

        layout()
        paint()

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            box.invalidate()
            layout()
            paint()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
        })

        const stopFrame = settings.current.still
            ? () => {}
            : onFrame((dt) => {
                  if (!visible) return

                  let running = false
                  const span = Math.hypot(size.width, size.height) * 1.15
                  for (let wave = 0; wave < WAVES; wave += 1) {
                      if (!Number.isFinite(waveAge[wave])) continue
                      waveAge[wave] += dt
                      if (waveAge[wave] * settings.current.speed * size.dpr > span) {
                          waveAge[wave] = Number.POSITIVE_INFINITY
                      } else {
                          running = true
                      }
                  }

                  if (running) paint()
              })

        const send = (event: PointerEvent) => {
            if (settings.current.still) return
            const point = box.px(event)
            if (point) ring(point.x * size.dpr, point.y * size.dpr)
        }

        const onEnter = (event: PointerEvent) => {
            if (settings.current.onHover) send(event)
        }

        host.addEventListener("pointerdown", send, { passive: true })
        host.addEventListener("pointerenter", onEnter, { passive: true })

        return () => {
            stopFrame()
            stopResize()
            stopVisible()
            host.removeEventListener("pointerdown", send)
            host.removeEventListener("pointerenter", onEnter)
            box.dispose()
        }
    }, [settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-sonar", className)}
            data-still={still ? "true" : undefined}
            style={style}
        >
            <canvas ref={canvasRef} className="xp-sonar-field" aria-hidden="true" />
            {children ? <div className="xp-sonar-content">{children}</div> : null}
        </div>
    )
}
