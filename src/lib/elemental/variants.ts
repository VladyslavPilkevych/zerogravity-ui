// Frost and water are parked until their bodies are worked out; everything
// they need is still here, commented, so bringing them back is uncommenting.
export type ElementalVariant = "electric" | "fire" // | "frost" | "water"

export const ELEMENTAL_VARIANTS: readonly ElementalVariant[] = [
    "electric",
    "fire",
    // "frost",
    // "water",
]

export interface VariantSpec {
    /** Default accent, overridable through the `color` prop. */
    accent: string
    /** Room the effect needs outside the box, in px. */
    bleed: number
    /** Stroke width of the bright core line, in px. */
    line: number
    /** Stroke width of the soft outer line, in px. */
    halo: number
    /** Seconds for one trip of a travelling arc around the perimeter. */
    lap: number
    /** Seconds for one crackle cycle. */
    beat: number
    /** How far the turbulence bends the line, in px. */
    bend: number
    /** Turbulence field. The seed is fixed per variant, so nothing is random. */
    noise: {
        kind: "turbulence" | "fractalNoise"
        x: number
        y: number
        octaves: number
        seed: number
        blur: number
        /** Contrast boost around the neutral point; 1 leaves the field alone. */
        bite: number
        /**
         * How the field is shaped before it bends the line. `smooth` curves,
         * `facet` breaks it into flat plates, `bolt` sharpens first and then
         * breaks, which is what turns a wobble into straight angular runs.
         */
        shape: "smooth" | "facet" | "bolt"
        /** Quantisation steps for `facet` and `bolt`. */
        steps?: number
    }
    /** How far the discharge hops through the field on each snap, in px. */
    hop?: number
    /**
     * A body of the element: flames reaching out of the top edge, water pooled
     * against the bottom, an ice shelf grown up from it. One displaced
     * silhouette, anchored to an edge, shaped by its own field.
     */
    sheet?: {
        /** Outside the box, or inside it over the content. */
        face: "out" | "in"
        from: "top" | "bottom"
        /** How far it reaches past the edge it grows from, in px. */
        reach: number
        /** How far it hangs over the sides, in px. */
        spill: number
        /** Where the lit crest ends and the body begins, 0 to 1. */
        crest: number
        /** Overlapping copies at staggered phases, for depth. */
        layers: number
        /** Thin the far end out, for tips that burn away into nothing. */
        fade: boolean
        /** How deeply the field cuts the silhouette, in px. */
        bend: number
        x: number
        y: number
        octaves: number
        seed: number
        /** Sideways share of the bend; 0 keeps the motion purely vertical. */
        sway: number
        bite: number
        shape: "smooth" | "facet" | "bolt"
        steps?: number
    }
    /** Particles drifting over the content, rather than around the box. */
    bitsInside?: boolean
    /** A wash of the accent over everything inside the border. */
    wash?: boolean
    /** Travelling arc dashes, in hundredths of the perimeter. */
    arc: { dash: number; count: number }
    /** Decorative particles, when the variant has them. */
    bits: number
}

/**
 * One entry per variant. Everything a variant needs to look right by default
 * lives here, so the component itself carries no per-variant branching.
 */
export const VARIANTS: Record<ElementalVariant, VariantSpec> = {
    electric: {
        accent: "#5ed7ff",
        bleed: 14,
        line: 1.4,
        halo: 6,
        lap: 2.6,
        beat: 1.05,
        bend: 11,
        hop: 64,
        noise: {
            kind: "fractalNoise",
            x: 0.017,
            y: 0.021,
            octaves: 1,
            seed: 17,
            blur: 0.5,
            bite: 1.7,
            shape: "bolt",
            steps: 7,
        },
        arc: { dash: 5, count: 3 },
        bits: 0,
    },
    fire: {
        accent: "#ff8a2b",
        bleed: 60,
        line: 2,
        halo: 9,
        lap: 5.5,
        beat: 1.5,
        bend: 13,
        noise: {
            kind: "fractalNoise",
            x: 0.016,
            y: 0.038,
            octaves: 3,
            seed: 5,
            blur: 0,
            bite: 1.4,
            shape: "smooth",
        },
        arc: { dash: 14, count: 2 },
        bits: 9,
        sheet: {
            face: "out",
            from: "top",
            reach: 58,
            spill: 12,
            crest: 0.42,
            layers: 3,
            fade: true,
            bend: 54,
            x: 0.05,
            y: 0.004,
            octaves: 2,
            seed: 11,
            sway: 0.22,
            bite: 1.8,
            shape: "smooth",
        },
    },
    // frost: {
    //     accent: "#a5dcff",
    //     bleed: 13,
    //     line: 1.3,
    //     halo: 4,
    //     lap: 9,
    //     beat: 5.5,
    //     bend: 7,
    //     noise: {
    //         kind: "fractalNoise",
    //         x: 0.038,
    //         y: 0.038,
    //         octaves: 2,
    //         seed: 41,
    //         blur: 0,
    //         bite: 2.1,
    //         shape: "facet",
    //         steps: 5,
    //     },
    //     arc: { dash: 22, count: 1 },
    //     bits: 13,
    //     bitsInside: true,
    //     wash: true,
    //     sheet: {
    //         face: "in",
    //         from: "bottom",
    //         reach: 62,
    //         spill: 84,
    //         crest: 0.1,
    //         layers: 2,
    //         fade: false,
    //         bend: 40,
    //         x: 0.013,
    //         y: 0.006,
    //         octaves: 1,
    //         seed: 47,
    //         sway: 0.3,
    //         bite: 1.9,
    //         shape: "bolt",
    //         steps: 6,
    //     },
    // },
    // water: {
    //     accent: "#3fb6e8",
    //     bleed: 15,
    //     line: 2.4,
    //     halo: 8,
    //     lap: 7,
    //     beat: 4,
    //     bend: 11,
    //     noise: {
    //         kind: "fractalNoise",
    //         x: 0.011,
    //         y: 0.02,
    //         octaves: 2,
    //         seed: 29,
    //         blur: 1.6,
    //         bite: 1.2,
    //         shape: "smooth",
    //     },
    //     arc: { dash: 30, count: 2 },
    //     bits: 4,
    //     sheet: {
    //         face: "in",
    //         from: "bottom",
    //         reach: 70,
    //         spill: 96,
    //         crest: 0.07,
    //         layers: 3,
    //         fade: false,
    //         bend: 26,
    //         x: 0.011,
    //         y: 0.006,
    //         octaves: 1,
    //         seed: 23,
    //         sway: 0.12,
    //         bite: 1.5,
    //         shape: "smooth",
    //     },
    // },
}

export function specFor(variant: ElementalVariant): VariantSpec {
    return VARIANTS[variant] ?? VARIANTS.electric
}

export function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}
