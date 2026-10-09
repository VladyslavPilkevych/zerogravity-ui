"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent as ReactMouseEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from "react"

import {
    context2d,
    cx,
    fitCanvas,
    onFrame,
    onResize,
    onVisible,
    rngFor,
    usePrefersReducedMotion,
    type SurfaceSize,
} from "../internal"
import { resolveColor } from "../pointer-fx/colors"
import "./Wash.css"

export type WashMode = "click" | "auto" | "both"

export interface WashProps {
    children?: ReactNode
    /** the palette, cycled in order; any CSS colour */
    colors?: string[]
    /** pour on a click or tap, on a timer, or both */
    mode?: WashMode
    /** milliseconds between automatic pours, at least 600 */
    interval?: number
    /** length of one pour, in ms */
    duration?: number
    /** timing function for the spread */
    easing?: string
    /** how diffuse the leading edge is, 0 to 0.9 */
    softness?: number
    /** square pixel fragments flick out of a click */
    burst?: boolean
    /** fixes the fragment pattern */
    seed?: number
    /** holds the pour and burst at a 0 to 1 progress, for stories and screenshots */
    freezeAt?: number
    /** holds the current colour and pours nothing */
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

interface WashState {
    base: string
    pour: { color: string; x: number; y: number; key: number } | null
}

type Spawn = (x: number, y: number, color: string) => void

const DEFAULT_COLORS = ["#20304f", "#2d4a4a", "#402f52", "#1f3b52", "#4a3550"]

const POOL = 48
const FRAGMENTS = 12
const CELL = 4
const DRAG = 5.5
const GRAVITY = 70
const ALPHA_STEPS = 4
const RING_LIFE = 0.16
const RING_STEP = 0.032

/** A pale version of the colour for the fragments; hex or rgb(), as a canvas hands either back. */
function tint(color: string): string {
    const value = color.trim()
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
    const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(value)
    let channels: number[]

    if (hex) {
        const digits =
            hex[1].length === 3
                ? hex[1]
                      .split("")
                      .map((digit) => digit + digit)
                      .join("")
                : hex[1]
        channels = [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16))
    } else if (rgb) {
        channels = [rgb[1], rgb[2], rgb[3]].map(Number)
    } else {
        return "rgba(255, 255, 255, 0.9)"
    }

    const [r, g, b] = channels.map((value) => Math.round(value + (255 - value) * 0.78))
    return `rgb(${r}, ${g}, ${b})`
}

export function Wash({
    children,
    colors,
    mode = "both",
    interval = 6000,
    duration = 1400,
    easing = "cubic-bezier(0.22, 1, 0.36, 1)",
    softness = 0.35,
    burst = true,
    seed = 1,
    freezeAt,
    disabled = false,
    className,
    style,
}: WashProps) {
    const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const spawnRef = useRef<Spawn | null>(null)
    const timerRef = useRef(0)
    const touchRef = useRef(false)
    const commitRef = useRef(0)
    const keyRef = useRef(0)
    const indexRef = useRef(0)
    const reduced = usePrefersReducedMotion()

    const frozen = freezeAt === undefined ? null : Math.min(1, Math.max(0, freezeAt))
    const sparks = burst && !reduced && !disabled

    const [state, setState] = useState<WashState>(() => ({ base: palette[0], pour: null }))

    const paletteKey = palette.join("|")
    const paletteRef = useRef(palette)
    paletteRef.current = palette

    useEffect(() => {
        indexRef.current = 0
        setState({ base: paletteRef.current[0], pour: null })
    }, [paletteKey])

    const trigger = useCallback(
        (x: number, y: number, fromPointer: boolean) => {
            if (disabled) return

            const tones = paletteRef.current
            if (tones.length < 2) return

            window.clearTimeout(commitRef.current)

            const next = (indexRef.current + 1) % tones.length
            const color = tones[next]
            indexRef.current = next

            if (reduced) {
                setState({ base: color, pour: null })
                return
            }

            keyRef.current += 1
            const key = keyRef.current
            setState((current) => ({
                base: current.pour ? current.pour.color : current.base,
                pour: { color, x, y, key },
            }))

            if (fromPointer) spawnRef.current?.(x, y, color)
        },
        [disabled, reduced],
    )

    useEffect(() => {
        if (!state.pour || reduced || frozen !== null) return

        commitRef.current = window.setTimeout(
            () => {
                setState((current) =>
                    current.pour ? { base: current.pour.color, pour: null } : current,
                )
            },
            Math.max(0, duration),
        )

        return () => window.clearTimeout(commitRef.current)
    }, [state.pour, duration, reduced, frozen])

    useEffect(() => {
        if (disabled || reduced || frozen !== null) return
        if (mode !== "auto" && mode !== "both") return

        const every = Math.max(600, interval)
        let seen = true
        const root = rootRef.current
        const stopVisible = root ? onVisible(root, (visible) => (seen = visible)) : () => {}

        timerRef.current = window.setInterval(() => {
            if (!seen || document.visibilityState === "hidden") return
            const spot = 0.2 + ((keyRef.current * 0.37) % 0.6)
            const other = 0.25 + ((keyRef.current * 0.61) % 0.5)
            trigger(spot, other, false)
        }, every)

        return () => {
            window.clearInterval(timerRef.current)
            stopVisible()
        }
    }, [mode, interval, disabled, reduced, frozen, trigger])

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!sparks || !root || !canvas) return

        const context = context2d(canvas)
        if (!context) return

        const originX = new Float32Array(POOL)
        const originY = new Float32Array(POOL)
        const velocityX = new Float32Array(POOL)
        const velocityY = new Float32Array(POOL)
        const age = new Float32Array(POOL)
        const life = new Float32Array(POOL).fill(0)
        const size = new Float32Array(POOL)
        const tone: string[] = new Array<string>(POOL).fill("")

        let surface: SurfaceSize | null = null
        let ringX = 0
        let ringY = 0
        let ringAge = RING_LIFE
        let ringTone = ""
        let cursor = 0
        let bursts = 0
        let stopFrame: (() => void) | null = null

        const draw = () => {
            if (!surface) return
            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, surface.width, surface.height)
            context.setTransform(surface.dpr, 0, 0, surface.dpr, 0, 0)

            let live = 0
            if (ringAge < RING_LIFE) {
                live += 1
                const half = CELL * (1 + Math.floor(ringAge / RING_STEP)) * 1.5
                const left = Math.round(ringX / CELL) * CELL - half
                const top = Math.round(ringY / CELL) * CELL - half
                const edge = half * 2
                context.globalAlpha = 0.55 * (1 - Math.floor((ringAge / RING_LIFE) * 3) / 3)
                context.fillStyle = ringTone
                context.fillRect(left, top, edge, 2)
                context.fillRect(left, top + edge - 2, edge, 2)
                context.fillRect(left, top, 2, edge)
                context.fillRect(left + edge - 2, top, 2, edge)
            }

            for (let i = 0; i < POOL; i += 1) {
                const span = life[i]
                if (span <= 0) continue
                const t = age[i]
                const progress = t / span
                if (progress >= 1) continue
                live += 1

                const travel = (1 - Math.exp(-DRAG * t)) / DRAG
                const x = originX[i] + velocityX[i] * travel
                const y = originY[i] + velocityY[i] * travel + 0.5 * GRAVITY * t * t
                const side = progress > 0.6 ? Math.max(CELL, size[i] - CELL) : size[i]

                context.globalAlpha = (Math.ceil((1 - progress) * ALPHA_STEPS) / ALPHA_STEPS) * 0.95
                context.fillStyle = tone[i]
                context.fillRect(
                    Math.round(x / CELL) * CELL - side / 2,
                    Math.round(y / CELL) * CELL - side / 2,
                    side,
                    side,
                )
            }

            context.globalAlpha = 1
            return live
        }

        const halt = () => {
            stopFrame?.()
            stopFrame = null
        }

        const tick = (dt: number) => {
            ringAge += dt
            for (let i = 0; i < POOL; i += 1) {
                if (life[i] <= 0) continue
                age[i] += dt
                if (age[i] >= life[i]) life[i] = 0
            }
            if (!draw()) halt()
        }

        const spawn: Spawn = (nx, ny, color) => {
            if (!surface) surface = fitCanvas(canvas, root)
            const width = surface.width / surface.dpr
            const height = surface.height / surface.dpr
            const random = rngFor(seed, bursts)
            // the canvas normalises any colour syntax to hex or rgba()
            context.fillStyle = "#ffffff"
            context.fillStyle = resolveColor(color, root)
            const fill = tint(String(context.fillStyle))
            bursts += 1
            ringX = nx * width
            ringY = ny * height
            ringAge = frozen === null ? 0 : RING_LIFE * frozen * 0.999
            ringTone = fill

            for (let k = 0; k < FRAGMENTS; k += 1) {
                const slot = cursor
                cursor = (cursor + 1) % POOL
                const angle = (k / FRAGMENTS) * Math.PI * 2 + (random() - 0.5) * 0.7
                const speed = 220 + random() * 280

                originX[slot] = nx * width
                originY[slot] = ny * height
                velocityX[slot] = Math.cos(angle) * speed
                velocityY[slot] = Math.sin(angle) * speed
                life[slot] = 0.34 + random() * 0.3
                age[slot] = frozen === null ? 0 : life[slot] * frozen * 0.999
                size[slot] = random() < 0.4 ? CELL * 2 : CELL
                tone[slot] = random() < 0.25 ? "#ffffff" : fill
            }

            if (frozen !== null) {
                draw()
                return
            }
            if (!stopFrame) stopFrame = onFrame(tick)
        }

        spawnRef.current = spawn
        const stopResize = onResize(root, () => {
            surface = null
            if (!stopFrame) return
            surface = fitCanvas(canvas, root)
        })

        return () => {
            spawnRef.current = null
            halt()
            stopResize()
        }
    }, [sparks, seed, frozen])

    const clickable = mode === "click" || mode === "both"

    const pourAt = (clientX: number, clientY: number) => {
        const box = rootRef.current?.getBoundingClientRect()
        if (!box || box.width === 0 || box.height === 0) return

        trigger((clientX - box.left) / box.width, (clientY - box.top) / box.height, true)
    }

    // a mouse or pen pours on press; a finger waits for the tap, so a swipe
    // that scrolls the page across the surface pours nothing
    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        touchRef.current = event.pointerType === "touch"
        if (!clickable || touchRef.current) return
        pourAt(event.clientX, event.clientY)
    }

    const onClick = (event: ReactMouseEvent<HTMLDivElement>) => {
        if (!clickable) return

        // a keyboard press on a control inside pours from that control
        if (event.detail === 0) {
            const target = event.target as Element
            if (target === event.currentTarget) return
            const spot = target.getBoundingClientRect()
            pourAt(spot.left + spot.width / 2, spot.top + spot.height / 2)
            return
        }

        if (!touchRef.current) return
        touchRef.current = false
        pourAt(event.clientX, event.clientY)
    }

    const rootStyle: CSSProperties = {
        ...style,
        ["--wash-base" as string]: state.base,
        ["--wash-duration" as string]: `${Math.max(0, duration)}ms`,
        ["--wash-easing" as string]: easing,
        ["--wash-soft" as string]: `${Math.round(Math.min(0.9, Math.max(0, softness)) * 100)}%`,
    }

    return (
        <div
            ref={rootRef}
            className={cx("xp-wash", className)}
            style={rootStyle}
            data-frozen={frozen === null ? undefined : "true"}
            onPointerDown={onPointerDown}
            onClick={onClick}
        >
            {state.pour ? (
                <div
                    key={state.pour.key}
                    className="xp-wash-pour"
                    aria-hidden="true"
                    style={{
                        ["--wash-color" as string]: state.pour.color,
                        ["--wash-x" as string]: `${(state.pour.x * 100).toFixed(2)}%`,
                        ["--wash-y" as string]: `${(state.pour.y * 100).toFixed(2)}%`,
                        ...(frozen === null
                            ? null
                            : {
                                  animationDelay: `${-frozen * Math.max(0, duration)}ms`,
                                  animationPlayState: "paused",
                              }),
                    }}
                />
            ) : null}
            {sparks ? (
                <canvas ref={canvasRef} className="xp-wash-burst" aria-hidden="true" />
            ) : null}
            {children ? <div className="xp-wash-content">{children}</div> : null}
        </div>
    )
}
