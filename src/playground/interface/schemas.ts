import type { ControlGroup } from "../panel/types"

export const DITHER_DEFAULTS = {
    variant: "sweep",
    cell: 8,
    density: 0.3,
    glow: 0.5,
    duration: 420,
    origin: "pointer",
    layer: "under",
    color: "#4ee1f2",
    active: false,
}

export const DITHER_CONTROLS: ControlGroup[] = [
    {
        id: "pixels",
        title: "Pixels",
        hint: "hover style, block size, glow and colour",
        open: true,
        controls: [
            { kind: "select", path: "variant", label: "Variant", options: ["sweep", "edge"] },
            { kind: "number", path: "cell", label: "Cell", min: 4, max: 24, step: 1, unit: "px" },
            { kind: "number", path: "glow", label: "Glow", min: 0, max: 1.5, step: 0.05 },
            { kind: "color", path: "color", label: "Colour" },
        ],
    },
    {
        id: "sweep",
        title: "Sweep",
        hint: "fill, resting texture and timing; sweep variant only",
        open: true,
        controls: [
            { kind: "number", path: "density", label: "Rest density", min: 0, max: 1, step: 0.02 },
            {
                kind: "number",
                path: "duration",
                label: "Duration",
                min: 120,
                max: 1400,
                step: 20,
                unit: "ms",
            },
            {
                kind: "select",
                path: "origin",
                label: "Origin",
                options: ["pointer", "center", "left", "right", "top", "bottom"],
            },
        ],
    },
    {
        id: "state",
        title: "State",
        hint: "stacking and a held-on state",
        open: true,
        controls: [
            { kind: "select", path: "layer", label: "Layer", options: ["under", "over"] },
            { kind: "boolean", path: "active", label: "Force active" },
        ],
    },
]

export const DITHER_PRESETS = [
    {
        id: "sweep",
        label: "Sweep",
        hint: "blocks fill from the pointer",
        values: {},
    },
    {
        id: "edge",
        label: "Edge",
        hint: "quick block frame and lift",
        values: { variant: "edge" },
    },
    {
        id: "lime",
        label: "Lime",
        hint: "lime sweep from the left edge",
        values: { color: "#c6f24e", origin: "left", cell: 10 },
    },
]

export const KEYCAP_DEFAULTS = {
    size: "md",
    tone: "#4ee1f2",
    depth: 4,
    notch: 3,
    disabled: false,
}

export const KEYCAP_CONTROLS: ControlGroup[] = [
    {
        id: "cap",
        title: "Cap",
        hint: "size, accent and press geometry",
        open: true,
        controls: [
            { kind: "select", path: "size", label: "Size", options: ["sm", "md", "lg"] },
            { kind: "color", path: "tone", label: "Tone" },
            { kind: "number", path: "depth", label: "Depth", min: 0, max: 10, step: 1, unit: "px" },
            { kind: "number", path: "notch", label: "Notch", min: 0, max: 6, step: 1, unit: "px" },
            { kind: "boolean", path: "disabled", label: "Disabled" },
        ],
    },
]

export const BEZEL_DEFAULTS = {
    label: "",
    tone: "#4ee1f2",
    grid: false,
    ticks: true,
    scan: true,
    notch: 4,
}

export const BEZEL_CONTROLS: ControlGroup[] = [
    {
        id: "frame",
        title: "Frame",
        hint: "corners, label tab and hover lock-on",
        open: true,
        controls: [
            { kind: "text", path: "label", label: "Label", maxLength: 24 },
            { kind: "color", path: "tone", label: "Tone" },
            { kind: "number", path: "notch", label: "Notch", min: 0, max: 8, step: 1, unit: "px" },
            { kind: "boolean", path: "grid", label: "Grid" },
            { kind: "boolean", path: "ticks", label: "Corner ticks" },
            { kind: "boolean", path: "scan", label: "Hover scan" },
        ],
    },
]

export const SEAM_DEFAULTS = {
    cell: 4,
    tone: null as string | null,
    animated: false,
    speed: 3.2,
}

export const SEAM_CONTROLS: ControlGroup[] = [
    {
        id: "seam",
        title: "Seam",
        hint: "block size, colour and the travelling pulse",
        open: true,
        controls: [
            { kind: "number", path: "cell", label: "Cell", min: 2, max: 10, step: 1, unit: "px" },
            { kind: "colorNullable", path: "tone", label: "Tone" },
            { kind: "boolean", path: "animated", label: "Animated" },
            {
                kind: "number",
                path: "speed",
                label: "Speed",
                min: 0.8,
                max: 8,
                step: 0.2,
                unit: "s",
            },
        ],
    },
]

export const TAG_DEFAULTS = {
    status: "neutral",
    variant: "outline",
}

export const TAG_CONTROLS: ControlGroup[] = [
    {
        id: "tag",
        title: "Your tag",
        hint: "the tag at the top and the code below",
        open: true,
        controls: [
            {
                kind: "select",
                path: "status",
                label: "Status",
                options: ["neutral", "info", "success", "warning", "danger", "live"],
            },
            { kind: "select", path: "variant", label: "Variant", options: ["outline", "solid"] },
        ],
    },
]

export const BEZEL_PRESETS = [
    {
        id: "labelled",
        label: "Labelled",
        hint: "lime tab and ticks",
        values: { label: "Package", tone: "#c6f24e" },
    },
    {
        id: "grid",
        label: "Grid",
        hint: "violet frame on a 1px grid",
        values: { label: "Grid", tone: "#9d7bff", grid: true },
    },
    { id: "plain", label: "Plain", hint: "no label, cyan accent", values: {} },
]

export const SEAM_PRESETS = [
    { id: "violet", label: "Violet", hint: "violet blocks", values: { tone: "#9d7bff" } },
    {
        id: "pulse",
        label: "Pulse",
        hint: "every pattern carries the pulse",
        values: { tone: "#4ee1f2", animated: true },
    },
    { id: "inherit", label: "Inherit", hint: "blocks take the text colour", values: {} },
]
