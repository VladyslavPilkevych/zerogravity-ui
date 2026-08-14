export {
    Antigravity,
    ANTIGRAVITY_DEFAULTS,
    ANTIGRAVITY_PRESETS,
    getAntigravityPreset,
    resolveAntigravityConfig,
} from "./antigravity"
export type {
    AntigravityConfig,
    AntigravityHandle,
    AntigravityOptions,
    AntigravityPreset,
    AntigravityProps,
    AntigravityStats,
    FormationShape,
    ParticleShape,
    Waveform,
} from "./antigravity"

export { Aperture } from "./aperture"
export type { ApertureDirection, ApertureProps } from "./aperture"

export { GridTrail, GRID_TRAIL_DEFAULTS } from "./grid-trail"
export type { GridTrailOptions, GridTrailProps, GridTrailShape } from "./grid-trail"

export { Reel } from "./reel"
export type { ReelHandle, ReelProps } from "./reel"

export { ScrollStack } from "./scroll-stack"
export type { ScrollStackProps, StackEasing } from "./scroll-stack"

export { SplitFlap } from "./split-flap"
export type { SplitFlapMode, SplitFlapProps } from "./split-flap"

export { Stencil, FILL_DEFAULT_COLORS } from "./stencil"
export type { StencilFill, StencilHover, StencilProps } from "./stencil"

export { TrailingCursor } from "./trailing-cursor"
export type { TrailingCursorProps, TrailingCursorVariant } from "./trailing-cursor"

export {
    resolveColor,
    usePointerFxEnabled,
    POINTER_FX_PRESETS,
    POINTER_FX_PRESET_IDS,
} from "./pointer-fx"
export type { PointerFxGate, PointerFxPreset, PointerFxTokens } from "./pointer-fx"
