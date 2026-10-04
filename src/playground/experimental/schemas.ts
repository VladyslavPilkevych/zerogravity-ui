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
    scrollLength: 340,
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
                kind: "number",
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
    radius: 150,
    strength: 0.5,
    maxDisplacement: 30,
    minGap: 12,
    release: 0.16,
    lift: 0.05,
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
        hint: "optional dent and sheen",
        open: true,
        controls: [
            { kind: "boolean", path: "highlight", label: "Enabled" },
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

export const DIORAMA_DEFAULTS = { parallax: 46, blur: 7, perspective: 1200, ease: 0.11 }

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
    interval: 4000,
    duration: 1400,
    softness: 0.35,
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
                options: ["random", "row", "column", "reverse", "center"],
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
    mode: "highlight",
    radius: 0.26,
    strength: 0.6,
    speed: 1,
    color: "#cfe8ff",
}

export const WAKE_CONTROLS: ControlGroup[] = [
    {
        id: "surface",
        title: "Surface",
        hint: "highlight lays light on it, distortion bends it",
        open: true,
        controls: [
            {
                kind: "select",
                path: "mode",
                label: "Mode",
                options: ["highlight", "distortion"],
            },
            { kind: "number", path: "radius", label: "Radius", min: 0.08, max: 0.6, step: 0.02 },
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1 },
            { kind: "color", path: "color", label: "Light" },
        ],
    },
]

/* --------------------------------------------------------------- Drench */

export const DRENCH_DEFAULTS = {
    text: "ZERO",
    rain: 0.55,
    fall: 1,
    wetness: 0.6,
    evaporation: 0.35,
    outline: 0.045,
    color: "#9fd8ff",
}

export const DRENCH_CONTROLS: ControlGroup[] = [
    {
        id: "weather",
        title: "Weather",
        hint: "the word is always there; the rain is what finds it",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 12 },
            { kind: "number", path: "rain", label: "Rain", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "fall", label: "Fall speed", min: 0.2, max: 3, step: 0.1 },
            { kind: "number", path: "wetness", label: "Wetness", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "evaporation",
                label: "Evaporation",
                min: 0,
                max: 1,
                step: 0.05,
            },
            {
                kind: "number",
                path: "outline",
                label: "Outline",
                min: 0.01,
                max: 0.14,
                step: 0.005,
            },
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
    maxYaw: 26,
    maxPitch: 16,
    damping: 0.12,
    headDelay: 0.45,
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

export const PRISM_DEFAULTS = {
    tilt: 12,
    dispersion: 0.6,
    sheen: 0.7,
    radius: 20,
}

export const PRISM_CONTROLS: ControlGroup[] = [
    {
        id: "glass",
        title: "Glass",
        hint: "how the slab leans, and how hard it splits the light",
        open: true,
        controls: [
            { kind: "number", path: "tilt", label: "Tilt", min: 0, max: 24, step: 1, unit: "°" },
            { kind: "number", path: "dispersion", label: "Dispersion", min: 0, max: 1, step: 0.05 },
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
    split: 16,
    width: 26,
    linger: 0.7,
}

export const CHROMA_CONTROLS: ControlGroup[] = [
    {
        id: "trail",
        title: "Trail",
        hint: "the channels lag behind each other, and the lag is the effect",
        open: true,
        controls: [
            { kind: "number", path: "split", label: "Split", min: 0, max: 60, step: 2, unit: "px" },
            { kind: "number", path: "width", label: "Width", min: 4, max: 90, step: 2, unit: "px" },
            { kind: "number", path: "linger", label: "Linger", min: 0.1, max: 3, step: 0.1 },
        ],
    },
]

export const SONAR_DEFAULTS = {
    gap: 26,
    amplitude: 16,
    speed: 620,
    band: 90,
    color: "#8ab4ff",
    onHover: false,
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
            { kind: "boolean", path: "onHover", label: "Fire on hover too" },
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
    travel: 1,
    curl: 0.7,
}

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
            { kind: "number", path: "travel", label: "Travel", min: 0.3, max: 3, step: 0.1 },
            { kind: "number", path: "curl", label: "Curl", min: 0, max: 1, step: 0.05 },
        ],
    },
]

export const TIDE_DEFAULTS = {
    color: "#1d5cff",
    colorTo: "#12d0b4",
    height: 120,
    amplitude: 0.45,
    crests: 2,
    speed: 1,
    flip: false,
    layers: 2,
}

export const TIDE_CONTROLS: ControlGroup[] = [
    {
        id: "water",
        title: "Water",
        hint: "a separator that never sits still",
        open: true,
        controls: [
            {
                kind: "number",
                path: "height",
                label: "Height",
                min: 40,
                max: 260,
                step: 10,
                unit: "px",
            },
            { kind: "number", path: "amplitude", label: "Swell", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "crests", label: "Crests", min: 0.5, max: 6, step: 0.5 },
            { kind: "number", path: "speed", label: "Speed", min: 0.1, max: 3, step: 0.1 },
            { kind: "color", path: "color", label: "Water" },
            { kind: "colorNullable", path: "colorTo", label: "Gradient to" },
            { kind: "boolean", path: "flip", label: "Point it upward" },
        ],
    },
]

export const GANTRY_DEFAULTS = {
    itemWidth: "320px",
    gap: "24px",
    pace: 1,
    lean: 6,
}

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
            { kind: "number", path: "pace", label: "Pace", min: 0.3, max: 3, step: 0.1 },
            { kind: "number", path: "lean", label: "Lean", min: 0, max: 24, step: 1, unit: "°" },
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
    bleed: 0.5,
    duration: 2.6,
    feather: 0.6,
    repeat: 6,
    seed: 12,
}

export const INK_CONTROLS: ControlGroup[] = [
    {
        id: "paper",
        title: "Paper",
        hint: "ink wicking into fibres, not a fade-in",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 12 },
            { kind: "number", path: "bleed", label: "Bleed", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "feather", label: "Feather", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "duration", label: "Soak", min: 0.4, max: 8, step: 0.2 },
            { kind: "number", path: "repeat", label: "Repeat", min: 0, max: 20, step: 1 },
            { kind: "color", path: "color", label: "Ink" },
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

export const NIMBUS_DEFAULTS = {
    count: 6,
    speed: 1,
    intensity: 0.75,
    paletteName: "aurora",
    seed: 9,
}

export const NIMBUS_PALETTES: Record<string, string[]> = {
    aurora: ["#3b1d6e", "#0e4f6b", "#7a1f5c", "#123a7a"],
    ember: ["#5a1206", "#7d2a08", "#2c0a3a", "#8a3b12"],
    tide: ["#04303f", "#0a5a5a", "#123a7a", "#0e6f5f"],
    ash: ["#1b1b22", "#2a2a35", "#101018", "#33333f"],
}

export const NIMBUS_CONTROLS: ControlGroup[] = [
    {
        id: "fog",
        title: "Fog",
        hint: "drawn small and stretched back up, so the softness is free",
        open: true,
        controls: [
            { kind: "number", path: "count", label: "Bodies", min: 0, max: 12, step: 1 },
            { kind: "number", path: "speed", label: "Speed", min: 0.1, max: 3, step: 0.1 },
            { kind: "number", path: "intensity", label: "Intensity", min: 0, max: 1, step: 0.05 },
            {
                kind: "select",
                path: "paletteName",
                label: "Palette",
                options: ["aurora", "ember", "tide", "ash"],
            },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 40, step: 1 },
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
