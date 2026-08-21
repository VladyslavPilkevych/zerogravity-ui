"use client"

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"

import {
    cx,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import {
    createGame,
    launch,
    layoutGame,
    movePaddle,
    nudgePaddle,
    stepGame,
    type RicochetGame,
} from "./engine"
import "./Ricochet.css"

export type RicochetVariant = "neon" | "mono" | "soft"

export interface RicochetProps {
    /** Short word or number. Digits, A–Z and a few marks are supported. */
    text?: string
    variant?: RicochetVariant
    /** Preferred block edge in px; the fitted size is never larger. */
    pixelSize?: number
    speed?: number
    color?: string
    ballColor?: string
    paddleColor?: string
    interactive?: boolean
    autoStart?: boolean
    hideCursor?: boolean
    hint?: string
    respectReducedMotion?: boolean
    onClear?: () => void
    className?: string
    style?: CSSProperties
}

const MAX_DPR = 2

const PALETTES: Record<
    RicochetVariant,
    { bg: string; block: string; ball: string; paddle: string; glow: number }
> = {
    neon: { bg: "#08090f", block: "#f6a94b", ball: "#fdf3e3", paddle: "#6fd6e8", glow: 1 },
    mono: { bg: "#0a0a0c", block: "#e9e4d8", ball: "#ffffff", paddle: "#e9e4d8", glow: 0 },
    soft: { bg: "#151327", block: "#c9a7e6", ball: "#f4e9f7", paddle: "#8fb6d9", glow: 0.5 },
}

export function Ricochet({
    text = "404",
    variant = "neon",
    pixelSize = 26,
    speed = 1,
    color,
    ballColor,
    paddleColor,
    interactive = true,
    autoStart = true,
    hideCursor = true,
    hint = "move to play",
    respectReducedMotion = true,
    onClear,
    className,
    style,
}: RicochetProps) {
    const shellRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameRef = useRef<RicochetGame | null>(null)
    const clearRef = useLatestRef(onClear)

    const reduced = usePrefersReducedMotion()
    const still = respectReducedMotion && reduced
    const [phase, setPhase] = useState<string>("idle")

    const palette = PALETTES[variant] ?? PALETTES.neon
    const paint = {
        block: color ?? palette.block,
        ball: ballColor ?? palette.ball,
        paddle: paddleColor ?? palette.paddle,
        glow: palette.glow,
    }
    const paintRef = useLatestRef(paint)

    useIsomorphicLayoutEffect(() => {
        const shell = shellRef.current
        const canvas = canvasRef.current
        if (!shell || !canvas) return

        const box = shell.getBoundingClientRect()
        const game = createGame({
            text,
            width: Math.max(120, box.width),
            height: Math.max(120, box.height),
            pixelSize,
            speed,
        })
        gameRef.current = game

        let frame = 0
        let last = 0
        let live = true

        const size = () => {
            const rect = shell.getBoundingClientRect()
            if (rect.width < 4 || rect.height < 4) return

            const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            canvas.width = Math.round(rect.width * dpr)
            canvas.height = Math.round(rect.height * dpr)
            layoutGame(game, rect.width, rect.height, pixelSize)

            const ctx = canvas.getContext("2d")
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        const draw = () => {
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const look = paintRef.current
            ctx.clearRect(0, 0, game.width, game.height)

            for (const block of game.blocks) {
                if (!block.alive) continue
                ctx.globalAlpha = 0.62 + (1 - block.tone) * 0.38
                ctx.fillStyle = look.block
                ctx.fillRect(
                    Math.round(block.x) + 1,
                    Math.round(block.y) + 1,
                    Math.round(block.w) - 2,
                    Math.round(block.h) - 2,
                )
            }
            ctx.globalAlpha = 1

            for (const item of game.sparks) {
                if (item.life <= 0) continue
                ctx.globalAlpha = Math.max(0, item.life / 0.34) * 0.9
                ctx.fillStyle = look.block
                const edge = Math.max(2, game.unit * 0.2)
                ctx.fillRect(Math.round(item.x), Math.round(item.y), edge, edge)
            }
            ctx.globalAlpha = 1

            ctx.fillStyle = look.paddle
            if (look.glow > 0) {
                ctx.shadowColor = look.paddle
                ctx.shadowBlur = 14 * look.glow
            }
            ctx.fillRect(
                Math.round(game.paddle.x - game.paddle.w / 2),
                Math.round(game.paddle.y),
                Math.round(game.paddle.w),
                Math.round(game.paddle.h),
            )

            ctx.fillStyle = look.ball
            if (look.glow > 0) ctx.shadowColor = look.ball
            const edge = Math.round(game.ball.r * 1.7)
            ctx.fillRect(
                Math.round(game.ball.x - edge / 2),
                Math.round(game.ball.y - edge / 2),
                edge,
                edge,
            )
            ctx.shadowBlur = 0
        }

        size()

        if (still) {
            draw()
            setPhase("idle")
            let watcher: ResizeObserver | undefined
            if (typeof ResizeObserver === "function") {
                watcher = new ResizeObserver(() => {
                    size()
                    draw()
                })
                watcher.observe(shell)
            }
            return () => {
                live = false
                watcher?.disconnect()
            }
        }

        const tick = (now: number) => {
            if (!live) return
            const delta = last === 0 ? 0 : (now - last) / 1000
            last = now

            stepGame(game, delta)
            draw()

            if (game.clearedNow) {
                game.clearedNow = false
                setPhase("cleared")
                clearRef.current?.()
            } else {
                setPhase((current) => (current === game.phase ? current : game.phase))
            }

            frame = requestAnimationFrame(tick)
        }

        if (autoStart) launch(game)
        setPhase(game.phase)
        frame = requestAnimationFrame(tick)

        let watcher: ResizeObserver | undefined
        if (typeof ResizeObserver === "function") {
            watcher = new ResizeObserver(size)
            watcher.observe(shell)
        }

        return () => {
            live = false
            cancelAnimationFrame(frame)
            watcher?.disconnect()
            gameRef.current = null
        }
    }, [text, pixelSize, speed, autoStart, still, variant])

    useEffect(() => {
        const stage = shellRef.current
        if (!stage || still || !interactive) return

        const onPointer = (event: PointerEvent) => {
            const game = gameRef.current
            if (!game) return

            const rect = stage.getBoundingClientRect()
            movePaddle(game, event.clientX - rect.left)
            if (game.phase === "idle") launch(game)
        }

        stage.addEventListener("pointermove", onPointer, { passive: true })
        stage.addEventListener("pointerdown", onPointer, { passive: true })

        return () => {
            stage.removeEventListener("pointermove", onPointer)
            stage.removeEventListener("pointerdown", onPointer)
        }
    }, [interactive, still])

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const game = gameRef.current
        if (!game || still || !interactive) return

        const key = event.key.toLowerCase()
        const left = key === "arrowleft" || key === "a"
        const right = key === "arrowright" || key === "d"
        if (!left && !right) return

        event.preventDefault()
        nudgePaddle(game, left ? -1 : 1)
        if (game.phase === "idle") launch(game)
    }

    return (
        <div
            ref={shellRef}
            className={cx("xp-ricochet", className)}
            data-phase={phase}
            data-variant={variant}
            data-hide-cursor={hideCursor && interactive && !still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--ric-bg": palette.bg,
                    "--ric-block": paint.block,
                    "--ric-ball": paint.ball,
                    "--ric-paddle": paint.paddle,
                } as CSSProperties
            }
        >
            <p className="xp-ricochet-sr">{text}</p>

            <div
                className="xp-ricochet-stage"
                role="group"
                aria-label={`${text} as an arcade scene. Arrow keys move the paddle.`}
                tabIndex={interactive && !still ? 0 : undefined}
                onKeyDown={onKeyDown}
            >
                <canvas ref={canvasRef} className="xp-ricochet-canvas" aria-hidden="true" />
            </div>

            {hint && interactive && !still ? (
                <p className="xp-ricochet-hint" aria-hidden="true">
                    {hint}
                </p>
            ) : null}
        </div>
    )
}
