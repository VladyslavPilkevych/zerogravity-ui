"use client"

import { useId, useState, type CSSProperties, type ReactNode } from "react"

import { cx } from "../internal"
import { Progress } from "../progress/Progress"
import "../internal/styles.css"
import "./Task.css"

export type TaskVariant = "pixel" | "classic" | "minimal" | "glass"
export type TaskElement = "div" | "li" | "article"

export interface TaskProps {
    title: ReactNode
    /** plain-text name, for the checkbox and the progress bar when `title` is not a string */
    name?: string
    done?: boolean
    defaultDone?: boolean
    onDoneChange?: (done: boolean) => void
    expanded?: boolean
    defaultExpanded?: boolean
    onExpandedChange?: (expanded: boolean) => void
    meta?: ReactNode
    progress?: { value: number; max?: number }
    actions?: ReactNode
    children?: ReactNode
    as?: TaskElement
    variant?: TaskVariant
    className?: string
    style?: CSSProperties
}

export function Task({
    title,
    name,
    done,
    defaultDone = false,
    onDoneChange,
    expanded,
    defaultExpanded = false,
    onExpandedChange,
    meta,
    progress,
    actions,
    children,
    as = "div",
    variant = "pixel",
    className,
    style,
}: TaskProps) {
    const id = useId()
    const titleId = `${id}-title`
    const metaId = `${id}-meta`
    const panelId = `${id}-panel`
    const [innerDone, setInnerDone] = useState(defaultDone)
    const [innerOpen, setInnerOpen] = useState(defaultExpanded)
    const isDone = done ?? innerDone
    const isOpen = children !== undefined && (expanded ?? innerOpen)
    const label = name ?? (typeof title === "string" ? title : undefined)
    const Tag = as

    const setDone = (next: boolean) => {
        if (done === undefined) setInnerDone(next)
        onDoneChange?.(next)
    }
    const setOpen = (next: boolean) => {
        if (expanded === undefined) setInnerOpen(next)
        onExpandedChange?.(next)
    }

    const summary = (
        <>
            <span id={titleId} className="zg-task-title">
                {title}
            </span>
            {meta !== undefined && (
                <span id={metaId} className="zg-task-meta">
                    {meta}
                </span>
            )}
        </>
    )

    return (
        <Tag
            className={cx("zg-task", className)}
            data-variant={variant}
            data-done={isDone || undefined}
            data-expanded={isOpen || undefined}
            style={style}
        >
            <div className="zg-task-row">
                <input
                    type="checkbox"
                    className="zg-task-check"
                    checked={isDone}
                    onChange={(event) => setDone(event.target.checked)}
                    aria-labelledby={titleId}
                    aria-describedby={meta !== undefined ? metaId : undefined}
                />
                {children !== undefined ? (
                    <button
                        type="button"
                        className="zg-task-summary"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpen(!isOpen)}
                    >
                        {summary}
                        <span className="zg-task-chevron" aria-hidden="true" />
                    </button>
                ) : (
                    <div className="zg-task-summary">{summary}</div>
                )}
                {actions !== undefined && <div className="zg-task-actions">{actions}</div>}
            </div>
            {progress && (
                <Progress
                    className="zg-task-progress"
                    value={progress.value}
                    max={progress.max}
                    label={label ? `Progress of ${label}` : "Progress"}
                    hideLabel
                    variant={variant}
                />
            )}
            {children !== undefined && (
                <div
                    id={panelId}
                    className="zg-task-panel"
                    role="region"
                    aria-labelledby={titleId}
                    hidden={!isOpen}
                >
                    {isOpen && children}
                </div>
            )}
        </Tag>
    )
}
