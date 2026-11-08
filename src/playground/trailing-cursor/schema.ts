import { POINTER_FX_PRESET_IDS } from "@/lib/pointer-fx"

import type { ControlGroup, PanelPreset } from "../panel/types"

export interface TrailingCursorDemoConfig {
    preset: string
    variant: "dot-ring" | "ring-only" | "dot-only"
    dotColor: string | null
    ringColor: string | null
    ringBorderColor: string | null
    dotSize: number
    ringSize: number
    ringHoverSize: number
    ringPressSize: number
    ease: number
    dotEase: number
    dotHoverScale: number
    dotPressScale: number
    hideNativeCursor: boolean
    preserveTextCursor: boolean
    mixBlendMode: string
}

export const TRAILING_CURSOR_DEFAULTS: TrailingCursorDemoConfig = {
    preset: "amber",
    variant: "dot-ring",
    dotColor: null,
    ringColor: null,
    ringBorderColor: null,
    dotSize: 6,
    ringSize: 34,
    ringHoverSize: 52,
    ringPressSize: 26,
    ease: 0.16,
    dotEase: 1,
    dotHoverScale: 1,
    dotPressScale: 1,
    hideNativeCursor: true,
    preserveTextCursor: true,
    mixBlendMode: "normal",
}

const VARIANTS = ["dot-ring", "ring-only", "dot-only"] as const
const BLEND_MODES = ["normal", "difference", "exclusion", "screen"] as const

export const TRAILING_CURSOR_CONTROLS: ControlGroup[] = [
    {
        id: "look",
        title: "Look",
        hint: "layers and colours",
        open: true,
        controls: [
            {
                kind: "select",
                path: "preset",
                label: "Preset palette",
                options: POINTER_FX_PRESET_IDS,
            },
            { kind: "select", path: "variant", label: "Variant", options: VARIANTS },
            { kind: "colorNullable", path: "dotColor", label: "Override dot colour" },
            { kind: "colorNullable", path: "ringColor", label: "Override ring fill" },
            { kind: "colorNullable", path: "ringBorderColor", label: "Override ring border" },
            { kind: "select", path: "mixBlendMode", label: "Blend mode", options: BLEND_MODES },
        ],
    },
    {
        id: "motion",
        title: "Size and motion",
        hint: "ring states and easing",
        open: true,
        controls: [
            {
                kind: "number",
                path: "dotSize",
                label: "Dot size",
                min: 2,
                max: 24,
                step: 1,
                unit: "px",
            },
            {
                kind: "number",
                path: "ringSize",
                label: "Ring size",
                min: 10,
                max: 120,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "ringHoverSize",
                label: "Ring on hover",
                min: 10,
                max: 160,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "ringPressSize",
                label: "Ring when pressed",
                min: 6,
                max: 120,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "ease", label: "Ring ease", min: 0.02, max: 1, step: 0.01 },
            {
                kind: "number",
                path: "dotEase",
                label: "Dot ease (1 pins it)",
                min: 0.02,
                max: 1,
                step: 0.01,
            },
            {
                kind: "number",
                path: "dotHoverScale",
                label: "Dot on hover",
                min: 0,
                max: 4,
                step: 0.1,
            },
            {
                kind: "number",
                path: "dotPressScale",
                label: "Dot when pressed",
                min: 0,
                max: 2,
                step: 0.05,
            },
            { kind: "boolean", path: "hideNativeCursor", label: "Hide the native cursor" },
            {
                kind: "boolean",
                path: "preserveTextCursor",
                label: "Keep the text cursor in fields",
            },
        ],
    },
]

export const TRAILING_CURSOR_PRESETS: PanelPreset[] = POINTER_FX_PRESET_IDS.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
    hint: `${id} palette`,
}))

export const TRAILING_CURSOR_PRESET_VALUES: Record<string, Partial<TrailingCursorDemoConfig>> = {
    amber: { preset: "amber" },
    cyan: { preset: "cyan", ease: 0.1, ringSize: 42 },
    violet: { preset: "violet", variant: "ring-only", ringSize: 44, ringHoverSize: 72 },
    emerald: { preset: "emerald", ease: 0.28, ringSize: 28 },
    rose: {
        preset: "rose",
        variant: "dot-only",
        dotSize: 14,
        dotEase: 0.2,
        dotHoverScale: 2.4,
        dotPressScale: 0.7,
    },
    mono: { preset: "mono", mixBlendMode: "difference", ringSize: 40 },
}
