import type { ControlGroup } from "@/playground/panel/types"

export type DocCategory =
    | "Backgrounds"
    | "Surfaces"
    | "Cursor"
    | "Scroll"
    | "Typography"
    | "Media"
    | "Interface"
    | "Loading & transitions"

/** Sidebar order: ambient and decorative first, practical UI last. */
export const DOC_CATEGORIES: readonly DocCategory[] = [
    "Backgrounds",
    "Surfaces",
    "Cursor",
    "Scroll",
    "Typography",
    "Media",
    "Interface",
    "Loading & transitions",
]

export interface DocPreset {
    id: string
    label: string
    hint?: string
    values: Record<string, unknown>
}

export interface PropRow {
    name: string
    type: string
    default: string
    description: string
}

export interface PreviewOptions {
    minHeight?: number
    /** the demo tells a tall scroll story, so it gets its own scroll port */
    scroll?: boolean
    /** the preview renders its own bounded scroller and drives the component from it */
    port?: boolean
    /** drop the frame padding for canvases that should reach the edges */
    bleed?: boolean
    /** keep `position: fixed` children inside the frame instead of the viewport */
    containFixed?: boolean
    /** let the preview run past the reading column */
    wide?: boolean
    /** one line shown under the frame */
    note?: string
}

export interface DocEntry {
    slug: string
    name: string
    /** what it is in plain words, shown under the brand name */
    label: string
    /** the JSX tag, when it differs from the display name */
    tag?: string
    description: string
    category: DocCategory
    status: "stable" | "experimental"
    /** external runtime packages, excluding react and this library */
    dependencies: string[]
    tags?: string[]
    defaults: Record<string, unknown>
    controls: ControlGroup[]
    presets?: DocPreset[]
    /** demo-only knobs: never generated into code, never listed as props */
    omit?: string[]
    /** props the component cannot render without, printed even at their default */
    required?: string[]
    /** props with no control, such as children and callbacks */
    extraProps?: PropRow[]
    /** example children for wrapper components */
    children?: string
    /** JSX props with no control that the component cannot compile without, always printed */
    fixedProps?: string[]
    /** JSX props with no control, picked by a config value such as the active example */
    exampleProps?: { key: string; props: Record<string, string[]> }
    preview?: PreviewOptions
}
