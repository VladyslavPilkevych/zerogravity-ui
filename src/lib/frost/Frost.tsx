import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from "react"

import { clamp, cx, finite } from "../internal"
import "./Frost.css"

export type FrostElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "nav"
export type FrostTone = "light" | "dark"
export type FrostVariant = "blur" | "tint"

export interface FrostProps extends HTMLAttributes<HTMLElement> {
    as?: FrostElement
    tone?: FrostTone
    variant?: FrostVariant
    blur?: number
    tint?: string
    tintOpacity?: number
    radius?: number | string
    border?: boolean
    shadow?: boolean
}

export const Frost = forwardRef<HTMLElement, FrostProps>(function Frost(
    {
        as = "div",
        tone = "light",
        variant = "blur",
        blur = 12,
        tint,
        tintOpacity,
        radius = 20,
        border = true,
        shadow = true,
        className,
        style,
        children,
        ...rest
    },
    ref,
) {
    const Tag = as as ElementType
    const amount = clamp(finite(blur, 12), 0, 40)
    const blurred = variant === "blur" && amount > 0

    const vars = {
        "--zg-frost-blur": `${amount}px`,
        "--zg-frost-radius": typeof radius === "number" ? `${Math.max(0, radius)}px` : radius,
        ...(tint ? { "--zg-frost-tint": tint } : null),
        ...(tintOpacity !== undefined
            ? { "--zg-frost-amount": `${clamp(finite(tintOpacity, 0.5), 0, 1) * 100}%` }
            : null),
    } as CSSProperties

    return (
        <Tag
            ref={ref}
            className={cx("zg-frost", className)}
            data-tone={tone}
            data-variant={blurred ? "blur" : "tint"}
            data-border={border ? "" : undefined}
            data-shadow={shadow ? "" : undefined}
            style={{ ...style, ...vars }}
            {...rest}
        >
            {children}
        </Tag>
    )
})
