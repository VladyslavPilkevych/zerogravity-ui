export function getPath(source: unknown, path: string): unknown {
    let current = source
    for (const part of path.split(".")) {
        if (current === null || typeof current !== "object") return undefined
        current = (current as Record<string, unknown>)[part]
    }
    return current
}

export function setPath<T extends object>(source: T, path: string, value: unknown): T {
    const dot = path.indexOf(".")
    if (dot === -1) {
        return { ...source, [path]: value }
    }

    const head = path.slice(0, dot)
    const tail = path.slice(dot + 1)
    const child = (source as Record<string, unknown>)[head]

    return {
        ...source,
        [head]: setPath((child ?? {}) as object, tail, value),
    }
}
