"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import type { PreviewApi } from "./useDocsConfig"

/**
 * One chunk per component, so a docs page only downloads the demo it shows.
 * Keys match `slug` in the registry.
 */
export const PREVIEWS: Record<string, ComponentType<PreviewApi>> = {
    antigravity: dynamic(() =>
        import("@/playground/previews/AntigravityPreview").then((m) => m.AntigravityPreview),
    ),
    aperture: dynamic(() =>
        import("@/playground/previews/AperturePreview").then((m) => m.AperturePreview),
    ),
    diorama: dynamic(() =>
        import("@/playground/previews/DioramaPreview").then((m) => m.DioramaPreview),
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
