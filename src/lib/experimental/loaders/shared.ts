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
    /** Space between pixels, measured in pixel widths. Omit for the natural look. */
    gap?: number
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

/** Clamped so a stray value cannot tear the geometry apart. */
export function gapOf(gap: number | undefined, natural: number): number {
    if (gap === undefined || !Number.isFinite(gap)) return natural
    return Math.min(Math.max(gap, 0), 4)
}

export function beatOf(base: number, speed = 1): number {
    const pace = speed > 0 ? speed : 1
    return Math.round((base / pace) * 100) / 100
}
