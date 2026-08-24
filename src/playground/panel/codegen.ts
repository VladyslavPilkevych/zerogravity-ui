function literal(value: unknown): string {
    if (value === null) return "null"
    if (typeof value === "string") return JSON.stringify(value)
    if (typeof value === "number") return String(Math.round(value * 10000) / 10000)
    if (Array.isArray(value)) return `[${value.map(literal).join(", ")}]`
    return String(value)
}

function equal(a: unknown, b: unknown): boolean {
    return a === b || JSON.stringify(a) === JSON.stringify(b)
}

/**
 * One prop per line, and only the ones the reader actually changed. Nested
 * objects keep just their changed fields so the snippet stays copy-ready.
 */
export function propLines(
    defaults: Record<string, unknown>,
    config: Record<string, unknown>,
    omit: string[] = [],
    indent = "    ",
): string[] {
    const lines: string[] = []

    for (const key of Object.keys(defaults)) {
        if (omit.includes(key)) continue

        const value = config[key]
        const base = defaults[key]

        if (base !== null && typeof base === "object" && !Array.isArray(base)) {
            const entries: string[] = []
            for (const field of Object.keys(base as Record<string, unknown>)) {
                const next = (value as Record<string, unknown>)[field]
                if (!equal(next, (base as Record<string, unknown>)[field])) {
                    entries.push(`${field}: ${literal(next)}`)
                }
            }
            if (entries.length > 0) {
                lines.push(`${indent}${key}={{ ${entries.join(", ")} }}`)
            }
        } else if (!equal(value, base)) {
            if (value === true) lines.push(`${indent}${key}`)
            else if (typeof value === "string" && !value.includes('"'))
                lines.push(`${indent}${key}="${value}"`)
            else lines.push(`${indent}${key}={${literal(value)}}`)
        }
    }

    return lines
}
