"use client"

import {
    Children,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from "react"

import { cx, onFrame, useIsomorphicLayoutEffect, useLatestRef } from "../internal"
import "./Reel.css"

export interface ReelHandle {
    next(): void
    prev(): void
    go(index: number): void
}

export interface ReelProps {
    children: ReactNode
    index?: number
    defaultIndex?: number
    onIndexChange?: (index: number) => void
    loop?: boolean
    itemWidth?: number
    itemHeight?: number
    radius?: number
    spacing?: number
    visible?: number
    scale?: number
    opacity?: number
    rotate?: number
    depth?: number
    perspective?: number
    stiffness?: number
    drag?: boolean
    wheel?: boolean
    arrows?: boolean
    dots?: boolean
    clickToSelect?: boolean
    className?: string
    label?: string
    style?: CSSProperties
}

const SETTLED = 0.0005
const DRAG_THRESHOLD = 4
const WHEEL_STEP = 60
const WHEEL_COOLDOWN = 220
const WHEEL_IDLE = 160
const WHEEL_LINE = 40
const SAMPLES = 16
const VELOCITY_SPAN = 60
const MAX_FLICK = 3
const HEADROOM = 56

function wrap(value: number, length: number): number {
    return ((value % length) + length) % length
}

function shortest(delta: number, length: number): number {
    return wrap(delta + length / 2, length) - length / 2
}

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value
}

interface Track {
    x: Float64Array
    t: Float64Array
    head: number
    size: number
}

function record(track: Track, x: number, t: number): void {
    track.head = (track.head + 1) % SAMPLES
    track.x[track.head] = x
    track.t[track.head] = t
    if (track.size < SAMPLES) track.size += 1
}

/**
 * Pointer speed in px/ms over the last ~VELOCITY_SPAN ms before `now`. Measured
 * against the release moment, so a pointer that stopped before letting go reads
 * as still, and only the latest direction of travel counts.
 */
function releaseSpeed(track: Track, x: number, now: number): number {
    let anchor = -1
    for (let n = 0; n < track.size; n += 1) {
        anchor = (track.head - n + SAMPLES) % SAMPLES
        if (now - track.t[anchor] >= VELOCITY_SPAN) break
    }
    if (anchor < 0) return 0
    const elapsed = now - track.t[anchor]
    return elapsed > 0 ? (x - track.x[anchor]) / elapsed : 0
}

export const Reel = forwardRef<ReelHandle, ReelProps>(function Reel(
    {
        children,
        index,
        defaultIndex = 0,
        onIndexChange,
        loop = false,
        itemWidth = 300,
        itemHeight = 400,
        radius = 0,
        spacing = 340,
        visible = 3,
        scale = 0.8,
        opacity = 0.35,
        rotate = 0,
        depth = 0,
        perspective = 1400,
        stiffness = 9,
        drag = true,
        wheel = true,
        arrows = true,
        dots = true,
        clickToSelect = true,
        className,
        label = "Carousel",
        style,
    },
    ref,
) {
    const items = Children.toArray(children)
    const count = items.length

    const viewportRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])

    const bindersRef = useRef<((node: HTMLDivElement | null) => void)[]>([])

    const positionRef = useRef(defaultIndex)
    const targetRef = useRef(defaultIndex)
    const activePaintedRef = useRef(-1)
    const stopRef = useRef<(() => void) | null>(null)
    const paintedRef = useRef({
        position: Number.NaN,
        transform: [] as string[],
        opacity: [] as string[],
        layer: [] as string[],
        hidden: [] as boolean[],
    })

    const dragStateRef = useRef({
        active: false,
        pointerId: -1,
        startX: 0,
        startPosition: 0,
        track: {
            x: new Float64Array(SAMPLES),
            t: new Float64Array(SAMPLES),
            head: 0,
            size: 0,
        } as Track,
        moved: false,
        pressed: -1,
    })
    const wheelRef = useRef({ delta: 0, time: 0, last: 0, level: 0, locked: false })

    const controlled = index !== undefined
    const [internal, setInternal] = useState(() => clamp(defaultIndex, 0, Math.max(0, count - 1)))
    const current = controlled ? clamp(index, 0, Math.max(0, count - 1)) : internal

    const settings = useLatestRef({
        loop,
        spacing,
        visible,
        scale,
        opacity,
        rotate,
        depth,
        stiffness,
        count,
    })
    const changeRef = useLatestRef(onIndexChange)

    const paint = useCallback(() => {
        const config = settings.current
        const total = config.count
        if (total === 0) return

        const position = positionRef.current
        const painted = paintedRef.current
        if (position === painted.position) return
        painted.position = position

        const active = wrap(Math.round(position), total)

        for (let i = 0; i < total; i += 1) {
            const node = itemRefs.current[i]
            if (!node) continue
            const style = node.style

            const offset = config.loop ? shortest(i - position, total) : i - position
            const distance = Math.abs(offset)

            if (distance > config.visible + 1) {
                if (painted.hidden[i] !== true) {
                    painted.hidden[i] = true
                    style.visibility = "hidden"
                    style.pointerEvents = "none"
                }
                continue
            }

            if (painted.hidden[i] !== false) {
                painted.hidden[i] = false
                style.visibility = ""
                style.pointerEvents = ""
            }

            const ramp = distance > 1 ? 1 : distance
            const itemScale = 1 + (config.scale - 1) * ramp
            const itemOpacity = 1 + (config.opacity - 1) * ramp
            const spin = -config.rotate * clamp(offset, -1, 1)
            const push = -config.depth * ramp

            const transform = `translate(-50%, -50%) translate3d(${(
                offset * config.spacing
            ).toFixed(
                2,
            )}px, 0, ${push.toFixed(2)}px) rotateY(${spin.toFixed(2)}deg) scale(${itemScale.toFixed(4)})`
            const opacity = itemOpacity.toFixed(3)
            const layer = String(1000 - Math.round(distance * 10))

            if (painted.transform[i] !== transform) {
                painted.transform[i] = transform
                style.transform = transform
            }
            if (painted.opacity[i] !== opacity) {
                painted.opacity[i] = opacity
                style.opacity = opacity
            }
            if (painted.layer[i] !== layer) {
                painted.layer[i] = layer
                style.zIndex = layer
            }
        }

        if (active !== activePaintedRef.current) {
            activePaintedRef.current = active
            for (let i = 0; i < total; i += 1) {
                const node = itemRefs.current[i]
                if (node) node.dataset.active = i === active ? "true" : "false"
            }
        }
    }, [settings])

    const repaint = useCallback(() => {
        const painted = paintedRef.current
        painted.position = Number.NaN
        painted.transform.length = 0
        painted.opacity.length = 0
        painted.layer.length = 0
        painted.hidden.length = 0
        activePaintedRef.current = -1
        paint()
    }, [paint])

    const halt = useCallback(() => {
        stopRef.current?.()
        stopRef.current = null
    }, [])

    const tickRef = useRef<(dt: number) => void>(() => {})

    const tick = useCallback(
        (dt: number) => {
            if (dragStateRef.current.active) {
                paint()
                halt()
                return
            }

            const diff = targetRef.current - positionRef.current
            if (Math.abs(diff) < SETTLED) {
                positionRef.current = targetRef.current
                paint()
                halt()
                return
            }

            positionRef.current += diff * (1 - Math.exp(-settings.current.stiffness * dt))
            paint()
        },
        [paint, halt, settings],
    )

    useIsomorphicLayoutEffect(() => {
        tickRef.current = tick
    }, [tick])

    const start = useCallback(() => {
        if (stopRef.current) return
        stopRef.current = onFrame((dt) => tickRef.current(dt))
    }, [])

    const commit = useCallback(
        (next: number) => {
            const total = settings.current.count
            if (total === 0) return
            const normalized = settings.current.loop ? wrap(next, total) : clamp(next, 0, total - 1)
            if (!controlled) setInternal(normalized)
            changeRef.current?.(normalized)
        },
        [controlled, settings, changeRef],
    )

    const step = useCallback(
        (direction: number) => {
            const total = settings.current.count
            if (total === 0) return
            commit(Math.round(targetRef.current) + direction)
        },
        [commit, settings],
    )

    useImperativeHandle(
        ref,
        () => ({
            next: () => step(1),
            prev: () => step(-1),
            go: (value: number) => commit(value),
        }),
        [step, commit],
    )

    useIsomorphicLayoutEffect(() => {
        itemRefs.current.length = count
        repaint()
    }, [
        count,
        itemWidth,
        itemHeight,
        spacing,
        scale,
        opacity,
        rotate,
        depth,
        visible,
        loop,
        repaint,
    ])

    useEffect(() => {
        const total = count
        if (total === 0) return

        const reduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const heading = loop
            ? wrap(Math.round(targetRef.current), total)
            : clamp(Math.round(targetRef.current), 0, total - 1)

        if (heading !== current) {
            targetRef.current = loop
                ? positionRef.current + shortest(current - positionRef.current, total)
                : clamp(current, 0, total - 1)
        }

        if (reduced) {
            positionRef.current = targetRef.current
            paint()
            return
        }

        start()
    }, [current, count, loop, start, paint])

    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport || !wheel) return

        const onWheel = (event: WheelEvent) => {
            const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
            let delta = horizontal ? event.deltaX : event.shiftKey ? event.deltaY : 0
            if (delta === 0) return

            event.preventDefault()
            if (event.deltaMode === 1) delta *= WHEEL_LINE
            else if (event.deltaMode === 2) delta *= viewport.clientWidth

            const state = wheelRef.current
            const now = performance.now()
            const gap = now - state.last
            const magnitude = Math.abs(delta)
            const decaying = magnitude <= state.level
            state.last = now
            state.level = magnitude

            // a trackpad swipe keeps streaming shrinking deltas (momentum) long
            // after it stepped; that tail belongs to the same gesture
            if (state.locked) {
                const tail =
                    now - state.time < WHEEL_COOLDOWN || (decaying && magnitude < WHEEL_STEP)
                if (gap < WHEEL_IDLE && tail) return
                state.locked = false
            }

            // stray deltas from an earlier gesture must not add up into a step
            if (gap >= WHEEL_IDLE) state.delta = 0

            state.delta += delta
            if (Math.abs(state.delta) >= WHEEL_STEP) {
                step(Math.sign(state.delta))
                state.delta = 0
                state.time = now
                state.locked = true
            }
        }

        viewport.addEventListener("wheel", onWheel, { passive: false })
        return () => viewport.removeEventListener("wheel", onWheel)
    }, [wheel, step])

    useEffect(() => halt, [halt])

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (count === 0 || event.button !== 0) return

        const state = dragStateRef.current
        // a second finger must not hijack the drag in progress
        if (state.active && !event.isPrimary) return
        const card = (event.target as HTMLElement).closest(".reel-item") as HTMLElement | null
        state.pressed = card ? Number(card.dataset.index) : -1
        state.moved = false

        if (!drag) return

        state.active = true
        state.pointerId = event.pointerId
        state.startX = event.clientX
        state.startPosition = positionRef.current
        state.track.size = 0
        record(state.track, event.clientX, performance.now())
        event.currentTarget.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const state = dragStateRef.current
        if (!state.active || event.pointerId !== state.pointerId) return

        const dx = event.clientX - state.startX
        if (Math.abs(dx) > DRAG_THRESHOLD) state.moved = true

        record(state.track, event.clientX, performance.now())

        let next = state.startPosition - dx / settings.current.spacing

        if (!settings.current.loop) {
            const max = settings.current.count - 1
            if (next < 0) next *= 0.35
            else if (next > max) next = max + (next - max) * 0.35
        }

        positionRef.current = next
        start()
    }

    const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, fling: boolean) => {
        const state = dragStateRef.current
        const pressed = state.pressed
        const tapped = clickToSelect && !state.moved && pressed >= 0
        state.pressed = -1

        if (!state.active) {
            if (tapped) commit(pressed)
            return
        }

        if (event.pointerId !== state.pointerId) return

        state.active = false
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }

        if (tapped) {
            commit(pressed)
        } else {
            const speed = fling ? releaseSpeed(state.track, event.clientX, performance.now()) : 0
            // px/ms -> slides/s, projected 0.2s ahead
            const velocity = (-speed * 1000) / settings.current.spacing
            const projected = positionRef.current + clamp(velocity * 0.2, -MAX_FLICK, MAX_FLICK)
            commit(Math.round(projected))
        }

        start()
    }

    const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => finishDrag(event, true)

    // the browser took the pointer (scroll, gesture, capture lost): settle, never fling
    const cancelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        dragStateRef.current.pressed = -1
        finishDrag(event, false)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault()
            step(-1)
        } else if (event.key === "ArrowRight") {
            event.preventDefault()
            step(1)
        } else if (event.key === "Home") {
            event.preventDefault()
            commit(0)
        } else if (event.key === "End") {
            event.preventDefault()
            commit(count - 1)
        }
    }

    const bindItem = (i: number) => {
        let bind = bindersRef.current[i]
        if (!bind) {
            bind = (node) => {
                itemRefs.current[i] = node
            }
            bindersRef.current[i] = bind
        }
        return bind
    }

    const atStart = !loop && current === 0
    const atEnd = !loop && current === count - 1

    return (
        <div
            className={cx("reel", className)}
            style={{ ...style, ["--reel-radius" as string]: `${radius}px` }}
            role="group"
            aria-roledescription="carousel"
            aria-label={label}
        >
            <div
                ref={viewportRef}
                className="reel-viewport"
                style={{ height: itemHeight + HEADROOM, perspective: `${perspective}px` }}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={cancelDrag}
                onLostPointerCapture={cancelDrag}
            >
                {items.map((item, i) => (
                    <div
                        key={i}
                        ref={bindItem(i)}
                        className={clickToSelect ? "reel-item reel-item-clickable" : "reel-item"}
                        style={{ width: itemWidth, height: itemHeight }}
                        data-index={i}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${count}`}
                    >
                        <div className="reel-item-inner">{item}</div>
                    </div>
                ))}
            </div>

            {arrows && count > 1 ? (
                <>
                    <button
                        type="button"
                        className="reel-arrow reel-arrow-prev"
                        onClick={() => step(-1)}
                        disabled={atStart}
                        aria-label="Previous"
                    >
                        <span aria-hidden="true">‹</span>
                    </button>
                    <button
                        type="button"
                        className="reel-arrow reel-arrow-next"
                        onClick={() => step(1)}
                        disabled={atEnd}
                        aria-label="Next"
                    >
                        <span aria-hidden="true">›</span>
                    </button>
                </>
            ) : null}

            {dots && count > 1 && count <= 12 ? (
                <div className="reel-dots">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={i === current ? "reel-dot reel-dot-active" : "reel-dot"}
                            onClick={() => commit(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === current}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
})
