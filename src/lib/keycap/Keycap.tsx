import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { cx } from "../internal"
import "../internal/pixel.css"
import "./Keycap.css"

export type KeycapVariant = "solid" | "outline" | "ghost"
export type KeycapSize = "sm" | "md" | "lg"

export interface KeycapProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: KeycapVariant
    size?: KeycapSize
    tone?: string
    depth?: number
    notch?: number
}

export const Keycap = forwardRef<HTMLButtonElement, KeycapProps>(function Keycap(
    {
        variant = "solid",
        size = "md",
        tone,
        depth = 4,
        notch = 3,
        type = "button",
        className,
        style,
        children,
        ...rest
    },
    ref,
) {
    const rootStyle = {
        ...style,
        ...(tone ? { "--zg-keycap-accent": tone } : null),
        "--zg-keycap-depth": `${Math.max(0, depth)}px`,
        "--zg-notch": `${Math.max(0, notch)}px`,
    } as CSSProperties

    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            className={cx("zg-keycap", className)}
            data-variant={variant}
            data-size={size}
            style={rootStyle}
        >
            <span className="zg-keycap-shadow" aria-hidden="true">
                <span className="zg-px-notch" />
            </span>
            <span className="zg-keycap-face zg-px-notch">
                <span className="zg-keycap-ring zg-px-ring" aria-hidden="true" />
                <span className="zg-keycap-label">{children}</span>
            </span>
        </button>
    )
})
