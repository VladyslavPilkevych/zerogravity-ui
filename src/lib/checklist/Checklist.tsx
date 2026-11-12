"use client"

import { useId, useState, type CSSProperties, type ReactNode } from "react"

import { cx } from "../internal"
import { Progress } from "../progress/Progress"
import "../internal/styles.css"
import "./Checklist.css"

export type ChecklistVariant = "pixel" | "classic" | "minimal" | "glass"

export interface ChecklistItem {
    id: string
    label: ReactNode
    disabled?: boolean
}

export interface ChecklistProps {
    items: readonly ChecklistItem[]
    label: string
    hideLabel?: boolean
    value?: readonly string[]
    defaultValue?: readonly string[]
    onChange?: (checked: string[]) => void
    name?: string
    showProgress?: boolean
    disabled?: boolean
    variant?: ChecklistVariant
    className?: string
    style?: CSSProperties
}

export function Checklist({
    items,
    label,
    hideLabel = false,
    value,
    defaultValue = [],
    onChange,
    name,
    showProgress = false,
    disabled = false,
    variant = "pixel",
    className,
    style,
}: ChecklistProps) {
    const legendId = useId()
    const [inner, setInner] = useState<readonly string[]>(defaultValue)
    const checked = new Set(value ?? inner)
    const done = items.filter((item) => checked.has(item.id)).length

    const toggle = (id: string, on: boolean) => {
        const next = items
            .map((item) => item.id)
            .filter((itemId) => (itemId === id ? on : checked.has(itemId)))
        if (value === undefined) setInner(next)
        onChange?.(next)
    }

    return (
        <fieldset
            className={cx("zg-checklist", className)}
            data-variant={variant}
            disabled={disabled}
            style={style}
        >
            <legend
                id={legendId}
                className="zg-checklist-legend"
                data-hidden={hideLabel || undefined}
            >
                {label}
            </legend>
            {showProgress && items.length > 0 && (
                <Progress
                    className="zg-checklist-progress"
                    value={done}
                    max={items.length}
                    label={`${label} done`}
                    hideLabel={hideLabel}
                    format="fraction"
                    variant={variant}
                />
            )}
            <ul className="zg-checklist-items">
                {items.map((item) => {
                    const on = checked.has(item.id)
                    return (
                        <li
                            key={item.id}
                            data-checked={on || undefined}
                            data-disabled={item.disabled || undefined}
                        >
                            <label className="zg-checklist-item">
                                <input
                                    type="checkbox"
                                    className="zg-checklist-box"
                                    name={name}
                                    value={item.id}
                                    checked={on}
                                    disabled={item.disabled}
                                    onChange={(event) => toggle(item.id, event.target.checked)}
                                />
                                <span className="zg-checklist-text">{item.label}</span>
                            </label>
                        </li>
                    )
                })}
            </ul>
        </fieldset>
    )
}
