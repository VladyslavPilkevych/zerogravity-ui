import { act, render, screen } from "@testing-library/react"
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Clock, clockParts, nextTick } from "./Clock"

const INSTANT = new Date(Date.UTC(2026, 10, 8, 19, 57, 30))

afterEach(() => {
    vi.useRealTimers()
})

describe("Clock", () => {
    it("formats date and time with Intl in the requested zone and locale", () => {
        const parts = clockParts(INSTANT, { locale: "en-GB", timeZone: "Europe/Bratislava" })
        expect(parts.date).toBe("Sun 8 Nov")
        expect(parts.time).toBe("20:57")

        const tokyo = clockParts(INSTANT, {
            locale: "en-GB",
            timeZone: "Asia/Tokyo",
            seconds: true,
        })
        expect(tokyo.date).toBe("Mon 9 Nov")
        expect(tokyo.time).toBe("04:57:30")
        expect(
            clockParts(INSTANT, { locale: "en-US", timeZone: "UTC", hour12: true }).time,
        ).toMatch(/07:57\sPM/)
    })

    it("renders a static value as a time element", () => {
        render(<Clock value={INSTANT} locale="en-GB" timeZone="UTC" />)
        const time = screen.getByRole("time")
        expect(time).toHaveAttribute("datetime", INSTANT.toISOString())
        expect(time).toHaveTextContent("Sun 8 Nov·19:57")
        expect(time).toHaveAccessibleName(/Sunday,? 8 November 2026/)
    })

    it("can show only the date or only the time", () => {
        const { rerender } = render(
            <Clock value={INSTANT} locale="en-GB" timeZone="UTC" show="time" />,
        )
        expect(screen.getByRole("time")).toHaveTextContent(/^19:57$/)
        rerender(<Clock value={INSTANT} locale="en-GB" timeZone="UTC" show="date" />)
        expect(screen.getByRole("time")).toHaveTextContent(/^Sun 8 Nov$/)
    })

    it("waits for the next minute, or the next second when seconds show", () => {
        expect(nextTick(Date.UTC(2026, 0, 1, 10, 0, 30), false)).toBe(30_015)
        expect(nextTick(Date.UTC(2026, 0, 1, 10, 0, 30, 400), true)).toBe(615)
    })

    it("updates live on the minute and stops when unmounted", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(Date.UTC(2026, 10, 8, 19, 57, 50)))
        const { container, unmount } = render(<Clock locale="en-GB" timeZone="UTC" show="time" />)

        expect(container.querySelector("time[data-pending]")).not.toBeNull()
        act(() => vi.advanceTimersByTime(0))
        expect(screen.getByRole("time")).toHaveTextContent("19:57")
        act(() => vi.advanceTimersByTime(10_100))
        expect(screen.getByRole("time")).toHaveTextContent("19:58")
        expect(vi.getTimerCount()).toBe(1)
        unmount()
        expect(vi.getTimerCount()).toBe(0)
    })

    it("keeps one timer through a StrictMode remount", () => {
        vi.useFakeTimers()
        const { unmount } = render(
            <StrictMode>
                <Clock />
            </StrictMode>,
        )
        expect(vi.getTimerCount()).toBe(1)
        unmount()
        expect(vi.getTimerCount()).toBe(0)
    })

    it("renders empty on the server when live, so hydration cannot mismatch", () => {
        const html = renderToString(<Clock />)
        expect(html).toContain("data-pending")
        expect(html).not.toMatch(/\d\d:\d\d/)
    })
})
