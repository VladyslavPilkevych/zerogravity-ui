"use client"

import { useId, useState, type CSSProperties, type ReactNode } from "react"

import { cx } from "../internal"
import "../internal/styles.css"
import "./Detent.css"

export type DetentVariant = "pixel" | "classic" | "minimal" | "glass"

export interface DetentOption<T extends string | number> {
    value: T
    label: ReactNode
    disabled?: boolean
}

export interface DetentProps<T extends string | number> {
    options: readonly DetentOption<T>[]
    label: string
    variant?: DetentVariant
    value?: T
    defaultValue?: T
    onChange?: (value: T) => void
    name?: string
    disabled?: boolean
    fullWidth?: boolean
    className?: string
    style?: CSSProperties
}

export function Detent<T extends string | number>({
    options,
    label,
    variant = "pixel",
    value,
    defaultValue,
    onChange,
    name,
    disabled = false,
    fullWidth = false,
    className,
    style,
}: DetentProps<T>) {
    const generated = useId()
    const group = name ?? `zg-detent-${generated.replace(/[^a-zA-Z0-9_-]/g, "")}`
    const initial = defaultValue ?? options.find((option) => !option.disabled)?.value
    const [inner, setInner] = useState<T | undefined>(initial)
    const controlled = value !== undefined
    const current = controlled ? value : inner
    const index = options.findIndex((option) => option.value === current)

    const choose = (option: DetentOption<T>) => {
        if (!controlled) setInner(option.value)
        onChange?.(option.value)
    }

    return (
        <div
            role="radiogroup"
            aria-label={label}
            aria-disabled={disabled || undefined}
            className={cx("zg-detent", className)}
            data-variant={variant}
            data-full={fullWidth ? "" : undefined}
            data-empty={index === -1 ? "" : undefined}
            style={
                {
                    ...style,
                    "--zg-detent-count": options.length,
                    "--zg-detent-index": Math.max(index, 0),
                } as CSSProperties
            }
        >
            <span className="zg-detent-indicator" aria-hidden="true" />
            {options.map((option, position) => (
                <label
                    key={String(option.value)}
                    className="zg-detent-option"
                    data-checked={position === index ? "" : undefined}
                    data-disabled={disabled || option.disabled ? "" : undefined}
                >
                    <input
                        type="radio"
                        className="zg-detent-input"
                        name={group}
                        value={String(option.value)}
                        checked={position === index}
                        disabled={disabled || option.disabled}
                        onChange={() => choose(option)}
                    />
                    <span className="zg-detent-label">{option.label}</span>
                </label>
            ))}
        </div>
    )
}
