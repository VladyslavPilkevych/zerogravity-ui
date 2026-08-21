import type { ReactNode } from "react"

import type { MeadowSpec } from "./plan"
import {
    GhostClassic,
    GhostKitten,
    GhostRibbon,
    MEADOW_MOON_VARIANTS,
    MEADOW_SUN_VARIANTS,
    UfoAntenna,
    UfoSaucer,
} from "./variants"

const svgProps = { focusable: "false", role: "presentation" } as const

export interface MeadowCometSpot {
    x: number
    y: number
    size: number
    beat: number
    delay: number
    tilt: number
}

export const MEADOW_COMETS: readonly MeadowCometSpot[] = [
    { x: 56, y: 3, size: 126, beat: 17, delay: -4, tilt: 15 },
    { x: 14, y: 10, size: 98, beat: 26, delay: -15, tilt: 18 },
]

export function MeadowCloud() {
    return (
        <svg viewBox="0 0 132 62" {...svgProps}>
            <g fill="currentColor">
                <circle cx="40" cy="36" r="19" />
                <circle cx="64" cy="27" r="25" />
                <circle cx="90" cy="36" r="17" />
                <rect x="20" y="38" width="92" height="20" rx="10" />
            </g>
        </svg>
    )
}

export function MeadowHills() {
    return (
        <svg viewBox="0 0 1200 340" preserveAspectRatio="none" {...svgProps}>
            <path
                d="M0 148C168 92 306 116 462 140 640 168 782 104 962 120 1082 130 1152 148 1200 158V340H0Z"
                fill="var(--meadow-hill-far)"
            />
            <path
                d="M0 206C148 166 262 194 424 206 616 220 762 176 924 190 1064 202 1142 216 1200 222V340H0Z"
                fill="var(--meadow-hill-mid)"
            />
            <path
                d="M0 262C204 244 424 258 646 264 866 270 1044 258 1200 264V340H0Z"
                fill="var(--meadow-hill-near)"
            />
        </svg>
    )
}

export function MeadowFlower() {
    return (
        <svg viewBox="0 0 48 80" {...svgProps}>
            <path
                d="M24 78C24 60 20 48 15 38"
                stroke="var(--meadow-stem)"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M22 58C16 56 12 50 13 45"
                stroke="var(--meadow-stem)"
                strokeWidth="2.2"
                fill="none"
            />
            <g fill="currentColor">
                <circle cx="15" cy="24" r="8" />
                <circle cx="27" cy="20" r="8" />
                <circle cx="33" cy="31" r="8" />
                <circle cx="21" cy="36" r="8" />
                <circle cx="9" cy="34" r="7" />
            </g>
            <circle cx="21" cy="28" r="6" fill="var(--meadow-pollen)" />
        </svg>
    )
}

export function MeadowTuft() {
    return (
        <svg viewBox="0 0 64 58" {...svgProps}>
            <g fill="currentColor">
                <path d="M31 58C24 43 15 31 3 24c12 11 19 22 22 34Z" />
                <path d="M32 58C28 40 24 25 17 12c9 15 13 30 15 46Z" />
                <path d="M33 58c2-17 3-32 2-47 6 15 6 31 4 47Z" />
                <path d="M34 58c5-17 12-30 23-40-8 12-14 25-16 40Z" />
                <path d="M35 58c7-14 17-22 29-25-11 6-19 13-24 25Z" />
            </g>
        </svg>
    )
}

export function MeadowSprig() {
    return (
        <svg viewBox="0 0 48 68" {...svgProps}>
            <path
                d="M24 66V22"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
            />
            <g fill="currentColor" opacity="0.9">
                <ellipse cx="15" cy="34" rx="9" ry="5.4" transform="rotate(-28 15 34)" />
                <ellipse cx="33" cy="28" rx="9" ry="5.4" transform="rotate(28 33 28)" />
                <ellipse cx="17" cy="48" rx="7.5" ry="4.6" transform="rotate(-24 17 48)" />
            </g>
            <circle cx="24" cy="18" r="5" fill="var(--meadow-bud)" />
        </svg>
    )
}

function MeadowBalloon() {
    return (
        <svg viewBox="0 0 96 132" {...svgProps}>
            <path
                d="M48 4c20 0 34 18 34 40 0 24-20 44-34 58C34 88 14 68 14 44 14 22 28 4 48 4Z"
                fill="#f4a877"
            />
            <path
                d="M48 4C36 4 14 22 14 44c0 24 20 44 34 58-8-16-14-36-14-58S42 14 48 4Z"
                fill="#e98c4f"
            />
            <path
                d="M48 4c12 0 34 18 34 40 0 24-20 44-34 58 8-16 14-36 14-58S54 14 48 4Z"
                fill="#f9c7a3"
            />
            <ellipse cx="34" cy="26" rx="7" ry="11" fill="#fdeedd" opacity="0.5" />
            <path d="M39 100v14M57 100v14" stroke="#c79a70" strokeWidth="2.4" />
            <path
                d="M48 95c6.6 0 10.5 4.8 10.5 11v7.5c0 2.1-2 3-3.5 1.6-1.5-1.4-3.3-1.4-4.8 0-1.5 1.4-3.3 1.4-4.8 0-1.5-1.4-3.3-1.4-4.8 0-1.5 1.4-3.6.5-3.6-1.6V106c0-6.2 4-11 11-11Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2"
            />
            <ellipse cx="44.6" cy="105" rx="2.3" ry="2.9" fill="var(--meadow-face)" />
            <ellipse cx="51.4" cy="105" rx="2.3" ry="2.9" fill="var(--meadow-face)" />
            <circle cx="43.8" cy="103.8" r="0.9" fill="#ffffff" opacity="0.92" />
            <ellipse cx="48" cy="110.6" rx="1.9" ry="2.2" fill="var(--meadow-face)" />
            <rect x="35" y="113" width="26" height="16" rx="4.5" fill="#c08b5c" />
            <rect x="35" y="113" width="26" height="5" rx="2.5" fill="#a9764a" />
        </svg>
    )
}

function MeadowButterfly() {
    return (
        <svg viewBox="0 0 56 44" {...svgProps}>
            <g className="xp-meadow-wing-left">
                <path d="M27 22C18 6 4 6 4 16c0 9 11 12 23 8Z" fill="#f4bfc9" />
                <path d="M27 23C19 34 7 36 6 28c-1-7 9-9 21-6Z" fill="#f6cfb6" />
            </g>
            <g className="xp-meadow-wing-right">
                <path d="M29 22C38 6 52 6 52 16c0 9-11 12-23 8Z" fill="#f4bfc9" />
                <path d="M29 23C37 34 49 36 50 28c1-7-9-9-21-6Z" fill="#f6cfb6" />
            </g>
            <rect x="26.4" y="12" width="3.2" height="22" rx="1.6" fill="#8a7a6e" />
            <path
                d="M27 13c-2-4-5-5-7-5M29 13c2-4 5-5 7-5"
                stroke="#8a7a6e"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

function MeadowBirds() {
    return (
        <svg viewBox="0 0 72 34" {...svgProps}>
            <g stroke="#a89584" strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path className="xp-meadow-wing-left" d="M4 14c6-8 12-8 16-2" />
                <path className="xp-meadow-wing-right" d="M20 12c4-6 10-6 16 2" />
                <path d="M44 26c4-5 8-5 11-1" opacity="0.7" />
                <path d="M55 25c3-4 7-4 11 1" opacity="0.7" />
            </g>
        </svg>
    )
}

function MeadowStar() {
    return (
        <svg viewBox="0 0 40 40" {...svgProps}>
            <path
                d="M20 2c1.4 10.4 7.2 16.2 18 18-10.8 1.8-16.6 7.6-18 18-1.4-10.4-7.2-16.2-18-18C12.8 18.2 18.6 12.4 20 2Z"
                fill="var(--meadow-spark)"
            />
        </svg>
    )
}

function MeadowRobot() {
    return (
        <svg viewBox="0 0 64 72" {...svgProps}>
            <path d="M32 8V3" stroke="var(--meadow-outline)" strokeWidth="2.4" />
            <circle cx="32" cy="2.6" r="2.8" fill="#7ad4ea" />
            <rect x="6" y="42" width="52" height="24" rx="10" fill="#d9dcf4" />
            <rect x="14" y="48" width="12" height="8" rx="3" fill="#7ad4ea" opacity="0.8" />
            <rect
                x="8"
                y="10"
                width="48"
                height="36"
                rx="14"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.6"
            />
            <rect x="15" y="18" width="34" height="20" rx="9" fill="#3a4272" />
            <ellipse cx="25" cy="28" rx="4.2" ry="4.8" fill="#cfe3ff" />
            <ellipse cx="39" cy="28" rx="4.2" ry="4.8" fill="#cfe3ff" />
            <circle cx="23.6" cy="26" r="1.4" fill="#ffffff" opacity="0.92" />
            <circle cx="37.6" cy="26" r="1.4" fill="#ffffff" opacity="0.92" />
            <path d="M4 24h4M56 24h4" stroke="var(--meadow-outline)" strokeWidth="2.6" />
        </svg>
    )
}

export function MeadowBlackHole() {
    return (
        <svg viewBox="0 0 200 200" {...svgProps}>
            <circle cx="100" cy="100" r="86" fill="#1a1636" opacity="0.35" />
            <ellipse
                cx="100"
                cy="100"
                rx="80"
                ry="24"
                fill="none"
                stroke="#8f7ad6"
                strokeWidth="7"
                opacity="0.32"
            />
            <ellipse
                cx="100"
                cy="100"
                rx="62"
                ry="17"
                fill="none"
                stroke="#c9a8f0"
                strokeWidth="5"
                opacity="0.4"
            />
            <circle cx="100" cy="100" r="40" fill="#0a0716" />
            <circle
                cx="100"
                cy="100"
                r="43"
                fill="none"
                stroke="#d8c2ff"
                strokeWidth="2.5"
                opacity="0.5"
            />
        </svg>
    )
}

export function MeadowGasPlanet() {
    return (
        <svg viewBox="0 0 120 120" {...svgProps}>
            <circle cx="60" cy="60" r="52" fill="#7466ae" />
            <ellipse cx="60" cy="42" rx="46" ry="9" fill="#8f81c6" opacity="0.75" />
            <ellipse cx="60" cy="66" rx="50" ry="7" fill="#5d508f" opacity="0.7" />
            <ellipse cx="60" cy="84" rx="40" ry="6" fill="#8f81c6" opacity="0.5" />
            <circle cx="42" cy="40" r="15" fill="#a89ada" opacity="0.45" />
        </svg>
    )
}

export function MeadowRingPlanet() {
    return (
        <svg viewBox="0 0 200 140" {...svgProps}>
            <path
                d="M6 70a94 26 0 0 0 188 0"
                fill="none"
                stroke="#b8a9e6"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.5"
            />
            <circle cx="100" cy="70" r="46" fill="#c98f86" />
            <ellipse cx="100" cy="56" rx="40" ry="10" fill="#dda99c" opacity="0.6" />
            <ellipse cx="100" cy="82" rx="42" ry="8" fill="#a9736d" opacity="0.6" />
            <circle cx="84" cy="54" r="13" fill="#e6bfb2" opacity="0.45" />
            <path
                d="M6 70a94 26 0 0 1 188 0"
                fill="none"
                stroke="#d7cbf5"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.85"
            />
        </svg>
    )
}

export function MeadowMoonlet() {
    return (
        <svg viewBox="0 0 80 80" {...svgProps}>
            <circle cx="40" cy="40" r="32" fill="#cfd2ee" />
            <circle cx="48" cy="32" r="24" fill="#e4e6fa" />
            <g fill="#b3b7dd" opacity="0.65">
                <circle cx="30" cy="50" r="7" />
                <circle cx="47" cy="57" r="4.5" />
            </g>
        </svg>
    )
}

function MeadowRocket() {
    return (
        <svg viewBox="0 0 76 46" {...svgProps}>
            <path d="M2 23c5-4 9-3 12 0-3 3-7 4-12 0Z" fill="#f2a86a" />
            <path d="M6 23c3-2 5-2 7 0-2 2-4 2-7 0Z" fill="#fbd79a" />
            <path d="M22 11 17 2l12 9Z" fill="#8b85bd" />
            <path d="M22 35 17 44l12-9Z" fill="#8b85bd" />
            <path
                d="M20 11h20c9 0 20 6 26 12-6 6-17 12-26 12H20c-6 0-11-5-11-12s5-12 11-12Z"
                fill="#eef0ff"
            />
            <path d="M40 11c9 0 20 6 26 12-6 6-17 12-26 12Z" fill="#d98d80" />
            <circle cx="27" cy="23" r="6" fill="#6f8fd0" />
            <circle cx="25" cy="21" r="2.2" fill="#c9dcff" opacity="0.8" />
        </svg>
    )
}

function MeadowAstronaut() {
    return (
        <svg viewBox="0 0 64 70" {...svgProps}>
            <path d="M32 6v-4" stroke="var(--meadow-outline)" strokeWidth="2.4" />
            <circle cx="32" cy="2.6" r="2.6" fill="var(--meadow-blush)" />
            <rect x="20" y="44" width="24" height="20" rx="9" fill="#d9dcf4" />
            <circle cx="32" cy="30" r="24" fill="var(--meadow-body)" />
            <circle
                cx="32"
                cy="30"
                r="24"
                fill="none"
                stroke="var(--meadow-outline)"
                strokeWidth="2.6"
            />
            <path d="M32 12c11 0 17 8 17 17s-7 15-17 15-17-6-17-15 6-17 17-17Z" fill="#3a4272" />
            <ellipse cx="25" cy="28" rx="3" ry="3.8" fill="#dfe6ff" />
            <ellipse cx="39" cy="28" rx="3" ry="3.8" fill="#dfe6ff" />
            <path
                d="M28 36c2 2 6 2 8 0"
                stroke="#8fa4d8"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
            <ellipse cx="22" cy="20" rx="6" ry="4" fill="#7b86bd" opacity="0.5" />
        </svg>
    )
}

export interface MeadowPlanetSpot {
    art: "gas" | "ring" | "moonlet" | "void"
    x: number
    y: number
    size: number
    beat: number
    orbit?: number
    dense?: boolean
    faint?: boolean
    compact?: { x: number; y: number; size: number }
}

export const MEADOW_PLANET_ART = {
    gas: MeadowGasPlanet,
    ring: MeadowRingPlanet,
    moonlet: MeadowMoonlet,
    void: MeadowBlackHole,
} as const

export const MEADOW_PLANETS: readonly MeadowPlanetSpot[] = [
    {
        art: "ring",
        x: -8,
        y: 58,
        size: 268,
        beat: 46,
        compact: { x: -18, y: 79, size: 168 },
    },
    {
        art: "gas",
        x: 79,
        y: 6,
        size: 148,
        beat: 38,
        orbit: 1.34,
        compact: { x: 74, y: 1, size: 104 },
    },
    { art: "moonlet", x: 20, y: 14, size: 46, beat: 30, dense: true },
    {
        art: "void",
        x: 24,
        y: -2,
        size: 190,
        beat: 62,
        faint: true,
        compact: { x: 20, y: -8, size: 120 },
    },
]

export interface MeadowItem extends MeadowSpec {
    content: ReactNode
}

export const MEADOW_CAST: readonly MeadowItem[] = [
    {
        content: <MeadowBalloon />,
        kind: "balloon",
        motion: "bob",
        x: 13,
        y: 26,
        size: 96,
        depth: 0.8,
        compact: { x: 16, y: 8, size: 62 },
    },
    {
        content: <GhostClassic />,
        kind: "mascot",
        motion: "float",
        x: 87,
        y: 47,
        size: 62,
        depth: 0.7,
        compact: { x: 84, y: 95, size: 48 },
    },
    {
        content: <MeadowButterfly />,
        kind: "butterfly",
        motion: "flit",
        x: 13,
        y: 70,
        size: 60,
        depth: 0.6,
        compact: { x: 12, y: 94, size: 42 },
    },
    {
        content: <GhostKitten />,
        kind: "mascot",
        motion: "hover",
        x: 90,
        y: 82,
        size: 58,
        depth: 0.75,
        compact: { x: 50, y: 95, size: 44 },
    },
    {
        content: <MeadowBirds />,
        kind: "bird",
        motion: "glide",
        x: 0,
        y: 10,
        size: 62,
        depth: 0.3,
        flip: true,
        compact: { x: 0, y: 4, size: 44 },
    },
    {
        content: <GhostRibbon />,
        kind: "mascot",
        motion: "float",
        x: 11,
        y: 79,
        size: 60,
        depth: 0.6,
        compact: { x: 26, y: 91, size: 46 },
    },
    {
        content: <MeadowStar />,
        kind: "star",
        motion: "twinkle",
        x: 93,
        y: 15,
        size: 26,
        depth: 0.4,
        compact: { x: 92, y: 6, size: 20 },
    },
    {
        content: <MeadowButterfly />,
        kind: "butterfly",
        motion: "flit",
        x: 84,
        y: 74,
        size: 46,
        depth: 0.45,
        compact: { x: 68, y: 91, size: 34 },
    },
    {
        content: <GhostClassic />,
        kind: "mascot",
        motion: "hover",
        x: 8,
        y: 44,
        size: 50,
        depth: 0.65,
        compact: { x: 6, y: 87, size: 40 },
    },
    {
        content: <GhostKitten />,
        kind: "mascot",
        motion: "float",
        x: 94,
        y: 63,
        size: 42,
        depth: 0.5,
        compact: { x: 94, y: 84, size: 32 },
    },
]

export const MEADOW_SPACE_CAST: readonly MeadowItem[] = [
    {
        content: <MeadowRocket />,
        kind: "rocket",
        motion: "glide",
        x: 0,
        y: 13,
        size: 66,
        depth: 0.7,
        compact: { x: 0, y: 7, size: 46 },
    },
    {
        content: <GhostClassic />,
        kind: "mascot",
        motion: "float",
        x: 87,
        y: 45,
        size: 62,
        depth: 0.7,
        compact: { x: 84, y: 96, size: 46 },
    },
    {
        content: <UfoSaucer />,
        kind: "ufo",
        motion: "glide",
        x: 0,
        y: 91,
        size: 92,
        depth: 0.55,
        compact: { x: 0, y: 95, size: 62 },
    },
    {
        content: <MeadowRobot />,
        kind: "mascot",
        motion: "hover",
        x: 11,
        y: 72,
        size: 64,
        depth: 0.75,
        compact: { x: 22, y: 96, size: 44 },
    },
    {
        content: <MeadowRocket />,
        kind: "rocket",
        motion: "glide",
        x: 0,
        y: 95,
        size: 48,
        depth: 0.4,
        flip: true,
        compact: { x: 0, y: 90, size: 36 },
    },
    {
        content: <MeadowAstronaut />,
        kind: "mascot",
        motion: "float",
        x: 8,
        y: 28,
        size: 58,
        depth: 0.6,
        compact: { x: 6, y: 8, size: 42 },
    },
    {
        content: <UfoAntenna />,
        kind: "ufo",
        motion: "glide",
        x: 0,
        y: 6,
        size: 70,
        depth: 0.35,
        flip: true,
        compact: { x: 0, y: 3, size: 50 },
    },
    {
        content: <GhostKitten />,
        kind: "mascot",
        motion: "hover",
        x: 91,
        y: 82,
        size: 54,
        depth: 0.65,
        compact: { x: 92, y: 92, size: 42 },
    },
    {
        content: <GhostRibbon />,
        kind: "mascot",
        motion: "float",
        x: 94,
        y: 24,
        size: 44,
        depth: 0.5,
        compact: { x: 94, y: 84, size: 32 },
    },
    {
        content: <MeadowStar />,
        kind: "star",
        motion: "twinkle",
        x: 78,
        y: 62,
        size: 24,
        depth: 0.4,
        compact: { x: 93, y: 5, size: 18 },
    },
]

export interface MeadowCloudSpot {
    x: number
    y: number
    size: number
    tone: number
    drift: number
    far: boolean
}

export const MEADOW_CLOUDS: readonly MeadowCloudSpot[] = [
    { x: 5, y: 15, size: 158, tone: 0.94, drift: 34, far: false },
    { x: 57, y: 6, size: 114, tone: 0.6, drift: 46, far: true },
    { x: 68, y: 20, size: 112, tone: 0.8, drift: 30, far: false },
    { x: 29, y: 8, size: 88, tone: 0.44, drift: 54, far: true },
]

export type MeadowPlantKind = "flower" | "tuft" | "sprig"

export interface MeadowPlantSpot {
    kind: MeadowPlantKind
    x: number
    bottom: number
    size: number
    tint: string
    sway: number
    near?: boolean
    dense?: boolean
}

export const MEADOW_PLANTS: readonly MeadowPlantSpot[] = [
    { kind: "flower", x: 4, bottom: 3, size: 44, tint: "pink", sway: 4.6 },
    { kind: "tuft", x: 14, bottom: 0, size: 56, tint: "green", sway: 5.4 },
    { kind: "flower", x: 23, bottom: 5, size: 32, tint: "cream", sway: 6.2, dense: true },
    { kind: "sprig", x: 38, bottom: 0, size: 42, tint: "green", sway: 5, dense: true },
    { kind: "flower", x: 66, bottom: 4, size: 38, tint: "coral", sway: 4.2 },
    { kind: "tuft", x: 78, bottom: 0, size: 62, tint: "green", sway: 5.8, dense: true },
    { kind: "flower", x: 93, bottom: 3, size: 42, tint: "pink", sway: 6.4 },
    { kind: "tuft", x: 5, bottom: -5, size: 132, tint: "deep", sway: 6.8, near: true },
    {
        kind: "tuft",
        x: 71,
        bottom: -6,
        size: 122,
        tint: "deep",
        sway: 7.4,
        near: true,
        dense: true,
    },
    { kind: "flower", x: 95, bottom: -9, size: 74, tint: "coral", sway: 5.6, near: true },
]

export const MEADOW_ART = {
    flower: MeadowFlower,
    tuft: MeadowTuft,
    sprig: MeadowSprig,
} as const

/** Orbs come straight from the approved sets, indexed deterministically. */
export const MEADOW_SUN_ART = MEADOW_SUN_VARIANTS.map((variant) => variant.Art)
export const MEADOW_MOON_ART = MEADOW_MOON_VARIANTS.map((variant) => variant.Art)
