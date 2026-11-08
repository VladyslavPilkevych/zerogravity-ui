"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
} from "react"

import { clamp, cx, finite, useIsomorphicLayoutEffect, useMediaQuery } from "../internal"
import {
    addMonths,
    civil,
    iso,
    monthGrid,
    sameMonth,
    toDate,
    weekStart,
    zoned,
    type Day,
} from "./dates"
import {
    compareItems,
    layoutSegments,
    onDay,
    place,
    segmentOn,
    type CalendarItemBase,
    type Placed,
} from "./layout"
import "./Calendar.css"

export type CalendarView = "month" | "week" | "day"
export type CalendarVariant = "pixel" | "classic"

export interface CalendarItem extends CalendarItemBase {
    /** any CSS colour, used for the item's accent */
    accent?: string
}

export interface CalendarRenderInfo {
    view: CalendarView
    /** the item started on an earlier day than the one being drawn */
    continuesBefore: boolean
    /** the item ends on a later day than the one being drawn */
    continuesAfter: boolean
    compact: boolean
}

export interface CalendarDayInfo {
    date: Date
    today: boolean
    selected: boolean
    outside: boolean
}

export interface CalendarProps<T extends CalendarItem = CalendarItem> {
    events?: readonly T[]
    view?: CalendarView
    defaultView?: CalendarView
    onViewChange?: (view: CalendarView) => void
    views?: readonly CalendarView[]
    date?: Date
    defaultDate?: Date
    onDateChange?: (date: Date) => void
    selectedDate?: Date | null
    defaultSelectedDate?: Date | null
    onSelectedDateChange?: (date: Date) => void
    weekStartsOn?: number
    locale?: string
    timeZone?: string
    now?: Date
    variant?: CalendarVariant
    renderEvent?: (event: T, info: CalendarRenderInfo) => ReactNode
    renderDay?: (info: CalendarDayInfo) => ReactNode
    onEventClick?: (event: T) => void
    onMoreClick?: (date: Date) => void
    maxEventsPerDay?: number
    hourHeight?: number
    startHour?: number
    endHour?: number
    scrollToHour?: number
    height?: number | string
    label?: string
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

interface CalendarContextValue {
    view: CalendarView
    views: readonly CalendarView[]
    anchor: Day
    selected: Day | null
    today: Day | null
    nowMinutes: number | null
    weekStartsOn: number
    locale?: string
    timeZone?: string
    variant: CalendarVariant
    placed: Placed<CalendarItem>[]
    maxEventsPerDay: number
    startMinutes: number
    endMinutes: number
    scrollToHour: number
    renderEvent?: (event: CalendarItem, info: CalendarRenderInfo) => ReactNode
    renderDay?: (info: CalendarDayInfo) => ReactNode
    onEventClick?: (event: CalendarItem) => void
    onMoreClick: (day: Day) => void
    setView: (view: CalendarView) => void
    setAnchor: (day: Day) => void
    select: (day: Day) => void
    step: (direction: 1 | -1) => void
    goToday: () => void
    title: string
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

function useCalendarContext(component: string): CalendarContextValue {
    const context = useContext(CalendarContext)
    if (!context) throw new Error(`${component} must be rendered inside <Calendar>`)
    return context
}

const DAY_MS = 86_400_000
const ALL_VIEWS: readonly CalendarView[] = ["month", "week", "day"]
const NARROW_QUERY = "(max-width: 640px)"

/**
 * ICU versions disagree on thin and narrow no-break spaces (Node and browsers
 * differ), so server and client text would not match during hydration.
 */
function plain(text: string): string {
    return text.replace(/[\u2009\u202f]/g, " ")
}

/** Format a calendar day on its own terms: UTC noon never crosses a date line. */
function format(day: Day, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return plain(
        new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
            new Date(day * DAY_MS + DAY_MS / 2),
        ),
    )
}

function formatRange(from: Day, to: Day, options: Intl.DateTimeFormatOptions, locale?: string) {
    const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" })
    const a = new Date(from * DAY_MS + DAY_MS / 2)
    const b = new Date(to * DAY_MS + DAY_MS / 2)
    return plain(
        typeof formatter.formatRange === "function"
            ? formatter.formatRange(a, b)
            : `${formatter.format(a)} – ${formatter.format(b)}`,
    )
}

export function formatTimeRange(
    start: Date,
    end: Date,
    locale?: string,
    timeZone?: string,
): string {
    const formatter = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        ...(timeZone ? { timeZone } : null),
    })
    return plain(`${formatter.format(start)}–${formatter.format(end)}`)
}

function useMinuteNow(fixed: Date | undefined): number | null {
    const [ticked, setTicked] = useState<number | null>(null)
    const live = fixed === undefined

    useEffect(() => {
        if (!live) return
        const tick = () => {
            const current = Date.now()
            setTicked(current)
            timer = window.setTimeout(tick, 60_000 - (current % 60_000) + 20)
        }
        let timer = window.setTimeout(tick, 0)
        return () => window.clearTimeout(timer)
    }, [live])

    return fixed ? fixed.getTime() : ticked
}

function useControllable<V>(
    value: V | undefined,
    fallback: V,
    onChange?: (value: V) => void,
): [V, (next: V) => void] {
    const [inner, setInner] = useState(fallback)
    const controlled = value !== undefined
    const current = controlled ? value : inner
    const set = useCallback(
        (next: V) => {
            if (!controlled) setInner(next)
            onChange?.(next)
        },
        [controlled, onChange],
    )
    return [current, set]
}

function CalendarRoot<T extends CalendarItem>({
    events = [],
    view: viewProp,
    defaultView,
    onViewChange,
    views = ALL_VIEWS,
    date,
    defaultDate,
    onDateChange,
    selectedDate,
    defaultSelectedDate = null,
    onSelectedDateChange,
    weekStartsOn = 1,
    locale,
    timeZone,
    now,
    variant = "pixel",
    renderEvent,
    renderDay,
    onEventClick,
    onMoreClick,
    maxEventsPerDay = 3,
    hourHeight = 48,
    startHour = 0,
    endHour = 24,
    scrollToHour = 7,
    height = 560,
    label = "Calendar",
    className,
    style,
    children,
}: CalendarProps<T>) {
    const narrow = useMediaQuery(NARROW_QUERY)
    const nowMs = useMinuteNow(now)
    const nowZoned = nowMs === null ? null : zoned(new Date(nowMs), timeZone)
    const firstDay = clamp(Math.round(finite(weekStartsOn, 1)), 0, 6)

    const [chosenView, setChosenView] = useState<CalendarView | null>(defaultView ?? null)
    const fallbackView: CalendarView = narrow && views.includes("day") ? "day" : "week"
    const view: CalendarView =
        viewProp ?? chosenView ?? (views.includes(fallbackView) ? fallbackView : views[0])

    const initialAnchor = zoned(defaultDate ?? now ?? new Date(), timeZone).day
    const [anchorDate, setAnchorDate] = useControllable<Date>(
        date,
        toDate(initialAnchor),
        onDateChange,
    )
    const anchor = zoned(anchorDate).day

    const [selectedValue, setSelectedValue] = useControllable<Date | null>(
        selectedDate,
        defaultSelectedDate,
        onSelectedDateChange as ((value: Date | null) => void) | undefined,
    )
    const selected = selectedValue ? zoned(selectedValue).day : null

    const placed = useMemo(
        () => place(events, timeZone).sort(compareItems) as Placed<CalendarItem>[],
        [events, timeZone],
    )

    const setView = useCallback(
        (next: CalendarView) => {
            if (viewProp === undefined) setChosenView(next)
            onViewChange?.(next)
        },
        [viewProp, onViewChange],
    )
    const setAnchor = useCallback((day: Day) => setAnchorDate(toDate(day)), [setAnchorDate])
    const select = useCallback(
        (day: Day) => {
            setSelectedValue(toDate(day))
            setAnchorDate(toDate(day))
        },
        [setSelectedValue, setAnchorDate],
    )
    const step = useCallback(
        (direction: 1 | -1) => {
            if (view === "month") setAnchor(addMonths(anchor, direction))
            else setAnchor(anchor + direction * (view === "week" ? 7 : 1))
        },
        [view, anchor, setAnchor],
    )
    const goToday = useCallback(() => {
        select(zoned(nowMs === null ? new Date() : new Date(nowMs), timeZone).day)
    }, [select, nowMs, timeZone])
    const moreClick = useCallback(
        (day: Day) => {
            if (onMoreClick) return onMoreClick(toDate(day))
            select(day)
            if (views.includes("day")) setView("day")
        },
        [onMoreClick, select, setView, views],
    )

    const first = weekStart(anchor, firstDay)
    const title =
        view === "month"
            ? format(anchor, { month: "long", year: "numeric" }, locale)
            : view === "week"
              ? formatRange(
                    first,
                    first + 6,
                    { day: "numeric", month: "short", year: "numeric" },
                    locale,
                )
              : format(
                    anchor,
                    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
                    locale,
                )

    const span = clamp(finite(endHour, 24), 1, 24) * 60
    const begin = Math.min(clamp(finite(startHour, 0), 0, 23) * 60, span - 60)

    const value: CalendarContextValue = {
        view,
        views,
        anchor,
        selected,
        today: nowZoned?.day ?? null,
        nowMinutes: nowZoned?.minutes ?? null,
        weekStartsOn: firstDay,
        locale,
        timeZone,
        variant,
        placed,
        maxEventsPerDay: clamp(Math.round(finite(maxEventsPerDay, 3)), 1, 20),
        startMinutes: begin,
        endMinutes: span,
        scrollToHour: clamp(finite(scrollToHour, 7), 0, 23),
        renderEvent: renderEvent as CalendarContextValue["renderEvent"],
        renderDay,
        onEventClick: onEventClick as CalendarContextValue["onEventClick"],
        onMoreClick: moreClick,
        setView,
        setAnchor,
        select,
        step,
        goToday,
        title,
    }

    const vars = {
        ...style,
        "--zg-calendar-hour": `${clamp(finite(hourHeight, 48), 16, 240)}px`,
        "--zg-calendar-height": typeof height === "number" ? `${height}px` : height,
    } as CSSProperties

    return (
        <CalendarContext.Provider value={value}>
            <section
                className={cx("zg-calendar", className)}
                aria-label={label}
                data-variant={variant}
                data-view={view}
                style={vars}
            >
                {children ?? (
                    <>
                        <CalendarHeader />
                        <CalendarBody />
                    </>
                )}
            </section>
        </CalendarContext.Provider>
    )
}

export interface UseCalendar {
    view: CalendarView
    views: readonly CalendarView[]
    setView: (view: CalendarView) => void
    date: Date
    setDate: (date: Date) => void
    selectedDate: Date | null
    today: Date | null
    title: string
    previous: () => void
    next: () => void
    goToToday: () => void
}

/** Navigation for custom headers and controls rendered inside a Calendar. */
export function useCalendar(): UseCalendar {
    const context = useCalendarContext("useCalendar")
    return {
        view: context.view,
        views: context.views,
        setView: context.setView,
        date: toDate(context.anchor),
        setDate: (date: Date) => context.setAnchor(zoned(date).day),
        selectedDate: context.selected === null ? null : toDate(context.selected),
        today: context.today === null ? null : toDate(context.today),
        title: context.title,
        previous: () => context.step(-1),
        next: () => context.step(1),
        goToToday: context.goToday,
    }
}

const VIEW_LABELS: Record<CalendarView, string> = { month: "Month", week: "Week", day: "Day" }

export interface CalendarHeaderProps {
    /** replaces the title */
    title?: ReactNode
    /** extra controls, after the view switcher */
    actions?: ReactNode
    className?: string
}

function CalendarHeader({ title, actions, className }: CalendarHeaderProps) {
    const context = useCalendarContext("Calendar.Header")
    const unit = context.view

    return (
        <header className={cx("zg-calendar-header", className)}>
            <div className="zg-calendar-nav">
                <button
                    type="button"
                    className="zg-calendar-button"
                    aria-label={`Previous ${unit}`}
                    onClick={() => context.step(-1)}
                >
                    <span aria-hidden="true">‹</span>
                </button>
                <button type="button" className="zg-calendar-button" onClick={context.goToday}>
                    Today
                </button>
                <button
                    type="button"
                    className="zg-calendar-button"
                    aria-label={`Next ${unit}`}
                    onClick={() => context.step(1)}
                >
                    <span aria-hidden="true">›</span>
                </button>
            </div>
            <h2 className="zg-calendar-title" aria-live="polite">
                {title ?? context.title}
            </h2>
            {context.views.length > 1 && (
                <div className="zg-calendar-views" role="group" aria-label="View">
                    {context.views.map((name) => (
                        <button
                            key={name}
                            type="button"
                            className="zg-calendar-button"
                            aria-pressed={context.view === name}
                            onClick={() => context.setView(name)}
                        >
                            {VIEW_LABELS[name]}
                        </button>
                    ))}
                </div>
            )}
            {actions}
        </header>
    )
}

function CalendarBody() {
    const { view } = useCalendarContext("Calendar.View")
    if (view === "month") return <CalendarMonth />
    if (view === "day") return <CalendarDay />
    return <CalendarWeek />
}

function renderItem(
    context: CalendarContextValue,
    placed: Placed<CalendarItem>,
    info: CalendarRenderInfo,
) {
    if (context.renderEvent) return context.renderEvent(placed.item, info)
    const { item } = placed
    return (
        <CalendarEvent
            title={item.title}
            start={item.start}
            end={item.end}
            allDay={item.allDay || placed.banner}
            accent={item.accent}
            compact={info.compact}
            locale={context.locale}
            timeZone={context.timeZone}
            variant={context.variant}
            onClick={context.onEventClick ? () => context.onEventClick?.(item) : undefined}
        />
    )
}

const KEY_STEPS: Record<string, (day: Day, weekStartsOn: number) => Day> = {
    ArrowLeft: (day) => day - 1,
    ArrowRight: (day) => day + 1,
    ArrowUp: (day) => day - 7,
    ArrowDown: (day) => day + 7,
    Home: (day, first) => weekStart(day, first),
    End: (day, first) => weekStart(day, first) + 6,
    PageUp: (day) => addMonths(day, -1),
    PageDown: (day) => addMonths(day, 1),
}

function CalendarMonth() {
    const context = useCalendarContext("Calendar.Month")
    const { anchor, weekStartsOn, placed, maxEventsPerDay, locale, selected, today } = context
    const helpId = useId()
    const tableRef = useRef<HTMLTableElement>(null)
    const refocus = useRef(false)
    const days = useMemo(() => monthGrid(anchor, weekStartsOn), [anchor, weekStartsOn])
    const [focusDay, setFocusDay] = useState<Day | null>(null)
    const focusable =
        focusDay !== null && days.includes(focusDay)
            ? focusDay
            : selected !== null && days.includes(selected) && sameMonth(selected, anchor)
              ? selected
              : today !== null && sameMonth(today, anchor)
                ? today
                : days.find((day) => sameMonth(day, anchor))

    const buckets = useMemo(() => {
        const map = new Map<Day, Placed<CalendarItem>[]>()
        const first = days[0]
        const last = days[days.length - 1]
        for (const item of placed) {
            for (
                let day = Math.max(item.startDay, first);
                day <= Math.min(item.endDay, last);
                day++
            ) {
                const list = map.get(day)
                if (list) list.push(item)
                else map.set(day, [item])
            }
        }
        return map
    }, [days, placed])

    useEffect(() => {
        if (!refocus.current || focusDay === null) return
        refocus.current = false
        tableRef.current?.querySelector<HTMLButtonElement>(`[data-day="${iso(focusDay)}"]`)?.focus()
    }, [focusDay, anchor])

    const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
        const target = event.target as HTMLElement
        if (!target.matches(".zg-calendar-date")) return
        const move = KEY_STEPS[event.key]
        if (!move || focusable === undefined) return
        event.preventDefault()
        const next = move(focusable, weekStartsOn)
        refocus.current = true
        setFocusDay(next)
        if (!sameMonth(next, anchor)) context.setAnchor(next)
    }

    const weekdays = days.slice(0, 7)
    const weeks = Array.from({ length: 6 }, (_, row) => days.slice(row * 7, row * 7 + 7))

    return (
        <div className="zg-calendar-month-wrap">
            <table
                ref={tableRef}
                className="zg-calendar-month"
                aria-label={context.title}
                aria-describedby={helpId}
                onKeyDown={onKeyDown}
            >
                <thead>
                    <tr>
                        {weekdays.map((day) => (
                            <th
                                key={day}
                                scope="col"
                                abbr={format(day, { weekday: "long" }, locale)}
                            >
                                {format(day, { weekday: "short" }, locale)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week) => (
                        <tr key={week[0]}>
                            {week.map((day) => {
                                const items = buckets.get(day) ?? []
                                const shown = items.slice(0, maxEventsPerDay)
                                const more = items.length - shown.length
                                const isToday = day === today
                                const isSelected = day === selected
                                const outside = !sameMonth(day, anchor)
                                const weekday = civil(day).weekday
                                return (
                                    <td
                                        key={day}
                                        data-today={isToday || undefined}
                                        data-selected={isSelected || undefined}
                                        data-outside={outside || undefined}
                                        data-weekend={weekday === 0 || weekday === 6 || undefined}
                                    >
                                        <button
                                            type="button"
                                            className="zg-calendar-date"
                                            data-day={iso(day)}
                                            tabIndex={day === focusable ? 0 : -1}
                                            aria-pressed={isSelected}
                                            aria-current={isToday ? "date" : undefined}
                                            aria-label={`${format(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" }, locale)}${isToday ? ", today" : ""}${items.length ? `, ${items.length} ${items.length === 1 ? "event" : "events"}` : ""}`}
                                            onFocus={() => setFocusDay(day)}
                                            onClick={() => context.select(day)}
                                        >
                                            {civil(day).day}
                                        </button>
                                        {context.renderDay?.({
                                            date: toDate(day),
                                            today: isToday,
                                            selected: isSelected,
                                            outside,
                                        })}
                                        {shown.length > 0 && (
                                            <ul className="zg-calendar-day-events">
                                                {shown.map((item) => (
                                                    <li key={item.item.id}>
                                                        {renderItem(context, item, {
                                                            view: "month",
                                                            continuesBefore: item.startDay < day,
                                                            continuesAfter: item.endDay > day,
                                                            compact: true,
                                                        })}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {more > 0 && (
                                            <button
                                                type="button"
                                                className="zg-calendar-more"
                                                aria-label={`${more} more on ${format(day, { day: "numeric", month: "long" }, locale)}`}
                                                onClick={() => context.onMoreClick(day)}
                                            >
                                                +{more} more
                                            </button>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <p id={helpId} className="zg-calendar-help">
                Arrow keys move between days, Home and End go to the start and end of the week, Page
                Up and Page Down change the month.
            </p>
        </div>
    )
}

function TimeGrid({ days }: { days: Day[] }) {
    const context = useCalendarContext("Calendar.Week")
    const { placed, startMinutes, endMinutes, today, nowMinutes, locale, selected } = context
    const scrollRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const span = endMinutes - startMinutes

    const hours = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(locale, { hour: "numeric", timeZone: "UTC" })
        const list: { hour: number; label: string }[] = []
        for (let minute = startMinutes; minute < endMinutes; minute += 60) {
            list.push({
                hour: minute / 60,
                label: plain(formatter.format(new Date(Date.UTC(2000, 0, 1, minute / 60)))),
            })
        }
        return list
    }, [locale, startMinutes, endMinutes])

    const columns = useMemo(
        () =>
            days.map((day) => {
                const banners = placed.filter((item) => item.banner && onDay(item, day))
                const segments = placed
                    .map((item) => {
                        const segment = segmentOn(item, day)
                        if (!segment) return null
                        const from = clamp(segment.from, startMinutes, endMinutes)
                        const to = clamp(segment.to, startMinutes, endMinutes)
                        return to > from || (segment.from === segment.to && from < endMinutes)
                            ? { segment: { ...segment, from, to }, item }
                            : null
                    })
                    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
                const slots = layoutSegments(
                    segments.map((entry) => entry.segment),
                    20,
                )
                const byId = new Map(segments.map((entry) => [entry.item.item.id, entry.item]))
                return {
                    day,
                    banners,
                    slots: slots.map((slot) => ({ slot, item: byId.get(slot.id)! })),
                }
            }),
        [days, placed, startMinutes, endMinutes],
    )

    const scrollKey = `${days[0]}-${days.length}`
    useIsomorphicLayoutEffect(() => {
        const scroller = scrollRef.current
        const grid = gridRef.current
        if (!scroller || !grid) return
        scroller.scrollTop = Math.max(
            0,
            ((context.scrollToHour * 60 - startMinutes) / span) * grid.offsetHeight,
        )
    }, [scrollKey])

    const hasBanners = columns.some((column) => column.banners.length > 0)
    const position = (minutes: number) => `${((minutes - startMinutes) / span) * 100}%`

    return (
        <div
            ref={scrollRef}
            className="zg-calendar-scroll"
            style={
                {
                    "--zg-calendar-days": days.length,
                    "--zg-calendar-span": span / 60,
                } as CSSProperties
            }
        >
            <div className="zg-calendar-week-head">
                <div className="zg-calendar-corner" aria-hidden="true" />
                {days.map((day) => (
                    <div
                        key={day}
                        className="zg-calendar-day-head"
                        data-today={day === today || undefined}
                        data-selected={day === selected || undefined}
                    >
                        <button
                            type="button"
                            className="zg-calendar-day-button"
                            aria-pressed={day === selected}
                            aria-current={day === today ? "date" : undefined}
                            aria-label={format(
                                day,
                                { weekday: "long", day: "numeric", month: "long" },
                                locale,
                            )}
                            onClick={() => context.select(day)}
                        >
                            <span className="zg-calendar-weekday">
                                {format(day, { weekday: "short" }, locale)}
                            </span>
                            <span className="zg-calendar-day-number">{civil(day).day}</span>
                        </button>
                    </div>
                ))}
            </div>
            {hasBanners && (
                <div className="zg-calendar-all-day">
                    <div className="zg-calendar-corner zg-calendar-all-day-label">All day</div>
                    {columns.map(({ day, banners }) => (
                        <ul
                            key={day}
                            className="zg-calendar-day-events"
                            aria-label={`All day, ${format(day, { weekday: "long", day: "numeric", month: "long" }, locale)}`}
                        >
                            {banners.map((item) => (
                                <li key={item.item.id}>
                                    {renderItem(context, item, {
                                        view: context.view,
                                        continuesBefore: item.startDay < day,
                                        continuesAfter: item.endDay > day,
                                        compact: true,
                                    })}
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            )}
            <div ref={gridRef} className="zg-calendar-grid">
                <div className="zg-calendar-hours" aria-hidden="true">
                    {hours.map(({ hour, label }) => (
                        <span key={hour} style={{ top: position(hour * 60) }}>
                            {label}
                        </span>
                    ))}
                </div>
                {columns.map(({ day, slots }) => (
                    <div
                        key={day}
                        className="zg-calendar-column"
                        role="group"
                        aria-label={format(
                            day,
                            { weekday: "long", day: "numeric", month: "long" },
                            locale,
                        )}
                        data-today={day === today || undefined}
                    >
                        {slots.map(({ slot, item }) => (
                            <div
                                key={slot.id}
                                className="zg-calendar-slot"
                                data-id={slot.id}
                                style={{
                                    top: position(slot.from),
                                    height: `${(Math.max(slot.to - slot.from, 20) / span) * 100}%`,
                                    left: `${(slot.column / slot.columns) * 100}%`,
                                    width: `${(slot.span / slot.columns) * 100}%`,
                                }}
                            >
                                {renderItem(context, item, {
                                    view: context.view,
                                    continuesBefore: item.startDay < day,
                                    continuesAfter: item.endDay > day,
                                    compact: slot.to - slot.from < 45,
                                })}
                            </div>
                        ))}
                        {day === today &&
                            nowMinutes !== null &&
                            nowMinutes >= startMinutes &&
                            nowMinutes <= endMinutes && (
                                <div
                                    className="zg-calendar-now"
                                    style={{ top: position(nowMinutes) }}
                                    aria-hidden="true"
                                />
                            )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function CalendarWeek() {
    const { anchor, weekStartsOn } = useCalendarContext("Calendar.Week")
    const first = weekStart(anchor, weekStartsOn)
    const days = useMemo(() => Array.from({ length: 7 }, (_, index) => first + index), [first])
    return <TimeGrid days={days} />
}

function CalendarDay() {
    const { anchor } = useCalendarContext("Calendar.Day")
    const days = useMemo(() => [anchor], [anchor])
    return <TimeGrid days={days} />
}

export interface CalendarEventProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> {
    title: ReactNode
    start?: Date
    end?: Date
    allDay?: boolean
    /** replaces the time label */
    time?: ReactNode
    accent?: string
    muted?: boolean
    selected?: boolean
    compact?: boolean
    locale?: string
    timeZone?: string
    variant?: CalendarVariant
    onClick?: () => void
}

/** One event chip. Works inside a Calendar or on its own, in agendas and popovers. */
export function CalendarEvent({
    title,
    start,
    end,
    allDay = false,
    time,
    accent,
    muted = false,
    selected = false,
    compact = false,
    locale,
    timeZone,
    variant,
    onClick,
    className,
    style,
    children,
    ...rest
}: CalendarEventProps) {
    const context = useContext(CalendarContext)
    const label =
        time ??
        (allDay || !start || !end
            ? null
            : formatTimeRange(start, end, locale ?? context?.locale, timeZone ?? context?.timeZone))
    const Tag = onClick ? "button" : "div"

    return (
        <Tag
            {...rest}
            {...(onClick ? { type: "button" as const, onClick } : null)}
            className={cx("zg-calendar-event", className)}
            data-variant={variant ?? context?.variant ?? "pixel"}
            data-muted={muted || undefined}
            data-selected={selected || undefined}
            data-compact={compact || undefined}
            style={
                {
                    ...style,
                    ...(accent ? { "--zg-calendar-event-accent": accent } : null),
                } as CSSProperties
            }
        >
            <span className="zg-calendar-event-title">{title}</span>
            {label && <span className="zg-calendar-event-time">{label}</span>}
            {children}
        </Tag>
    )
}

export const Calendar = Object.assign(CalendarRoot, {
    Header: CalendarHeader,
    View: CalendarBody,
    Month: CalendarMonth,
    Week: CalendarWeek,
    Day: CalendarDay,
})
