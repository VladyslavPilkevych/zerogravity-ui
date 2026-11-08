"use client"

import dynamic from "next/dynamic"
import { lazy, type ComponentType } from "react"

import type { PreviewApi } from "./useDocsConfig"

/**
 * One chunk per component, so a docs page only downloads the demo it shows.
 * Keys match `slug` in the registry.
 *
 * The preview itself is a plain `React.lazy`, rendered as the only child of
 * its frame. next/dynamic would put it second in a two-slot fragment, and when
 * the chunk suspends during hydration React replays that fiber without its
 * list position, so every `useId` inside the preview comes out different from
 * the server's.
 */
export const PREVIEWS: Record<string, ComponentType<PreviewApi>> = {
    calendar: lazy(() =>
        import("@/playground/previews/CalendarPreview").then((m) => ({
            default: m.CalendarPreview,
        })),
    ),
    checklist: lazy(() =>
        import("@/playground/previews/ChecklistPreview").then((m) => ({
            default: m.ChecklistPreview,
        })),
    ),
    clock: lazy(() =>
        import("@/playground/previews/ClockPreview").then((m) => ({ default: m.ClockPreview })),
    ),
    progress: lazy(() =>
        import("@/playground/previews/ProgressPreview").then((m) => ({
            default: m.ProgressPreview,
        })),
    ),
    task: lazy(() =>
        import("@/playground/previews/TaskPreview").then((m) => ({ default: m.TaskPreview })),
    ),
    ascender: lazy(() =>
        import("@/playground/previews/AscenderPreview").then((m) => ({
            default: m.AscenderPreview,
        })),
    ),
    detent: lazy(() =>
        import("@/playground/previews/DetentPreview").then((m) => ({ default: m.DetentPreview })),
    ),
    folio: lazy(() =>
        import("@/playground/previews/FolioPreview").then((m) => ({ default: m.FolioPreview })),
    ),
    frost: lazy(() =>
        import("@/playground/previews/FrostPreview").then((m) => ({ default: m.FrostPreview })),
    ),
    halo: lazy(() =>
        import("@/playground/previews/HaloPreview").then((m) => ({ default: m.HaloPreview })),
    ),
    sash: lazy(() =>
        import("@/playground/previews/SashPreview").then((m) => ({ default: m.SashPreview })),
    ),
    tether: lazy(() =>
        import("@/playground/previews/TetherPreview").then((m) => ({ default: m.TetherPreview })),
    ),
    anaglyph: lazy(() =>
        import("@/playground/previews/AnaglyphPreview").then((m) => ({
            default: m.AnaglyphPreview,
        })),
    ),
    bitmap: lazy(() =>
        import("@/playground/previews/BitmapPreview").then((m) => ({ default: m.BitmapPreview })),
    ),
    chroma: lazy(() =>
        import("@/playground/previews/ChromaPreview").then((m) => ({ default: m.ChromaPreview })),
    ),
    concertina: lazy(() =>
        import("@/playground/previews/ConcertinaPreview").then((m) => ({
            default: m.ConcertinaPreview,
        })),
    ),
    contact: lazy(() =>
        import("@/playground/previews/ContactPreview").then((m) => ({ default: m.ContactPreview })),
    ),
    emulsion: lazy(() =>
        import("@/playground/previews/EmulsionPreview").then((m) => ({
            default: m.EmulsionPreview,
        })),
    ),
    gantry: lazy(() =>
        import("@/playground/previews/GantryPreview").then((m) => ({ default: m.GantryPreview })),
    ),
    gnomon: lazy(() =>
        import("@/playground/previews/GnomonPreview").then((m) => ({ default: m.GnomonPreview })),
    ),
    ink: lazy(() =>
        import("@/playground/previews/InkPreview").then((m) => ({ default: m.InkPreview })),
    ),
    lattice: lazy(() =>
        import("@/playground/previews/LatticePreview").then((m) => ({ default: m.LatticePreview })),
    ),
    lenticular: lazy(() =>
        import("@/playground/previews/LenticularPreview").then((m) => ({
            default: m.LenticularPreview,
        })),
    ),
    meniscus: lazy(() =>
        import("@/playground/previews/MeniscusPreview").then((m) => ({
            default: m.MeniscusPreview,
        })),
    ),
    nimbus: lazy(() =>
        import("@/playground/previews/NimbusPreview").then((m) => ({ default: m.NimbusPreview })),
    ),
    palimpsest: lazy(() =>
        import("@/playground/previews/PalimpsestPreview").then((m) => ({
            default: m.PalimpsestPreview,
        })),
    ),
    peel: lazy(() =>
        import("@/playground/previews/PeelPreview").then((m) => ({ default: m.PeelPreview })),
    ),
    phosphor: lazy(() =>
        import("@/playground/previews/PhosphorPreview").then((m) => ({
            default: m.PhosphorPreview,
        })),
    ),
    prism: lazy(() =>
        import("@/playground/previews/PrismPreview").then((m) => ({ default: m.PrismPreview })),
    ),
    quartz: lazy(() =>
        import("@/playground/previews/QuartzPreview").then((m) => ({ default: m.QuartzPreview })),
    ),
    quiver: lazy(() =>
        import("@/playground/previews/QuiverPreview").then((m) => ({ default: m.QuiverPreview })),
    ),
    sonar: lazy(() =>
        import("@/playground/previews/SonarPreview").then((m) => ({ default: m.SonarPreview })),
    ),
    tide: lazy(() =>
        import("@/playground/previews/TidePreview").then((m) => ({ default: m.TidePreview })),
    ),
    drench: lazy(() =>
        import("@/playground/previews/DrenchPreview").then((m) => ({ default: m.DrenchPreview })),
    ),
    eclipse: lazy(() =>
        import("@/playground/previews/EclipsePreview").then((m) => ({ default: m.EclipsePreview })),
    ),
    gaze: lazy(() =>
        import("@/playground/previews/GazePreview").then((m) => ({ default: m.GazePreview })),
    ),
    perseid: lazy(() =>
        import("@/playground/previews/PerseidPreview").then((m) => ({ default: m.PerseidPreview })),
    ),
    undertow: lazy(() =>
        import("@/playground/previews/UndertowPreview").then((m) => ({
            default: m.UndertowPreview,
        })),
    ),
    wake: lazy(() =>
        import("@/playground/previews/WakePreview").then((m) => ({ default: m.WakePreview })),
    ),
    antigravity: lazy(() =>
        import("@/playground/previews/AntigravityPreview").then((m) => ({
            default: m.AntigravityPreview,
        })),
    ),
    aperture: lazy(() =>
        import("@/playground/previews/AperturePreview").then((m) => ({
            default: m.AperturePreview,
        })),
    ),
    diorama: lazy(() =>
        import("@/playground/previews/DioramaPreview").then((m) => ({ default: m.DioramaPreview })),
    ),
    elemental: lazy(() =>
        import("@/playground/previews/ElementalPreview").then((m) => ({
            default: m.ElementalPreview,
        })),
    ),
    facet: lazy(() =>
        import("@/playground/previews/FacetPreview").then((m) => ({ default: m.FacetPreview })),
    ),
    "grid-trail": lazy(() =>
        import("@/playground/previews/GridTrailPreview").then((m) => ({
            default: m.GridTrailPreview,
        })),
    ),
    kern: lazy(() =>
        import("@/playground/previews/KernPreview").then((m) => ({ default: m.KernPreview })),
    ),
    loaders: lazy(() =>
        import("@/playground/previews/LoadersPreview").then((m) => ({ default: m.LoadersPreview })),
    ),
    lodestone: lazy(() =>
        import("@/playground/previews/LodestonePreview").then((m) => ({
            default: m.LodestonePreview,
        })),
    ),
    louvre: lazy(() =>
        import("@/playground/previews/LouvrePreview").then((m) => ({ default: m.LouvrePreview })),
    ),
    meadow: lazy(() =>
        import("@/playground/previews/MeadowPreview").then((m) => ({ default: m.MeadowPreview })),
    ),
    overprint: lazy(() =>
        import("@/playground/previews/OverprintPreview").then((m) => ({
            default: m.OverprintPreview,
        })),
    ),
    raster: lazy(() =>
        import("@/playground/previews/RasterPreview").then((m) => ({ default: m.RasterPreview })),
    ),
    reel: lazy(() =>
        import("@/playground/previews/ReelPreview").then((m) => ({ default: m.ReelPreview })),
    ),
    ricochet: lazy(() =>
        import("@/playground/previews/RicochetPreview").then((m) => ({
            default: m.RicochetPreview,
        })),
    ),
    "scroll-stack": lazy(() =>
        import("@/playground/previews/ScrollStackPreview").then((m) => ({
            default: m.ScrollStackPreview,
        })),
    ),
    "split-flap": lazy(() =>
        import("@/playground/previews/SplitFlapPreview").then((m) => ({
            default: m.SplitFlapPreview,
        })),
    ),
    stencil: lazy(() =>
        import("@/playground/previews/StencilPreview").then((m) => ({ default: m.StencilPreview })),
    ),
    tessera: lazy(() =>
        import("@/playground/previews/TesseraPreview").then((m) => ({ default: m.TesseraPreview })),
    ),
    "trailing-cursor": lazy(() =>
        import("@/playground/previews/TrailingCursorPreview").then((m) => ({
            default: m.TrailingCursorPreview,
        })),
    ),
    vellum: lazy(() =>
        import("@/playground/previews/VellumPreview").then((m) => ({ default: m.VellumPreview })),
    ),
    bezel: lazy(() =>
        import("@/playground/previews/BezelPreview").then((m) => ({ default: m.BezelPreview })),
    ),
    dither: lazy(() =>
        import("@/playground/previews/DitherPreview").then((m) => ({ default: m.DitherPreview })),
    ),
    keycap: lazy(() =>
        import("@/playground/previews/KeycapPreview").then((m) => ({ default: m.KeycapPreview })),
    ),
    tag: lazy(() =>
        import("@/playground/previews/TagPreview").then((m) => ({ default: m.TagPreview })),
    ),
    seam: lazy(() =>
        import("@/playground/previews/SeamPreview").then((m) => ({ default: m.SeamPreview })),
    ),
    wash: lazy(() =>
        import("@/playground/previews/WashPreview").then((m) => ({ default: m.WashPreview })),
    ),
}

const Nothing = () => null

/**
 * The same chunks through next/dynamic, rendering nothing. On the server this
 * emits a preload link for the page's preview chunk, so the browser fetches it
 * alongside the page rather than once hydration has begun, and the page
 * hydrates as early as it did before. Nothing below it uses `useId`.
 */
export const PRELOADS: Record<string, ComponentType> = {
    calendar: dynamic(() => import("@/playground/previews/CalendarPreview").then(() => Nothing)),
    checklist: dynamic(() => import("@/playground/previews/ChecklistPreview").then(() => Nothing)),
    clock: dynamic(() => import("@/playground/previews/ClockPreview").then(() => Nothing)),
    progress: dynamic(() => import("@/playground/previews/ProgressPreview").then(() => Nothing)),
    task: dynamic(() => import("@/playground/previews/TaskPreview").then(() => Nothing)),
    ascender: dynamic(() => import("@/playground/previews/AscenderPreview").then(() => Nothing)),
    detent: dynamic(() => import("@/playground/previews/DetentPreview").then(() => Nothing)),
    folio: dynamic(() => import("@/playground/previews/FolioPreview").then(() => Nothing)),
    frost: dynamic(() => import("@/playground/previews/FrostPreview").then(() => Nothing)),
    halo: dynamic(() => import("@/playground/previews/HaloPreview").then(() => Nothing)),
    sash: dynamic(() => import("@/playground/previews/SashPreview").then(() => Nothing)),
    tether: dynamic(() => import("@/playground/previews/TetherPreview").then(() => Nothing)),
    anaglyph: dynamic(() => import("@/playground/previews/AnaglyphPreview").then(() => Nothing)),
    bitmap: dynamic(() => import("@/playground/previews/BitmapPreview").then(() => Nothing)),
    chroma: dynamic(() => import("@/playground/previews/ChromaPreview").then(() => Nothing)),
    concertina: dynamic(() =>
        import("@/playground/previews/ConcertinaPreview").then(() => Nothing),
    ),
    contact: dynamic(() => import("@/playground/previews/ContactPreview").then(() => Nothing)),
    emulsion: dynamic(() => import("@/playground/previews/EmulsionPreview").then(() => Nothing)),
    gantry: dynamic(() => import("@/playground/previews/GantryPreview").then(() => Nothing)),
    gnomon: dynamic(() => import("@/playground/previews/GnomonPreview").then(() => Nothing)),
    ink: dynamic(() => import("@/playground/previews/InkPreview").then(() => Nothing)),
    lattice: dynamic(() => import("@/playground/previews/LatticePreview").then(() => Nothing)),
    lenticular: dynamic(() =>
        import("@/playground/previews/LenticularPreview").then(() => Nothing),
    ),
    meniscus: dynamic(() => import("@/playground/previews/MeniscusPreview").then(() => Nothing)),
    nimbus: dynamic(() => import("@/playground/previews/NimbusPreview").then(() => Nothing)),
    palimpsest: dynamic(() =>
        import("@/playground/previews/PalimpsestPreview").then(() => Nothing),
    ),
    peel: dynamic(() => import("@/playground/previews/PeelPreview").then(() => Nothing)),
    phosphor: dynamic(() => import("@/playground/previews/PhosphorPreview").then(() => Nothing)),
    prism: dynamic(() => import("@/playground/previews/PrismPreview").then(() => Nothing)),
    quartz: dynamic(() => import("@/playground/previews/QuartzPreview").then(() => Nothing)),
    quiver: dynamic(() => import("@/playground/previews/QuiverPreview").then(() => Nothing)),
    sonar: dynamic(() => import("@/playground/previews/SonarPreview").then(() => Nothing)),
    tide: dynamic(() => import("@/playground/previews/TidePreview").then(() => Nothing)),
    drench: dynamic(() => import("@/playground/previews/DrenchPreview").then(() => Nothing)),
    eclipse: dynamic(() => import("@/playground/previews/EclipsePreview").then(() => Nothing)),
    gaze: dynamic(() => import("@/playground/previews/GazePreview").then(() => Nothing)),
    perseid: dynamic(() => import("@/playground/previews/PerseidPreview").then(() => Nothing)),
    undertow: dynamic(() => import("@/playground/previews/UndertowPreview").then(() => Nothing)),
    wake: dynamic(() => import("@/playground/previews/WakePreview").then(() => Nothing)),
    antigravity: dynamic(() =>
        import("@/playground/previews/AntigravityPreview").then(() => Nothing),
    ),
    aperture: dynamic(() => import("@/playground/previews/AperturePreview").then(() => Nothing)),
    diorama: dynamic(() => import("@/playground/previews/DioramaPreview").then(() => Nothing)),
    elemental: dynamic(() => import("@/playground/previews/ElementalPreview").then(() => Nothing)),
    facet: dynamic(() => import("@/playground/previews/FacetPreview").then(() => Nothing)),
    "grid-trail": dynamic(() =>
        import("@/playground/previews/GridTrailPreview").then(() => Nothing),
    ),
    kern: dynamic(() => import("@/playground/previews/KernPreview").then(() => Nothing)),
    loaders: dynamic(() => import("@/playground/previews/LoadersPreview").then(() => Nothing)),
    lodestone: dynamic(() => import("@/playground/previews/LodestonePreview").then(() => Nothing)),
    louvre: dynamic(() => import("@/playground/previews/LouvrePreview").then(() => Nothing)),
    meadow: dynamic(() => import("@/playground/previews/MeadowPreview").then(() => Nothing)),
    overprint: dynamic(() => import("@/playground/previews/OverprintPreview").then(() => Nothing)),
    raster: dynamic(() => import("@/playground/previews/RasterPreview").then(() => Nothing)),
    reel: dynamic(() => import("@/playground/previews/ReelPreview").then(() => Nothing)),
    ricochet: dynamic(() => import("@/playground/previews/RicochetPreview").then(() => Nothing)),
    "scroll-stack": dynamic(() =>
        import("@/playground/previews/ScrollStackPreview").then(() => Nothing),
    ),
    "split-flap": dynamic(() =>
        import("@/playground/previews/SplitFlapPreview").then(() => Nothing),
    ),
    stencil: dynamic(() => import("@/playground/previews/StencilPreview").then(() => Nothing)),
    tessera: dynamic(() => import("@/playground/previews/TesseraPreview").then(() => Nothing)),
    "trailing-cursor": dynamic(() =>
        import("@/playground/previews/TrailingCursorPreview").then(() => Nothing),
    ),
    vellum: dynamic(() => import("@/playground/previews/VellumPreview").then(() => Nothing)),
    bezel: dynamic(() => import("@/playground/previews/BezelPreview").then(() => Nothing)),
    dither: dynamic(() => import("@/playground/previews/DitherPreview").then(() => Nothing)),
    keycap: dynamic(() => import("@/playground/previews/KeycapPreview").then(() => Nothing)),
    tag: dynamic(() => import("@/playground/previews/TagPreview").then(() => Nothing)),
    seam: dynamic(() => import("@/playground/previews/SeamPreview").then(() => Nothing)),
    wash: dynamic(() => import("@/playground/previews/WashPreview").then(() => Nothing)),
}
