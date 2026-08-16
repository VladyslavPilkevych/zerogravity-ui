"use client"

import { useCallback, useMemo, useState } from "react"

export function useExperiment<T extends Record<string, unknown>>(defaults: T) {
    const [overrides, setOverrides] = useState<Partial<T>>({})

    const config = useMemo(() => ({ ...defaults, ...overrides }) as T, [defaults, overrides])

    const update = useCallback((path: string, value: unknown) => {
        setOverrides((current) => ({ ...current, [path]: value }) as Partial<T>)
    }, [])

    const reset = useCallback(() => setOverrides({}), [])

    return {
        config,
        update,
        reset,
        editCount: Object.keys(overrides).length,
    }
}
