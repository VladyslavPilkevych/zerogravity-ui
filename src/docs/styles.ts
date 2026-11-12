import type { ControlDef } from "@/playground/panel/types"

import type { DocPreset } from "./types"

export type VisualStyle = "pixel" | "classic" | "minimal" | "glass"

const ALL: readonly VisualStyle[] = ["pixel", "classic", "minimal", "glass"]

const ABOUT: Record<VisualStyle, { label: string; hint: string }> = {
    pixel: { label: "Pixel", hint: "square, stepped, block accents" },
    classic: { label: "Classic", hint: "smooth and rounded" },
    minimal: { label: "Minimal", hint: "almost no chrome, content first" },
    glass: { label: "Glass", hint: "translucent, with fine edges" },
}

/**
 * The one inventory of visual styles: which components offer them, which
 * styles, and through which prop. `appearance` is used only where `variant`
 * already meant something else before the styles existed. The first style is
 * the default. Components missing from this list take no style at all.
 */
export const VISUAL_STYLES = {
    calendar: { prop: "variant", styles: ALL },
    task: { prop: "variant", styles: ALL },
    checklist: { prop: "variant", styles: ALL },
    progress: { prop: "variant", styles: ALL },
    detent: { prop: "variant", styles: ALL },
    folio: { prop: "variant", styles: ALL },
    tag: { prop: "appearance", styles: ALL },
    clock: { prop: "variant", styles: ["pixel", "classic", "glass"] },
    sash: { prop: "variant", styles: ["pixel", "classic", "glass"] },
    tether: { prop: "variant", styles: ["pixel", "classic", "minimal"] },
} as const satisfies Record<
    string,
    { prop: "variant" | "appearance"; styles: readonly VisualStyle[] }
>

export type StyledSlug = keyof typeof VISUAL_STYLES

export function styleControl(slug: StyledSlug): ControlDef {
    const { prop, styles } = VISUAL_STYLES[slug]
    return { kind: "select", path: prop, label: "Style", options: styles }
}

export function stylePresets(slug: StyledSlug): DocPreset[] {
    const { prop, styles } = VISUAL_STYLES[slug]
    return styles.map((style) => ({ id: style, ...ABOUT[style], values: { [prop]: style } }))
}
