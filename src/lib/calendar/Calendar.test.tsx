import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrictMode, useState } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
    Calendar,
    CalendarEvent,
    formatTimeRange,
    useCalendar,
    type CalendarItem,
} from "./Calendar"

const NOW = new Date(2026, 2, 11, 10, 30)
const EVENTS: CalendarItem[] = [
    {
        id: "standup",
        title: "Standup",
        start: new Date(2026, 2, 11, 9),
        end: new Date(2026, 2, 11, 9, 30),
    },
    {
        id: "review",
        title: "Review",
        start: new Date(2026, 2, 11, 9),
        end: new Date(2026, 2, 11, 11),
    },
    {
        id: "lunch",
        title: "Lunch",
        start: new Date(2026, 2, 11, 12),
        end: new Date(2026, 2, 11, 13),
    },
    {
        id: "trip",
        title: "Trip",
        start: new Date(2026, 2, 12),
        end: new Date(2026, 2, 14),
        allDay: true,
    },
    { id: "x1", title: "One", start: new Date(2026, 2, 16, 8), end: new Date(2026, 2, 16, 9) },
    { id: "x2", title: "Two", start: new Date(2026, 2, 16, 10), end: new Date(2026, 2, 16, 11) },
    { id: "x3", title: "Three", start: new Date(2026, 2, 16, 12), end: new Date(2026, 2, 16, 13) },
    { id: "x4", title: "Four", start: new Date(2026, 2, 16, 14), end: new Date(2026, 2, 16, 15) },
]

function cal(props: Partial<Parameters<typeof Calendar>[0]> = {}) {
    return (
        <Calendar
            events={EVENTS}
            now={NOW}
            defaultDate={NOW}
            defaultView="month"
            locale="en-GB"
            {...props}
        />
    )
}

function dateButton(iso: string) {
    return document.querySelector(`[data-day="${iso}"]`) as HTMLButtonElement
}

afterEach(() => {
    vi.useRealTimers()
})

describe("Calendar month", () => {
    it("draws six weeks starting on Monday, with leading and trailing days", () => {
        render(cal())
        const table = screen.getByRole("table", { name: "March 2026" })
        expect(within(table).getAllByRole("columnheader")[0]).toHaveTextContent(/Mon/)
        expect(within(table).getAllByRole("row")).toHaveLength(7)
        expect(dateButton("2026-02-23")).toBeInTheDocument()
        expect(dateButton("2026-02-23").closest("td")).toHaveAttribute("data-outside")
        expect(dateButton("2026-04-05")).toBeInTheDocument()
    })

    it("starts the week on any day", () => {
        render(cal({ weekStartsOn: 0 }))
        expect(screen.getAllByRole("columnheader")[0]).toHaveTextContent(/Sun/)
        expect(dateButton("2026-03-01")).toBeInTheDocument()
    })

    it("marks today and lists events on every day they cover", () => {
        render(cal())
        expect(dateButton("2026-03-11")).toHaveAttribute("aria-current", "date")
        expect(dateButton("2026-03-11")).toHaveAccessibleName(/today, 3 events/)
        const trip = screen.getAllByText("Trip")
        expect(trip).toHaveLength(2)
    })

    it("folds extra events into a +N more control that opens the day", async () => {
        const user = userEvent.setup()
        const { container } = render(cal())
        const more = screen.getByRole("button", { name: /1 more on 16 March/ })

        await user.click(more)
        expect(container.querySelector(".zg-calendar")).toHaveAttribute("data-view", "day")
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/16 March 2026/)
    })

    it("selects a day and reports it", async () => {
        const user = userEvent.setup()
        const change = vi.fn()
        render(cal({ onSelectedDateChange: change }))

        await user.click(dateButton("2026-03-20"))
        expect(dateButton("2026-03-20")).toHaveAttribute("aria-pressed", "true")
        expect(change.mock.calls[0][0]).toEqual(new Date(2026, 2, 20))
    })

    it("moves focus with the arrow keys and turns the month at its edge", async () => {
        const user = userEvent.setup()
        render(cal())

        dateButton("2026-03-11").focus()
        await user.keyboard("{ArrowRight}")
        expect(dateButton("2026-03-12")).toHaveFocus()
        await user.keyboard("{PageDown}")
        expect(screen.getByRole("table", { name: "April 2026" })).toBeInTheDocument()
        expect(dateButton("2026-04-12")).toHaveFocus()
        await user.keyboard("{Home}")
        expect(dateButton("2026-04-06")).toHaveFocus()
    })

    it("navigates by month, back to today, and follows a controlled date", async () => {
        const user = userEvent.setup()
        render(cal())

        await user.click(screen.getByRole("button", { name: "Next month" }))
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("April 2026")
        await user.click(screen.getByRole("button", { name: "Today" }))
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("March 2026")

        function Controlled() {
            const [date, setDate] = useState(new Date(2028, 1, 10))
            return (
                <Calendar now={NOW} view="month" date={date} onDateChange={setDate} label="Leap" />
            )
        }
        render(<Controlled />)
        const leap = screen.getByRole("region", { name: "Leap" })
        expect(within(leap).getByRole("heading")).toHaveTextContent("February 2028")
        expect(leap.querySelector('[data-day="2028-02-29"]')).toBeInTheDocument()
    })

    it("hands day cells and events to custom renderers", () => {
        render(
            cal({
                renderDay: ({ today }) => (today ? <span>star</span> : null),
                renderEvent: (event, info) => (
                    <span data-testid="custom">
                        {event.title}
                        {info.continuesAfter ? " →" : ""}
                    </span>
                ),
            }),
        )
        expect(screen.getByText("star")).toBeInTheDocument()
        expect(screen.getAllByTestId("custom").some((node) => node.textContent === "Trip →")).toBe(
            true,
        )
    })
})

describe("Calendar week and day", () => {
    it("places timed events by start and length and splits overlaps into columns", () => {
        const { container } = render(cal({ defaultView: "week" }))
        const slot = (id: string) => container.querySelector(`[data-id="${id}"]`) as HTMLElement

        expect(slot("review").style.top).toBe(`${((9 * 60) / 1440) * 100}%`)
        expect(slot("review").style.height).toBe(`${(120 / 1440) * 100}%`)
        expect(slot("review").style.width).toBe("50%")
        expect(slot("standup").style.left).toBe("50%")
        expect(slot("lunch").style.width).toBe("100%")
    })

    it("puts all-day items in their own row and draws the now line on today", () => {
        const { container } = render(cal({ defaultView: "week" }))

        expect(screen.getByText("All day")).toBeInTheDocument()
        expect(container.querySelector(".zg-calendar-all-day")).toHaveTextContent("Trip")
        const now = container.querySelector(".zg-calendar-now") as HTMLElement
        expect(now.style.top).toBe(`${(630 / 1440) * 100}%`)
        expect(now.closest(".zg-calendar-column")).toHaveAttribute("data-today")
    })

    it("shows one day with the same scheduling as the week", () => {
        const { container } = render(cal({ defaultView: "day" }))

        expect(container.querySelectorAll(".zg-calendar-column")).toHaveLength(1)
        expect((container.querySelector('[data-id="review"]') as HTMLElement).style.width).toBe(
            "50%",
        )
    })

    it("clips the grid to the requested hours", () => {
        const { container } = render(cal({ defaultView: "day", startHour: 8, endHour: 18 }))
        const review = container.querySelector('[data-id="review"]') as HTMLElement
        expect(review.style.top).toBe(`${(60 / 600) * 100}%`)
    })

    it("opens an event through onEventClick", async () => {
        const user = userEvent.setup()
        const open = vi.fn()
        render(cal({ defaultView: "day", onEventClick: open }))

        await user.click(screen.getByRole("button", { name: /Lunch/ }))
        expect(open).toHaveBeenCalledWith(EVENTS[2])
    })
})

describe("Calendar composition", () => {
    it("renders custom headers through useCalendar", async () => {
        const user = userEvent.setup()
        function Header() {
            const calendar = useCalendar()
            return (
                <div>
                    <span data-testid="title">{calendar.title}</span>
                    <button type="button" onClick={calendar.next}>
                        forward
                    </button>
                </div>
            )
        }
        render(
            <Calendar now={NOW} defaultDate={NOW} defaultView="week" locale="en-GB">
                <Header />
                <Calendar.Week />
            </Calendar>,
        )

        expect(screen.getByTestId("title")).toHaveTextContent(/9.+15 Mar 2026/)
        await user.click(screen.getByText("forward"))
        expect(screen.getByTestId("title")).toHaveTextContent(/16.+22 Mar 2026/)
    })

    it("throws a clear error outside a Calendar", () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        expect(() => render(<Calendar.Month />)).toThrow(/inside <Calendar>/)
    })

    it("renders an event chip on its own, as a button only when clickable", () => {
        const click = vi.fn()
        const { rerender } = render(
            <CalendarEvent
                title="Solo"
                start={new Date(2026, 2, 11, 9)}
                end={new Date(2026, 2, 11, 10)}
            />,
        )
        expect(screen.queryByRole("button")).toBeNull()
        expect(screen.getByText("Solo").parentElement).toHaveAttribute("data-variant", "pixel")

        rerender(<CalendarEvent title="Solo" accent="#f0f" variant="classic" onClick={click} />)
        fireEvent.click(screen.getByRole("button", { name: "Solo" }))
        expect(click).toHaveBeenCalled()
    })
})

describe("Calendar lifecycle", () => {
    it("renders on the server deterministically with a fixed now", () => {
        const html = renderToString(cal())
        expect(html).toContain("March 2026")
        expect(renderToString(cal())).toBe(html)
    })

    it("uses plain spaces, since ICU builds disagree on thin and narrow ones", () => {
        const html = renderToString(
            <Calendar events={[]} now={NOW} defaultDate={NOW} defaultView="week" locale="en-US" />,
        )
        expect(html).toMatch(/Mar 9 – 15, 2026/)
        expect(html).not.toMatch(/[\u2009\u202f]/)
        expect(formatTimeRange(new Date(2026, 2, 11, 9), new Date(2026, 2, 11, 10), "en-US")).toBe(
            "9:00 AM–10:00 AM",
        )
    })

    it("ticks once a minute and stops when unmounted", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 11, 10, 30, 15))
        const { container, unmount } = render(<Calendar defaultView="day" events={[]} />)
        const top = () => (container.querySelector(".zg-calendar-now") as HTMLElement).style.top

        expect(container.querySelector(".zg-calendar-now")).toBeNull()
        act(() => vi.advanceTimersByTime(0))
        const before = top()
        act(() => vi.advanceTimersByTime(60_000))
        expect(top()).not.toBe(before)
        unmount()
        expect(vi.getTimerCount()).toBe(0)
    })

    it("leaves no timer behind after a StrictMode remount", () => {
        vi.useFakeTimers()
        const { unmount } = render(
            <StrictMode>
                <Calendar events={[]} />
            </StrictMode>,
        )
        expect(vi.getTimerCount()).toBe(1)
        unmount()
        expect(vi.getTimerCount()).toBe(0)
    })
})
