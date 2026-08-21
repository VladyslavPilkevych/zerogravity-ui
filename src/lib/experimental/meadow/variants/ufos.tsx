import type { MeadowVariant } from "./types"

const art = { role: "presentation", focusable: "false" } as const

const HULL = "#eef0ff"
const RIM = "#b9b3e4"
const GLASS = "#8fb7e8"
const GLASS_LIT = "#cfe3ff"
const LAMP = "#7ad4ea"

function UfoSaucer() {
    return (
        <svg viewBox="0 0 100 58" data-variant="ufo-1" {...art}>
            <ellipse cx="50" cy="50" rx="30" ry="6" fill={LAMP} opacity="0.18" />
            <path d="M50 6c11 0 19 7 19 15H31c0-8 8-15 19-15Z" fill={GLASS_LIT} />
            <path d="M50 6c6 0 11 4 13 10-4 2-9 3-13 3s-9-1-13-3c2-6 7-10 13-10Z" fill={GLASS} />
            <ellipse cx="50" cy="25" rx="44" ry="11" fill={HULL} />
            <path d="M6 25a44 11 0 0 0 88 0Z" fill={RIM} />
            <g fill={LAMP}>
                <circle cx="26" cy="29" r="3.4" />
                <circle cx="50" cy="31" r="3.4" />
                <circle cx="74" cy="29" r="3.4" />
            </g>
            <ellipse cx="36" cy="21" rx="10" ry="3" fill="#ffffff" opacity="0.5" />
        </svg>
    )
}

function UfoBeam() {
    return (
        <svg viewBox="0 0 96 84" data-variant="ufo-3" {...art}>
            <path d="M32 34h32l14 44H18Z" fill="#bfeeff" opacity="0.22" />
            <path d="M38 34h20l8 44H30Z" fill="#dff7ff" opacity="0.3" />
            <path d="M44 34h8l3 44H41Z" fill="#f2fdff" opacity="0.34" />
            <path d="M48 4c10 0 17 6 17 14H31c0-8 7-14 17-14Z" fill={GLASS_LIT} />
            <path d="M48 4c5 0 10 4 12 9-4 2-8 3-12 3s-8-1-12-3c2-5 7-9 12-9Z" fill={GLASS} />
            <ellipse cx="48" cy="26" rx="40" ry="10" fill={HULL} />
            <path d="M8 26a40 10 0 0 0 80 0Z" fill={RIM} />
            <g fill={LAMP}>
                <circle cx="24" cy="30" r="3.2" />
                <circle cx="48" cy="32" r="3.2" />
                <circle cx="72" cy="30" r="3.2" />
            </g>
        </svg>
    )
}

function UfoAntenna() {
    return (
        <svg viewBox="0 0 100 66" data-variant="ufo-6" {...art}>
            <path d="M50 12V4" stroke={RIM} strokeWidth="2.6" />
            <circle cx="50" cy="3" r="3.4" fill={LAMP} />
            <path d="M50 12c10 0 17 6 17 13H33c0-7 7-13 17-13Z" fill={GLASS_LIT} />
            <path d="M50 12c5 0 10 4 12 9-4 2-8 3-12 3s-8-1-12-3c2-5 7-9 12-9Z" fill={GLASS} />
            <ellipse cx="50" cy="33" rx="42" ry="11" fill={HULL} />
            <path d="M8 33a42 11 0 0 0 84 0Z" fill={RIM} />
            <g fill={LAMP}>
                <circle cx="22" cy="37" r="3.2" />
                <circle cx="40" cy="39" r="3.2" />
                <circle cx="60" cy="39" r="3.2" />
                <circle cx="78" cy="37" r="3.2" />
            </g>
            <g fill={LAMP} opacity="0.7">
                <path d="M88 12c.6 3.4 2.4 5.2 5.8 5.8-3.4.6-5.2 2.4-5.8 5.8-.6-3.4-2.4-5.2-5.8-5.8 3.4-.6 5.2-2.4 5.8-5.8Z" />
                <path d="M12 18c.4 2.4 1.6 3.6 4 4-2.4.4-3.6 1.6-4 4-.4-2.4-1.6-3.6-4-4 2.4-.4 3.6-1.6 4-4Z" />
            </g>
        </svg>
    )
}

export const MEADOW_UFO_VARIANTS: readonly MeadowVariant[] = [
    {
        id: "ufo-1",
        label: "UFO 1",
        note: "Classic saucer, three lamps, soft shine",
        Art: UfoSaucer,
    },
    { id: "ufo-3", label: "UFO 3", note: "Saucer casting a soft tractor beam", Art: UfoBeam },
    { id: "ufo-6", label: "UFO 6", note: "Bobble antenna, four lamps, sparkles", Art: UfoAntenna },
]

export { UfoSaucer, UfoBeam, UfoAntenna }
