"use client"

import { Antigravity, getAntigravityPreset } from "@/lib"

const PIXEL = getAntigravityPreset("pixel")!.options

/**
 * The hero field is the library's own "pixel" preset, so the homepage and the
 * docs showcase cannot drift. Only the seed and the class are local.
 */
export function HomeField() {
    return <Antigravity {...PIXEL} className="pz-field" seed={2049} />
}
