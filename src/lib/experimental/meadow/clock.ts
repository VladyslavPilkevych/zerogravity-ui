"use client"

import { useCallback, useSyncExternalStore } from "react"

import { hourOf } from "./plan"

const TICK = 60_000

const listeners = new Set<() => void>()
let timer = 0
let hour: number | null = null

function sample(notify: boolean) {
    const next = Math.round(hourOf(new Date()) * 60) / 60
    if (next === hour) return

    hour = next
    if (notify) for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
    listeners.add(listener)

    if (listeners.size === 1) {
        sample(false)
        timer = window.setInterval(() => sample(true), TICK)
    }

    return () => {
        listeners.delete(listener)
        if (listeners.size > 0) return

        window.clearInterval(timer)
        timer = 0
        hour = null
    }
}

const idle = () => () => {}
const nothing = () => null

/**
 * The local hour, or null until the browser has been asked. Server and first
 * client render both see null, so `timeAware` cannot cause a hydration
 * mismatch. One shared minute tick serves every mounted scene.
 */
export function useLocalHour(enabled: boolean): number | null {
    const listen = useCallback(
        (listener: () => void) => (enabled ? subscribe(listener) : idle()),
        [enabled],
    )
    const read = useCallback(() => (enabled ? hour : null), [enabled])

    return useSyncExternalStore(listen, read, nothing)
}
