import type { CSSProperties, HTMLAttributes, ReactNode } from "react"

import { cx } from "../internal"
import { layoutBitmap, type BitmapCell } from "./font"
import "./Bitmap.css"

export type BitmapEffect = "sweep" | "wave" | "cycle"

export type BitmapElement =
    "span" | "div" | "p" | "strong" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

export interface BitmapProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "color"> {
    text: string
    as?: BitmapElement
    pixelSize?: number
    gap?: number
    tracking?: number
    color?: string
    colors?: readonly string[]
    effect?: BitmapEffect
    animated?: boolean
    speed?: number
    dim?: number
    paused?: boolean
    respectReducedMotion?: boolean
}

const PHASES = 96
const MAX_CYCLE_COLORS = 6

const TIMING: Record<BitmapEffect, { period: number; step: number }> = {
    sweep: { period: 5500, step: 55 },
    wave: { period: 2400, step: 45 },
    cycle: { period: 1400, step: 60 },
}

interface Group {
    key: string
    fill: string
    delay: number | null
    cells: BitmapCell[]
}

function round(value: number): number {
    return Math.round(value * 1000) / 1000
}

function clamp(value: number, min: number, max: number): number {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

export function Bitmap({
    text,
    as: Tag = "span",
    pixelSize = 0,
    gap = 0.1,
    tracking = 1,
    color = "currentColor",
    colors,
    effect = "sweep",
    animated = true,
    speed = 1,
    dim = 0.6,
    paused = false,
    respectReducedMotion = true,
    className,
    style,
    ...rest
}: BitmapProps) {
    const { cells, width, height } = layoutBitmap(text, tracking)
    const palette = colors && colors.length > 0 ? colors : [color]
    const cycleColors = palette.slice(0, MAX_CYCLE_COLORS)
    const moving =
        animated && speed > 0 && cells.length > 0 && (effect !== "cycle" || cycleColors.length > 1)

    const diagonals = Math.max(1, width + height - 1)
    const { step } = TIMING[effect]
    const period = TIMING[effect].period * (effect === "cycle" ? cycleColors.length : 1)
    const scaledPeriod = period / Math.max(speed, 0.001)

    const groups = new Map<string, Group>()
    for (const cell of cells) {
        const diagonal = cell.x + cell.y
        const tone =
            effect === "sweep"
                ? 0
                : Math.min(palette.length - 1, Math.floor((diagonal / diagonals) * palette.length))
        const phase = moving
            ? Math.round((((diagonal * step) % period) / period) * PHASES) % PHASES
            : 0
        const key = `${phase}:${tone}`

        let group = groups.get(key)
        if (!group) {
            group = {
                key,
                fill: palette[tone],
                delay: moving ? Math.round((phase / PHASES - 1) * scaledPeriod) : null,
                cells: [],
            }
            groups.set(key, group)
        }
        group.cells.push(cell)
    }

    const inset = clamp(gap, 0, 0.5)
    const size = round(1 - inset)
    const offset = round(inset / 2)
    const fixed = pixelSize > 0

    const vars: Record<string, string | number> = {}
    if (moving) {
        vars["--zg-bitmap-period"] = `${Math.round(scaledPeriod)}ms`
        vars["--zg-bitmap-dim"] = clamp(dim, 0, 1)
        if (effect === "sweep") {
            vars["--zg-bitmap-base"] = palette[0]
            vars["--zg-bitmap-hi"] = palette[1] ?? palette[0]
        }
        if (effect === "cycle") {
            cycleColors.forEach((value, index) => {
                vars[`--zg-bitmap-c${index}`] = value
            })
        }
    }

    let svg: ReactNode = null
    if (width > 0) {
        svg = (
            <svg
                className="zg-bitmap-svg"
                viewBox={`0 0 ${width} ${height}`}
                width={fixed ? width * pixelSize : undefined}
                height={fixed ? height * pixelSize : undefined}
                preserveAspectRatio="xMidYMid meet"
                shapeRendering={fixed && Number.isInteger(pixelSize) ? "crispEdges" : undefined}
                focusable="false"
                aria-hidden="true"
            >
                {Array.from(groups.values()).map((group) => (
                    <g
                        key={group.key}
                        style={
                            group.delay === null
                                ? { fill: group.fill }
                                : { fill: group.fill, animationDelay: `${group.delay}ms` }
                        }
                    >
                        {group.cells.map((cell) => (
                            <rect
                                key={`${cell.x}-${cell.y}`}
                                x={round(cell.x + offset)}
                                y={round(cell.y + offset)}
                                width={size}
                                height={size}
                            />
                        ))}
                    </g>
                ))}
            </svg>
        )
    }

    return (
        <Tag
            {...rest}
            className={cx("zg-bitmap", className)}
            style={{ ...vars, ...style } as CSSProperties}
            data-sizing={fixed ? "fixed" : "fluid"}
            data-effect={moving ? effect : undefined}
            data-colors={moving && effect === "cycle" ? cycleColors.length : undefined}
            data-paused={moving && paused ? "" : undefined}
            data-reduced-motion={moving && respectReducedMotion ? "respect" : undefined}
        >
            <span className="zg-bitmap-label">{text}</span>
            {svg}
        </Tag>
    )
}
