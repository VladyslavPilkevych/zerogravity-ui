import { useId, type CSSProperties, type HTMLAttributes } from "react"

import { clamp, cx, finite } from "../internal"
import "./Progress.css"

export type ProgressVariant = "pixel" | "classic"
export type ProgressFormat = "auto" | "percent" | "fraction"

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value: number
    max?: number
    label: string
    hideLabel?: boolean
    format?: ProgressFormat | ((value: number, max: number) => string)
    segments?: boolean | number
    variant?: ProgressVariant
}

export const PROGRESS_SEGMENT_LIMIT = 40

export function progressText(value: number, max: number, format: ProgressProps["format"]): string {
    if (typeof format === "function") return format(value, max)
    const fraction = format === "fraction" || (format === "auto" && max !== 100)
    return fraction ? `${value} of ${max}` : `${Math.round((value / max) * 100)}%`
}

export function Progress({
    value,
    max = 100,
    label,
    hideLabel = false,
    format = "auto",
    segments = false,
    variant = "pixel",
    className,
    style,
    ...rest
}: ProgressProps) {
    const labelId = useId()
    const total = Math.max(finite(max, 100), 1)
    const current = clamp(finite(value, 0), 0, total)
    const text = progressText(current, total, format)
    const shown =
        typeof format === "function" || format === "percent" || (format === "auto" && total === 100)
            ? text
            : `${current}/${total}`
    const count =
        segments === true
            ? Math.round(total)
            : typeof segments === "number"
              ? Math.round(segments)
              : 0
    const blocks = count > 1 && count <= PROGRESS_SEGMENT_LIMIT ? count : 0
    const filled = blocks ? Math.round((current / total) * blocks) : 0

    return (
        <div
            {...rest}
            className={cx("zg-progress", className)}
            data-variant={variant}
            data-complete={current >= total || undefined}
            style={{ ...style, "--zg-progress-ratio": current / total } as CSSProperties}
        >
            {!hideLabel && (
                <div className="zg-progress-head">
                    <span id={labelId} className="zg-progress-label">
                        {label}
                    </span>
                    <span className="zg-progress-value" aria-hidden="true">
                        {shown}
                    </span>
                </div>
            )}
            <div
                className="zg-progress-track"
                role="progressbar"
                aria-labelledby={hideLabel ? undefined : labelId}
                aria-label={hideLabel ? label : undefined}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={current}
                aria-valuetext={text}
                data-segments={blocks || undefined}
            >
                {blocks ? (
                    Array.from({ length: blocks }, (_, index) => (
                        <span
                            key={index}
                            className="zg-progress-block"
                            data-on={index < filled || undefined}
                        />
                    ))
                ) : (
                    <span className="zg-progress-fill" />
                )}
            </div>
        </div>
    )
}
