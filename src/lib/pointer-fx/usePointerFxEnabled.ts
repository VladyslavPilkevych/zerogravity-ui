"use client"

import { useMediaQuery, usePrefersReducedMotion } from "../internal"

export interface PointerFxGate {
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
}

export function usePointerFxEnabled({
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
}: PointerFxGate): boolean {
    const hasFinePointer = useMediaQuery("(pointer: fine)")
    const prefersReducedMotion = usePrefersReducedMotion()

    if (disabled) return false

    const pointerAllowed = enableOnTouch || hasFinePointer
    const motionAllowed = !respectReducedMotion || !prefersReducedMotion

    return pointerAllowed && motionAllowed
}
