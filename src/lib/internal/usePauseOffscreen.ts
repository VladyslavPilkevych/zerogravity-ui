"use client"

import { useEffect, type RefObject } from "react"

import { pauseOffscreen } from "./observe"

/** Holds the element's CSS animations while it is out of view. Pair with `offscreen.css`. */
export function usePauseOffscreen(ref: RefObject<Element | null>, active: boolean): void {
    useEffect(() => {
        const element = ref.current
        if (!element || !active) return
        return pauseOffscreen(element)
    }, [ref, active])
}
