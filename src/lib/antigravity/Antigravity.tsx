"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from "react"

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

export const Antigravity = forwardRef<AntigravityHandle, AntigravityProps>(
    function Antigravity({ className, style, onStats, ...options }, ref) {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const engineRef = useRef<AntigravityEngine | null>(null)

        const config = resolveAntigravityConfig(options)
        const configRef = useRef(config)
        configRef.current = config

        const statsRef = useRef(onStats)
        statsRef.current = onStats

        useEffect(() => {
            const canvas = canvasRef.current
            const host = canvas?.parentElement
            if (!canvas || !host) return

            const engine = new AntigravityEngine(canvas, host, configRef.current)
            engine.setStatsHandler((stats) => statsRef.current?.(stats))
            engineRef.current = engine

            return () => {
                engine.destroy()
                engineRef.current = null
            }
        }, [])

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
                className={className ? `antigravity ${className}` : "antigravity"}
                style={style}
                aria-hidden="true"
            />
        )
    },
)
