"use client"

import type { CSSProperties } from "react"

import { usePrefersReducedMotion } from "../../internal"

export interface LoaderCommon {
    /** Accessible name. Pass an empty string for a purely decorative loader. */
    label?: string
    color?: string
    /** Multiplier on the animation pace; 1 is the default rhythm. */
    speed?: number
    /** Hold the loader in its resting state. */
    paused?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export type LoaderAria = { "aria-hidden": true } | { role: "status"; "aria-label": string }

export function useLoaderStill(paused = false, respect = true): boolean {
    const reduced = usePrefersReducedMotion()
    return paused || (respect && reduced)
}

export function loaderAria(label: string | undefined): LoaderAria {
    if (label === "") return { "aria-hidden": true }
    return { role: "status", "aria-label": label ?? "Loading" }
}

export function beatOf(base: number, speed = 1): number {
    const pace = speed > 0 ? speed : 1
    return Math.round((base / pace) * 100) / 100
}
