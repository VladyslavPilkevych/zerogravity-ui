"use client"

import {
    Children,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from "react"

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
const MAX_FLICK = 3

function wrap(value: number, length: number): number {
    return ((value % length) + length) % length
}

function shortest(delta: number, length: number): number {
    return wrap(delta + length / 2, length) - length / 2
}

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value
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

    const positionRef = useRef(defaultIndex)
    const targetRef = useRef(defaultIndex)
    const activePaintedRef = useRef(-1)
    const frameRef = useRef(0)
    const lastTimeRef = useRef(0)
    const runningRef = useRef(false)

    const dragStateRef = useRef({
        active: false,
        pointerId: -1,
        startX: 0,
        startPosition: 0,
        lastX: 0,
        lastTime: 0,
        velocity: 0,
        moved: false,
        pressed: -1,
    })
    const wheelRef = useRef({ delta: 0, time: 0 })

    const controlled = index !== undefined
    const [internal, setInternal] = useState(() => clamp(defaultIndex, 0, Math.max(0, count - 1)))
    const current = controlled ? clamp(index, 0, Math.max(0, count - 1)) : internal

    const settings = useRef({ loop, spacing, visible, scale, opacity, rotate, depth, stiffness, count })
    settings.current = { loop, spacing, visible, scale, opacity, rotate, depth, stiffness, count }

    const changeRef = useRef(onIndexChange)
    changeRef.current = onIndexChange

    const paint = useCallback(() => {
        const config = settings.current
        const total = config.count
        if (total === 0) return

        const position = positionRef.current
        const active = wrap(Math.round(position), total)

        for (let i = 0; i < total; i += 1) {
            const node = itemRefs.current[i]
            if (!node) continue

            const offset = config.loop ? shortest(i - position, total) : i - position
            const distance = Math.abs(offset)

            if (distance > config.visible + 1) {
                if (node.style.visibility !== "hidden") {
                    node.style.visibility = "hidden"
                    node.style.pointerEvents = "none"
                }
                continue
            }

            if (node.style.visibility === "hidden") {
                node.style.visibility = ""
                node.style.pointerEvents = ""
            }

            const ramp = distance > 1 ? 1 : distance
            const itemScale = 1 + (config.scale - 1) * ramp
            const itemOpacity = 1 + (config.opacity - 1) * ramp
            const spin = -config.rotate * clamp(offset, -1, 1)
            const push = -config.depth * ramp

            node.style.transform = `translate(-50%, -50%) translate3d(${(offset * config.spacing).toFixed(
                2,
            )}px, 0, ${push.toFixed(2)}px) rotateY(${spin.toFixed(2)}deg) scale(${itemScale.toFixed(4)})`
            node.style.opacity = itemOpacity.toFixed(3)
            node.style.zIndex = String(1000 - Math.round(distance * 10))
        }

        if (active !== activePaintedRef.current) {
            activePaintedRef.current = active
            for (let i = 0; i < total; i += 1) {
                const node = itemRefs.current[i]
                if (node) node.dataset.active = i === active ? "true" : "false"
            }
        }
    }, [])

    const tick = useCallback(
        (now: number) => {
            const dt = lastTimeRef.current === 0 ? 1 / 60 : Math.min((now - lastTimeRef.current) / 1000, 1 / 15)
            lastTimeRef.current = now

            if (!dragStateRef.current.active) {
                const diff = targetRef.current - positionRef.current
                if (Math.abs(diff) < SETTLED) {
                    positionRef.current = targetRef.current
                    runningRef.current = false
                } else {
                    positionRef.current += diff * (1 - Math.exp(-settings.current.stiffness * dt))
                }
            }

            paint()

            if (runningRef.current || dragStateRef.current.active) {
                frameRef.current = requestAnimationFrame(tick)
            } else {
                frameRef.current = 0
                lastTimeRef.current = 0
            }
        },
        [paint],
    )

    const start = useCallback(() => {
        if (frameRef.current !== 0) return
        runningRef.current = true
        lastTimeRef.current = 0
        frameRef.current = requestAnimationFrame(tick)
    }, [tick])

    const commit = useCallback(
        (next: number) => {
            const total = settings.current.count
            if (total === 0) return
            const normalized = settings.current.loop ? wrap(next, total) : clamp(next, 0, total - 1)
            if (!controlled) setInternal(normalized)
            changeRef.current?.(normalized)
        },
        [controlled],
    )

    const step = useCallback(
        (direction: number) => {
            const total = settings.current.count
            if (total === 0) return
            commit(Math.round(targetRef.current) + direction)
        },
        [commit],
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

    useLayoutEffect(() => {
        itemRefs.current.length = count
        activePaintedRef.current = -1
        paint()
    }, [count, itemWidth, itemHeight, spacing, scale, opacity, rotate, depth, visible, paint])

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
            const delta = horizontal ? event.deltaX : event.shiftKey ? event.deltaY : 0
            if (delta === 0) return

            event.preventDefault()
            const now = performance.now()
            if (now - wheelRef.current.time < WHEEL_COOLDOWN) return

            wheelRef.current.delta += delta
            if (Math.abs(wheelRef.current.delta) >= WHEEL_STEP) {
                step(Math.sign(wheelRef.current.delta))
                wheelRef.current.delta = 0
                wheelRef.current.time = now
            }
        }

        viewport.addEventListener("wheel", onWheel, { passive: false })
        return () => viewport.removeEventListener("wheel", onWheel)
    }, [wheel, step])

    useEffect(() => {
        return () => {
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [])

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (count === 0 || event.button !== 0) return

        const state = dragStateRef.current
        const card = (event.target as HTMLElement).closest(".reel-item") as HTMLElement | null
        state.pressed = card ? Number(card.dataset.index) : -1
        state.moved = false

        if (!drag) return

        state.active = true
        state.pointerId = event.pointerId
        state.startX = event.clientX
        state.startPosition = positionRef.current
        state.lastX = event.clientX
        state.lastTime = performance.now()
        state.velocity = 0
        event.currentTarget.setPointerCapture(event.pointerId)
        start()
    }

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const state = dragStateRef.current
        if (!state.active || event.pointerId !== state.pointerId) return

        const dx = event.clientX - state.startX
        if (Math.abs(dx) > DRAG_THRESHOLD) state.moved = true

        const now = performance.now()
        const elapsed = (now - state.lastTime) / 1000
        if (elapsed > 0.001) {
            state.velocity = -(event.clientX - state.lastX) / settings.current.spacing / elapsed
            state.lastX = event.clientX
            state.lastTime = now
        }

        let next = state.startPosition - dx / settings.current.spacing

        if (!settings.current.loop) {
            const max = settings.current.count - 1
            if (next < 0) next *= 0.35
            else if (next > max) next = max + (next - max) * 0.35
        }

        positionRef.current = next
    }

    const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
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
            const projected = positionRef.current + clamp(state.velocity * 0.2, -MAX_FLICK, MAX_FLICK)
            commit(Math.round(projected))
        }

        start()
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

    const atStart = !loop && current === 0
    const atEnd = !loop && current === count - 1

    return (
        <div
            className={className ? `reel ${className}` : "reel"}
            style={style}
            role="group"
            aria-roledescription="carousel"
            aria-label={label}
        >
            <div
                ref={viewportRef}
                className="reel-viewport"
                style={{ height: itemHeight, perspective: `${perspective}px` }}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
            >
                {items.map((item, i) => (
                    <div
                        key={i}
                        ref={(node) => {
                            itemRefs.current[i] = node
                        }}
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
