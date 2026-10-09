import type { CSSProperties, HTMLAttributes, ReactNode } from "react"

import { cx } from "../internal"
import "../internal/pixel.css"
import "./Bezel.css"

export type BezelElement = "div" | "section" | "article" | "aside" | "figure" | "nav" | "li"

export interface BezelProps extends HTMLAttributes<HTMLElement> {
    as?: BezelElement
    label?: ReactNode
    tone?: string
    grid?: boolean
    ticks?: boolean
    scan?: boolean
    notch?: number
    padding?: number | string
}

export function Bezel({
    as: Tag = "div",
    label,
    tone,
    grid = false,
    ticks = true,
    scan = true,
    notch = 4,
    padding,
    className,
    style,
    children,
    ...rest
}: BezelProps) {
    const rootStyle = {
        ...style,
        ...(tone ? { "--zg-bezel-accent": tone } : null),
        ...(padding !== undefined
            ? { "--zg-bezel-pad": typeof padding === "number" ? `${padding}px` : padding }
            : null),
        "--zg-notch": `${Math.max(0, notch)}px`,
    } as CSSProperties

    return (
        <Tag
            {...rest}
            className={cx("zg-bezel", className)}
            data-grid={grid || undefined}
            data-scan={scan || undefined}
            data-labelled={label ? true : undefined}
            style={rootStyle}
        >
            <span className="zg-bezel-plate zg-px-notch" aria-hidden="true" />
            <span className="zg-bezel-frame zg-px-ring" aria-hidden="true" />
            {ticks && <span className="zg-bezel-ticks" aria-hidden="true" />}
            {label && <span className="zg-bezel-label">{label}</span>}
            {children}
        </Tag>
    )
}
