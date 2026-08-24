"use client"

import { useCallback, useMemo, useState } from "react"

import { countOverrides, mergeDeep } from "@/playground/panel/overrides"
import { setPath } from "@/playground/panel/path"

import type { DocEntry } from "./types"

/**
 * The one piece of state on a component page. The preview and the generated
 * snippet both read `config`, so they cannot drift. Manual edits survive a
 * preset switch, which is the behaviour the playground already had.
 */
export function useDocsConfig(entry: DocEntry): PreviewApi {
    const [presetId, setPresetId] = useState(entry.presets?.[0]?.id ?? "")
    const [overrides, setOverrides] = useState<Record<string, unknown>>({})

    const presetValues = useMemo(
        () => entry.presets?.find((preset) => preset.id === presetId)?.values ?? {},
        [entry.presets, presetId],
    )

    const config = useMemo(
        () => mergeDeep(mergeDeep(entry.defaults, presetValues), overrides),
        [entry.defaults, presetValues, overrides],
    )

    const set = useCallback((path: string, value: unknown) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const apply = useCallback((patch: Record<string, unknown>) => {
        setOverrides((prev) => mergeDeep(prev, patch))
    }, [])

    const replace = useCallback((patch: Record<string, unknown>) => {
        setOverrides(patch)
    }, [])

    const reset = useCallback(() => setOverrides({}), [])

    return {
        config,
        presetId,
        setPreset: setPresetId,
        set,
        apply,
        replace,
        reset,
        editCount: countOverrides(overrides),
    }
}

export interface PreviewApi {
    config: Record<string, unknown>
    presetId: string
    setPreset: (id: string) => void
    set: (path: string, value: unknown) => void
    apply: (patch: Record<string, unknown>) => void
    replace: (patch: Record<string, unknown>) => void
    reset: () => void
    editCount: number
}
