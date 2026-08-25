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
