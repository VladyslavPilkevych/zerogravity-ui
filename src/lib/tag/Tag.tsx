import type { CSSProperties, HTMLAttributes } from "react"

import { cx } from "../internal"
import "./Tag.css"

export const TAG_STATUSES = ["neutral", "info", "success", "warning", "danger", "live"] as const

export type TagStatus = (typeof TAG_STATUSES)[number]

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    status?: TagStatus
    variant?: "outline" | "solid"
    tone?: string
}

const GLYPHS: Record<TagStatus, readonly string[]> = {
    neutral: [".....", ".###.", ".###.", ".###.", "....."],
    info: ["..#..", ".....", "..#..", "..#..", "..#.."],
    success: [".....", "....#", "...#.", "#.#..", ".#..."],
    warning: ["..#..", "..#..", "..#..", ".....", "..#.."],
    danger: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    live: [".ooo.", "o...o", "o.#.o", "o...o", ".ooo."],
}

function cells(status: TagStatus): { x: number; y: number; ring: boolean }[] {
    return GLYPHS[status].flatMap((row, y) =>
        Array.from(row).flatMap((mark, x) => (mark === "." ? [] : [{ x, y, ring: mark === "o" }])),
    )
}

export function Tag({
    status = "neutral",
    variant = "outline",
    tone,
    className,
    style,
    children,
    ...rest
}: TagProps) {
    const rootStyle = tone ? ({ ...style, "--zg-tag-tone": tone } as CSSProperties) : style

    return (
        <span
            {...rest}
            className={cx("zg-tag", className)}
            data-status={status}
            data-variant={variant}
            style={rootStyle}
        >
            <svg className="zg-tag-glyph" viewBox="0 0 5 5" aria-hidden="true" focusable="false">
                {cells(status).map(({ x, y, ring }) => (
                    <rect
                        key={`${x}-${y}`}
                        className={ring ? "zg-tag-ring" : undefined}
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
