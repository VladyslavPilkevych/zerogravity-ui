import { FILL_DEFAULT_COLORS, type StencilFill } from "@/lib/stencil"

import type { ControlGroup, PanelPreset } from "../panel/types"

export interface StencilDemoConfig {
    text: string
    fill: StencilFill
    colors: string[]
    image: string
    scale: number
    angle: number
    size: number
    weight: number
    tracking: number
    hover: string
    strength: number
    animate: number
    continuous: boolean
    outline: number
    outlineColor: string
}

export const STENCIL_DEFAULTS: StencilDemoConfig = {
    text: "ZEBRA",
    fill: "zebra",
    colors: FILL_DEFAULT_COLORS.zebra,
    image: "",
    scale: 64,
    angle: 68,
    size: 160,
    weight: 800,
    tracking: -0.02,
    hover: "lift",
    strength: 1,
    animate: 0,
    continuous: true,
    outline: 0,
    outlineColor: "#ffffff",
}

const FILLS = [
    "zebra",
    "leopard",
    "stripes",
    "checker",
    "dots",
    "grid",
    "gradient",
    "rainbow",
    "image",
] as const

const HOVERS = ["none", "lift", "pop", "wave", "tilt", "shift", "glow"] as const

export const STENCIL_CONTROLS: ControlGroup[] = [
    {
        id: "fill",
        title: "Fill",
        hint: "what shows through the letters",
        open: true,
        controls: [
            { kind: "select", path: "fill", label: "Pattern", options: FILLS },
            { kind: "palette", path: "colors", label: "Pattern colours" },
            { kind: "number", path: "scale", label: "Pattern scale", min: 8, max: 300, step: 2, unit: "px" },
            { kind: "number", path: "angle", label: "Pattern angle", min: 0, max: 180, step: 1, unit: "°" },
            { kind: "boolean", path: "continuous", label: "Pattern flows across the word" },
            { kind: "number", path: "animate", label: "Pattern loop time", min: 0, max: 20, step: 0.5, unit: "s" },
        ],
    },
    {
        id: "type",
        title: "Type",
        hint: "size and weight of the letters",
        open: true,
        controls: [
            { kind: "number", path: "size", label: "Font size", min: 40, max: 340, step: 4, unit: "px" },
            { kind: "number", path: "weight", label: "Weight", min: 100, max: 900, step: 100 },
            { kind: "number", path: "tracking", label: "Tracking", min: -0.12, max: 0.3, step: 0.005, unit: "em" },
            { kind: "number", path: "outline", label: "Outline", min: 0, max: 6, step: 0.5, unit: "px" },
            { kind: "color", path: "outlineColor", label: "Outline colour" },
        ],
    },
    {
        id: "hover",
        title: "Hover",
        hint: "what a letter does under the cursor",
        open: true,
        controls: [
            { kind: "select", path: "hover", label: "Effect", options: HOVERS },
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 2.5, step: 0.05 },
        ],
    },
]

export const STENCIL_PRESETS: PanelPreset[] = [
    { id: "zebra", label: "Zebra", hint: "Irregular black and white bands" },
    { id: "leopard", label: "Leopard", hint: "Rosette spots on a tan coat" },
    { id: "candy", label: "Candy", hint: "Diagonal stripes that keep sliding" },
    { id: "rainbow", label: "Rainbow", hint: "Full spectrum, waving on hover" },
    { id: "photo", label: "Photo", hint: "Any image through the glyphs" },
    { id: "wire", label: "Wire", hint: "Grid fill with an outline" },
]

const PHOTO =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23ff9a3c"/><stop offset="0.5" stop-color="%23ff3c8f"/><stop offset="1" stop-color="%236a3cff"/></linearGradient></defs><rect width="600" height="400" fill="url(%23s)"/><circle cx="140" cy="120" r="90" fill="%23ffe9a8" opacity="0.85"/><path d="M0 320 L160 200 L300 300 L430 190 L600 310 L600 400 L0 400 Z" fill="%23120a2a" opacity="0.7"/></svg>`,
    )

export const STENCIL_PRESET_VALUES: Record<string, Partial<StencilDemoConfig>> = {
    zebra: {},
    leopard: {
        text: "LEOPARD",
        fill: "leopard",
        colors: FILL_DEFAULT_COLORS.leopard,
        scale: 110,
        hover: "pop",
        size: 140,
    },
    candy: {
        text: "CANDY",
        fill: "stripes",
        colors: ["#ff4d6d", "#fff0f3"],
        scale: 46,
        angle: 55,
        animate: 3,
        hover: "tilt",
    },
    rainbow: {
        text: "RAINBOW",
        fill: "rainbow",
        colors: [],
        scale: 40,
        angle: 90,
        animate: 6,
        hover: "wave",
        size: 130,
        strength: 1.4,
    },
    photo: {
        text: "SUNSET",
        fill: "image",
        image: PHOTO,
        hover: "glow",
        size: 170,
        tracking: -0.04,
    },
    wire: {
        text: "WIRE",
        fill: "grid",
        colors: ["#050b1a", "#6ea8fe"],
        scale: 26,
        angle: 0,
        outline: 1.5,
        outlineColor: "#6ea8fe",
        hover: "shift",
        size: 180,
    },
}
