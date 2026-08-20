"use client"

import { createContext, useContext, useSyncExternalStore } from "react"

import type { TesseraController, TesseraEngine, TesseraPhase } from "./engine"

export const TesseraContext = createContext<TesseraEngine | null>(null)

function useEngine(): TesseraEngine {
    const engine = useContext(TesseraContext)

    if (!engine) {
        throw new Error("Tessera hooks must be used inside a <TesseraProvider>.")
    }

    return engine
}

export function useTessera(): TesseraController {
    return useEngine()
}

export function useTesseraPhase(): TesseraPhase {
    const engine = useEngine()

    return useSyncExternalStore(
        engine.subscribe,
        () => engine.getSnapshot().phase,
        () => "idle" as const,
    )
}
