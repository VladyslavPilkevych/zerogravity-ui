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
} from "../internal"
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
    /** send a wave when the pointer enters, as well as on press */
    pulseOnHover?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const MAX_DOTS = 2400
const WAVES = 6

interface SonarEngine {
    sync(): void
}

export function Sonar({
    children,
    gap = 26,
    amplitude = 16,
    speed = 620,
    band = 90,
    color = "#8ab4ff",
    pulseOnHover = false,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: SonarProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<SonarEngine | null>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        gap: clamp(finite(gap, 26), 8, 120),
        amplitude: clamp(finite(amplitude, 16), 0, 90),
        speed: clamp(finite(speed, 620), 40, 3000),
        band: clamp(finite(band, 90), 10, 400),
        color,
        pulseOnHover,
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
        let stopFrame: (() => void) | null = null

        const waveX = new Float32Array(WAVES)
        const waveY = new Float32Array(WAVES)
        const waveAge = new Float32Array(WAVES).fill(Number.POSITIVE_INFINITY)
        const lifted = new Float32Array(MAX_DOTS * 4)
        let next = 0

        const layout = () => {
            const step = settings.current.gap * size.dpr
            columns = clamp(Math.round(size.width / step) + 1, 2, 200)
            rows = clamp(Math.round(size.height / step) + 1, 2, 200)

            while (columns * rows > MAX_DOTS) {
                columns = Math.max(2, columns - 1)
                rows = Math.max(2, rows - 1)
            }

            stepX = size.width / Math.max(1, columns - 1)
            stepY = size.height / Math.max(1, rows - 1)
        }

        const paint = () => {
            const config = settings.current
            const reach = config.amplitude * size.dpr
            const band = config.band * size.dpr
            const radius = Math.max(1, size.dpr * 1.1)
            const span = Math.hypot(size.width, size.height) * 1.1
            let count = 0

            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, size.width, size.height)
            context.fillStyle = config.color
            context.globalAlpha = 0.18
            context.beginPath()

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

                        const crest = Math.cos((offset / band) * Math.PI) * 0.5 + 0.5
                        const force = crest * Math.max(0, 1 - front / span)
                        if (distance > 0.001) {
                            shiftX += (dx / distance) * reach * force
                            shiftY += (dy / distance) * reach * force
                        }
                        lift += force
                    }

                    if (lift < 0.001) {
                        context.moveTo(baseX + radius, baseY)
                        context.arc(baseX, baseY, radius, 0, Math.PI * 2)
                        continue
                    }

                    const slot = count * 4
                    lifted[slot] = baseX + shiftX
                    lifted[slot + 1] = baseY + shiftY
                    lifted[slot + 2] = radius * (1 + Math.min(lift, 1) * 1.4)
                    lifted[slot + 3] = clamp(0.18 + lift * 0.75, 0, 1)
                    count += 1
                }
            }

            context.fill()

            for (let dot = 0; dot < count; dot += 1) {
                const slot = dot * 4
                context.globalAlpha = lifted[slot + 3]
                context.beginPath()
                context.arc(lifted[slot], lifted[slot + 1], lifted[slot + 2], 0, Math.PI * 2)
                context.fill()
            }

            context.globalAlpha = 1
        }

        const sleep = () => {
            stopFrame?.()
            stopFrame = null
        }

        const tick = (dt: number) => {
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

            paint()
            if (!running) sleep()
        }

        const wake = () => {
            if (stopFrame || !visible || settings.current.still) return
            if (!waveAge.some((age) => Number.isFinite(age))) return
            stopFrame = onFrame(tick)
        }

        const calm = () => {
            sleep()
            waveAge.fill(Number.POSITIVE_INFINITY)
        }

        const sync = () => {
            if (settings.current.still) calm()
            layout()
            paint()
            wake()
        }

        layout()
        paint()

        const stopResize = onResize(host, () => {
            size = fitCanvas(canvas, host)
            box.invalidate()
            sync()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
            if (seen) return
            calm()
            paint()
        })

        const send = (event: PointerEvent) => {
            if (settings.current.still || !visible) return
            const point = box.px(event)
            if (!point) return
            waveX[next] = point.x * size.dpr
            waveY[next] = point.y * size.dpr
            waveAge[next] = 0
            next = (next + 1) % WAVES
            wake()
        }

        const onEnter = (event: PointerEvent) => {
            if (settings.current.pulseOnHover) send(event)
        }

        host.addEventListener("pointerdown", send, { passive: true })
        host.addEventListener("pointerenter", onEnter, { passive: true })
        engineRef.current = { sync }

        return () => {
            engineRef.current = null
            sleep()
            stopResize()
            stopVisible()
            host.removeEventListener("pointerdown", send)
            host.removeEventListener("pointerenter", onEnter)
            box.dispose()
        }
    }, [settings])

    useEffect(() => {
        engineRef.current?.sync()
    }, [gap, amplitude, speed, band, color, still])

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
