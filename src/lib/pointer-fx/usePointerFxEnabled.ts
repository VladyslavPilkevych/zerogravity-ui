"use client"

import { useEffect, useState } from "react"

export interface PointerFxGate {
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
}

const FINE_POINTER = "(pointer: fine)"
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribe(query: MediaQueryList, listener: () => void): () => void {
    if (typeof query.addEventListener === "function") {
        query.addEventListener("change", listener)
        return () => query.removeEventListener("change", listener)
    }
    query.addListener(listener)
    return () => query.removeListener(listener)
}

export function usePointerFxEnabled({
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
}: PointerFxGate): boolean {
    const [allowed, setAllowed] = useState(false)

    useEffect(() => {
        if (disabled) {
            setAllowed(false)
            return
        }

        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            setAllowed(false)
            return
        }

        const fine = window.matchMedia(FINE_POINTER)
        const still = window.matchMedia(REDUCED_MOTION)

        const evaluate = () => {
            const pointerOk = enableOnTouch || fine.matches
            const motionOk = !respectReducedMotion || !still.matches
            setAllowed(pointerOk && motionOk)
        }

        evaluate()

        const unsubscribeFine = subscribe(fine, evaluate)
        const unsubscribeStill = subscribe(still, evaluate)

        return () => {
            unsubscribeFine()
            unsubscribeStill()
        }
    }, [disabled, enableOnTouch, respectReducedMotion])

    return allowed
}
