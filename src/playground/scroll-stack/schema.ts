import type { ControlGroup, PanelPreset } from "../panel/types"

export interface ScrollStackDemoConfig {
    height: string
    top: number
    peek: number
    scaleTo: number
    dim: number
    dimColor: string
    opacityTo: number
    liftTo: number
    blurTo: number
    rounded: number
    easing: "linear" | "smooth"
    disabled: boolean
    cards: number
    sizeMix: "uniform" | "alternating" | "shrinking" | "growing"
}

/** Heights are a share of the preview frame, not of the browser viewport. */
export const SIZE_MIXES: Record<string, (index: number, count: number) => string | undefined> = {
    uniform: () => undefined,
    alternating: (index) => (index % 2 === 1 ? "36cqh" : undefined),
    shrinking: (index, count) => `${Math.round(52 - (index / Math.max(1, count - 1)) * 16)}cqh`,
    growing: (index, count) => `${Math.round(36 + (index / Math.max(1, count - 1)) * 16)}cqh`,
}

/*
 * Deck proportions rather than the component's own full-page defaults: cards
 * are a little under half the frame so two are in view at once, and each one
 * parks a notch lower than the last so the tops of the cards below stay
 * visible. On a real page you would use full-height sections and no peek.
 */
export const SCROLL_STACK_DEFAULTS: ScrollStackDemoConfig = {
    height: "44cqh",
    top: 30,
    peek: 16,
    scaleTo: 0.9,
    dim: 0.45,
    dimColor: "#05050a",
    opacityTo: 1,
    liftTo: 0,
    blurTo: 0,
    rounded: 20,
    easing: "smooth",
    disabled: false,
    cards: 5,
    sizeMix: "uniform",
}

export const SCROLL_STACK_CONTROLS: ControlGroup[] = [
    {
        id: "layout",
        title: "Layout",
        hint: "size and sticky offsets",
        open: true,
        controls: [
            {
                kind: "cssLength",
                path: "height",
                label: "Card height",
                min: 20,
                max: 90,
                step: 2,
                unit: "cqh",
            },
            {
                kind: "select",
                path: "sizeMix",
                label: "Per-section heights",
                options: ["uniform", "alternating", "shrinking", "growing"],
            },
            {
                kind: "number",
                path: "top",
                label: "Sticky offset",
                min: 0,
                max: 200,
                step: 4,
                unit: "px",
            },
            {
                kind: "number",
                path: "peek",
                label: "Peek per card",
                min: 0,
                max: 80,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "rounded",
                label: "Corner radius",
                min: 0,
                max: 48,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "cards",
                label: "Sections (demo only)",
                min: 2,
                max: 8,
                step: 1,
            },
        ],
    },
    {
        id: "motion",
        title: "Motion",
        hint: "how a covered card recedes",
        open: true,
        controls: [
            {
                kind: "number",
                path: "scaleTo",
                label: "Scale down to",
                min: 0.6,
                max: 1,
                step: 0.01,
            },
            { kind: "number", path: "dim", label: "Dim overlay", min: 0, max: 1, step: 0.01 },
            { kind: "color", path: "dimColor", label: "Dim colour" },
            {
                kind: "number",
                path: "opacityTo",
                label: "Fade to (see-through)",
                min: 0,
                max: 1,
                step: 0.01,
            },
            {
                kind: "number",
                path: "liftTo",
                label: "Lift up by",
                min: 0,
                max: 160,
                step: 4,
                unit: "px",
            },
            {
                kind: "number",
                path: "blurTo",
                label: "Blur",
                min: 0,
                max: 20,
                step: 0.5,
                unit: "px",
            },
            { kind: "select", path: "easing", label: "Easing", options: ["smooth", "linear"] },
            { kind: "boolean", path: "disabled", label: "Disable motion (plain sticky)" },
        ],
    },
]

export const SCROLL_STACK_PRESETS: PanelPreset[] = [
    { id: "clean", label: "Clean", hint: "Gentle scale and fade" },
    { id: "deck", label: "Deck", hint: "Rounded cards with visible edges" },
    { id: "fade", label: "Fade out", hint: "No scaling, the card lifts and fades" },
    { id: "cinematic", label: "Cinematic", hint: "Deep scale with blur" },
]

export const SCROLL_STACK_PRESET_VALUES: Record<string, Partial<ScrollStackDemoConfig>> = {
    clean: {},
    deck: { peek: 26, top: 24, scaleTo: 0.97, dim: 0.22, rounded: 28, height: "88vh" },
    fade: { scaleTo: 1, dim: 0, opacityTo: 0, liftTo: 70, rounded: 0 },
    cinematic: {
        scaleTo: 0.84,
        dim: 0.68,
        blurTo: 7,
        rounded: 32,
        top: 18,
        peek: 8,
        height: "92vh",
    },
}
