import type { MeadowVariant } from "./types"

const art = { role: "presentation", focusable: "false" } as const

const BODY = "#e6e6fb"
const LIT = "#f4f4ff"
const CRATER = "#c3c4e8"
const FACE = "#5b5a86"
const BLUSH = "#d8b6d8"
const SPARK = "#dbe3ff"

function MoonFull() {
    return (
        <svg viewBox="0 0 100 100" data-variant="moon-1" {...art}>
            <circle cx="50" cy="50" r="38" fill={BODY} />
            <circle cx="56" cy="43" r="30" fill={LIT} />
            <g fill={CRATER} opacity="0.6">
                <circle cx="38" cy="62" r="8" />
                <circle cx="60" cy="70" r="5" />
                <circle cx="33" cy="41" r="5.4" />
            </g>
        </svg>
    )
}

function MoonDozy() {
    return (
        <svg viewBox="0 0 100 100" data-variant="moon-3" {...art}>
            <path d="M64 12a40 40 0 1 0 0 76 32 32 0 0 1 0-76Z" fill={LIT} />
            <ellipse cx="30" cy="60" rx="6" ry="4" fill={BLUSH} opacity="0.7" />
            <g stroke={FACE} strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M24 46c3 4.4 9 4.4 12 0" />
                <path d="M44 44c3 4.4 9 4.4 12 0" />
            </g>
            <ellipse cx="38" cy="60" rx="3.6" ry="4.2" fill={FACE} />
            <g fill={SPARK} opacity="0.85">
                <circle cx="82" cy="26" r="3" />
                <circle cx="88" cy="16" r="2" />
            </g>
        </svg>
    )
}

export const MEADOW_MOON_VARIANTS: readonly MeadowVariant[] = [
    {
        id: "moon-1",
        label: "Moon 1",
        note: "Full moon, three craters, offset highlight",
        Art: MoonFull,
    },
    {
        id: "moon-3",
        label: "Moon 3",
        note: "Dozy crescent with closed eyes and sleep bubbles",
        Art: MoonDozy,
    },
]

export { MoonFull, MoonDozy }
