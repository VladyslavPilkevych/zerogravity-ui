import type { DocPreset } from "@/docs/types"

import type { ControlGroup } from "../panel/types"

/* the docs start loud on purpose: the effect should be obvious before anything is touched */
export const PRISM_DEFAULTS = {
    strength: 1.1,
    facets: "pixel",
    pixel: 8,
    tilt: 14,
    depth: 18,
    dispersion: 0.8,
    sheen: 0.7,
    radius: 4,
}

export const PRISM_PRESETS: DocPreset[] = [
    {
        id: "strong",
        label: "Strong",
        hint: "the docs default",
        values: { ...PRISM_DEFAULTS },
    },
    {
        id: "subtle",
        label: "Subtle",
        hint: "a hairline of colour, for a card that should stay calm",
        values: { strength: 0.25, tilt: 8, depth: 8, dispersion: 0.6 },
    },
    {
        id: "dramatic",
        label: "Dramatic",
        hint: "full dispersion and a heavy slab",
        values: { strength: 1.9, tilt: 16, depth: 26, dispersion: 1, sheen: 0.9 },
    },
    {
        id: "deep",
        label: "3D",
        hint: "a steep lean and thick glass, so the coloured edge and the caustic behind it show",
        values: {
            strength: 1.2,
            tilt: 26,
            depth: 40,
            dispersion: 0.9,
            facets: "smooth",
            radius: 16,
        },
    },
]

export const PRISM_CONTROLS: ControlGroup[] = [
    {
        id: "optics",
        title: "Optics",
        hint: "how hard the glass bends and splits the light",
        open: true,
        controls: [
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 2, step: 0.05 },
            { kind: "number", path: "dispersion", label: "Dispersion", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "sheen", label: "Sheen", min: 0, max: 1, step: 0.05 },
        ],
    },
    {
        id: "glass",
        title: "Glass",
        hint: "the slab itself: how it leans and how thick it is",
        open: true,
        controls: [
            { kind: "number", path: "tilt", label: "Tilt", min: 0, max: 30, step: 1, unit: "°" },
            { kind: "number", path: "depth", label: "Depth", min: 0, max: 48, step: 1, unit: "px" },
            { kind: "select", path: "facets", label: "Facets", options: ["pixel", "smooth"] },
            { kind: "number", path: "pixel", label: "Cell", min: 4, max: 20, step: 1, unit: "px" },
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
