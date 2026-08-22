import { getPath } from "@/playground/panel/path"
import type { ControlDef } from "@/playground/panel/types"

import type { DocEntry, PropRow } from "./types"

function typeOf(def: ControlDef): string {
    switch (def.kind) {
        case "number":
            return "number"
        case "cssLength":
            return "string"
        case "text":
            return "string"
        case "select":
            return def.options.map((option) => `"${option}"`).join(" | ")
        case "boolean":
            return "boolean"
        case "color":
            return "string"
        case "colorNullable":
            return "string | null"
        case "palette":
            return "string[]"
        default:
            return "unknown"
    }
}

export function formatValue(value: unknown): string {
    if (value === undefined) return "—"
    if (value === null) return "null"
    if (typeof value === "string") return value === "" ? '""' : `"${value}"`
    if (typeof value === "number") return String(Math.round(value * 10000) / 10000)
    if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`
    if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
        return `{ ${entries.map(([key, item]) => `${key}: ${formatValue(item)}`).join(", ")} }`
    }
    return String(value)
}

function describe(def: ControlDef): string {
    const range =
        def.kind === "number" || def.kind === "cssLength"
            ? ` Range ${def.min} to ${def.max}${def.unit ? ` ${def.unit}` : ""}.`
            : ""

    return `${def.label}.${range}`
}

/**
 * The props table and the generated snippet both read this, so a control, its
 * documented type and its default can never drift apart.
 */
export function propsFor(entry: DocEntry): PropRow[] {
    const omit = new Set(entry.omit ?? [])
    const rows: PropRow[] = []
    const seen = new Set<string>()

    for (const group of entry.controls) {
        for (const def of group.controls) {
            const root = def.path.split(".")[0]
            if (omit.has(root) || omit.has(def.path)) continue
            if (seen.has(def.path)) continue
            seen.add(def.path)

            rows.push({
                name: def.path,
                type: typeOf(def),
                default: formatValue(getPath(entry.defaults, def.path)),
                description: describe(def),
            })
        }
    }

    return [...rows, ...(entry.extraProps ?? [])]
}
