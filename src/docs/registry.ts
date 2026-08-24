import { ANTIGRAVITY_PRESETS } from "@/lib/antigravity/presets"
import { ANTIGRAVITY_DEFAULTS } from "@/lib/antigravity/types"
import { ANTIGRAVITY_CONTROLS } from "@/playground/antigravity/schema"
import {
    APERTURE_CONTROLS,
    APERTURE_DEFAULTS,
    APERTURE_PRESETS,
    APERTURE_PRESET_VALUES,
} from "@/playground/aperture/schema"
import {
    DIORAMA_CONTROLS,
    DIORAMA_DEFAULTS,
    ELEMENTAL_CONTROLS,
    ELEMENTAL_DEFAULTS,
    FACET_CONTROLS,
    FACET_DEFAULTS,
    KERN_CONTROLS,
    KERN_DEFAULTS,
    LOADERS_CONTROLS,
    LOADERS_DEFAULTS,
    LODESTONE_CONTROLS,
    LODESTONE_DEFAULTS,
    LOUVRE_CONTROLS,
    LOUVRE_DEFAULTS,
    MEADOW_CONTROLS,
    MEADOW_DEFAULTS,
    OVERPRINT_CONTROLS,
    OVERPRINT_DEFAULTS,
    RASTER_CONTROLS,
    RASTER_DEFAULTS,
    RICOCHET_CONTROLS,
    RICOCHET_DEFAULTS,
    TESSERA_CONTROLS,
    TESSERA_DEFAULTS,
    VELLUM_CONTROLS,
    VELLUM_DEFAULTS,
    WASH_CONTROLS,
    WASH_DEFAULTS,
} from "@/playground/experimental/schemas"
import {
    GRID_TRAIL_CONTROLS,
    GRID_TRAIL_DEMO_DEFAULTS,
    GRID_TRAIL_PRESETS,
    GRID_TRAIL_PRESET_VALUES,
} from "@/playground/grid-trail/schema"
import {
    REEL_CONTROLS,
    REEL_DEFAULTS,
    REEL_PRESETS,
    REEL_PRESET_VALUES,
} from "@/playground/reel/schema"
import {
    SCROLL_STACK_CONTROLS,
    SCROLL_STACK_DEFAULTS,
    SCROLL_STACK_PRESETS,
    SCROLL_STACK_PRESET_VALUES,
} from "@/playground/scroll-stack/schema"
import {
    SPLIT_FLAP_CONTROLS,
    SPLIT_FLAP_DEFAULTS,
    SPLIT_FLAP_PRESETS,
    SPLIT_FLAP_PRESET_VALUES,
} from "@/playground/split-flap/schema"
import {
    STENCIL_CONTROLS,
    STENCIL_DEFAULTS,
    STENCIL_PRESETS,
    STENCIL_PRESET_VALUES,
} from "@/playground/stencil/schema"
import {
    TRAILING_CURSOR_CONTROLS,
    TRAILING_CURSOR_DEFAULTS,
    TRAILING_CURSOR_PRESETS,
    TRAILING_CURSOR_PRESET_VALUES,
} from "@/playground/trailing-cursor/schema"
import type { PanelPreset } from "@/playground/panel/types"

import type { DocCategory, DocEntry, DocPreset } from "./types"

/** Bridges the older `PanelPreset[]` + values map onto one preset shape. */
function presetsFrom(
    list: PanelPreset[],
    values: Record<string, Record<string, unknown>>,
): DocPreset[] {
    return list.map((preset) => ({
        id: preset.id,
        label: preset.label,
        hint: preset.hint,
        values: values[preset.id] ?? {},
    }))
}

export const REPOSITORY_URL = "https://github.com/VladyslavPilkevych/zerogravity-ui"

export const COMPONENTS: DocEntry[] = [
    {
        slug: "antigravity",
        name: "Antigravity",
        description: "A particle field that flows around the cursor and settles into formations.",
        category: "Pointer",
        status: "stable",
        dependencies: [],
        tags: ["particles", "canvas", "cursor", "hero"],
        defaults: ANTIGRAVITY_DEFAULTS as unknown as Record<string, unknown>,
        controls: ANTIGRAVITY_CONTROLS,
        presets: ANTIGRAVITY_PRESETS.map((preset) => ({
            id: preset.id,
            label: preset.label,
            hint: preset.hint,
            values: preset.options as Record<string, unknown>,
        })),
        extraProps: [
            {
                name: "onStats",
                type: "(stats: AntigravityStats) => void",
                default: "—",
                description: "Frame statistics: fps, particles drawn, batches, ms per frame.",
            },
            {
                name: "ref",
                type: "Ref<AntigravityHandle>",
                default: "—",
                description: "Imperative handle exposing burst() and colorBurst().",
            },
        ],
        preview: { minHeight: 520, bleed: true, wide: true },
    },
    {
        slug: "scroll-stack",
        name: "ScrollStack",
        description: "Full-height sections that slide over each other on scroll, and unstack back.",
        category: "Motion",
        status: "stable",
        dependencies: [],
        tags: ["scroll", "sticky", "cards", "sections"],
        defaults: SCROLL_STACK_DEFAULTS as unknown as Record<string, unknown>,
        controls: SCROLL_STACK_CONTROLS,
        presets: presetsFrom(
            SCROLL_STACK_PRESETS,
            SCROLL_STACK_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        omit: ["cards", "sizeMix"],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "One element per card. Each becomes a sticky section.",
            },
            {
                name: "heights",
                type: "string[]",
                default: "—",
                description: "Per-card height override, in place of the shared height.",
            },
            {
                name: "onActiveChange",
                type: "(index: number) => void",
                default: "—",
                description: "Fires when the front-most card changes.",
            },
        ],
        children: "<article>Card one</article>",
        preview: {
            port: true,
            minHeight: 560,
            wide: true,
            note: "Scaled down to fit the frame: short cards and a small peek, so the whole deck is visible at once. On a page you would use full-height sections and no peek.",
        },
    },
    {
        slug: "aperture",
        name: "Aperture",
        description: "A full-bleed panel that closes into a framed card as you scroll, or opens.",
        category: "Motion",
        status: "stable",
        dependencies: [],
        tags: ["scroll", "clip-path", "frame", "reveal"],
        defaults: APERTURE_DEFAULTS as unknown as Record<string, unknown>,
        controls: APERTURE_CONTROLS,
        presets: presetsFrom(
            APERTURE_PRESETS,
            APERTURE_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "The panel content. It never rescales — only the window changes.",
            },
            {
                name: "onProgress",
                type: "(progress: number) => void",
                default: "—",
                description: "Scroll progress from 0 to 1.",
            },
        ],
        children: "<div>Panel content</div>",
        preview: {
            port: true,
            minHeight: 560,
            wide: true,
            note: "Scaled down to fit the frame, and set to open so the panel starts as a card and grows to full bleed. On a page the pane is the viewport and it reads page scroll.",
        },
    },
    {
        slug: "elemental",
        name: "Elemental",
        description: "An animated edge that wraps any content in electricity or fire.",
        category: "Media",
        status: "stable",
        dependencies: [],
        tags: ["border", "glow", "card", "effect", "decorative", "wrapper"],
        defaults: ELEMENTAL_DEFAULTS,
        controls: ELEMENTAL_CONTROLS,
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Whatever the edge wraps. It stays fully interactive.",
            },
            {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Freeze the edge in its static state.",
            },
            {
                name: "respectReducedMotion",
                type: "boolean",
                default: "true",
                description: "Fall back to the static edge when the user asks for less motion.",
            },
        ],
        children: "<Card />",
        preview: { minHeight: 520 },
    },
    {
        slug: "louvre",
        name: "Louvre",
        description: "Sticky blinds whose slats rotate away to reveal the section behind them.",
        category: "Motion",
        status: "experimental",
        dependencies: [],
        tags: ["scroll", "blinds", "transition", "reveal"],
        defaults: LOUVRE_DEFAULTS,
        controls: LOUVRE_CONTROLS,
        extraProps: [
            {
                name: "front",
                type: "ReactNode",
                default: "—",
                description: "What the closed blinds show.",
            },
            {
                name: "back",
                type: "ReactNode",
                default: "—",
                description: "What is revealed once the slats open.",
            },
        ],
        preview: {
            port: true,
            minHeight: 560,
            wide: true,
            note: "Scaled down to fit the frame, so one full turn of the blinds is visible here. On a page the pane is the viewport and it reads page scroll.",
        },
    },
    {
        slug: "reel",
        name: "Reel",
        description: "A roulette-style carousel you can drag, flick, scroll sideways or step.",
        category: "Media",
        status: "stable",
        dependencies: [],
        tags: ["carousel", "slider", "coverflow", "drag"],
        defaults: REEL_DEFAULTS as unknown as Record<string, unknown>,
        controls: REEL_CONTROLS,
        presets: presetsFrom(
            REEL_PRESETS,
            REEL_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        omit: ["items"],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "One element per slide.",
            },
            {
                name: "index",
                type: "number",
                default: "—",
                description: "Controlled index of the centred slide.",
            },
            {
                name: "onIndexChange",
                type: "(index: number) => void",
                default: "—",
                description: "Fires when a different slide reaches the centre.",
            },
            {
                name: "label",
                type: "string",
                default: '"Carousel"',
                description: "Accessible name for the carousel region.",
            },
        ],
        children: "<article>Slide one</article>",
        preview: { minHeight: 520, wide: true },
    },
    {
        slug: "raster",
        name: "Raster",
        description: "One picture through four stylised abstractions: blur, glass, glyph, pixel.",
        category: "Media",
        status: "experimental",
        dependencies: [],
        tags: ["image", "canvas", "pixel", "ascii", "filter"],
        defaults: RASTER_DEFAULTS,
        controls: RASTER_CONTROLS,
        extraProps: [
            {
                name: "src",
                type: "string",
                default: "—",
                description: "Image URL or imported asset.",
            },
            {
                name: "alt",
                type: "string",
                default: "—",
                description: "Alternative text. Empty string if the image is decorative.",
            },
            {
                name: "aspectRatio",
                type: "string",
                default: '"16 / 9"',
                description: "CSS aspect ratio for the frame.",
            },
        ],
        preview: { minHeight: 460 },
    },
    {
        slug: "stencil",
        name: "Stencil",
        description: "Display type filled with stripes, checks, gradients, an image or video.",
        category: "Typography",
        status: "stable",
        dependencies: [],
        tags: ["type", "text", "pattern", "mask", "heading"],
        defaults: STENCIL_DEFAULTS as unknown as Record<string, unknown>,
        controls: STENCIL_CONTROLS,
        presets: presetsFrom(
            STENCIL_PRESETS,
            STENCIL_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        extraProps: [
            {
                name: "media",
                type: "string",
                default: "—",
                description: "Video URL used by the reveal hover mode.",
            },
        ],
        preview: { minHeight: 380 },
    },
    {
        slug: "split-flap",
        name: "SplitFlap",
        description:
            "An airport board that flips one character at a time: text, clock or countdown.",
        category: "Typography",
        status: "stable",
        dependencies: [],
        tags: ["board", "flip", "clock", "countdown", "text"],
        defaults: SPLIT_FLAP_DEFAULTS as unknown as Record<string, unknown>,
        controls: SPLIT_FLAP_CONTROLS,
        presets: presetsFrom(
            SPLIT_FLAP_PRESETS,
            SPLIT_FLAP_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        extraProps: [
            {
                name: "target",
                type: "Date | number",
                default: "—",
                description: "Deadline for countdown mode.",
            },
        ],
        preview: { minHeight: 340 },
    },
    {
        slug: "kern",
        name: "Kern",
        description: "Glyphs that open up, lift and gain weight as the pointer passes them.",
        category: "Typography",
        status: "stable",
        dependencies: [],
        tags: ["type", "text", "pointer", "variable font"],
        defaults: KERN_DEFAULTS,
        controls: KERN_CONTROLS,
        preview: { minHeight: 340 },
    },
    {
        slug: "overprint",
        name: "Overprint",
        description:
            "Colour separations that misregister on scroll and converge back into register.",
        category: "Typography",
        status: "stable",
        dependencies: [],
        tags: ["type", "text", "scroll", "print", "cmyk"],
        defaults: OVERPRINT_DEFAULTS,
        controls: OVERPRINT_CONTROLS,
        preview: {
            minHeight: 340,
            note: "Scrolling the page shifts the plates apart; they converge again when it stops.",
        },
    },
    {
        slug: "grid-trail",
        name: "GridTrail",
        description: "A pointer trail that lights cells on an invisible grid, then stops the loop.",
        category: "Pointer",
        status: "stable",
        dependencies: [],
        tags: ["cursor", "grid", "trail", "background"],
        defaults: GRID_TRAIL_DEMO_DEFAULTS as unknown as Record<string, unknown>,
        controls: GRID_TRAIL_CONTROLS,
        presets: presetsFrom(
            GRID_TRAIL_PRESETS,
            GRID_TRAIL_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        omit: ["scoped"],
        extraProps: [
            {
                name: "container",
                type: "RefObject<HTMLElement>",
                default: "—",
                description: "Scope the trail to one element instead of the viewport.",
            },
            {
                name: "zIndex",
                type: "number",
                default: "0",
                description: "Stacking level of the trail canvas.",
            },
        ],
        preview: { minHeight: 420, bleed: true, containFixed: true },
    },
    {
        slug: "trailing-cursor",
        name: "TrailingCursor",
        description: "A dot pinned to the pointer and a ring that lags, grows and recolours.",
        category: "Pointer",
        status: "stable",
        dependencies: [],
        tags: ["cursor", "pointer", "ring", "hover"],
        defaults: TRAILING_CURSOR_DEFAULTS as unknown as Record<string, unknown>,
        controls: TRAILING_CURSOR_CONTROLS,
        presets: presetsFrom(
            TRAILING_CURSOR_PRESETS,
            TRAILING_CURSOR_PRESET_VALUES as Record<string, Record<string, unknown>>,
        ),
        preview: { minHeight: 460, bleed: true, containFixed: true },
    },
    {
        slug: "lodestone",
        name: "Lodestone",
        description: "Magnetic buttons that lean toward the pointer but never overlap each other.",
        category: "Pointer",
        status: "stable",
        dependencies: [],
        tags: ["button", "magnet", "cursor", "cta"],
        defaults: LODESTONE_DEFAULTS,
        controls: LODESTONE_CONTROLS,
        omit: ["buttons", "spacing"],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Button label.",
            },
        ],
        children: "Get started",
        preview: { minHeight: 340 },
    },
    {
        slug: "vellum",
        name: "Vellum",
        description: "A sheet that leans toward the pointer, with an optional dent and sheen.",
        category: "Pointer",
        status: "stable",
        dependencies: [],
        tags: ["tilt", "card", "3d", "hover"],
        defaults: VELLUM_DEFAULTS,
        controls: VELLUM_CONTROLS,
        omit: ["highlight", "dent", "sheen", "sheenColor"],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Whatever sits on the sheet.",
            },
            {
                name: "highlight",
                type: "VellumHighlight | false",
                default: "false",
                description: "Dent and sheen settings, or false to switch both off.",
            },
        ],
        children: "<div>Card</div>",
        preview: { minHeight: 400 },
    },
    {
        slug: "diorama",
        name: "Diorama",
        description:
            "Depth layers that part as the pointer moves, letting you see past the foreground.",
        category: "Pointer",
        status: "stable",
        dependencies: [],
        tags: ["parallax", "depth", "layers", "pointer"],
        defaults: DIORAMA_DEFAULTS,
        controls: DIORAMA_CONTROLS,
        extraProps: [
            {
                name: "background",
                type: "ReactNode",
                default: "—",
                description: "The deepest layer, never blurred.",
            },
            {
                name: "planes",
                type: "DioramaPlane[]",
                default: "[]",
                description: "Foreground layers, each with its own content and depth.",
            },
        ],
        preview: { minHeight: 420 },
    },
    {
        slug: "facet",
        name: "Facet",
        description:
            "A faceted surface whose colour migrates across the slats instead of switching.",
        category: "Pointer",
        status: "experimental",
        dependencies: [],
        tags: ["background", "hero", "gradient", "ambient"],
        defaults: FACET_DEFAULTS,
        controls: FACET_CONTROLS,
        omit: ["paletteName"],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Content laid over the surface.",
            },
            {
                name: "palette",
                type: "string[]",
                default: "—",
                description: "Colours the ambient flow moves between.",
            },
        ],
        children: "<div>Hero copy</div>",
        preview: { minHeight: 460, bleed: true },
    },
    {
        slug: "wash",
        name: "Wash",
        description: "A new colour that spreads outward from wherever the surface was touched.",
        category: "Pointer",
        status: "experimental",
        dependencies: [],
        tags: ["background", "ripple", "colour", "click"],
        defaults: WASH_DEFAULTS,
        controls: WASH_CONTROLS,
        omit: ["paletteName"],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Content laid over the wash. Stays interactive.",
            },
            {
                name: "colors",
                type: "string[]",
                default: "—",
                description: "The cycle of colours to bloom through.",
            },
        ],
        children: "<div>Hero copy</div>",
        preview: { minHeight: 460, bleed: true },
    },
    {
        slug: "meadow",
        name: "Meadow",
        description:
            "A living pastel hero scene that drifts, bobs and flutters around your content.",
        category: "Scenes",
        status: "stable",
        dependencies: [],
        tags: ["hero", "illustration", "scene", "svg", "playful"],
        defaults: MEADOW_DEFAULTS,
        controls: MEADOW_CONTROLS,
        omit: [
            "sun",
            "clouds",
            "hills",
            "flowers",
            "balloon",
            "butterflies",
            "birds",
            "mascots",
            "stars",
            "comets",
            "planets",
            "rockets",
            "ufos",
        ],
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Content centred inside the scene.",
            },
            {
                name: "scene",
                type: "MeadowScene",
                default: "{}",
                description: "Per-element switches, for example { birds: false, flowers: false }.",
            },
        ],
        children: "<div>Hero copy</div>",
        preview: { minHeight: 520, bleed: true, wide: true },
    },
    {
        slug: "tessera",
        name: "Tessera",
        description:
            "A tiled route transition: tiles cover the viewport, the route swaps, they retreat.",
        category: "Scenes",
        status: "stable",
        tag: "TesseraProvider",
        dependencies: [],
        tags: ["route", "transition", "page", "tiles", "navigation"],
        defaults: TESSERA_DEFAULTS,
        controls: TESSERA_CONTROLS,
        extraProps: [
            {
                name: "children",
                type: "ReactNode",
                default: "—",
                description: "Your app. Navigation runs through useTessera().",
            },
        ],
        children: "<App />",
        preview: {
            minHeight: 440,
            bleed: true,
            containFixed: true,
            note: "The overlay is position: fixed in real use. It is held inside this frame so the docs stay usable.",
        },
    },
    {
        slug: "ricochet",
        name: "Ricochet",
        description:
            "Short text built from destructible pixel blocks, with breakout or shooter play.",
        category: "Scenes",
        status: "stable",
        dependencies: [],
        tags: ["404", "game", "pixel", "canvas", "arcade"],
        defaults: RICOCHET_DEFAULTS,
        controls: RICOCHET_CONTROLS,
        extraProps: [
            {
                name: "onClear",
                type: "() => void",
                default: "—",
                description: "Fires once, when the last block is destroyed.",
            },
            {
                name: "interactive",
                type: "boolean",
                default: "true",
                description: "Pointer, keyboard and focus handling.",
            },
            {
                name: "respectReducedMotion",
                type: "boolean",
                default: "true",
                description: "Render the text standing still when the user asks for less motion.",
            },
        ],
        preview: { minHeight: 480 },
    },
    {
        slug: "loaders",
        name: "Pixel loaders",
        description:
            "Four retro-digital loading states: a heart, blocks, a bar and a full-screen pulse.",
        category: "Feedback",
        status: "experimental",
        tag: "PixelHeart",
        dependencies: [],
        tags: ["loading", "spinner", "pixel", "progress", "skeleton"],
        defaults: LOADERS_DEFAULTS,
        controls: LOADERS_CONTROLS,
        omit: ["heartVariant", "blocksVariant", "determinate", "value"],
        extraProps: [
            {
                name: "variant",
                type: '"pulse" | "blink"',
                default: '"pulse"',
                description: "PixelHeart animation style.",
            },
            {
                name: "value",
                type: "number",
                default: "—",
                description: "PixelBar progress from 0 to 1. Omit for an indeterminate bar.",
            },
            {
                name: "label",
                type: "string",
                default: '"Loading"',
                description: "Announced by screen readers while the loader is visible.",
            },
        ],
        preview: { scroll: true, minHeight: 520, wide: true },
    },
]

export const COMPONENT_COUNT = COMPONENTS.length

/** The light list the sidebar needs, so schemas stay out of the client bundle. */
export function sidebarIndex() {
    return COMPONENTS.map((entry) => ({
        slug: entry.slug,
        name: entry.name,
        description: entry.description,
        category: entry.category,
        status: entry.status,
        tags: entry.tags,
    }))
}

export function findComponent(slug: string): DocEntry | undefined {
    return COMPONENTS.find((entry) => entry.slug === slug)
}

export function groupByCategory(
    entries: DocEntry[],
): { category: DocCategory; items: DocEntry[] }[] {
    const groups: { category: DocCategory; items: DocEntry[] }[] = []

    for (const entry of entries) {
        const found = groups.find((group) => group.category === entry.category)
        if (found) found.items.push(entry)
        else groups.push({ category: entry.category, items: [entry] })
    }

    return groups
}
