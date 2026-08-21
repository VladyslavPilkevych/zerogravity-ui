import type { ReactNode } from "react"

import type { MeadowSpec } from "./plan"

const svgProps = { focusable: "false", role: "presentation" } as const

export function MeadowMoon() {
    return (
        <svg viewBox="0 0 200 200" {...svgProps}>
            <circle cx="100" cy="100" r="46" fill="#e6e6fb" />
            <circle cx="100" cy="100" r="46" fill="#cfd0f0" opacity="0.55" />
            <circle cx="112" cy="86" r="34" fill="#f2f2ff" />
            <g fill="#c3c4e8" opacity="0.6">
                <circle cx="86" cy="112" r="9" />
                <circle cx="108" cy="126" r="6" />
                <circle cx="78" cy="90" r="5" />
            </g>
        </svg>
    )
}

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

export function MeadowSun() {
    return (
        <svg viewBox="0 0 200 200" {...svgProps}>
            <g className="xp-meadow-rays" fill="#f7bd80" opacity="0.2">
                {Array.from({ length: 12 }, (_, index) => (
                    <path
                        key={index}
                        d="M100 8 L106 44 L94 44 Z"
                        transform={`rotate(${index * 30} 100 100)`}
                    />
                ))}
            </g>
            <circle cx="100" cy="100" r="44" fill="#fbd190" />
            <circle cx="100" cy="100" r="34" fill="#fde3b6" />
            <circle cx="88" cy="88" r="14" fill="#fdeac6" opacity="0.85" />
        </svg>
    )
}

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
            <path d="M40 100v12M56 100v12" stroke="#c79a70" strokeWidth="2.4" />
            <rect x="38" y="110" width="20" height="15" rx="4" fill="#c08b5c" />
            <rect x="38" y="110" width="20" height="5" rx="2.5" fill="#a9764a" />
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

function MeadowPlane() {
    return (
        <svg viewBox="0 0 56 44" {...svgProps}>
            <path d="M3 24 53 6 28 28Z" fill="#fdf5e8" />
            <path d="M28 28 53 6 33 41Z" fill="#dbc9ac" />
            <path d="M28 28l8 3" stroke="#cbbba2" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

function MeadowBlob() {
    return (
        <svg viewBox="0 0 72 66" {...svgProps}>
            <path
                d="M36 4c17 0 28 11 28 26 0 17-13 32-28 32S8 47 8 30C8 15 19 4 36 4Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.6"
            />
            <ellipse cx="21" cy="38" rx="5" ry="3.4" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="51" cy="38" rx="5" ry="3.4" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="27" cy="30" rx="3.4" ry="4.4" fill="var(--meadow-face)" />
            <ellipse cx="45" cy="30" rx="3.4" ry="4.4" fill="var(--meadow-face)" />
            <path
                d="M32 40c2 2.4 6 2.4 8 0"
                stroke="var(--meadow-face)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

function MeadowGhost() {
    return (
        <svg viewBox="0 0 60 68" {...svgProps}>
            <path
                d="M30 3c14 0 23 11 23 25v22c0 4-4 6-7 3-3-3-7-3-10 0s-7 3-10 0-7-3-10 0c-3 3-9 1-9-3V28C7 14 16 3 30 3Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.6"
            />
            <ellipse cx="17" cy="35" rx="4.4" ry="3" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="43" cy="35" rx="4.4" ry="3" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="23" cy="27" rx="3.2" ry="4.2" fill="var(--meadow-face)" />
            <ellipse cx="37" cy="27" rx="3.2" ry="4.2" fill="var(--meadow-face)" />
            <path
                d="M27 36c1.6 2 4.4 2 6 0"
                stroke="var(--meadow-face)"
                strokeWidth="1.9"
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

function MeadowSleepy() {
    return (
        <svg viewBox="0 0 78 58" {...svgProps}>
            <path
                d="M39 4c19 0 34 10 34 24 0 15-15 26-34 26S5 43 5 28C5 14 20 4 39 4Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.6"
            />
            <ellipse cx="22" cy="36" rx="5" ry="3.2" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="56" cy="36" rx="5" ry="3.2" fill="var(--meadow-blush)" opacity="0.9" />
            <g stroke="var(--meadow-face)" strokeWidth="2.2" strokeLinecap="round" fill="none">
                <path d="M23 27c2.4 3 6.4 3 8.8 0" />
                <path d="M46 27c2.4 3 6.4 3 8.8 0" />
                <path d="M35 38c2.4 2 5.6 2 8 0" />
            </g>
        </svg>
    )
}

function MeadowWink() {
    return (
        <svg viewBox="0 0 54 74" {...svgProps}>
            <path
                d="M27 3c13 0 22 10 22 23v31c0 4-4 6-7 3-3-3-6-3-9 0s-6 3-9 0-6-3-9 0c-3 3-8 1-8-3V26C7 13 14 3 27 3Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.6"
            />
            <ellipse cx="15" cy="37" rx="4.4" ry="3" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="39" cy="37" rx="4.4" ry="3" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="20" cy="29" rx="3.2" ry="4.2" fill="var(--meadow-face)" />
            <g stroke="var(--meadow-face)" strokeWidth="2.2" strokeLinecap="round" fill="none">
                <path d="M30 30c2.4-2.6 6-2.6 8 0" />
                <path d="M24 39c2 2.2 5 2.2 7 0" />
            </g>
        </svg>
    )
}

function MeadowSprite() {
    return (
        <svg viewBox="0 0 48 50" {...svgProps}>
            <path
                d="M24 3c12 0 20 8 20 19s-9 25-20 25S4 33 4 22C4 11 12 3 24 3Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.4"
            />
            <ellipse cx="14" cy="28" rx="3.6" ry="2.4" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="34" cy="28" rx="3.6" ry="2.4" fill="var(--meadow-blush)" opacity="0.9" />
            <ellipse cx="18" cy="22" rx="2.8" ry="3.6" fill="var(--meadow-face)" />
            <ellipse cx="30" cy="22" rx="2.8" ry="3.6" fill="var(--meadow-face)" />
            <ellipse cx="24" cy="31" rx="2.6" ry="3" fill="var(--meadow-face)" />
        </svg>
    )
}

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
        content: <MeadowBlob />,
        kind: "mascot",
        motion: "float",
        x: 87,
        y: 47,
        size: 68,
        depth: 0.7,
        compact: { x: 84, y: 95, size: 52 },
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
        content: <MeadowPlane />,
        kind: "plane",
        motion: "glide",
        x: 0,
        y: 15,
        size: 52,
        depth: 0.55,
        compact: { x: 0, y: 5, size: 34 },
    },
    {
        content: <MeadowGhost />,
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
        content: <MeadowSleepy />,
        kind: "mascot",
        motion: "float",
        x: 11,
        y: 79,
        size: 64,
        depth: 0.6,
        compact: { x: 26, y: 91, size: 48 },
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
        content: <MeadowWink />,
        kind: "mascot",
        motion: "hover",
        x: 8,
        y: 44,
        size: 54,
        depth: 0.65,
        compact: { x: 6, y: 87, size: 42 },
    },
    {
        content: <MeadowSprite />,
        kind: "mascot",
        motion: "float",
        x: 94,
        y: 63,
        size: 42,
        depth: 0.5,
        compact: { x: 94, y: 84, size: 32 },
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
