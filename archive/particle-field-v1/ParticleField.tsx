"use client"

import { useEffect, useRef } from "react"
import "./ParticleField.css"

type Particle = {
    x: number
    y: number
    offsetX: number
    offsetY: number
    theta: number
    baseRadius: number
    z: number
    baseSize: number
    color: string
    baseColorR: number
    baseColorG: number
    baseColorB: number
    phase: number
    lerpSpeed: number
    waveSpeed: number
    waveAmpX: number
    waveAmpY: number
}

type ColorWave = {
    originX: number
    originY: number
    color: string
    startTime: number
    duration: number
    speed: number
}

export function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const parent = canvas.parentElement
        if (!parent) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        let width = 0
        let height = 0
        let animationFrame = 0
        let particles: Particle[] = []

        const targetMouse = { x: 0, y: 0, active: false }
        const smoothMouse = { x: 0, y: 0 }

        const premiumColors = [
            '255, 255, 255',
            '210, 225, 255',
            '230, 210, 255',
            '200, 255, 245',
            '240, 240, 250'
        ]

        const createParticles = () => {
            particles = []
            const count = 900
            const minRadius = 180
            const maxRadius = 580

            for (let i = 0; i < count; i++) {
                const r = minRadius + (maxRadius - minRadius) * Math.sqrt(Math.random())
                const theta = Math.random() * Math.PI * 2
                const offsetX = Math.cos(theta) * r
                const offsetY = Math.sin(theta) * r

                const z = Math.random() * 2 - 1

                const lerpSpeed = 0.015 + ((z + 1) / 2) * 0.025
                const baseSize = 1.5 + ((z + 1) / 2) * 2.5
                const color = premiumColors[Math.floor(Math.random() * premiumColors.length)]
                const [cr, cg, cb] = color.split(",").map(Number)

                particles.push({
                    x: width / 2 + offsetX,
                    y: height / 2 + offsetY,
                    offsetX,
                    offsetY,
                    theta,
                    baseRadius: r,
                    z,
                    baseSize,
                    color,
                    baseColorR: cr,
                    baseColorG: cg,
                    baseColorB: cb,
                    phase: Math.random() * Math.PI * 2,
                    lerpSpeed,
                    waveSpeed: 0.0005 + Math.random() * 0.001,
                    waveAmpX: 10 + Math.random() * 20,
                    waveAmpY: 10 + Math.random() * 20,
                })
            }
        }

        const resize = () => {
            const rect = parent.getBoundingClientRect()
            const dpr = Math.min(window.devicePixelRatio || 1, 2)

            width = rect.width
            height = rect.height

            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            if (particles.length === 0) {
                createParticles()
                targetMouse.x = width / 2
                targetMouse.y = height / 2
                smoothMouse.x = width / 2
                smoothMouse.y = height / 2
                targetMouse.active = true
            }
        }

        const handleMouseMove = (event: MouseEvent) => {
            const rect = parent.getBoundingClientRect()
            targetMouse.x = event.clientX - rect.left
            targetMouse.y = event.clientY - rect.top
            targetMouse.active = true
        }

        const handleMouseLeave = () => {
            targetMouse.x = width / 2
            targetMouse.y = height / 2
            targetMouse.active = false
        }

        const hslToRgb = (h: number, s: number, l: number) => {
            s /= 100
            l /= 100
            const k = (n: number) => (n + h / 30) % 12
            const a = s * Math.min(l, 1 - l)
            const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
            return `${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}`
        }

        const startTime = isReducedMotion ? performance.now() - 2000 : performance.now()
        let activeWave: ColorWave | null = null
        let nextWaveTime = startTime + 2000
        let running = false

        const draw = () => {
            ctx.clearRect(0, 0, width, height)

            const time = performance.now()
            const t = time * 0.001

            const elapsed = time - startTime
            const globalAlpha = Math.min(1, elapsed / 2000)

            smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.012
            smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.012

            if (globalAlpha > 0) {
                const gradient = ctx.createRadialGradient(
                    smoothMouse.x, smoothMouse.y, 0,
                    smoothMouse.x, smoothMouse.y, 400
                )
                gradient.addColorStop(0, `rgba(200, 220, 255, ${0.08 * globalAlpha})`)
                gradient.addColorStop(0.4, `rgba(180, 200, 255, ${0.02 * globalAlpha})`)
                gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(smoothMouse.x, smoothMouse.y, 400, 0, Math.PI * 2)
                ctx.fill()
            }

            if (!activeWave && time > nextWaveTime) {
                const angle = Math.random() * Math.PI * 2
                const radius = 600
                const originX = Math.cos(angle) * radius
                const originY = Math.sin(angle) * radius

                const h = Math.random() * 360
                const s = Math.random() > 0.4 ? (80 + Math.random() * 20) : (45 + Math.random() * 25)
                const l = 50 + Math.random() * 25
                const color = hslToRgb(h, s, l)

                activeWave = {
                    originX,
                    originY,
                    color,
                    startTime: time,
                    duration: 7500,
                    speed: 0.20,
                }
                nextWaveTime = time + 4000 + Math.random() * 4000
            }

            if (activeWave && (time - activeWave.startTime) > activeWave.duration) {
                activeWave = null
            }

            const cycle = Math.sin(t * 0.3)

            for (const p of particles) {
                const driftX = Math.sin(time * p.waveSpeed + p.phase) * p.waveAmpX
                const driftY = Math.cos(time * p.waveSpeed + p.phase) * p.waveAmpY

                const blobDeform = isReducedMotion ? 0 : (
                    Math.sin(p.theta * 3 + t * 0.4) * 35 +
                    Math.sin(p.theta * 5 - t * 0.25) * 20 +
                    Math.sin(p.theta * 7 + t * 0.55) * 12 +
                    Math.sin(p.theta * 2 - t * 0.15) * 25
                )
                const deformedRadius = p.baseRadius + blobDeform
                const deformedOffsetX = Math.cos(p.theta) * deformedRadius
                const deformedOffsetY = Math.sin(p.theta) * deformedRadius

                const distToCenter = deformedRadius || 1
                const dirX = deformedOffsetX / distToCenter
                const dirY = deformedOffsetY / distToCenter

                const waveFreq = 0.012
                const wave = isReducedMotion ? 0 : Math.sin(t * 1.5 - distToCenter * waveFreq * cycle)

                const maxDisplacement = isReducedMotion ? 0 : 25
                const displacement = wave * maxDisplacement

                const displacedOffsetX = deformedOffsetX + dirX * displacement
                const displacedOffsetY = deformedOffsetY + dirY * displacement

                const targetX = smoothMouse.x + displacedOffsetX + driftX
                const targetY = smoothMouse.y + displacedOffsetY + driftY

                p.x += (targetX - p.x) * p.lerpSpeed
                p.y += (targetY - p.y) * p.lerpSpeed

                const baseOpacity = 0.35 + ((p.z + 1) / 2) * 0.5
                const waveOpacityScale = isReducedMotion ? 1 : 1.0 + wave * 0.15
                const opacity = Math.min(1, Math.max(0.15, baseOpacity * waveOpacityScale))

                const sizePulse = isReducedMotion ? 0 : Math.sin(t * 1.8 + p.phase * 3.0) * 0.3
                const size = Math.max(1.0, p.baseSize * (1.0 + sizePulse))

                const alpha = opacity * globalAlpha

                let r = p.baseColorR
                let g = p.baseColorG
                let b = p.baseColorB

                if (activeWave) {
                    const waveAge = time - activeWave.startTime
                    const waveRadius = waveAge * activeWave.speed

                    const dxToOrigin = p.offsetX - activeWave.originX
                    const dyToOrigin = p.offsetY - activeWave.originY
                    const distToOrigin = Math.sqrt(dxToOrigin * dxToOrigin + dyToOrigin * dyToOrigin)

                    const waveDist = waveRadius - distToOrigin
                    if (waveDist > 0) {
                        const waveWidth = 1000
                        if (waveDist < waveWidth) {
                            const influence = Math.sin((waveDist / waveWidth) * Math.PI)
                            const [wr, wg, wb] = activeWave.color.split(",").map(Number)
                            r = r * (1 - influence) + wr * influence
                            g = g * (1 - influence) + wg * influence
                            b = b * (1 - influence) + wb * influence
                        }
                    }
                }

                ctx.beginPath()
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`
                ctx.fill()
            }

            if (running) {
                animationFrame = requestAnimationFrame(draw)
            }
        }

        const start = () => {
            if (running) return
            running = true
            animationFrame = requestAnimationFrame(draw)
        }

        const stop = () => {
            running = false
            cancelAnimationFrame(animationFrame)
        }

        resize()

        let observer: IntersectionObserver | null = null

        if (isReducedMotion) {
            draw()
        } else {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        start()
                    } else {
                        stop()
                    }
                },
                { threshold: 0 }
            )
            observer.observe(parent)
        }

        window.addEventListener("resize", resize)
        parent.addEventListener("mousemove", handleMouseMove)
        parent.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            stop()
            observer?.disconnect()
            window.removeEventListener("resize", resize)
            parent.removeEventListener("mousemove", handleMouseMove)
            parent.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [])

    return <canvas ref={canvasRef} className="particle-field" />
}
