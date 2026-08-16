"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"

import {
    cx,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import { usePointerFxEnabled } from "../../pointer-fx"
import "./Facet.css"

export interface FacetProps {
    children?: ReactNode
    cell?: number
    palette?: string[]
    ground?: string
    variation?: number
    intensity?: number
    seed?: number
    ease?: number
    ambient?: boolean
    ambientInterval?: number
    ambientDuration?: number
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const MAX_CELLS = 900

const DEFAULT_PALETTE = ["#3b4c8a", "#2f6b70", "#6a4478", "#334f86", "#4a5c8f"]

const SWEEPS = [
    [1, 0],
    [0.7, 0.7],
    [0, 1],
    [-0.7, 0.7],
    [-1, 0],
    [-0.7, -0.7],
    [0, -1],
    [0.7, -0.7],
] as const

function mulberry(seed: number) {
    let value = seed >>> 0
    return () => {
        value = (value + 0x6d2b79f5) >>> 0
        let t = Math.imul(value ^ (value >>> 15), 1 | value)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function Facet({
    children,
    cell = 120,
    palette,
    ground = "#05060b",
    variation = 14,
    intensity = 0.7,
    seed = 7,
    ease = 0.14,
    ambient = false,
    ambientInterval = 7000,
    ambientDuration = 5200,
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    style,
}: FacetProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const surfaceRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)
    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
    const reduced = usePrefersReducedMotion()
    const settings = useLatestRef({ ease })

    const tones = useMemo(
        () => (palette && palette.length > 0 ? palette : DEFAULT_PALETTE),
        [palette],
    )

    const [grid, setGrid] = useState({ columns: 0, rows: 0 })
    const [step, setStep] = useState(0)

    const shards = useMemo(() => {
        const total = Math.min(MAX_CELLS, Math.max(1, grid.columns * grid.rows)) * 2
        const random = mulberry(seed)
        return Array.from({ length: total }, () => ({
            flip: random() > 0.5,
            shade: random(),
            pace: 0.75 + random() * 0.6,
        }))
    }, [grid.columns, grid.rows, seed])

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return

        const size = Math.max(24, cell)

        const measure = () => {
            const box = root.getBoundingClientRect()
            const columns = Math.max(1, Math.ceil(box.width / size))
            const rows = Math.max(1, Math.ceil(box.height / size))
            setGrid((current) =>
                current.columns === columns && current.rows === rows ? current : { columns, rows },
            )
        }

        measure()

        const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null
        observer?.observe(root)
        window.addEventListener("resize", measure)

        return () => {
            observer?.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [cell])

    useIsomorphicLayoutEffect(() => {
        const surface = surfaceRef.current
        if (!surface || !enabled) return

        let pointerX = 0.5
        let pointerY = 0.3
        let lightX = 0.5
        let lightY = 0.3
        let rect: DOMRect | null = null

        const invalidate = () => {
            rect = null
        }

        const paint = () => {
            const factor = Math.min(Math.max(settings.current.ease, 0.02), 1)
            rect = null
            lightX += (pointerX - lightX) * factor
            lightY += (pointerY - lightY) * factor

            surface.style.setProperty("--facet-lx", lightX.toFixed(4))
            surface.style.setProperty("--facet-ly", lightY.toFixed(4))

            const done = Math.abs(pointerX - lightX) < 0.002 && Math.abs(pointerY - lightY) < 0.002
            frameRef.current = done ? 0 : requestAnimationFrame(paint)
        }

        const wake = () => {
            if (frameRef.current === 0) frameRef.current = requestAnimationFrame(paint)
        }

        const onMove = (event: PointerEvent) => {
            if (!rect) rect = surface.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) return
            pointerX = (event.clientX - rect.left) / rect.width
            pointerY = (event.clientY - rect.top) / rect.height
            wake()
        }

        const onLeave = () => {
            pointerX = 0.5
            pointerY = 0.3
            wake()
        }

        window.addEventListener("pointermove", onMove, { passive: true })
        window.addEventListener("blur", onLeave)
        window.addEventListener("resize", invalidate)
        window.addEventListener("scroll", invalidate, { passive: true, capture: true })

        return () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("blur", onLeave)
            window.removeEventListener("resize", invalidate)
            window.removeEventListener("scroll", invalidate, { capture: true })
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [enabled, settings])

    useEffect(() => {
        setStep(0)
    }, [tones])

    useEffect(() => {
        if (!ambient || reduced || disabled || tones.length < 2) return

        const interval = Math.max(1200, ambientInterval)
        const timer = window.setInterval(() => {
            if (document.visibilityState === "hidden") return
            setStep((current) => current + 1)
        }, interval)

        return () => window.clearInterval(timer)
    }, [ambient, ambientInterval, reduced, disabled, tones.length])

    const columns = grid.columns
    const rows = Math.min(grid.rows, Math.max(1, Math.floor(MAX_CELLS / Math.max(1, columns))))

    const tone = tones[step % tones.length]
    const sweep = SWEEPS[step % SWEEPS.length]
    const drifting = ambient && !reduced && !disabled && tones.length > 1

    const rootStyle: CSSProperties = {
        ...style,
        ["--facet-cols" as string]: columns,
        ["--facet-rows" as string]: rows,
        ["--facet-tone" as string]: tone,
        ["--facet-ground" as string]: ground,
        ["--facet-variation" as string]: variation,
        ["--facet-intensity" as string]: intensity,
        ["--facet-fade" as string]: `${Math.max(0, ambientDuration)}ms`,
        ["--facet-dx" as string]: sweep[0],
        ["--facet-dy" as string]: sweep[1],
    }

    return (
        <div
            ref={rootRef}
            className={cx("xp-facet", drifting && "xp-facet-drifting", className)}
            style={rootStyle}
        >
            <div ref={surfaceRef} className="xp-facet-surface" aria-hidden="true">
                {columns > 0 && rows > 0
                    ? shards.slice(0, columns * rows * 2).map((shard, index) => {
                          const cellIndex = index >> 1
                          const column = cellIndex % columns
                          const row = Math.floor(cellIndex / columns)

                          return (
                              <span
                                  key={index}
                                  className={cx(
                                      "xp-facet-shard",
                                      index % 2 === 0 ? "xp-facet-a" : "xp-facet-b",
                                      shard.flip && "xp-facet-flip",
                                  )}
                                  style={{
                                      ["--cx" as string]: ((column + 0.5) / columns).toFixed(4),
                                      ["--cy" as string]: ((row + 0.5) / rows).toFixed(4),
                                      ["--shade" as string]: shard.shade.toFixed(3),
                                      ["--pace" as string]: shard.pace.toFixed(3),
                                      gridColumn: column + 1,
                                      gridRow: row + 1,
                                  }}
                              />
                          )
                      })
                    : null}
                {drifting ? <span className="xp-facet-bloom" /> : null}
            </div>
            {children ? <div className="xp-facet-content">{children}</div> : null}
        </div>
    )
}
