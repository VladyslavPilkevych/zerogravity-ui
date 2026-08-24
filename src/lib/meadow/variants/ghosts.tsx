import { ghostBody } from "./ghostBody"
import type { MeadowVariant } from "./types"

const art = { role: "presentation", focusable: "false" } as const

const skin = {
    fill: "var(--meadow-body)",
    stroke: "var(--meadow-outline)",
    strokeWidth: 2.6,
} as const

function Eyes({ cx, y, r, gap }: { cx: number; y: number; r: number; gap: number }) {
    return (
        <>
            <ellipse cx={cx - gap} cy={y} rx={r} ry={r * 1.2} fill="var(--meadow-face)" />
            <ellipse cx={cx + gap} cy={y} rx={r} ry={r * 1.2} fill="var(--meadow-face)" />
            <circle
                cx={cx - gap - r * 0.34}
                cy={y - r * 0.5}
                r={r * 0.34}
                fill="#ffffff"
                opacity="0.92"
            />
            <circle
                cx={cx + gap - r * 0.34}
                cy={y - r * 0.5}
                r={r * 0.34}
                fill="#ffffff"
                opacity="0.92"
            />
        </>
    )
}

function Blush({ cx, y, gap, rx }: { cx: number; y: number; gap: number; rx: number }) {
    return (
        <>
            <ellipse
                cx={cx - gap}
                cy={y}
                rx={rx}
                ry={rx * 0.62}
                fill="var(--meadow-blush)"
                opacity="0.85"
            />
            <ellipse
                cx={cx + gap}
                cy={y}
                rx={rx}
                ry={rx * 0.62}
                fill="var(--meadow-blush)"
                opacity="0.85"
            />
        </>
    )
}

function GhostClassic() {
    return (
        <svg viewBox="0 0 64 78" data-variant="ghost-1" {...art}>
            <path
                d={ghostBody({
                    width: 64,
                    height: 78,
                    top: 5,
                    shoulder: 30,
                    hem: 62,
                    scallops: 3,
                    droop: 10,
                })}
                {...skin}
            />
            <Blush cx={32} y={44} gap={16} rx={5.4} />
            <Eyes cx={32} y={32} r={5} gap={8} />
            <ellipse cx="32" cy="44" rx="4" ry="4.8" fill="var(--meadow-face)" />
        </svg>
    )
}

function GhostKitten() {
    return (
        <svg viewBox="0 0 68 76" data-variant="ghost-5" {...art}>
            <path
                d="M17 20 14 6l14 8ZM51 20 54 6 40 14Z"
                fill="var(--meadow-body)"
                stroke="var(--meadow-outline)"
                strokeWidth="2.4"
                strokeLinejoin="round"
            />
            <path
                d={ghostBody({
                    width: 68,
                    height: 76,
                    top: 10,
                    shoulder: 32,
                    hem: 58,
                    scallops: 4,
                    droop: 9,
                    lift: 0.66,
                })}
                {...skin}
            />
            <Blush cx={34} y={44} gap={18} rx={5.4} />
            <Eyes cx={34} y={33} r={5} gap={9} />
            <path
                d="M30 44c1.4 2.6 4 2.6 4 0 0 2.6 2.6 2.6 4 0"
                stroke="var(--meadow-face)"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

function GhostRibbon() {
    return (
        <svg viewBox="0 0 66 80" data-variant="ghost-6" {...art}>
            <path
                d={ghostBody({
                    width: 66,
                    height: 80,
                    top: 12,
                    shoulder: 36,
                    hem: 62,
                    scallops: 3,
                    droop: 10,
                })}
                {...skin}
            />
            <path
                d="M33 13c-4-6-13-7-13-1s9 5 13 1Zm0 0c4-6 13-7 13-1s-9 5-13 1Z"
                fill="var(--meadow-blush)"
                stroke="var(--meadow-outline)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <circle
                cx="33"
                cy="13"
                r="3"
                fill="var(--meadow-blush)"
                stroke="var(--meadow-outline)"
                strokeWidth="1.8"
            />
            <Blush cx={33} y={48} gap={17} rx={5.4} />
            <ellipse cx="25" cy="37" rx="5" ry="6" fill="var(--meadow-face)" />
            <circle cx="23.4" cy="34.6" r="1.7" fill="#ffffff" opacity="0.92" />
            <path
                d="M36 36c3-3.4 7.6-3.4 10.6 0"
                stroke="var(--meadow-face)"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
            />
            <ellipse cx="33" cy="48" rx="3.6" ry="4.2" fill="var(--meadow-face)" />
        </svg>
    )
}

export const MEADOW_GHOST_VARIANTS: readonly MeadowVariant[] = [
    {
        id: "ghost-1",
        label: "Ghost 1",
        note: "Tall classic, three scallops, open mouth",
        Art: GhostClassic,
    },
    { id: "ghost-5", label: "Ghost 5", note: "Kitten ears and a cat mouth", Art: GhostKitten },
    { id: "ghost-6", label: "Ghost 6", note: "Ribbon on top, winking", Art: GhostRibbon },
]

export { GhostClassic, GhostKitten, GhostRibbon }
