import {
    NIMBUS_PRESETS,
    NIMBUS_PRESET_NAMES,
    type NimbusPreset,
} from "@/lib/experimental/nimbus/presets"

import type { ControlGroup } from "../panel/types"

export const PALETTES = {
    facet: {
        dusk: ["#3b4c8a", "#2f6b70", "#6a4478", "#334f86", "#4a5c8f"],
        ember: ["#7a3b52", "#8a5a3b", "#6d3f4a", "#8f5a45"],
        forest: ["#2c5344", "#3a5f4a", "#24485c", "#356050"],
    } as Record<string, string[]>,
    wash: {
        ink: ["#20304f", "#2d4a4a", "#402f52", "#1f3b52", "#4a3550"],
        clay: ["#4a3328", "#5a4030", "#3d2b2b", "#63483a"],
        tide: ["#123040", "#17414a", "#0f3a3a", "#1b4c56"],
    } as Record<string, string[]>,
}

export const LOUVRE_DEFAULTS = {
    slats: 8,
    orientation: "horizontal",
    phase: 0.7,
    perspective: 900,
    gap: 2,
    shade: 0.6,
    scrollLength: "340cqh",
}

export const LOUVRE_CONTROLS: ControlGroup[] = [
    {
        id: "blinds",
        title: "Blinds",
        hint: "slat geometry and reveal wave",
        open: true,
        controls: [
            { kind: "number", path: "slats", label: "Slats", min: 3, max: 24, step: 1 },
            {
                kind: "select",
                path: "orientation",
                label: "Orientation",
                options: ["horizontal", "vertical"],
            },
            { kind: "number", path: "phase", label: "Phase", min: 0, max: 1.5, step: 0.05 },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 500,
                max: 2600,
                step: 50,
                unit: "px",
            },
            { kind: "number", path: "gap", label: "Gap", min: 0, max: 12, step: 1, unit: "px" },
            { kind: "number", path: "shade", label: "Shade", min: 0, max: 1, step: 0.05 },
            {
                kind: "cssLength",
                path: "scrollLength",
                label: "Scroll length",
                min: 150,
                max: 500,
                step: 10,
                unit: "cqh",
            },
        ],
    },
]

export const LODESTONE_DEFAULTS = {
    radius: 130,
    strength: 0.32,
    maxDisplacement: 16,
    minGap: 12,
    release: 0.16,
    lift: 0.04,
    buttons: 4,
    spacing: 18,
}

export const LODESTONE_CONTROLS: ControlGroup[] = [
    {
        id: "magnet",
        title: "Magnet",
        hint: "how each button reacts to a nearby pointer",
        open: true,
        controls: [
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 40,
                max: 400,
                step: 10,
                unit: "px",
            },
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 1, step: 0.02 },
            {
                kind: "number",
                path: "maxDisplacement",
                label: "Max displacement",
                min: 0,
                max: 80,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "release",
                label: "Return speed",
                min: 0.02,
                max: 1,
                step: 0.02,
            },
            { kind: "number", path: "lift", label: "Lift", min: 0, max: 0.3, step: 0.01 },
        ],
    },
    {
        id: "layout",
        title: "Layout",
        hint: "crowd the buttons to prove they cannot overlap",
        open: true,
        controls: [
            {
                kind: "number",
                path: "minGap",
                label: "Minimum gap",
                min: 0,
                max: 40,
                step: 1,
                unit: "px",
            },
            { kind: "number", path: "buttons", label: "Buttons", min: 2, max: 5, step: 1 },
            {
                kind: "number",
                path: "spacing",
                label: "Rest spacing",
                min: 2,
                max: 60,
                step: 2,
                unit: "px",
            },
        ],
    },
]

export const FACET_DEFAULTS = {
    cell: 120,
    paletteName: "dusk",
    variation: 14,
    intensity: 0.7,
    seed: 7,
    ambient: true,
    ambientInterval: 7000,
    ambientDuration: 5200,
}

export const FACET_CONTROLS: ControlGroup[] = [
    {
        id: "surface",
        title: "Surface",
        hint: "facet size and pointer lighting",
        open: true,
        controls: [
            {
                kind: "number",
                path: "cell",
                label: "Facet size",
                min: 40,
                max: 320,
                step: 10,
                unit: "px",
            },
            {
                kind: "number",
                path: "variation",
                label: "Tone variation",
                min: 0,
                max: 40,
                step: 1,
            },
            { kind: "number", path: "intensity", label: "Light", min: 0, max: 1.4, step: 0.05 },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 99, step: 1 },
        ],
    },
    {
        id: "ambient",
        title: "Ambient flow",
        hint: "interval picks the next colour, duration is the transition",
        open: true,
        controls: [
            { kind: "boolean", path: "ambient", label: "Enabled" },
            {
                kind: "select",
                path: "paletteName",
                label: "Palette",
                options: ["dusk", "ember", "forest"],
            },
            {
                kind: "number",
                path: "ambientInterval",
                label: "Interval",
                min: 1200,
                max: 20000,
                step: 200,
                unit: "ms",
            },
            {
                kind: "number",
                path: "ambientDuration",
                label: "Duration",
                min: 400,
                max: 14000,
                step: 200,
                unit: "ms",
            },
        ],
    },
]

export const VELLUM_DEFAULTS = {
    tilt: 9,
    radius: 22,
    ease: 0.14,
    perspective: 900,
    highlight: true,
    surface: "smooth",
    pixel: 12,
    dent: 0.35,
    sheen: 0.5,
    sheenColor: "#ffffff",
}

export const VELLUM_CONTROLS: ControlGroup[] = [
    {
        id: "sheet",
        title: "Sheet",
        hint: "geometry of the tilt",
        open: true,
        controls: [
            { kind: "number", path: "tilt", label: "Tilt", min: 0, max: 30, step: 1, unit: "deg" },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 64,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "ease", label: "Ease", min: 0.02, max: 1, step: 0.02 },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 300,
                max: 2000,
                step: 50,
                unit: "px",
            },
        ],
    },
    {
        id: "highlight",
        title: "Highlight",
        hint: "optional dent and sheen, smooth or in square cells",
        open: true,
        controls: [
            { kind: "boolean", path: "highlight", label: "Enabled" },
            { kind: "select", path: "surface", label: "Surface", options: ["smooth", "pixel"] },
            { kind: "number", path: "pixel", label: "Cell", min: 6, max: 32, step: 1, unit: "px" },
            { kind: "number", path: "dent", label: "Dent", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "sheen", label: "Sheen", min: 0, max: 1.5, step: 0.05 },
            { kind: "color", path: "sheenColor", label: "Sheen colour" },
        ],
    },
]

export const KERN_DEFAULTS = {
    text: "TYPESET",
    radius: 160,
    spread: 0.34,
    lift: 12,
    weight: 320,
    ease: 0.18,
    size: 88,
}

export const KERN_CONTROLS: ControlGroup[] = [
    {
        id: "optical",
        title: "Optical",
        hint: "per-glyph response to pointer distance",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 18 },
            { kind: "number", path: "size", label: "Size", min: 32, max: 180, step: 2, unit: "px" },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 40,
                max: 500,
                step: 10,
                unit: "px",
            },
            { kind: "number", path: "spread", label: "Spread", min: 0, max: 1, step: 0.02 },
            { kind: "number", path: "lift", label: "Lift", min: 0, max: 60, step: 2, unit: "px" },
            { kind: "number", path: "weight", label: "Weight axis", min: 0, max: 500, step: 10 },
            { kind: "number", path: "ease", label: "Ease", min: 0.02, max: 1, step: 0.02 },
        ],
    },
]

export const OVERPRINT_DEFAULTS = {
    text: "MISREGISTER",
    spread: 10,
    converge: 5,
    size: 96,
    weight: 800,
}

export const OVERPRINT_CONTROLS: ControlGroup[] = [
    {
        id: "press",
        title: "Press",
        hint: "ink offset and how fast the plates realign",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 18 },
            { kind: "number", path: "size", label: "Size", min: 32, max: 200, step: 2, unit: "px" },
            {
                kind: "number",
                path: "spread",
                label: "Spread",
                min: 0,
                max: 48,
                step: 1,
                unit: "px",
            },
            { kind: "number", path: "converge", label: "Converge", min: 1, max: 20, step: 0.5 },
            { kind: "number", path: "weight", label: "Weight", min: 300, max: 900, step: 50 },
        ],
    },
]

export const DIORAMA_DEFAULTS = {
    example: "product",
    parallax: 46,
    blur: 7,
    perspective: 1200,
    ease: 0.11,
}

export type DioramaExample = "product" | "editorial" | "poster" | "frame"

export const DIORAMA_EXAMPLES: { id: DioramaExample; label: string; hint: string }[] = [
    { id: "product", label: "Product", hint: "A layered product card" },
    { id: "editorial", label: "Editorial", hint: "Text and picture with depth" },
    { id: "poster", label: "Poster", hint: "A hero composition" },
    { id: "frame", label: "Frame", hint: "Foreground framing around content" },
]

export const DIORAMA_PRESET_VALUES: Record<DioramaExample, Record<string, unknown>> = {
    product: { example: "product" },
    editorial: { example: "editorial", parallax: 32, blur: 5 },
    poster: { example: "poster", parallax: 64, blur: 4 },
    frame: { example: "frame", parallax: 56, blur: 10 },
}

export const DIORAMA_CONTROLS: ControlGroup[] = [
    {
        id: "optics",
        title: "Optics",
        hint: "how strongly depth separates the layers",
        open: true,
        controls: [
            {
                kind: "number",
                path: "parallax",
                label: "Parallax",
                min: 0,
                max: 140,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "blur",
                label: "Foreground blur",
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
            },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 400,
                max: 2400,
                step: 50,
                unit: "px",
            },
            { kind: "number", path: "ease", label: "Ease", min: 0.02, max: 1, step: 0.02 },
        ],
    },
]

export const WASH_DEFAULTS = {
    mode: "both",
    paletteName: "ink",
    interval: 6000,
    duration: 1400,
    softness: 0.35,
    burst: true,
}

export const WASH_CONTROLS: ControlGroup[] = [
    {
        id: "trigger",
        title: "Trigger",
        hint: "click, automatic, or both",
        open: true,
        controls: [
            { kind: "select", path: "mode", label: "Mode", options: ["click", "auto", "both"] },
            {
                kind: "number",
                path: "interval",
                label: "Interval",
                min: 600,
                max: 15000,
                step: 100,
                unit: "ms",
            },
        ],
    },
    {
        id: "bloom",
        title: "Bloom",
        hint: "shape and pace of the spreading colour",
        open: true,
        controls: [
            {
                kind: "number",
                path: "duration",
                label: "Duration",
                min: 200,
                max: 4000,
                step: 100,
                unit: "ms",
            },
            {
                kind: "number",
                path: "softness",
                label: "Edge softness",
                min: 0,
                max: 0.9,
                step: 0.05,
            },
            { kind: "boolean", path: "burst", label: "Pixel burst on click" },
            {
                kind: "select",
                path: "paletteName",
                label: "Palette",
                options: ["ink", "clay", "tide"],
            },
        ],
    },
]

export const TESSERA_DEFAULTS = {
    color: "#0b0c11",
    rows: 4,
    columns: 6,
    duration: 420,
    stagger: 380,
    sequence: "random",
}

export const TESSERA_CONTROLS: ControlGroup[] = [
    {
        id: "grid",
        title: "Grid",
        hint: "how many tiles cover the viewport",
        open: true,
        controls: [
            { kind: "number", path: "rows", label: "Rows", min: 1, max: 12, step: 1 },
            { kind: "number", path: "columns", label: "Columns", min: 1, max: 12, step: 1 },
            {
                kind: "select",
                path: "sequence",
                label: "Sequence",
                options: ["random", "row", "column", "reverse", "center", "diagonal", "spiral"],
            },
        ],
    },
    {
        id: "timing",
        title: "Timing",
        hint: "per-tile duration and the delay between tiles",
        open: true,
        controls: [
            {
                kind: "number",
                path: "duration",
                label: "Duration",
                min: 120,
                max: 1600,
                step: 20,
                unit: "ms",
            },
            {
                kind: "number",
                path: "stagger",
                label: "Stagger",
                min: 0,
                max: 900,
                step: 20,
                unit: "ms",
            },
            { kind: "color", path: "color", label: "Tile colour" },
        ],
    },
]

export const MEADOW_DEFAULTS = {
    density: "cosy",
    theme: "day",
    timeAware: false,
    animated: true,
    trails: true,
    seed: 5,
    interactive: false,
    events: true,
    eventFrequency: "rare",
    bees: 5,
    butterflyCount: 5,
    ghostCount: 0,
    balloonCount: 2,
    fireflyCount: 26,
    planetCount: 9,
    sun: true,
    clouds: true,
    hills: true,
    flowers: true,
    balloon: true,
    butterflies: true,
    birds: true,
    mascots: true,
    stars: true,
    comets: true,
    planets: true,
    rockets: true,
    ufos: true,
}

export const MEADOW_CONTROLS: ControlGroup[] = [
    {
        id: "life",
        title: "Life",
        hint: "theme previews the scene; local time overrides it unless the theme is space",
        open: true,
        controls: [
            {
                kind: "select",
                path: "density",
                label: "Density",
                options: ["calm", "cosy", "lively"],
            },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 99, step: 1 },
            {
                kind: "select",
                path: "theme",
                label: "Theme",
                options: ["day", "sunrise", "sunset", "night", "space"],
            },
            { kind: "boolean", path: "timeAware", label: "Follow local time" },
            { kind: "boolean", path: "animated", label: "Animated" },
            { kind: "boolean", path: "trails", label: "Mascot trails" },
        ],
    },
    {
        id: "creatures",
        title: "Creatures",
        hint: "counts are clamped; fireflies need night and planets need space",
        open: true,
        controls: [
            { kind: "number", path: "bees", label: "Bees", min: 0, max: 12, step: 1 },
            {
                kind: "number",
                path: "butterflyCount",
                label: "Butterflies",
                min: 0,
                max: 16,
                step: 1,
            },
            { kind: "number", path: "ghostCount", label: "Extra ghosts", min: 0, max: 12, step: 1 },
            {
                kind: "number",
                path: "balloonCount",
                label: "Extra balloons",
                min: 0,
                max: 8,
                step: 1,
            },
            {
                kind: "number",
                path: "fireflyCount",
                label: "Fireflies (night)",
                min: 0,
                max: 40,
                step: 1,
            },
            {
                kind: "number",
                path: "planetCount",
                label: "Planets (space)",
                min: 0,
                max: 20,
                step: 1,
            },
        ],
    },
    {
        id: "interaction",
        title: "Interaction and events",
        hint: "pointer reactions need a fine pointer; events stay rare by default",
        open: true,
        controls: [
            { kind: "boolean", path: "interactive", label: "React to the pointer" },
            { kind: "boolean", path: "events", label: "Ambient events" },
            {
                kind: "select",
                path: "eventFrequency",
                label: "Event frequency",
                options: ["rare", "normal", "frequent"],
            },
        ],
    },
    {
        id: "landscape",
        title: "Landscape",
        hint: "the scenery behind everything",
        open: true,
        controls: [
            { kind: "boolean", path: "sun", label: "Sun" },
            { kind: "boolean", path: "clouds", label: "Clouds" },
            { kind: "boolean", path: "hills", label: "Hills and grass" },
            { kind: "boolean", path: "flowers", label: "Flowers" },
        ],
    },
    {
        id: "cast",
        title: "Cast",
        hint: "which characters are allowed on stage",
        open: false,
        controls: [
            { kind: "boolean", path: "balloon", label: "Balloon" },
            { kind: "boolean", path: "butterflies", label: "Butterflies" },
            { kind: "boolean", path: "birds", label: "Birds" },
            { kind: "boolean", path: "mascots", label: "Mascots" },
            { kind: "boolean", path: "stars", label: "Stars" },
            { kind: "boolean", path: "comets", label: "Shooting stars" },
            { kind: "boolean", path: "planets", label: "Planets" },
            { kind: "boolean", path: "rockets", label: "Rockets" },
            { kind: "boolean", path: "ufos", label: "UFOs" },
        ],
    },
]

export const RASTER_DEFAULTS = {
    mode: "pixel",
    disabled: false,
    animated: true,
    interactive: false,
    blurStrength: 22,
    distortion: 18,
    glyphSet: "ascii",
    cellSize: 10,
    pixelSize: 18,
    gridGap: 2,
    rounded: 0.28,
}

export const RASTER_CONTROLS: ControlGroup[] = [
    {
        id: "mode",
        title: "Mode",
        hint: "how the picture is abstracted",
        open: true,
        controls: [
            {
                kind: "select",
                path: "mode",
                label: "Mode",
                options: ["blur", "glass", "glyph", "pixel"],
            },
            { kind: "boolean", path: "disabled", label: "Show the original" },
            { kind: "boolean", path: "interactive", label: "Reveal on hover" },
            { kind: "boolean", path: "animated", label: "Animated" },
        ],
    },
    {
        id: "tuning",
        title: "Tuning",
        hint: "options for the selected mode",
        open: true,
        controls: [
            { kind: "number", path: "blurStrength", label: "Blur", min: 4, max: 60, step: 2 },
            { kind: "number", path: "distortion", label: "Distortion", min: 0, max: 50, step: 2 },
            { kind: "number", path: "cellSize", label: "Glyph cell", min: 6, max: 28, step: 1 },
            {
                kind: "select",
                path: "glyphSet",
                label: "Glyph set",
                options: ["ascii", "dots", "blocks", "ink"],
            },
            { kind: "number", path: "pixelSize", label: "Pixel size", min: 6, max: 48, step: 2 },
            { kind: "number", path: "gridGap", label: "Pixel gap", min: 0, max: 8, step: 1 },
            {
                kind: "number",
                path: "rounded",
                label: "Pixel rounding",
                min: 0,
                max: 1,
                step: 0.05,
            },
        ],
    },
]

export const LOADERS_DEFAULTS = {
    heartVariant: "pulse",
    blocksVariant: "wave",
    size: 96,
    gap: 0.34,
    color: "#f4a04f",
    speed: 1,
    paused: false,
    value: 0.45,
    determinate: false,
}

export const LOADERS_CONTROLS: ControlGroup[] = [
    {
        id: "shared",
        title: "Shared",
        hint: "applies to every loader in the gallery",
        open: true,
        controls: [
            { kind: "color", path: "color", label: "Colour" },
            { kind: "number", path: "speed", label: "Speed", min: 0.25, max: 3, step: 0.25 },
            { kind: "number", path: "size", label: "Heart size", min: 32, max: 200, step: 4 },
            { kind: "number", path: "gap", label: "Pixel gap", min: 0, max: 3, step: 0.02 },
            { kind: "boolean", path: "paused", label: "Paused" },
        ],
    },
    {
        id: "variants",
        title: "Variants",
        hint: "per-loader animation styles",
        open: true,
        controls: [
            { kind: "select", path: "heartVariant", label: "Heart", options: ["pulse", "blink"] },
            {
                kind: "select",
                path: "blocksVariant",
                label: "Blocks",
                options: ["wave", "center", "steps"],
            },
            { kind: "boolean", path: "determinate", label: "Bar shows progress" },
            { kind: "number", path: "value", label: "Bar value", min: 0, max: 1, step: 0.05 },
        ],
    },
]

export const RICOCHET_DEFAULTS = {
    text: "404",
    game: "breakout",
    variant: "neon",
    pixelSize: 26,
    speed: 1,
    powerUps: true,
    powerUpChance: 0.05,
    shotSpeed: 1,
    fireRate: 5,
    shipSpeed: 1,
    color: "#f6a94b",
    ballColor: "#fdf3e3",
    paddleColor: "#6fd6e8",
    autoStart: true,
    hideCursor: true,
}

export const RICOCHET_CONTROLS: ControlGroup[] = [
    {
        id: "scene",
        title: "Scene",
        hint: "what gets knocked apart",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 6 },
            { kind: "select", path: "game", label: "Game", options: ["breakout", "shooter"] },
            {
                kind: "select",
                path: "variant",
                label: "Variant",
                options: ["neon", "mono", "soft"],
            },
            { kind: "number", path: "pixelSize", label: "Pixel size", min: 8, max: 48, step: 2 },
        ],
    },
    {
        id: "breakout",
        title: "Breakout",
        hint: "ball and bonuses",
        open: true,
        controls: [
            { kind: "number", path: "speed", label: "Ball speed", min: 0.4, max: 2.5, step: 0.1 },
            { kind: "boolean", path: "powerUps", label: "Power-ups" },
            {
                kind: "number",
                path: "powerUpChance",
                label: "Drop chance",
                min: 0,
                max: 0.5,
                step: 0.01,
            },
        ],
    },
    {
        id: "shooter",
        title: "Shooter",
        hint: "ship and bolts",
        open: false,
        controls: [
            { kind: "number", path: "shotSpeed", label: "Shot speed", min: 0.4, max: 3, step: 0.1 },
            { kind: "number", path: "fireRate", label: "Fire rate", min: 1, max: 14, step: 1 },
            { kind: "number", path: "shipSpeed", label: "Ship speed", min: 0.4, max: 3, step: 0.1 },
        ],
    },
    {
        id: "look",
        title: "Look",
        hint: "colours and start-up",
        open: false,
        controls: [
            { kind: "color", path: "color", label: "Blocks" },
            { kind: "color", path: "ballColor", label: "Ball" },
            { kind: "color", path: "paddleColor", label: "Paddle or ship" },
            { kind: "boolean", path: "autoStart", label: "Auto start" },
            { kind: "boolean", path: "hideCursor", label: "Hide cursor" },
        ],
    },
]

export const ELEMENTAL_DEFAULTS = {
    variant: "electric",
    color: "",
    intensity: 1,
    speed: 1,
    radius: 16,
    particles: true,
    cursorEffect: false,
}

export const ELEMENTAL_CONTROLS: ControlGroup[] = [
    {
        id: "element",
        title: "Element",
        hint: "which edge the wrapper draws",
        open: true,
        controls: [
            {
                kind: "select",
                path: "variant",
                label: "Variant",
                options: ["electric", "fire"], // "frost", "water" are parked
            },
            { kind: "colorNullable", path: "color", label: "Custom colour" },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 60,
                step: 2,
                unit: "px",
            },
        ],
    },
    {
        id: "energy",
        title: "Energy",
        hint: "how hard the edge works",
        open: true,
        controls: [
            { kind: "number", path: "intensity", label: "Intensity", min: 0, max: 2, step: 0.1 },
            { kind: "number", path: "speed", label: "Speed", min: 0.25, max: 3, step: 0.25 },
            { kind: "boolean", path: "particles", label: "Particles" },
            { kind: "boolean", path: "cursorEffect", label: "Cursor effect" },
        ],
    },
]

/* ------------------------------------------------------------- Undertow */

export const UNDERTOW_DEFAULTS = {
    radius: 0.3,
    strength: 0.55,
    softness: 0.38,
    speed: 1,
    linger: 2.4,
    interactive: true,
}

export const UNDERTOW_CONTROLS: ControlGroup[] = [
    {
        id: "disturbance",
        title: "Disturbance",
        hint: "how far the pointer parts the surface, and how it settles",
        open: true,
        controls: [
            { kind: "number", path: "radius", label: "Radius", min: 0.08, max: 0.6, step: 0.02 },
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "softness", label: "Softness", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1 },
            { kind: "number", path: "linger", label: "Linger", min: 0.2, max: 8, step: 0.2 },
            { kind: "boolean", path: "interactive", label: "React to the pointer" },
        ],
    },
]

/* ----------------------------------------------------------------- Wake */

export const WAKE_DEFAULTS = {
    surface: "tiles",
    strength: 0.6,
    radius: 14,
    decay: 2.4,
    refraction: 1,
    light: 1,
    pixelated: false,
}

export const WAKE_CONTROLS: ControlGroup[] = [
    {
        id: "water",
        title: "Water",
        hint: "how the pointer pushes it and how long it keeps moving",
        open: true,
        controls: [
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "radius", label: "Radius", min: 4, max: 40, step: 1 },
            { kind: "number", path: "decay", label: "Decay", min: 0.5, max: 6, step: 0.1 },
        ],
    },
    {
        id: "surface",
        title: "Surface",
        hint: "what lies underneath, and how the water bends and lights it",
        open: true,
        controls: [
            {
                kind: "select",
                path: "surface",
                label: "Surface",
                options: ["tiles", "grid", "checker"],
            },
            {
                kind: "number",
                path: "refraction",
                label: "Refraction",
                min: 0,
                max: 3,
                step: 0.1,
            },
            { kind: "number", path: "light", label: "Light", min: 0, max: 3, step: 0.1 },
            { kind: "boolean", path: "pixelated", label: "Pixelated" },
        ],
    },
]

/* --------------------------------------------------------------- Drench */

export const DRENCH_DEFAULTS = {
    text: "RAIN",
    rain: 0.6,
    wind: 0.12,
    wetness: 0.6,
    evaporation: 0.3,
    fall: 1,
    color: "#9fd8ff",
}

export const DRENCH_CONTROLS: ControlGroup[] = [
    {
        id: "weather",
        title: "Weather",
        hint: "set rain to 0 and watch the letters dry out",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 12 },
            { kind: "number", path: "rain", label: "Rain", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "wind", label: "Wind", min: -1, max: 1, step: 0.05 },
            { kind: "number", path: "wetness", label: "Wetness", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "evaporation",
                label: "Evaporation",
                min: 0,
                max: 1,
                step: 0.05,
            },
            { kind: "number", path: "fall", label: "Fall speed", min: 0.2, max: 3, step: 0.1 },
            { kind: "color", path: "color", label: "Water" },
        ],
    },
]

/* -------------------------------------------------------------- Perseid */

export const PERSEID_DEFAULTS = {
    count: 18,
    speed: 1,
    angle: 24,
    parallax: false,
    paletteName: "aurora",
}

export const PERSEID_PALETTES: Record<string, string[]> = {
    aurora: ["#eaf4ff", "#8fc4ff", "#5ce1e6", "#ff8f6b", "#ff5f6d"],
    ice: ["#ffffff", "#cfe6ff", "#8fc4ff", "#5ce1e6"],
    ember: ["#fff1d6", "#ffb26b", "#ff8f6b", "#ff5f6d"],
    mono: ["#ffffff", "#dfe6ff", "#a8b4d8"],
}

export const PERSEID_CONTROLS: ControlGroup[] = [
    {
        id: "shower",
        title: "Shower",
        hint: "counts are clamped; the angle leans the whole field",
        open: true,
        controls: [
            { kind: "number", path: "count", label: "Meteors", min: 0, max: 60, step: 1 },
            { kind: "number", path: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1 },
            {
                kind: "number",
                path: "angle",
                label: "Angle",
                min: -70,
                max: 70,
                step: 2,
                unit: "°",
            },
            {
                kind: "select",
                path: "paletteName",
                label: "Palette",
                options: ["aurora", "ice", "ember", "mono"],
            },
            { kind: "boolean", path: "parallax", label: "Lean with the pointer" },
        ],
    },
]

/* ----------------------------------------------------------------- Gaze */

export const GAZE_DEFAULTS = {
    sensitivity: 1,
    maxYaw: 34,
    maxPitch: 18,
    damping: 0.1,
    headDelay: 0.6,
}

export const GAZE_CONTROLS: ControlGroup[] = [
    {
        id: "tracking",
        title: "Tracking",
        hint: "eyes lead and the head follows; both are clamped",
        open: true,
        controls: [
            {
                kind: "number",
                path: "sensitivity",
                label: "Sensitivity",
                min: 0.2,
                max: 3,
                step: 0.1,
            },
            {
                kind: "number",
                path: "maxYaw",
                label: "Max yaw",
                min: 0,
                max: 60,
                step: 2,
                unit: "°",
            },
            {
                kind: "number",
                path: "maxPitch",
                label: "Max pitch",
                min: 0,
                max: 40,
                step: 2,
                unit: "°",
            },
            { kind: "number", path: "damping", label: "Damping", min: 0.02, max: 1, step: 0.02 },
            {
                kind: "number",
                path: "headDelay",
                label: "Head delay",
                min: 0,
                max: 0.9,
                step: 0.05,
            },
        ],
    },
]

/* -------------------------------------------------------------- Eclipse */

export const ECLIPSE_DEFAULTS = {
    from: "up",
    recede: 0.06,
    dim: 0.45,
    blur: 0,
}

export const ECLIPSE_CONTROLS: ControlGroup[] = [
    {
        id: "cover",
        title: "Cover",
        hint: "each section pins, then the next one slides over it",
        open: true,
        controls: [
            {
                kind: "select",
                path: "from",
                label: "Arrives from",
                options: ["up", "left", "right"],
            },
            { kind: "number", path: "recede", label: "Recede", min: 0, max: 0.2, step: 0.01 },
            { kind: "number", path: "dim", label: "Dim", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "blur", label: "Blur", min: 0, max: 12, step: 1, unit: "px" },
        ],
    },
]

/* ------------------------------------------------------- 0.3.0 batch */

export const GNOMON_DEFAULTS = {
    distance: 28,
    softness: 30,
    depth: 0.55,
    color: "#05070f",
    lift: true,
}

export const GNOMON_CONTROLS: ControlGroup[] = [
    {
        id: "light",
        title: "Light",
        hint: "the pointer is the lamp; the shadows fall away from it",
        open: true,
        controls: [
            {
                kind: "number",
                path: "distance",
                label: "Throw",
                min: 0,
                max: 80,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "softness",
                label: "Softness",
                min: 0,
                max: 80,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "depth", label: "Depth", min: 0, max: 1, step: 0.05 },
            { kind: "color", path: "color", label: "Shadow" },
            { kind: "boolean", path: "lift", label: "Lift toward the light" },
        ],
    },
]

export const LATTICE_DEFAULTS = {
    gap: 56,
    strength: 0.6,
    radius: 0.3,
    color: "#7fd2ff",
    speed: 1,
    seed: 11,
}

export const LATTICE_CONTROLS: ControlGroup[] = [
    {
        id: "mesh",
        title: "Mesh",
        hint: "a strand that is stretched too far simply lets go",
        open: true,
        controls: [
            { kind: "number", path: "gap", label: "Gap", min: 24, max: 140, step: 4, unit: "px" },
            { kind: "number", path: "strength", label: "Push", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "radius", label: "Reach", min: 0.08, max: 0.8, step: 0.02 },
            { kind: "number", path: "speed", label: "Drift", min: 0, max: 3, step: 0.1 },
            { kind: "color", path: "color", label: "Thread" },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 60, step: 1 },
        ],
    },
]

export const CHROMA_DEFAULTS = {
    width: 24,
    blur: 12,
    decay: 0.6,
}

export const CHROMA_CONTROLS: ControlGroup[] = [
    {
        id: "trail",
        title: "Trail",
        hint: "a soft chromatic comet that fades out behind the pointer",
        open: true,
        controls: [
            { kind: "number", path: "width", label: "Width", min: 4, max: 80, step: 2, unit: "px" },
            { kind: "number", path: "blur", label: "Blur", min: 0, max: 40, step: 1, unit: "px" },
            {
                kind: "number",
                path: "decay",
                label: "Decay",
                min: 0.1,
                max: 1.5,
                step: 0.05,
                unit: "s",
            },
        ],
    },
]

export const SONAR_DEFAULTS = {
    gap: 26,
    amplitude: 16,
    speed: 620,
    band: 90,
    color: "#8ab4ff",
    pulseOnHover: false,
}

export const SONAR_CONTROLS: ControlGroup[] = [
    {
        id: "wave",
        title: "Wave",
        hint: "press the field and a shockwave crosses it",
        open: true,
        controls: [
            { kind: "number", path: "gap", label: "Gap", min: 12, max: 70, step: 2, unit: "px" },
            {
                kind: "number",
                path: "amplitude",
                label: "Shove",
                min: 0,
                max: 60,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "speed", label: "Speed", min: 120, max: 1800, step: 40 },
            {
                kind: "number",
                path: "band",
                label: "Crest",
                min: 20,
                max: 240,
                step: 10,
                unit: "px",
            },
            { kind: "color", path: "color", label: "Dots" },
            { kind: "boolean", path: "pulseOnHover", label: "Pulse on hover too" },
        ],
    },
]

export const CONCERTINA_DEFAULTS = {
    angle: 72,
    depth: 1400,
    shade: 0.55,
}

export const CONCERTINA_CONTROLS: ControlGroup[] = [
    {
        id: "fold",
        title: "Fold",
        hint: "panels hinge alternately, like a folded strip of paper",
        open: true,
        controls: [
            { kind: "number", path: "angle", label: "Angle", min: 0, max: 90, step: 2, unit: "°" },
            {
                kind: "number",
                path: "depth",
                label: "Perspective",
                min: 400,
                max: 3000,
                step: 100,
                unit: "px",
            },
            { kind: "number", path: "shade", label: "Shade", min: 0, max: 1, step: 0.05 },
        ],
    },
]

export const PEEL_DEFAULTS = {
    corner: "top-right",
    lead: 0.25,
    travel: 1.5,
    hold: 0.5,
    curl: 0.7,
}

export const PEEL_PRESETS = [
    {
        id: "normal",
        label: "Normal",
        hint: "Time to see the cover, the peel and what is underneath",
        values: { lead: 0.25, travel: 1.5, hold: 0.5 },
    },
    {
        id: "short",
        label: "Short",
        hint: "A quick lift with a brief pause on either side",
        values: { lead: 0.1, travel: 0.7, hold: 0.2 },
    },
    {
        id: "cinematic",
        label: "Cinematic",
        hint: "A slow peel and a long hold on the reveal",
        values: { lead: 0.5, travel: 2.6, hold: 1 },
    },
]

export const PEEL_CONTROLS: ControlGroup[] = [
    {
        id: "sheet",
        title: "Sheet",
        hint: "the top layer lifts off the one underneath",
        open: true,
        controls: [
            {
                kind: "select",
                path: "corner",
                label: "Lifts from",
                options: ["top-right", "top-left", "bottom-right", "bottom-left"],
            },
            { kind: "number", path: "curl", label: "Curl", min: 0, max: 1, step: 0.05 },
        ],
    },
    {
        id: "timing",
        title: "Timing",
        hint: "scroll per phase, in stage heights",
        open: true,
        controls: [
            { kind: "number", path: "lead", label: "Before the peel", min: 0, max: 3, step: 0.05 },
            { kind: "number", path: "travel", label: "Peel length", min: 0.2, max: 5, step: 0.1 },
            { kind: "number", path: "hold", label: "Hold the reveal", min: 0, max: 3, step: 0.05 },
        ],
    },
]

export const TIDE_DEFAULTS = {
    edge: "all",
    amplitude: 12,
    wavelength: 140,
    speed: 1,
    paused: false,
    stroke: null as string | null,
}

export const TIDE_CONTROLS: ControlGroup[] = [
    {
        id: "contour",
        title: "Contour",
        hint: "the edge of the box itself moves",
        open: true,
        controls: [
            {
                kind: "select",
                path: "edge",
                label: "Edge (card)",
                options: ["all", "top", "bottom", "left", "right", "x", "y"],
            },
            {
                kind: "number",
                path: "amplitude",
                label: "Amplitude",
                min: 0,
                max: 40,
                step: 1,
                unit: "px",
            },
            {
                kind: "number",
                path: "wavelength",
                label: "Wavelength",
                min: 40,
                max: 400,
                step: 10,
                unit: "px",
            },
            { kind: "number", path: "speed", label: "Speed", min: 0, max: 4, step: 0.1 },
            { kind: "boolean", path: "paused", label: "Paused" },
            { kind: "colorNullable", path: "stroke", label: "Stroke" },
        ],
    },
]

export const GANTRY_DEFAULTS = {
    itemWidth: "320px",
    gap: "24px",
    pace: 0.7,
    transition: 0.55,
    hold: 0.4,
    easing: "smooth",
    lean: 6,
}

export const GANTRY_PRESETS = [
    {
        id: "normal",
        label: "Normal",
        hint: "Each card rests long enough to read",
        values: { pace: 0.7, transition: 0.55, hold: 0.4 },
    },
    {
        id: "short",
        label: "Short",
        hint: "Little scroll per card, mostly moving",
        values: { pace: 0.4, transition: 0.8, hold: 0.15 },
    },
    {
        id: "cinematic",
        label: "Cinematic",
        hint: "Long rests, unhurried moves, a long hold at the end",
        values: { pace: 1.2, transition: 0.45, hold: 0.8 },
    },
]

export const GANTRY_CONTROLS: ControlGroup[] = [
    {
        id: "rail",
        title: "Rail",
        hint: "vertical scroll drives horizontal travel",
        open: true,
        controls: [
            {
                kind: "cssLength",
                path: "itemWidth",
                label: "Card width",
                min: 160,
                max: 520,
                step: 10,
                unit: "px",
            },
            { kind: "cssLength", path: "gap", label: "Gap", min: 0, max: 64, step: 4, unit: "px" },
            { kind: "number", path: "lean", label: "Lean", min: 0, max: 24, step: 1, unit: "°" },
        ],
    },
    {
        id: "timing",
        title: "Timing",
        hint: "how the scroll is shared between rests and moves",
        open: true,
        controls: [
            {
                kind: "number",
                path: "pace",
                label: "Scroll per card",
                min: 0.2,
                max: 3,
                step: 0.05,
            },
            {
                kind: "number",
                path: "transition",
                label: "Share spent moving",
                min: 0.1,
                max: 1,
                step: 0.05,
            },
            {
                kind: "number",
                path: "hold",
                label: "Hold the last card",
                min: 0,
                max: 2,
                step: 0.05,
            },
            { kind: "select", path: "easing", label: "Easing", options: ["smooth", "linear"] },
        ],
    },
]

export const PALIMPSEST_DEFAULTS = {
    text: "Palimpsest",
    layers: 4,
    spread: 26,
    rotation: 4,
    trigger: "pointer",
    seed: 6,
}

export const PALIMPSEST_CONTROLS: ControlGroup[] = [
    {
        id: "layers",
        title: "Layers",
        hint: "the word comes apart into the drafts underneath it",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 18 },
            { kind: "number", path: "layers", label: "Layers", min: 1, max: 8, step: 1 },
            {
                kind: "number",
                path: "spread",
                label: "Spread",
                min: 0,
                max: 90,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "rotation",
                label: "Rotation",
                min: 0,
                max: 20,
                step: 1,
                unit: "°",
            },
            { kind: "select", path: "trigger", label: "Trigger", options: ["pointer", "always"] },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 40, step: 1 },
        ],
    },
]

export const QUIVER_DEFAULTS = {
    text: "Quiver",
    lift: 18,
    width: 0.22,
    twist: 12,
    ambient: true,
}

export const QUIVER_CONTROLS: ControlGroup[] = [
    {
        id: "wave",
        title: "Wave",
        hint: "a crest that follows the pointer along the line",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 18 },
            { kind: "number", path: "lift", label: "Lift", min: 0, max: 60, step: 2, unit: "px" },
            { kind: "number", path: "width", label: "Width", min: 0.05, max: 0.8, step: 0.01 },
            { kind: "number", path: "twist", label: "Twist", min: 0, max: 40, step: 1, unit: "°" },
            { kind: "boolean", path: "ambient", label: "Keep moving on its own" },
        ],
    },
]

export const INK_DEFAULTS = {
    text: "Ink",
    color: "#1b2a4a",
    paper: "#f4eee0",
    bleed: 0.5,
    feather: 0.6,
    pigment: 0.7,
    rim: 0.6,
    duration: 2.6,
    repeat: 0,
    interactive: true,
    nib: 6,
    seed: 12,
}

export const INK_CONTROLS: ControlGroup[] = [
    {
        id: "ink",
        title: "Ink",
        hint: "water carries the dye out along the fibres; the drying edge darkens",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 12 },
            { kind: "number", path: "bleed", label: "Bleed", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "feather", label: "Feather", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "pigment", label: "Pigment", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "rim", label: "Tide line", min: 0, max: 1, step: 0.05 },
            { kind: "color", path: "color", label: "Ink" },
            { kind: "color", path: "paper", label: "Paper" },
        ],
    },
    {
        id: "soak",
        title: "Soak",
        hint: "drag on the paper to write with the nib",
        open: true,
        controls: [
            {
                kind: "number",
                path: "duration",
                label: "Soak",
                min: 0.4,
                max: 8,
                step: 0.2,
                unit: "s",
            },
            {
                kind: "number",
                path: "repeat",
                label: "Repeat",
                min: 0,
                max: 20,
                step: 1,
                unit: "s",
            },
            { kind: "boolean", path: "interactive", label: "Draw with the pointer" },
            { kind: "number", path: "nib", label: "Nib", min: 2, max: 20, step: 1, unit: "px" },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 40, step: 1 },
        ],
    },
]

export const PHOSPHOR_DEFAULTS = {
    text: "PHOSPHOR",
    color: "#54ffbe",
    bloom: 0.6,
    scanline: 4,
    fringe: 2,
    jitter: 0.4,
}

export const PHOSPHOR_CONTROLS: ControlGroup[] = [
    {
        id: "tube",
        title: "Tube",
        hint: "one gun per channel, and a mask in front of them",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 18 },
            { kind: "number", path: "bloom", label: "Bloom", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "scanline",
                label: "Scanline",
                min: 0,
                max: 16,
                step: 1,
                unit: "px",
            },
            {
                kind: "number",
                path: "fringe",
                label: "Fringe",
                min: 0,
                max: 10,
                step: 0.5,
                unit: "px",
            },
            { kind: "number", path: "jitter", label: "Jitter", min: 0, max: 1, step: 0.05 },
            { kind: "color", path: "color", label: "Phosphor" },
        ],
    },
]

export const LENTICULAR_DEFAULTS = {
    strips: 46,
    tilt: 7,
    sheen: 0.5,
    radius: 16,
}

export const LENTICULAR_CONTROLS: ControlGroup[] = [
    {
        id: "print",
        title: "Print",
        hint: "move across it and the picture underneath takes over",
        open: true,
        controls: [
            { kind: "number", path: "strips", label: "Strips", min: 10, max: 120, step: 2 },
            { kind: "number", path: "tilt", label: "Tilt", min: 0, max: 20, step: 1, unit: "°" },
            { kind: "number", path: "sheen", label: "Sheen", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 48,
                step: 2,
                unit: "px",
            },
        ],
    },
]

export const ANAGLYPH_DEFAULTS = {
    mode: "converge",
    separation: 14,
    depth: 0.4,
    radius: 14,
}

export const ANAGLYPH_CONTROLS: ControlGroup[] = [
    {
        id: "eyes",
        title: "Eyes",
        hint: "converge pulls the channels together under the pointer",
        open: true,
        controls: [
            { kind: "select", path: "mode", label: "Mode", options: ["converge", "parallax"] },
            {
                kind: "number",
                path: "separation",
                label: "Separation",
                min: 0,
                max: 60,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "depth", label: "Depth", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 48,
                step: 2,
                unit: "px",
            },
        ],
    },
]

export const CONTACT_DEFAULTS = {
    defaultFrame: 0,
    strip: true,
    radius: 14,
}

export const CONTACT_CONTROLS: ControlGroup[] = [
    {
        id: "sheet",
        title: "Sheet",
        hint: "scrub across the plate, or use the arrow keys",
        open: true,
        controls: [
            { kind: "number", path: "defaultFrame", label: "Rest frame", min: 0, max: 7, step: 1 },
            { kind: "boolean", path: "strip", label: "Show the film strip" },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 48,
                step: 2,
                unit: "px",
            },
        ],
    },
]

export const EMULSION_DEFAULTS = {
    halation: 0.45,
    grain: 0.3,
    warmth: 0.25,
    leak: 0.3,
    fade: 0.18,
    radius: 14,
    seed: 4,
}

export const EMULSION_CONTROLS: ControlGroup[] = [
    {
        id: "stock",
        title: "Stock",
        hint: "halation, grain and a leak across one corner",
        open: true,
        controls: [
            { kind: "number", path: "halation", label: "Halation", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "grain", label: "Grain", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "warmth", label: "Warmth", min: -1, max: 1, step: 0.05 },
            { kind: "number", path: "leak", label: "Leak", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "fade", label: "Fade", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 48,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 40, step: 1 },
        ],
    },
]

export const QUARTZ_DEFAULTS = {
    intensity: 0.35,
    scale: 128,
    speed: 1,
    colour: 0,
    blend: "soft-light",
    seed: 1,
}

export const QUARTZ_CONTROLS: ControlGroup[] = [
    {
        id: "grain",
        title: "Grain",
        hint: "one tile, painted once and repeated by CSS",
        open: true,
        controls: [
            { kind: "number", path: "intensity", label: "Intensity", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "scale",
                label: "Tile",
                min: 32,
                max: 256,
                step: 16,
                unit: "px",
            },
            { kind: "number", path: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1 },
            { kind: "number", path: "colour", label: "Colour", min: 0, max: 1, step: 0.05 },
            {
                kind: "select",
                path: "blend",
                label: "Blend",
                options: ["soft-light", "overlay", "screen", "multiply"],
            },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 40, step: 1 },
        ],
    },
]

const NIMBUS_KNOBS = [
    "motion",
    "parallax",
    "density",
    "lighting",
    "grain",
    "scrim",
    "intensity",
    "speed",
] as const

function nimbusKnobs(preset: NimbusPreset): Record<string, unknown> {
    const look = NIMBUS_PRESETS[preset]
    return Object.fromEntries(NIMBUS_KNOBS.map((knob) => [knob, look[knob]]))
}

export const NIMBUS_DEFAULTS = {
    preset: "calm",
    ...nimbusKnobs("calm"),
    paletteName: "preset",
    accent: null as string | null,
    seed: 9,
}

export const NIMBUS_PALETTES: Record<string, string[]> = {
    aurora: ["#3b1d6e", "#0e4f6b", "#7a1f5c", "#123a7a"],
    ember: ["#5a1206", "#7d2a08", "#2c0a3a", "#8a3b12"],
    tide: ["#04303f", "#0a5a5a", "#123a7a", "#0e6f5f"],
    ash: ["#1b1b22", "#2a2a35", "#101018", "#33333f"],
}

const NIMBUS_HINTS: Record<NimbusPreset, string> = {
    calm: "One mood, a slow camera and a little dust",
    drift: "Three moods crossfading, deeper parallax, faint light",
    cinematic: "Warm and cold scenes, light rays and sweeps, a wide frame",
    pixel: "Low-res dithered fog, crisp motes, a stepped twelve frames a second",
}

export const NIMBUS_DOC_PRESETS = NIMBUS_PRESET_NAMES.map((preset) => ({
    id: preset,
    label: preset.charAt(0).toUpperCase() + preset.slice(1),
    hint: NIMBUS_HINTS[preset],
    values: { preset, ...nimbusKnobs(preset) },
}))

export const NIMBUS_CONTROLS: ControlGroup[] = [
    {
        id: "scene",
        title: "Scene",
        hint: "the preset picks the moods, the frame and the resolution; the knobs below override it",
        open: true,
        controls: [
            { kind: "select", path: "preset", label: "Preset", options: NIMBUS_PRESET_NAMES },
            {
                kind: "select",
                path: "paletteName",
                label: "Fog colours",
                options: ["preset", "aurora", "ember", "tide", "ash"],
            },
            { kind: "colorNullable", path: "accent", label: "Accent" },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 40, step: 1 },
        ],
    },
    {
        id: "life",
        title: "Life",
        hint: "all 0 to 1; the field is drawn small and stretched up, so none of it is expensive",
        open: true,
        controls: [
            { kind: "number", path: "motion", label: "Motion", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "parallax", label: "Parallax", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "density", label: "Dust", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "lighting", label: "Lighting", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "speed", label: "Speed", min: 0.1, max: 3, step: 0.1 },
        ],
    },
    {
        id: "contrast",
        title: "Contrast",
        hint: "for the content on top",
        open: false,
        controls: [
            { kind: "number", path: "intensity", label: "Fog", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "scrim", label: "Scrim", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "grain", label: "Grain", min: 0, max: 1, step: 0.05 },
        ],
    },
]

export const MENISCUS_DEFAULTS = {
    value: 0.62,
    swell: 0.5,
    speed: 1,
    shape: "circle",
    size: 132,
    color: "#2f8bff",
    colorTo: "#41e0c8",
    showValue: true,
}

export const MENISCUS_CONTROLS: ControlGroup[] = [
    {
        id: "vessel",
        title: "Vessel",
        hint: "leave the value out for an indeterminate fill",
        open: true,
        controls: [
            { kind: "number", path: "value", label: "Value", min: 0, max: 1, step: 0.01 },
            { kind: "number", path: "swell", label: "Swell", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1 },
            {
                kind: "select",
                path: "shape",
                label: "Shape",
                options: ["circle", "pill", "square"],
            },
            { kind: "number", path: "size", label: "Size", min: 64, max: 260, step: 4, unit: "px" },
            { kind: "color", path: "color", label: "Liquid" },
            { kind: "colorNullable", path: "colorTo", label: "Gradient to" },
            { kind: "boolean", path: "showValue", label: "Show the number" },
        ],
    },
]
