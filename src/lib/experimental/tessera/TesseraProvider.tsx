"use client"

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type CSSProperties,
    type ReactNode,
} from "react"

import { cx, useLatestRef, usePrefersReducedMotion } from "../../internal"
import { whenAnimationsSettle } from "./animations"
import { TesseraContext } from "./context"
import { createTesseraEngine, type TesseraEngine } from "./engine"
import { buildTiles, type TesseraSequence } from "./sequence"
import "./Tessera.css"

export interface TesseraProviderProps {
    children?: ReactNode
    color?: string
    rows?: number
    columns?: number
    duration?: number
    stagger?: number
    easing?: string
    sequence?: TesseraSequence
    revealSequence?: TesseraSequence
    zIndex?: number
    timeout?: number
    respectReducedMotion?: boolean
}

interface TesseraConfig {
    color: string
    rows: number
    columns: number
    duration: number
    stagger: number
    easing: string
    sequence: TesseraSequence
    revealSequence: TesseraSequence
    zIndex: number
    respectReducedMotion: boolean
}

const MAX_AXIS = 12
const PLAIN_DURATION = 160

function axis(value: number): number {
    return Math.max(1, Math.min(MAX_AXIS, Math.round(value)))
}

export function TesseraProvider({
    children,
    color = "#0b0c11",
    rows = 4,
    columns = 6,
    duration = 420,
    stagger = 380,
    easing = "cubic-bezier(0.2, 0.8, 0.2, 1)",
    sequence = "random",
    revealSequence,
    zIndex = 9000,
    timeout = 4000,
    respectReducedMotion = true,
}: TesseraProviderProps) {
    const limit = useLatestRef(timeout)
    const [engine] = useState(() => createTesseraEngine(() => limit.current))

    const config = useMemo<TesseraConfig>(
        () => ({
            color,
            rows,
            columns,
            duration,
            stagger,
            easing,
            sequence,
            revealSequence: revealSequence ?? sequence,
            zIndex,
            respectReducedMotion,
        }),
        [
            color,
            rows,
            columns,
            duration,
            stagger,
            easing,
            sequence,
            revealSequence,
            zIndex,
            respectReducedMotion,
        ],
    )

    return (
        <TesseraContext.Provider value={engine}>
            {children}
            <TesseraOverlay engine={engine} config={config} />
        </TesseraContext.Provider>
    )
}

function TesseraOverlay({ engine, config }: { engine: TesseraEngine; config: TesseraConfig }) {
    const gridRef = useRef<HTMLDivElement>(null)
    const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot)
    const reduced = usePrefersReducedMotion() && config.respectReducedMotion

    const { phase, runId, options } = snapshot

    const rows = axis(options.rows ?? config.rows)
    const columns = axis(options.columns ?? config.columns)
    const cover = options.sequence ?? config.sequence
    const reveal = options.revealSequence ?? options.sequence ?? config.revealSequence

    const tiles = useMemo(
        () => buildTiles(rows, columns, cover, reveal, runId),
        [rows, columns, cover, reveal, runId],
    )

    const step = reduced ? PLAIN_DURATION : Math.max(0, options.duration ?? config.duration)
    const spread = reduced ? 0 : Math.max(0, options.stagger ?? config.stagger)

    useEffect(() => {
        if (phase !== "covering" && phase !== "revealing") return

        const grid = gridRef.current
        if (!grid) return

        return whenAnimationsSettle(grid, step + spread, () => {
            if (phase === "covering") engine.reportCovered()
            else engine.reportRevealed()
        })
    }, [engine, phase, runId, step, spread])

    if (phase === "idle") return null

    const style: CSSProperties = {
        ["--tessera-layer" as string]: config.zIndex,
        ["--tessera-color" as string]: options.color ?? config.color,
        ["--tessera-columns" as string]: columns,
        ["--tessera-rows" as string]: rows,
        ["--tessera-duration" as string]: `${step}ms`,
        ["--tessera-stagger" as string]: `${spread}ms`,
        ["--tessera-ease" as string]: config.easing,
    }

    return (
        <div
            className={cx("xp-tessera", reduced && "xp-tessera-plain")}
            data-phase={phase}
            aria-hidden="true"
            style={style}
        >
            <div key={runId} ref={gridRef} className="xp-tessera-grid">
                {tiles.map((tile, index) => (
                    <div
                        key={index}
                        className="xp-tessera-tile"
                        style={{
                            ["--tessera-in" as string]: tile.cover,
                            ["--tessera-out" as string]: tile.reveal,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
