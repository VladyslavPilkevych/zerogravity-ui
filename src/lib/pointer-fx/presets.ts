export type PointerFxPreset = "amber" | "cyan" | "violet" | "emerald" | "rose" | "mono"

export interface PointerFxTokens {
    label: string
    accent: string
    grid: string
    dot: string
    ring: string
    ringBorder: string
}

export const POINTER_FX_PRESETS: Record<PointerFxPreset, PointerFxTokens> = {
    amber: {
        label: "Amber",
        accent: "#f5ae20",
        grid: "#f5ae20",
        dot: "#f5ae20",
        ring: "rgba(245, 174, 32, 0.12)",
        ringBorder: "rgba(245, 174, 32, 0.55)",
    },
    cyan: {
        label: "Cyan",
        accent: "#22d3ee",
        grid: "#22d3ee",
        dot: "#22d3ee",
        ring: "rgba(34, 211, 238, 0.12)",
        ringBorder: "rgba(34, 211, 238, 0.55)",
    },
    violet: {
        label: "Violet",
        accent: "#a78bfa",
        grid: "#a78bfa",
        dot: "#a78bfa",
        ring: "rgba(167, 139, 250, 0.14)",
        ringBorder: "rgba(167, 139, 250, 0.58)",
    },
    emerald: {
        label: "Emerald",
        accent: "#34d399",
        grid: "#34d399",
        dot: "#34d399",
        ring: "rgba(52, 211, 153, 0.12)",
        ringBorder: "rgba(52, 211, 153, 0.55)",
    },
    rose: {
        label: "Rose",
        accent: "#fb7185",
        grid: "#fb7185",
        dot: "#fb7185",
        ring: "rgba(251, 113, 133, 0.13)",
        ringBorder: "rgba(251, 113, 133, 0.56)",
    },
    mono: {
        label: "Mono",
        accent: "#ffffff",
        grid: "#ffffff",
        dot: "#ffffff",
        ring: "rgba(255, 255, 255, 0.1)",
        ringBorder: "rgba(255, 255, 255, 0.5)",
    },
}

export const POINTER_FX_PRESET_IDS = Object.keys(POINTER_FX_PRESETS) as PointerFxPreset[]

export const DEFAULT_POINTER_FX_PRESET: PointerFxPreset = "amber"

export function pointerFxTokens(preset: PointerFxPreset | undefined): PointerFxTokens {
    return POINTER_FX_PRESETS[preset ?? DEFAULT_POINTER_FX_PRESET] ?? POINTER_FX_PRESETS.amber
}
