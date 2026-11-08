import type { CalendarItem } from "@/lib"

/** A fixed, fictional week, so every visit to the page looks the same. */
export const DEMO_NOW = new Date(2026, 2, 11, 10, 40)

const day = (offset: number, hour: number, minute = 0) =>
    new Date(2026, 2, 9 + offset, hour, minute)

export const DEMO_EVENTS: CalendarItem[] = [
    {
        id: "kickoff",
        title: "Project kickoff",
        start: day(0, 9),
        end: day(0, 10, 30),
        accent: "#4ee1f2",
    },
    { id: "focus-1", title: "Deep work", start: day(0, 13), end: day(0, 15), accent: "#9d7bff" },
    {
        id: "design",
        title: "Design review",
        start: day(1, 10),
        end: day(1, 11, 30),
        accent: "#ff5fa2",
    },
    { id: "sync", title: "Team sync", start: day(1, 11), end: day(1, 11, 45), accent: "#4ee1f2" },
    {
        id: "lunch",
        title: "Lunch with Ana",
        start: day(1, 12, 30),
        end: day(1, 13, 30),
        accent: "#c6f24e",
    },
    { id: "standup", title: "Standup", start: day(2, 9), end: day(2, 9, 15), accent: "#4ee1f2" },
    { id: "workshop", title: "Workshop", start: day(2, 9), end: day(2, 12), accent: "#ffb84e" },
    { id: "call", title: "Client call", start: day(2, 10), end: day(2, 11), accent: "#ff5fa2" },
    { id: "gym", title: "Gym", start: day(2, 18), end: day(2, 19), accent: "#c6f24e" },
    {
        id: "offsite",
        title: "Offsite",
        start: day(3, 0),
        end: day(5, 0),
        allDay: true,
        accent: "#9d7bff",
    },
    { id: "retro", title: "Retro", start: day(4, 15), end: day(4, 16), accent: "#4ee1f2" },
    { id: "dinner", title: "Dinner", start: day(5, 19), end: day(5, 21), accent: "#ffb84e" },
    {
        id: "release",
        title: "Release day",
        start: day(7, 0),
        end: day(8, 0),
        allDay: true,
        accent: "#ff5f6d",
    },
    { id: "m1", title: "Planning", start: day(9, 9), end: day(9, 10), accent: "#4ee1f2" },
    { id: "m2", title: "1:1", start: day(9, 11), end: day(9, 11, 30), accent: "#9d7bff" },
    { id: "m3", title: "Demo", start: day(9, 14), end: day(9, 15), accent: "#ff5fa2" },
    { id: "m4", title: "Write-up", start: day(9, 16), end: day(9, 17), accent: "#c6f24e" },
]
