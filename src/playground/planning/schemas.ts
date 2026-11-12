import { styleControl } from "@/docs/styles"

import type { ControlGroup } from "../panel/types"

export const CALENDAR_DEFAULTS = {
    variant: "pixel",
    defaultView: "week",
    weekStartsOn: 1,
    maxEventsPerDay: 3,
    hourHeight: 48,
    startHour: 0,
    endHour: 24,
}

export const CALENDAR_CONTROLS: ControlGroup[] = [
    {
        id: "look",
        title: "Look",
        hint: "style and first view",
        open: true,
        controls: [
            styleControl("calendar"),
            {
                kind: "select",
                path: "defaultView",
                label: "First view",
                options: ["month", "week", "day"],
            },
            {
                kind: "number",
                path: "weekStartsOn",
                label: "Week starts on (0 = Sunday)",
                min: 0,
                max: 6,
                step: 1,
            },
        ],
    },
    {
        id: "grid",
        title: "Grid",
        hint: "how much each view shows",
        open: true,
        controls: [
            {
                kind: "number",
                path: "maxEventsPerDay",
                label: "Events per month day",
                min: 1,
                max: 6,
                step: 1,
            },
            {
                kind: "number",
                path: "hourHeight",
                label: "Hour height",
                min: 24,
                max: 96,
                step: 4,
                unit: "px",
            },
            { kind: "number", path: "startHour", label: "First hour", min: 0, max: 12, step: 1 },
            { kind: "number", path: "endHour", label: "Last hour", min: 13, max: 24, step: 1 },
        ],
    },
]

export const TASK_DEFAULTS = { variant: "pixel" }

export const TASK_CONTROLS: ControlGroup[] = [
    {
        id: "look",
        title: "Look",
        hint: "one structure, four styles",
        open: true,
        controls: [styleControl("task")],
    },
]

export const CHECKLIST_DEFAULTS = { variant: "pixel", showProgress: false, disabled: false }

export const CHECKLIST_CONTROLS: ControlGroup[] = [
    {
        id: "list",
        title: "List",
        hint: "native checkboxes",
        open: true,
        controls: [
            styleControl("checklist"),
            { kind: "boolean", path: "showProgress", label: "Show progress" },
            { kind: "boolean", path: "disabled", label: "Disabled" },
        ],
    },
]

export const PROGRESS_DEFAULTS = {
    variant: "pixel",
    value: 3,
    max: 8,
    segments: false,
    format: "auto",
}

export const PROGRESS_CONTROLS: ControlGroup[] = [
    {
        id: "value",
        title: "Value",
        hint: "fraction under 100, percentage at 100",
        open: true,
        controls: [
            styleControl("progress"),
            { kind: "number", path: "value", label: "Value", min: 0, max: 100, step: 1 },
            { kind: "number", path: "max", label: "Max", min: 1, max: 100, step: 1 },
            { kind: "boolean", path: "segments", label: "Segmented" },
            {
                kind: "select",
                path: "format",
                label: "Value text",
                options: ["auto", "percent", "fraction"],
            },
        ],
    },
]

export const CLOCK_DEFAULTS = { variant: "pixel", show: "datetime", seconds: false, timeZone: "" }

export const CLOCK_ZONES = [
    "",
    "UTC",
    "Europe/London",
    "America/New_York",
    "Asia/Tokyo",
    "Australia/Sydney",
]

export const CLOCK_CONTROLS: ControlGroup[] = [
    {
        id: "display",
        title: "Display",
        hint: "Intl formatting, no date library",
        open: true,
        controls: [
            styleControl("clock"),
            { kind: "select", path: "show", label: "Show", options: ["datetime", "date", "time"] },
            { kind: "boolean", path: "seconds", label: "Seconds" },
            {
                kind: "select",
                path: "timeZone",
                label: "Time zone (empty: device)",
                options: CLOCK_ZONES,
            },
        ],
    },
]
