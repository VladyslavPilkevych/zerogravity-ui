import type { MeadowVariant } from "./types"

const art = { role: "presentation", focusable: "false" } as const

const CORE = "#fde3b6"
const BODY = "#fbd190"
const RAY = "#f7bd80"
const DEEP = "#f0a95f"
const FACE = "#a9713f"
const BLUSH = "#f2a48c"

function SunRayed() {
    return (
        <svg viewBox="0 0 120 120" data-variant="sun-1" {...art}>
            <g className="xp-meadow-rays" fill={RAY} opacity="0.65">
                {Array.from({ length: 12 }, (_, index) => (
                    <path
                        key={index}
                        d="M60 4l4.4 22h-8.8Z"
                        transform={`rotate(${index * 30} 60 60)`}
                    />
                ))}
            </g>
            <circle cx="60" cy="60" r="30" fill={BODY} />
            <circle cx="60" cy="60" r="22" fill={CORE} />
        </svg>
    )
}

function SunGlow() {
    return (
        <svg viewBox="0 0 120 120" data-variant="sun-3" {...art}>
            <circle cx="60" cy="60" r="54" fill={RAY} opacity="0.14" />
            <circle cx="60" cy="60" r="42" fill={RAY} opacity="0.2" />
            <circle cx="60" cy="60" r="31" fill={BODY} />
            <circle cx="60" cy="60" r="22" fill={CORE} />
            <circle cx="50" cy="50" r="8" fill="#fff6e4" opacity="0.8" />
        </svg>
    )
}

function SunFace() {
    return (
        <svg viewBox="0 0 120 120" data-variant="sun-4" {...art}>
            <g className="xp-meadow-rays" fill={RAY} opacity="0.55">
                {Array.from({ length: 10 }, (_, index) => (
                    <path
                        key={index}
                        d="M60 8c3 8 3 14 0 20-3-6-3-12 0-20Z"
                        transform={`rotate(${index * 36} 60 60)`}
                    />
                ))}
            </g>
            <circle cx="60" cy="60" r="32" fill={BODY} />
            <circle cx="60" cy="60" r="26" fill={CORE} />
            <ellipse cx="45" cy="66" rx="6" ry="4" fill={BLUSH} opacity="0.7" />
            <ellipse cx="75" cy="66" rx="6" ry="4" fill={BLUSH} opacity="0.7" />
            <ellipse cx="50" cy="55" rx="4" ry="5" fill={FACE} />
            <ellipse cx="70" cy="55" rx="4" ry="5" fill={FACE} />
            <circle cx="48.6" cy="53" r="1.5" fill="#ffffff" opacity="0.9" />
            <circle cx="68.6" cy="53" r="1.5" fill="#ffffff" opacity="0.9" />
            <path
                d="M53 66c3.4 4 10.6 4 14 0"
                stroke={FACE}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

function SunSpiky() {
    return (
        <svg viewBox="0 0 120 120" data-variant="sun-5" {...art}>
            <g fill={DEEP} opacity="0.5">
                {Array.from({ length: 8 }, (_, index) => (
                    <path
                        key={index}
                        d="M60 2l5 26h-10Z"
                        transform={`rotate(${index * 45} 60 60)`}
                    />
                ))}
            </g>
            <g className="xp-meadow-rays" fill={RAY} opacity="0.55">
                {Array.from({ length: 8 }, (_, index) => (
                    <path
                        key={index}
                        d="M60 18l4 14h-8Z"
                        transform={`rotate(${index * 45 + 22.5} 60 60)`}
                    />
                ))}
            </g>
            <circle cx="60" cy="60" r="29" fill={BODY} />
            <circle cx="60" cy="60" r="20" fill={CORE} />
        </svg>
    )
}

function SunRising() {
    return (
        <svg viewBox="0 0 120 78" data-variant="sun-6" {...art}>
            <g className="xp-meadow-rays" fill={RAY} opacity="0.55">
                {Array.from({ length: 7 }, (_, index) => (
                    <path
                        key={index}
                        d="M60 6l4.6 22h-9.2Z"
                        transform={`rotate(${index * 25 - 75} 60 66)`}
                    />
                ))}
            </g>
            <path d="M28 66a32 32 0 0 1 64 0Z" fill={BODY} />
            <path d="M38 66a22 22 0 0 1 44 0Z" fill={CORE} />
            <rect x="6" y="64" width="108" height="4" rx="2" fill={DEEP} opacity="0.35" />
        </svg>
    )
}

export const MEADOW_SUN_VARIANTS: readonly MeadowVariant[] = [
    {
        id: "sun-1",
        label: "Sun 1",
        note: "Twelve tapered rays, current style refined",
        Art: SunRayed,
    },
    { id: "sun-3", label: "Sun 3", note: "Rayless glow orb, concentric haloes", Art: SunGlow },
    { id: "sun-4", label: "Sun 4", note: "Friendly face with leaf-shaped rays", Art: SunFace },
    { id: "sun-5", label: "Sun 5", note: "Alternating long and short spikes", Art: SunSpiky },
    { id: "sun-6", label: "Sun 6", note: "Half sun rising over a horizon line", Art: SunRising },
]

export { SunRayed, SunGlow, SunFace, SunSpiky, SunRising }
