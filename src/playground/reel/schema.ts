import type { ControlGroup, PanelPreset } from "../panel/types"

export interface ReelDemoConfig {
    itemWidth: number
    itemHeight: number
    radius: number
    spacing: number
    visible: number
    scale: number
    opacity: number
    rotate: number
    depth: number
    perspective: number
    stiffness: number
    loop: boolean
    drag: boolean
    wheel: boolean
    arrows: boolean
    dots: boolean
    clickToSelect: boolean
    items: number
}

export const REEL_DEFAULTS: ReelDemoConfig = {
    itemWidth: 300,
    itemHeight: 400,
    radius: 20,
    spacing: 340,
    visible: 3,
    scale: 0.8,
    opacity: 0.35,
    rotate: 0,
    depth: 0,
    perspective: 1400,
    stiffness: 9,
    loop: false,
    drag: true,
    wheel: true,
    arrows: true,
    dots: true,
    clickToSelect: true,
    items: 7,
}

export const REEL_CONTROLS: ControlGroup[] = [
    {
        id: "size",
        title: "Size",
        hint: "item box and spacing",
        open: true,
        controls: [
            {
                kind: "number",
                path: "itemWidth",
                label: "Item width",
                min: 120,
                max: 640,
                step: 10,
                unit: "px",
            },
            {
                kind: "number",
                path: "itemHeight",
                label: "Item height",
                min: 160,
                max: 720,
                step: 10,
                unit: "px",
            },
            {
                kind: "number",
                path: "radius",
                label: "Corner radius",
                min: 0,
                max: 48,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "spacing",
                label: "Spacing",
                min: 60,
                max: 700,
                step: 5,
                unit: "px",
            },
            {
                kind: "number",
                path: "visible",
                label: "Neighbours each side",
                min: 1,
                max: 8,
                step: 1,
            },
            { kind: "number", path: "items", label: "Items (demo only)", min: 2, max: 16, step: 1 },
        ],
    },
    {
        id: "look",
        title: "Neighbours",
        hint: "how side items recede",
        open: true,
        controls: [
            { kind: "number", path: "scale", label: "Scale", min: 0.3, max: 1, step: 0.01 },
            { kind: "number", path: "opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
            {
                kind: "number",
                path: "rotate",
                label: "Y rotation",
                min: 0,
                max: 70,
                step: 1,
                unit: "°",
            },
            {
                kind: "number",
                path: "depth",
                label: "Push back",
                min: 0,
                max: 500,
                step: 10,
                unit: "px",
            },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 400,
                max: 3000,
                step: 50,
                unit: "px",
            },
        ],
    },
    {
        id: "input",
        title: "Motion and input",
        hint: "spring, drag, wheel, controls",
        open: true,
        controls: [
            {
                kind: "number",
                path: "stiffness",
                label: "Spring stiffness",
                min: 2,
                max: 24,
                step: 0.5,
            },
            { kind: "boolean", path: "loop", label: "Loop" },
            { kind: "boolean", path: "drag", label: "Drag to spin" },
            { kind: "boolean", path: "wheel", label: "Horizontal wheel" },
            { kind: "boolean", path: "arrows", label: "Arrow buttons" },
            { kind: "boolean", path: "dots", label: "Dots" },
            { kind: "boolean", path: "clickToSelect", label: "Click a neighbour to centre it" },
        ],
    },
]

export const REEL_PRESETS: PanelPreset[] = [
    { id: "flat", label: "Flat", hint: "Plain row, scaled neighbours" },
    { id: "coverflow", label: "Coverflow", hint: "3D rotation and depth" },
    { id: "tight", label: "Tight", hint: "Dense roulette with many neighbours" },
    { id: "single", label: "Spotlight", hint: "Wide item, faint neighbours" },
]

export const REEL_PRESET_VALUES: Record<string, Partial<ReelDemoConfig>> = {
    flat: {},
    coverflow: {
        rotate: 42,
        depth: 180,
        spacing: 230,
        scale: 0.88,
        opacity: 0.55,
        perspective: 1100,
    },
    tight: {
        spacing: 150,
        scale: 0.6,
        opacity: 0.22,
        visible: 6,
        itemWidth: 240,
        itemHeight: 340,
        loop: true,
    },
    single: {
        itemWidth: 460,
        itemHeight: 300,
        spacing: 520,
        scale: 0.72,
        opacity: 0.16,
        stiffness: 6,
    },
}

export const PRODUCTS = [
    { name: "Aurora Lamp", price: "$189", tag: "New", from: "#4c1d95", to: "#1e1b4b" },
    { name: "Halo Speaker", price: "$249", tag: "Popular", from: "#0f766e", to: "#082f2b" },
    { name: "Nimbus Chair", price: "$540", tag: "Limited", from: "#9a3412", to: "#3b1206" },
    { name: "Vertex Desk", price: "$820", tag: "Studio", from: "#1e3a8a", to: "#0b1533" },
    { name: "Pulse Watch", price: "$310", tag: "New", from: "#831843", to: "#310a1c" },
    { name: "Drift Cam", price: "$470", tag: "Pro", from: "#3f6212", to: "#141f05" },
    { name: "Echo Mic", price: "$155", tag: "Studio", from: "#7c2d12", to: "#2a0e05" },
    { name: "Prism Panel", price: "$96", tag: "Popular", from: "#155e75", to: "#062029" },
    { name: "Zephyr Fan", price: "$134", tag: "New", from: "#4338ca", to: "#171449" },
    { name: "Onyx Stand", price: "$78", tag: "Basic", from: "#334155", to: "#0f172a" },
    { name: "Lumen Bulb", price: "$42", tag: "Basic", from: "#a16207", to: "#3a2404" },
    { name: "Cobalt Pad", price: "$212", tag: "Pro", from: "#1d4ed8", to: "#0a1a44" },
    { name: "Ember Kettle", price: "$168", tag: "Home", from: "#b91c1c", to: "#3f0808" },
    { name: "Slate Clock", price: "$122", tag: "Home", from: "#475569", to: "#131a25" },
    { name: "Verde Pot", price: "$58", tag: "Home", from: "#15803d", to: "#052c13" },
    { name: "Ivory Vase", price: "$88", tag: "Limited", from: "#78716c", to: "#221f1d" },
]
