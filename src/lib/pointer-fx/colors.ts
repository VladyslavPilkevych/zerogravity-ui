const VAR_PATTERN = /^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([\s\S]*))?\)$/

export function resolveColor(value: string, element?: Element | null): string {
    const raw = value.trim()
    const match = VAR_PATTERN.exec(raw)
    if (!match) return raw

    const token = match[1]
    const fallback = match[2]?.trim() ?? ""

    if (typeof window === "undefined" || !element) {
        return fallback ? resolveColor(fallback, element) : raw
    }

    const resolved = window.getComputedStyle(element).getPropertyValue(token).trim()
    if (resolved) return resolveColor(resolved, element)

    return fallback ? resolveColor(fallback, element) : raw
}
