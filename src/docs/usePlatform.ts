"use client"

import { useSyncExternalStore } from "react"

import type { KbdPlatform } from "@/lib/experimental"

const MAC = /mac|iphone|ipad|ipod/i

function subscribe() {
    return () => {}
}

function onClient(): KbdPlatform {
    const hint =
        (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ??
        navigator.platform ??
        ""
    return MAC.test(hint) ? "mac" : "pc"
}

function onServer(): KbdPlatform {
    return "pc"
}

/**
 * The server snapshot is always "pc", so the first paint matches on every
 * platform and the mac glyphs swap in once React is running on the client.
 */
export function usePlatform(): KbdPlatform {
    return useSyncExternalStore(subscribe, onClient, onServer)
}
