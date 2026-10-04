"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import type { PreviewApi } from "./useDocsConfig"

/**
 * One chunk per component, so a docs page only downloads the demo it shows.
 * Keys match `slug` in the registry.
 */
export const PREVIEWS: Record<string, ComponentType<PreviewApi>> = {
    anaglyph: dynamic(() =>
        import("@/playground/previews/AnaglyphPreview").then((m) => m.AnaglyphPreview),
    ),
    chroma: dynamic(() =>
        import("@/playground/previews/ChromaPreview").then((m) => m.ChromaPreview),
    ),
    concertina: dynamic(() =>
        import("@/playground/previews/ConcertinaPreview").then((m) => m.ConcertinaPreview),
    ),
    contact: dynamic(() =>
        import("@/playground/previews/ContactPreview").then((m) => m.ContactPreview),
    ),
    emulsion: dynamic(() =>
        import("@/playground/previews/EmulsionPreview").then((m) => m.EmulsionPreview),
    ),
    gantry: dynamic(() =>
        import("@/playground/previews/GantryPreview").then((m) => m.GantryPreview),
    ),
    gnomon: dynamic(() =>
        import("@/playground/previews/GnomonPreview").then((m) => m.GnomonPreview),
    ),
    ink: dynamic(() => import("@/playground/previews/InkPreview").then((m) => m.InkPreview)),
    lattice: dynamic(() =>
        import("@/playground/previews/LatticePreview").then((m) => m.LatticePreview),
    ),
    lenticular: dynamic(() =>
        import("@/playground/previews/LenticularPreview").then((m) => m.LenticularPreview),
    ),
    meniscus: dynamic(() =>
        import("@/playground/previews/MeniscusPreview").then((m) => m.MeniscusPreview),
    ),
    nimbus: dynamic(() =>
        import("@/playground/previews/NimbusPreview").then((m) => m.NimbusPreview),
    ),
    palimpsest: dynamic(() =>
        import("@/playground/previews/PalimpsestPreview").then((m) => m.PalimpsestPreview),
    ),
    peel: dynamic(() => import("@/playground/previews/PeelPreview").then((m) => m.PeelPreview)),
    phosphor: dynamic(() =>
        import("@/playground/previews/PhosphorPreview").then((m) => m.PhosphorPreview),
    ),
    prism: dynamic(() => import("@/playground/previews/PrismPreview").then((m) => m.PrismPreview)),
    quartz: dynamic(() =>
        import("@/playground/previews/QuartzPreview").then((m) => m.QuartzPreview),
    ),
    quiver: dynamic(() =>
        import("@/playground/previews/QuiverPreview").then((m) => m.QuiverPreview),
    ),
    sonar: dynamic(() => import("@/playground/previews/SonarPreview").then((m) => m.SonarPreview)),
    tide: dynamic(() => import("@/playground/previews/TidePreview").then((m) => m.TidePreview)),
    drench: dynamic(() =>
        import("@/playground/previews/DrenchPreview").then((m) => m.DrenchPreview),
    ),
    eclipse: dynamic(() =>
        import("@/playground/previews/EclipsePreview").then((m) => m.EclipsePreview),
    ),
    gaze: dynamic(() => import("@/playground/previews/GazePreview").then((m) => m.GazePreview)),
    perseid: dynamic(() =>
        import("@/playground/previews/PerseidPreview").then((m) => m.PerseidPreview),
    ),
    undertow: dynamic(() =>
        import("@/playground/previews/UndertowPreview").then((m) => m.UndertowPreview),
    ),
    wake: dynamic(() => import("@/playground/previews/WakePreview").then((m) => m.WakePreview)),
    antigravity: dynamic(() =>
        import("@/playground/previews/AntigravityPreview").then((m) => m.AntigravityPreview),
    ),
    aperture: dynamic(() =>
        import("@/playground/previews/AperturePreview").then((m) => m.AperturePreview),
    ),
    diorama: dynamic(() =>
        import("@/playground/previews/DioramaPreview").then((m) => m.DioramaPreview),
    ),
    elemental: dynamic(() =>
        import("@/playground/previews/ElementalPreview").then((m) => m.ElementalPreview),
    ),
    facet: dynamic(() => import("@/playground/previews/FacetPreview").then((m) => m.FacetPreview)),
    "grid-trail": dynamic(() =>
        import("@/playground/previews/GridTrailPreview").then((m) => m.GridTrailPreview),
    ),
    kern: dynamic(() => import("@/playground/previews/KernPreview").then((m) => m.KernPreview)),
    loaders: dynamic(() =>
        import("@/playground/previews/LoadersPreview").then((m) => m.LoadersPreview),
    ),
    lodestone: dynamic(() =>
        import("@/playground/previews/LodestonePreview").then((m) => m.LodestonePreview),
    ),
    louvre: dynamic(() =>
        import("@/playground/previews/LouvrePreview").then((m) => m.LouvrePreview),
    ),
    meadow: dynamic(() =>
        import("@/playground/previews/MeadowPreview").then((m) => m.MeadowPreview),
    ),
    overprint: dynamic(() =>
        import("@/playground/previews/OverprintPreview").then((m) => m.OverprintPreview),
    ),
    raster: dynamic(() =>
        import("@/playground/previews/RasterPreview").then((m) => m.RasterPreview),
    ),
    reel: dynamic(() => import("@/playground/previews/ReelPreview").then((m) => m.ReelPreview)),
    ricochet: dynamic(() =>
        import("@/playground/previews/RicochetPreview").then((m) => m.RicochetPreview),
    ),
    "scroll-stack": dynamic(() =>
        import("@/playground/previews/ScrollStackPreview").then((m) => m.ScrollStackPreview),
    ),
    "split-flap": dynamic(() =>
        import("@/playground/previews/SplitFlapPreview").then((m) => m.SplitFlapPreview),
    ),
    stencil: dynamic(() =>
        import("@/playground/previews/StencilPreview").then((m) => m.StencilPreview),
    ),
    tessera: dynamic(() =>
        import("@/playground/previews/TesseraPreview").then((m) => m.TesseraPreview),
    ),
    "trailing-cursor": dynamic(() =>
        import("@/playground/previews/TrailingCursorPreview").then((m) => m.TrailingCursorPreview),
    ),
    vellum: dynamic(() =>
        import("@/playground/previews/VellumPreview").then((m) => m.VellumPreview),
    ),
    wash: dynamic(() => import("@/playground/previews/WashPreview").then((m) => m.WashPreview)),
}
