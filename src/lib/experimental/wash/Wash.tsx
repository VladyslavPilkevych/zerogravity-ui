"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from "react"

import { cx, usePrefersReducedMotion } from "../../internal"
import "./Wash.css"

export type WashMode = "click" | "auto" | "both"

export interface WashProps {
    children?: ReactNode
    colors?: string[]
    mode?: WashMode
    interval?: number
    duration?: number
    easing?: string
    softness?: number
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

interface WashState {
    base: string
    index: number
    pour: { color: string; x: number; y: number; key: number } | null
}

const DEFAULT_COLORS = ["#20304f", "#2d4a4a", "#402f52", "#1f3b52", "#4a3550"]

export function Wash({
    children,
    colors,
    mode = "auto",
    interval = 6000,
    duration = 1400,
    easing = "cubic-bezier(0.22, 1, 0.36, 1)",
    softness = 0.35,
    disabled = false,
    className,
    style,
}: WashProps) {
    const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS
    const rootRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef(0)
    const commitRef = useRef(0)
    const keyRef = useRef(0)
    const reduced = usePrefersReducedMotion()

    const [state, setState] = useState<WashState>(() => ({
        base: palette[0],
        index: 0,
        pour: null,
    }))

    const paletteKey = palette.join("|")
    const paletteRef = useRef(palette)
    paletteRef.current = palette

    useEffect(() => {
        setState({ base: paletteRef.current[0], index: 0, pour: null })
    }, [paletteKey])

    const trigger = useCallback(
        (x: number, y: number) => {
            if (disabled) return

            const tones = paletteRef.current
            if (tones.length < 2) return

            window.clearTimeout(commitRef.current)

            setState((current) => {
                const next = (current.index + 1) % tones.length
                const color = tones[next]

                if (reduced) {
                    return { base: color, index: next, pour: null }
                }

                keyRef.current += 1
                return {
                    base: current.pour ? current.pour.color : current.base,
                    index: next,
                    pour: { color, x, y, key: keyRef.current },
                }
            })
        },
        [disabled, reduced],
    )

    useEffect(() => {
        if (!state.pour || reduced) return

        commitRef.current = window.setTimeout(
            () => {
                setState((current) =>
                    current.pour ? { ...current, base: current.pour.color, pour: null } : current,
                )
            },
            Math.max(0, duration),
        )

        return () => window.clearTimeout(commitRef.current)
    }, [state.pour, duration, reduced])

    useEffect(() => {
        if (disabled || reduced) return
        if (mode !== "auto" && mode !== "both") return

        const every = Math.max(600, interval)

        timerRef.current = window.setInterval(() => {
            if (document.visibilityState === "hidden") return
            const spot = 0.2 + ((keyRef.current * 0.37) % 0.6)
            const other = 0.25 + ((keyRef.current * 0.61) % 0.5)
            trigger(spot, other)
        }, every)

        return () => window.clearInterval(timerRef.current)
    }, [mode, interval, disabled, reduced, trigger])

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (mode !== "click" && mode !== "both") return

        const box = rootRef.current?.getBoundingClientRect()
        if (!box || box.width === 0 || box.height === 0) return

        trigger((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height)
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
            onPointerDown={onPointerDown}
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
                    }}
                />
            ) : null}
            {children ? <div className="xp-wash-content">{children}</div> : null}
        </div>
    )
}
