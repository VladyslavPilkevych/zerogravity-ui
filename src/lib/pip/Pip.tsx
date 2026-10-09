import type { CSSProperties, HTMLAttributes } from "react"

import { cx } from "../internal"
import "./Pip.css"

export const PIP_STATUSES = ["neutral", "info", "success", "warning", "danger", "live"] as const

export type PipStatus = (typeof PIP_STATUSES)[number]

export interface PipProps extends HTMLAttributes<HTMLSpanElement> {
    status?: PipStatus
    variant?: "outline" | "solid"
    tone?: string
}

const GLYPHS: Record<PipStatus, readonly string[]> = {
    neutral: [".....", ".###.", ".###.", ".###.", "....."],
    info: ["..#..", ".....", "..#..", "..#..", "..#.."],
    success: [".....", "....#", "...#.", "#.#..", ".#..."],
    warning: ["..#..", "..#..", "..#..", ".....", "..#.."],
    danger: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    live: [".ooo.", "o...o", "o.#.o", "o...o", ".ooo."],
}

function cells(status: PipStatus): { x: number; y: number; ring: boolean }[] {
    return GLYPHS[status].flatMap((row, y) =>
        Array.from(row).flatMap((mark, x) => (mark === "." ? [] : [{ x, y, ring: mark === "o" }])),
    )
}

export function Pip({
    status = "neutral",
    variant = "outline",
    tone,
    className,
    style,
    children,
    ...rest
}: PipProps) {
    const rootStyle = tone ? ({ ...style, "--zg-pip-tone": tone } as CSSProperties) : style

    return (
        <span
            {...rest}
            className={cx("zg-pip", className)}
            data-status={status}
            data-variant={variant}
            style={rootStyle}
        >
            <svg className="zg-pip-glyph" viewBox="0 0 5 5" aria-hidden="true" focusable="false">
                {cells(status).map(({ x, y, ring }) => (
                    <rect
                        key={`${x}-${y}`}
                        className={ring ? "zg-pip-ring" : undefined}
                        x={x}
                        y={y}
                        width="1"
                        height="1"
                    />
                ))}
            </svg>
            {children}
        </span>
    )
}
