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

export { Diorama } from "./diorama"
export type { DioramaPlane, DioramaProps } from "./diorama"

export { Elemental, ELEMENTAL_VARIANTS } from "./elemental"
export type { ElementalProps, ElementalVariant } from "./elemental"

export { GridTrail, GRID_TRAIL_DEFAULTS } from "./grid-trail"
export type { GridTrailOptions, GridTrailProps, GridTrailShape } from "./grid-trail"

export { Kern } from "./kern"
export type { KernProps } from "./kern"

export { Lodestone } from "./lodestone"
export type { LodestoneProps } from "./lodestone"

export {
    Meadow,
    MEADOW_CAST,
    MEADOW_LIMITS,
    MEADOW_SPACE_CAST,
    MEADOW_VARIANT_SETS,
} from "./meadow"
export type {
    MeadowCreatures,
    MeadowDensity,
    MeadowEventPace,
    MeadowInteraction,
    MeadowItem,
    MeadowKind,
    MeadowMotion,
    MeadowProps,
    MeadowScene,
    MeadowScenePart,
    MeadowSpaceScene,
    MeadowTheme,
    MeadowVariant,
    MeadowVariantGroup,
    MeadowVariantSet,
} from "./meadow"

export { Overprint } from "./overprint"
export type { OverprintProps } from "./overprint"

export { Reel } from "./reel"
export type { ReelHandle, ReelProps } from "./reel"

export { Ricochet, SUPPORTED_CHARACTERS } from "./ricochet"
export type { RicochetMode, RicochetProps, RicochetVariant } from "./ricochet"

export { ScrollStack } from "./scroll-stack"
export type { ScrollStackProps, StackEasing } from "./scroll-stack"

export { SplitFlap } from "./split-flap"
export type { SplitFlapMode, SplitFlapProps } from "./split-flap"

export { Stencil, FILL_DEFAULT_COLORS } from "./stencil"
export type { StencilFill, StencilHover, StencilProps } from "./stencil"

export { TesseraProvider, useTessera, useTesseraPhase } from "./tessera"
export type {
    TesseraController,
    TesseraNavigate,
    TesseraPhase,
    TesseraProviderProps,
    TesseraRunOptions,
    TesseraSequence,
} from "./tessera"

export { TrailingCursor } from "./trailing-cursor"
export type { TrailingCursorProps, TrailingCursorVariant } from "./trailing-cursor"

export { Vellum } from "./vellum"
export type { VellumHighlight, VellumProps } from "./vellum"

export {
    resolveColor,
    usePointerFxEnabled,
    POINTER_FX_PRESETS,
    POINTER_FX_PRESET_IDS,
} from "./pointer-fx"
export type { PointerFxGate, PointerFxPreset, PointerFxTokens } from "./pointer-fx"
