import type { CSSProperties, HTMLAttributes, ReactNode } from "react"

import { cx } from "../internal"
import "./Seam.css"

export type SeamPattern = "dash" | "stair" | "dither" | "pulse"

export interface SeamProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    pattern?: SeamPattern
    tone?: string
    cell?: number
    animated?: boolean
    speed?: number
    label?: ReactNode
    decorative?: boolean
}

export function Seam({
    pattern = "dash",
    tone,
    cell = 4,
    animated,
    speed = 3.2,
    label,
    decorative = false,
    className,
    style,
    ...rest
}: SeamProps) {
    const moving = animated ?? pattern === "pulse"
    const rootStyle = {
        ...style,
        ...(tone ? { "--zg-seam-tone": tone } : null),
        "--zg-seam-cell": `${Math.max(1, Math.round(cell))}px`,
        "--zg-seam-speed": `${Math.max(0.4, speed)}s`,
    } as CSSProperties

    const semantics = decorative
        ? { "aria-hidden": true as const }
        : {
              role: "separator",
              "aria-orientation": "horizontal" as const,
              ...(typeof label === "string" ? { "aria-label": label } : null),
          }

    return (
        <div
            {...semantics}
            {...rest}
            className={cx("zg-seam", className)}
            data-pattern={pattern}
            data-animated={moving || undefined}
            style={rootStyle}
        >
            <span className="zg-seam-line" />
            {label && (
                <>
                    <span className="zg-seam-label">{label}</span>
                    <span className="zg-seam-line" data-flip="true" />
                </>
            )}
        </div>
    )
}
