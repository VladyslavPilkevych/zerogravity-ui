"use client"

import { Calendar } from "@/lib"
import type { CalendarVariant, CalendarView } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { DEMO_EVENTS, DEMO_NOW } from "../planning/demo"
import "../planning/planning.css"

export function CalendarPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: CalendarVariant
        defaultView: CalendarView
        weekStartsOn: number
        maxEventsPerDay: number
        hourHeight: number
        startHour: number
        endHour: number
    }

    return (
        <div className="pzp-calendar">
            <Calendar
                key={`${c.defaultView}-${c.weekStartsOn}`}
                events={DEMO_EVENTS}
                now={DEMO_NOW}
                defaultDate={DEMO_NOW}
                defaultSelectedDate={DEMO_NOW}
                variant={c.variant}
                defaultView={c.defaultView}
                weekStartsOn={c.weekStartsOn}
                maxEventsPerDay={c.maxEventsPerDay}
                hourHeight={c.hourHeight}
                startHour={c.startHour}
                endHour={c.endHour}
                height={460}
                scrollToHour={8}
            />
        </div>
    )
}
