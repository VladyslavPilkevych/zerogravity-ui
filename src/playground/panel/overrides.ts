type Dict = Record<string, unknown>

function isPlainObject(value: unknown): value is Dict {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function mergeDeep<T extends object>(base: T, patch: object): T {
    const out: Dict = { ...(base as Dict) }

    for (const [key, value] of Object.entries(patch as Dict)) {
        const current = out[key]
        out[key] =
            isPlainObject(value) && isPlainObject(current) ? mergeDeep(current, value) : value
    }

    return out as T
}

export function countOverrides(overrides: object): number {
    let total = 0

    for (const value of Object.values(overrides as Dict)) {
        total += isPlainObject(value) ? countOverrides(value) : 1
    }

    return total
}
