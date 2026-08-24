import type { ComponentType } from "react"

export type MeadowVariantGroup = "ghost" | "ufo" | "moon" | "sun"

export interface MeadowVariant {
    /** stable slug, also written to the artwork as data-variant */
    id: string
    label: string
    /** one line on what makes this one different */
    note: string
    Art: ComponentType
}

export interface MeadowVariantSet {
    group: MeadowVariantGroup
    title: string
    blurb: string
    variants: readonly MeadowVariant[]
}
