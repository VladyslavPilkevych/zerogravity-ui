"use client"

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"

import {
    cx,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import {
    bonusById,
    createGame,
    fire,
    holdFire,
    launch,
    layoutGame,
    moveActor,
    nudgeActor,
    SHIP_COLS,
    SHIP_SPRITE,
    stepGame,
    type RicochetGame,
    type RicochetMode,
} from "./engine"
import { textGrid } from "./font"
import "./Ricochet.css"

export type RicochetVariant = "neon" | "mono" | "soft"

export interface RicochetProps {
    /** Short word or number. Digits, A–Z and a few marks are supported. */
    text?: string
    /** Which arcade mechanic knocks the text apart. */
    game?: RicochetMode
    variant?: RicochetVariant
    /** Preferred block edge in px; the fitted size is never larger. */
    pixelSize?: number
    /** Ball speed in breakout. */
    speed?: number
    /** Bolt speed in shooter. */
    shotSpeed?: number
    /** Bolts per second in shooter. */
    fireRate?: number
    /** How briskly the paddle or ship follows the pointer. */
    shipSpeed?: number
    /** Falling bonuses in breakout. */
    powerUps?: boolean
    /** Chance from 0 to 1 that a destroyed block drops one. */
    powerUpChance?: number
    color?: string
    ballColor?: string
    /** Paddle in breakout, ship in shooter. */
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
    { bg: string; block: string; ball: string; paddle: string; bonus: string; glow: number }
> = {
    neon: {
        bg: "#08090f",
        block: "#f6a94b",
        ball: "#fdf3e3",
        paddle: "#6fd6e8",
        bonus: "#8ef2a4",
        glow: 1,
    },
    mono: {
        bg: "#0a0a0c",
        block: "#e9e4d8",
        ball: "#ffffff",
        paddle: "#e9e4d8",
        bonus: "#ffffff",
        glow: 0,
    },
    soft: {
        bg: "#151327",
        block: "#c9a7e6",
        ball: "#f4e9f7",
        paddle: "#8fb6d9",
        bonus: "#f0b6d8",
        glow: 0.5,
    },
}

const HINTS: Record<RicochetMode, string> = {
    breakout: "move to play",
    shooter: "move and shoot",
}

const LABELS: Record<RicochetMode, string> = {
    breakout: "Arrow keys move the paddle.",
    shooter: "Arrow keys move the ship, space shoots.",
}

export function Ricochet({
    text = "404",
    game: mode = "breakout",
    variant = "neon",
    pixelSize = 26,
    speed = 1,
    shotSpeed = 1,
    fireRate = 5,
    shipSpeed = 1,
    powerUps = true,
    powerUpChance = 0.05,
    color,
    ballColor,
    paddleColor,
    interactive = true,
    autoStart = true,
    hideCursor = true,
    hint,
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
        bonus: palette.bonus,
        bg: palette.bg,
        glow: palette.glow,
    }
    const paintRef = useLatestRef(paint)

    const caption = hint ?? HINTS[mode]

    useIsomorphicLayoutEffect(() => {
        const shell = shellRef.current
        const canvas = canvasRef.current
        if (!shell || !canvas) return

        const box = shell.getBoundingClientRect()
        const game = createGame({
            text,
            mode,
            width: Math.max(120, box.width),
            height: Math.max(120, box.height),
            pixelSize,
            speed,
            shotSpeed,
            fireRate,
            actorSpeed: shipSpeed,
            powerUps,
            powerUpChance,
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

        /** Draws a tiny label out of the same pixel font the blocks come from. */
        const stamp = (
            ctx: CanvasRenderingContext2D,
            label: string,
            cx: number,
            cy: number,
            cell: number,
        ) => {
            const grid = textGrid(label)
            const originX = cx - (grid.cols * cell) / 2
            const originY = cy - (grid.rows * cell) / 2
            const edge = Math.max(1, Math.ceil(cell))

            for (const spot of grid.cells) {
                ctx.fillRect(
                    Math.round(originX + spot.col * cell),
                    Math.round(originY + spot.row * cell),
                    edge,
                    edge,
                )
            }
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

            if (look.glow > 0) ctx.shadowBlur = 14 * look.glow

            if (game.mode === "shooter") {
                ctx.fillStyle = look.ball
                ctx.shadowColor = look.ball
                for (const shot of game.shots) {
                    if (!shot.alive) continue
                    ctx.fillRect(
                        Math.round(shot.x - game.shotR),
                        Math.round(shot.y),
                        Math.max(2, Math.round(game.shotR * 2)),
                        Math.max(4, Math.round(game.shotR * 4)),
                    )
                }

                const cell = game.actor.w / SHIP_COLS
                const left = game.actor.x - game.actor.w / 2
                const edge = Math.max(1, Math.ceil(cell))

                ctx.fillStyle = look.paddle
                ctx.shadowColor = look.paddle
                SHIP_SPRITE.forEach((row, rowIndex) => {
                    for (let col = 0; col < row.length; col += 1) {
                        if (row[col] !== "1") continue
                        ctx.fillRect(
                            Math.round(left + col * cell),
                            Math.round(game.actor.y + rowIndex * cell),
                            edge,
                            edge,
                        )
                    }
                })

                ctx.fillStyle = look.ball
                ctx.shadowColor = look.ball
                ctx.fillRect(
                    Math.round(left + cell * 3),
                    Math.round(game.actor.y + cell * 1),
                    edge,
                    edge,
                )

                // a puff under the pods while the ship is actually travelling
                if (Math.abs(game.actor.target - game.actor.x) > 0.6) {
                    ctx.globalAlpha = 0.7
                    ctx.fillStyle = look.bonus
                    ctx.shadowColor = look.bonus
                    for (const col of [1, 5]) {
                        ctx.fillRect(
                            Math.round(left + col * cell),
                            Math.round(game.actor.y + game.actor.h),
                            edge,
                            edge,
                        )
                    }
                    ctx.globalAlpha = 1
                }
            } else {
                ctx.fillStyle = look.paddle
                ctx.shadowColor = look.paddle
                ctx.fillRect(
                    Math.round(game.actor.x - game.actor.w / 2),
                    Math.round(game.actor.y),
                    Math.round(game.actor.w),
                    Math.round(game.actor.h),
                )

                ctx.fillStyle = look.ball
                ctx.shadowColor = look.ball
                for (const ball of game.balls) {
                    const edge = Math.round(ball.r * 1.7)
                    ctx.fillRect(
                        Math.round(ball.x - edge / 2),
                        Math.round(ball.y - edge / 2),
                        edge,
                        edge,
                    )
                }

                for (const drop of game.drops) {
                    if (!drop.alive) continue
                    const r = game.dropR

                    ctx.fillStyle = look.bonus
                    ctx.shadowColor = look.bonus
                    ctx.fillRect(
                        Math.round(drop.x - r),
                        Math.round(drop.y - r),
                        Math.round(r * 2),
                        Math.round(r * 2),
                    )

                    ctx.shadowBlur = 0
                    ctx.fillStyle = look.bg
                    stamp(
                        ctx,
                        bonusById(drop.bonus)?.label ?? "+",
                        drop.x,
                        drop.y,
                        (r * 1.4) / textGrid(bonusById(drop.bonus)?.label ?? "+").cols,
                    )
                    if (look.glow > 0) ctx.shadowBlur = 14 * look.glow
                }
            }

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
    }, [
        text,
        mode,
        pixelSize,
        speed,
        shotSpeed,
        fireRate,
        shipSpeed,
        powerUps,
        powerUpChance,
        autoStart,
        still,
        variant,
    ])

    useEffect(() => {
        const stage = shellRef.current
        if (!stage || still || !interactive) return

        const aim = (event: PointerEvent) => {
            const game = gameRef.current
            if (!game) return

            const rect = stage.getBoundingClientRect()
            moveActor(game, event.clientX - rect.left)
            if (game.phase === "idle") launch(game)
        }

        const press = (event: PointerEvent) => {
            const game = gameRef.current
            if (!game) return

            aim(event)
            if (game.mode !== "shooter") return
            holdFire(game, true)
            fire(game)
        }

        const release = () => {
            const game = gameRef.current
            if (game) holdFire(game, false)
        }

        stage.addEventListener("pointermove", aim, { passive: true })
        stage.addEventListener("pointerdown", press, { passive: true })
        stage.addEventListener("pointerup", release, { passive: true })
        stage.addEventListener("pointercancel", release, { passive: true })
        stage.addEventListener("pointerleave", release, { passive: true })

        return () => {
            stage.removeEventListener("pointermove", aim)
            stage.removeEventListener("pointerdown", press)
            stage.removeEventListener("pointerup", release)
            stage.removeEventListener("pointercancel", release)
            stage.removeEventListener("pointerleave", release)
        }
    }, [interactive, still])

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const game = gameRef.current
        if (!game || still || !interactive) return

        const key = event.key.toLowerCase()
        const left = key === "arrowleft" || key === "a"
        const right = key === "arrowright" || key === "d"
        const shoot = (key === " " || key === "spacebar") && game.mode === "shooter"
        if (!left && !right && !shoot) return

        event.preventDefault()
        if (game.phase === "idle") launch(game)

        if (shoot) {
            holdFire(game, true)
            fire(game)
            return
        }
        nudgeActor(game, left ? -1 : 1)
    }

    const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
        const game = gameRef.current
        if (!game) return
        const key = event.key.toLowerCase()
        if (key === " " || key === "spacebar") holdFire(game, false)
    }

    return (
        <div
            ref={shellRef}
            className={cx("xp-ricochet", className)}
            data-phase={phase}
            data-variant={variant}
            data-game={mode}
            data-hide-cursor={hideCursor && interactive && !still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--ric-bg": palette.bg,
                    "--ric-block": paint.block,
                    "--ric-ball": paint.ball,
                    "--ric-paddle": paint.paddle,
                    "--ric-bonus": paint.bonus,
                } as CSSProperties
            }
        >
            <p className="xp-ricochet-sr">{text}</p>

            <div
                className="xp-ricochet-stage"
                role="group"
                aria-label={`${text} as an arcade scene. ${LABELS[mode]}`}
                tabIndex={interactive && !still ? 0 : undefined}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
            >
                <canvas ref={canvasRef} className="xp-ricochet-canvas" aria-hidden="true" />
            </div>

            {caption && interactive && !still ? (
                <p className="xp-ricochet-hint" aria-hidden="true">
                    {caption}
                </p>
            ) : null}
        </div>
    )
}
