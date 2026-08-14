"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from "react"

import { cx, useLatestRef } from "../internal"
import { AntigravityEngine } from "./engine"
import { resolveAntigravityConfig, type AntigravityOptions, type AntigravityStats } from "./types"
import "./Antigravity.css"

export interface AntigravityHandle {
    burst(): void
    colorBurst(): void
}

export interface AntigravityProps extends AntigravityOptions {
    className?: string
    style?: CSSProperties
    onStats?: (stats: AntigravityStats) => void
}

export const Antigravity = forwardRef<AntigravityHandle, AntigravityProps>(function Antigravity(
    { className, style, onStats, ...options },
    ref,
) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<AntigravityEngine | null>(null)

    const config = resolveAntigravityConfig(options)
    const configRef = useLatestRef(config)
    const statsRef = useLatestRef(onStats)

    useEffect(() => {
        const canvas = canvasRef.current
        const host = canvas?.parentElement
        if (!canvas || !host || !canvas.getContext("2d", { alpha: true })) return

        const engine = new AntigravityEngine(canvas, host, configRef.current)
        engine.setStatsHandler((stats) => statsRef.current?.(stats))
        engineRef.current = engine

        return () => {
            engine.destroy()
            engineRef.current = null
        }
    }, [configRef, statsRef])

    useEffect(() => {
        engineRef.current?.setConfig(config)
    })

    useImperativeHandle(
        ref,
        () => ({
            burst: () => engineRef.current?.burst(),
            colorBurst: () => engineRef.current?.colorBurst(),
        }),
        [],
    )

    return (
        <canvas
            ref={canvasRef}
            className={cx("antigravity", className)}
            style={style}
            aria-hidden="true"
        />
    )
})
