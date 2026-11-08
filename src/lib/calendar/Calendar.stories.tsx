import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor } from "storybook/test"

import { Calendar, CalendarEvent, useCalendar, type CalendarItem } from "./Calendar"

const NOW = new Date(2026, 2, 11, 10, 40)
const at = (offset: number, hour: number, minute = 0) => new Date(2026, 2, 9 + offset, hour, minute)

const EVENTS: CalendarItem[] = [
    { id: "kickoff", title: "Kickoff", start: at(0, 9), end: at(0, 10, 30), accent: "#4ee1f2" },
    { id: "workshop", title: "Workshop", start: at(2, 9), end: at(2, 12), accent: "#ffb84e" },
    { id: "call", title: "Client call", start: at(2, 10), end: at(2, 11), accent: "#ff5fa2" },
    { id: "standup", title: "Standup", start: at(2, 9), end: at(2, 9, 15), accent: "#4ee1f2" },
    {
        id: "offsite",
        title: "Offsite",
        start: at(3, 0),
        end: at(5, 0),
        allDay: true,
        accent: "#9d7bff",
    },
    { id: "retro", title: "Retro", start: at(4, 15), end: at(4, 16), accent: "#c6f24e" },
    { id: "a", title: "Planning", start: at(9, 9), end: at(9, 10) },
    { id: "b", title: "1:1", start: at(9, 11), end: at(9, 11, 30) },
    { id: "c", title: "Demo", start: at(9, 14), end: at(9, 15) },
    { id: "d", title: "Write-up", start: at(9, 16), end: at(9, 17) },
]

const meta = {
    title: "Components/Calendar",
    component: Calendar,
    parameters: { surface: { padding: 16 } },
    args: {
        events: EVENTS,
        now: NOW,
        defaultDate: NOW,
        locale: "en-GB",
        height: 420,
        scrollToHour: 8,
        style: { color: "#f5f5f7", "--zg-calendar-surface": "#0d0e12" } as React.CSSProperties,
    },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const MonthPixel: Story = { args: { defaultView: "month" } }

export const MonthClassic: Story = { args: { defaultView: "month", variant: "classic" } }

/** Overlapping events share their hour side by side, and the now line sits on today. */
export const WeekLayout: Story = {
    args: { defaultView: "week" },
    play: async ({ canvasElement }) => {
        const box = (id: string) =>
            (
                canvasElement.querySelector(`[data-id="${id}"]`) as HTMLElement
            ).getBoundingClientRect()
        const workshop = box("workshop")
        const call = box("call")
        const standup = box("standup")

        await expect(Math.abs(workshop.width - call.width)).toBeLessThan(2)
        await expect(call.left).toBeGreaterThanOrEqual(workshop.right - 1)
        await expect(standup.left).toBeGreaterThanOrEqual(workshop.right - 1)
        await expect(call.top - workshop.top).toBeGreaterThan(40)

        const now = canvasElement.querySelector(".zg-calendar-now") as HTMLElement
        await expect(now.closest(".zg-calendar-column")).toHaveAttribute("data-today")
    },
}

export const Day: Story = { args: { defaultView: "day", variant: "classic" } }

export const CustomEvents: Story = {
    args: {
        defaultView: "week",
        renderEvent: (event) => (
            <CalendarEvent title={event.title} accent={event.accent} compact>
                <span style={{ fontSize: 11, opacity: 0.8 }}>custom</span>
            </CalendarEvent>
        ),
    },
}

function CompactHeader() {
    const calendar = useCalendar()
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" onClick={calendar.previous}>
                Back
            </button>
            <strong>{calendar.title}</strong>
            <button type="button" onClick={calendar.next}>
                Forward
            </button>
        </div>
    )
}

export const Composition: Story = {
    args: {
        defaultView: "month",
        children: (
            <>
                <CompactHeader />
                <Calendar.Month />
            </>
        ),
    },
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector("button") as HTMLElement)
        await waitFor(() => expect(canvasElement).toHaveTextContent("February 2026"))
    },
}

/** At phone width the week scrolls sideways inside its frame instead of crushing columns. */
export const Narrow: Story = {
    args: { defaultView: "week" },
    decorators: [
        (Story) => (
            <div style={{ width: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-calendar") as HTMLElement
        const scroller = canvasElement.querySelector(".zg-calendar-scroll") as HTMLElement
        await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
        await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth)
        const column = canvasElement.querySelector(".zg-calendar-column") as HTMLElement
        await expect(column.getBoundingClientRect().width).toBeGreaterThanOrEqual(75)
    },
}

export const NarrowMonth: Story = {
    args: { defaultView: "month" },
    decorators: Narrow.decorators,
    play: async ({ canvasElement }) => {
        const chips = [...canvasElement.querySelectorAll(".zg-calendar-month .zg-calendar-event")]
        await expect(chips.length).toBeGreaterThan(0)
        for (const chip of chips) {
            const cell = chip.closest("td")!.getBoundingClientRect()
            const box = chip.getBoundingClientRect()
            await expect(box.left).toBeGreaterThanOrEqual(cell.left)
            await expect(box.right).toBeLessThanOrEqual(cell.right)
        }
    },
}
