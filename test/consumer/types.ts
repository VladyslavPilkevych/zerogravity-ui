import {
    Antigravity,
    ANTIGRAVITY_DEFAULTS,
    Aperture,
    GridTrail,
    Reel,
    ScrollStack,
    SplitFlap,
    Stencil,
    TrailingCursor,
    resolveAntigravityConfig,
    resolveColor,
    type AntigravityConfig,
    type AntigravityOptions,
    type AntigravityProps,
    type ApertureProps,
    type FormationShape,
    type GridTrailProps,
    type ReelHandle,
    type ReelProps,
    type ScrollStackProps,
    type SplitFlapProps,
    type StencilProps,
    type TrailingCursorProps,
} from "zerogravity-ui"

// The same components again, through their own entry points.
import { Reel as DirectReel, type ReelProps as DirectReelProps } from "zerogravity-ui/reel"
import { SplitFlap as DirectSplitFlap } from "zerogravity-ui/split-flap"
import { Stencil as DirectStencil, type StencilFill } from "zerogravity-ui/stencil"
import { Antigravity as DirectAntigravity } from "zerogravity-ui/antigravity"
import { resolveColor as directResolveColor } from "zerogravity-ui/pointer-fx"

const direct = [DirectReel, DirectSplitFlap, DirectStencil, DirectAntigravity]
void direct

const directReel: DirectReelProps = { children: null, radius: 20 }
void directReel

const fill: StencilFill = "zebra"
void fill

const directColour: string = directResolveColor("#000")
void directColour

const components = [
    Antigravity,
    Aperture,
    GridTrail,
    Reel,
    ScrollStack,
    SplitFlap,
    Stencil,
    TrailingCursor,
]
void components

const reel: ReelProps = { radius: 20, itemWidth: 300, loop: true, children: null }
const aperture: ApertureProps = { children: null, direction: "close" }
const grid: GridTrailProps = { cellSize: 32, shape: "square" }
const stack: ScrollStackProps = { children: null, easing: "smooth" }
const flap: SplitFlapProps = { value: "OK", mode: "text" }
const stencil: StencilProps = { text: "OK", fill: "zebra", hover: "lift" }
const cursor: TrailingCursorProps = { variant: "ring-only" }
const antigravity: AntigravityProps = { count: 100, seed: 7, paused: true }
void [reel, aperture, grid, stack, flap, stencil, cursor, antigravity]

const shape: FormationShape = "ring"
void shape

const options: AntigravityOptions = { count: 250, formation: { shape: "heart" } }
const resolved: AntigravityConfig = resolveAntigravityConfig(options)
const particleCount: number = resolved.count
void particleCount

const defaultCount: number = ANTIGRAVITY_DEFAULTS.count
void defaultCount

const colour: string = resolveColor("#fff")
void colour

declare const handle: ReelHandle
handle.next()
handle.prev()
handle.go(2)

// Negative cases: each line must remain a type error for the public API to be sound.

// @ts-expect-error invalid formation name
const badShape: FormationShape = "sphere"
void badShape

// @ts-expect-error hover does not accept arbitrary strings
const badStencil: StencilProps = { text: "A", hover: "explode" }
void badStencil

// @ts-expect-error radius must be a number
const badReel: ReelProps = { children: null, radius: "20" }
void badReel

// @ts-expect-error text is required
const missingText: StencilProps = { fill: "zebra" }
void missingText

// @ts-expect-error onIndexChange receives a number, not a string
const badCallback: ReelProps = { children: null, onIndexChange: (index: string) => void index }
void badCallback

// @ts-expect-error easing only accepts the documented union
const badEasing: ScrollStackProps = { children: null, easing: "bouncy" }
void badEasing

// @ts-expect-error internal engine modules are not part of the public surface
import type { AntigravityEngine } from "zerogravity-ui/antigravity/engine"
export type { AntigravityEngine }

// @ts-expect-error shared helpers have no entry point
import { cx } from "zerogravity-ui/internal"
void cx

// @ts-expect-error prototypes are not published
import { Meadow } from "zerogravity-ui/meadow"
void Meadow

// @ts-expect-error dist is an implementation detail, not an import path
import { Reel as DistReel } from "zerogravity-ui/dist/reel"
void DistReel

// @ts-expect-error a component entry point exports only its own component
import { Stencil as WrongEntry } from "zerogravity-ui/reel"
void WrongEntry
