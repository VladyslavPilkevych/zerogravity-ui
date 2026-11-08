"use client"

import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react"

import { cx } from "../internal"
import "./Clock.css"

export type ClockVariant = "pixel" | "classic"
export type ClockShow = "datetime" | "date" | "time"

export interface ClockProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    value?: Date
    show?: ClockShow
    locale?: string
    timeZone?: string
    hour12?: boolean
    seconds?: boolean
    dateFormat?: Pick<Intl.DateTimeFormatOptions, "weekday" | "day" | "month" | "year">
    separator?: ReactNode
    variant?: ClockVariant
}

const DEFAULT_DATE: ClockProps["dateFormat"] = { weekday: "short", day: "numeric", month: "short" }

export interface ClockParts {
    date: string
    time: string
    full: string
}

export function clockParts(
    instant: Date,
    {
        locale,
        timeZone,
        hour12,
        seconds = false,
        dateFormat = DEFAULT_DATE,
    }: Pick<ClockProps, "locale" | "timeZone" | "hour12" | "seconds" | "dateFormat"> = {},
): ClockParts {
    const zone = timeZone ? { timeZone } : null
    const cycle = hour12 === undefined ? null : { hour12 }
    return {
        date: new Intl.DateTimeFormat(locale, { ...dateFormat, ...zone }).format(instant),
        time: new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
            ...(seconds ? { second: "2-digit" } : null),
            ...cycle,
            ...zone,
        }).format(instant),
        full: new Intl.DateTimeFormat(locale, {
            dateStyle: "full",
            timeStyle: seconds ? "medium" : "short",
            ...cycle,
            ...zone,
        }).format(instant),
    }
}

/** The next moment the display changes: the next whole second, or the next whole minute. */
export function nextTick(now: number, seconds: boolean): number {
    const unit = seconds ? 1000 : 60_000
    return unit - (now % unit) + 15
}

export function Clock({
    value,
    show = "datetime",
    locale,
    timeZone,
    hour12,
    seconds = false,
    dateFormat = DEFAULT_DATE,
    separator = "·",
    variant = "pixel",
    className,
    ...rest
}: ClockProps) {
    const [ticked, setTicked] = useState<number | null>(null)
    const live = value === undefined

    useEffect(() => {
        if (!live) return
        const tick = () => {
            const current = Date.now()
            setTicked(current)
            timer = window.setTimeout(tick, nextTick(current, seconds))
        }
        let timer = window.setTimeout(tick, 0)
        return () => window.clearTimeout(timer)
    }, [live, seconds])

    const now = value ? value.getTime() : ticked

    if (now === null) {
        return (
            <time
                {...rest}
                className={cx("zg-clock", className)}
                data-variant={variant}
                data-pending=""
            />
        )
    }

    const instant = new Date(now)
    const parts = clockParts(instant, { locale, timeZone, hour12, seconds, dateFormat })

    return (
        <time
            {...rest}
            className={cx("zg-clock", className)}
            data-variant={variant}
            dateTime={instant.toISOString()}
            title={parts.full}
            aria-label={show === "datetime" ? parts.full : undefined}
        >
            {show !== "time" && <span className="zg-clock-date">{parts.date}</span>}
            {show === "datetime" && (
                <span
                    className="zg-clock-separator"
                    data-mark={separator === "·" || undefined}
                    aria-hidden="true"
                >
                    {separator}
                </span>
            )}
            {show !== "date" && <span className="zg-clock-time">{parts.time}</span>}
        </time>
    )
}
