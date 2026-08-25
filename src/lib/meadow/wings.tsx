import type { ReactNode } from "react"

const svgProps = { focusable: "false", role: "presentation" } as const

export interface WingVariant {
    id: string
    /** drawn width in px before depth scaling */
    size: number
    /** wing beats per second; smaller creatures flap faster */
    flap: number
    /** how far this one strays from a straight line, 0..1 */
    curve: number
    /** cruising speed in scene percent per second */
    speed: number
    art: ReactNode
}

/* ------------------------------------------------------------------ bees */

function Bee({
    body,
    stripe,
    stripes,
    wing,
    stout,
}: {
    body: string
    stripe: string
    stripes: number
    wing: string
    stout: boolean
}) {
    const width = stout ? 15 : 12
    const step = width / (stripes + 1)

    return (
        <svg viewBox="0 0 34 22" {...svgProps}>
            <ellipse cx="18" cy="13" rx={width} ry={stout ? 7 : 5.6} fill={body} />
            {Array.from({ length: stripes }, (_, index) => (
                <rect
                    key={index}
                    x={13 + index * step}
                    y={stout ? 7.4 : 8.6}
                    width={step * 0.52}
                    height={stout ? 11 : 8.8}
                    rx={step * 0.26}
                    fill={stripe}
                />
            ))}
            <circle cx={29} cy="12" r={stout ? 4.4 : 3.6} fill={stripe} />
            <path
                d="M30 8.6c1.5-2.4 3.1-3 4.1-2.8M31 9.8c1.6-1.6 3.2-1.6 4-1"
                stroke={stripe}
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
            />

            {/* wings last, so they read over the body rather than behind it */}
            <g className="xp-meadow-wing-left" opacity="0.72">
                <ellipse
                    cx="15"
                    cy="6.4"
                    rx={stout ? 7.4 : 8.6}
                    ry="4.8"
                    fill={wing}
                    stroke={stripe}
                    strokeOpacity="0.28"
                    strokeWidth="0.6"
                />
            </g>
            <g className="xp-meadow-wing-right" opacity="0.62">
                <ellipse
                    cx="22"
                    cy="7.6"
                    rx={stout ? 6.2 : 7.2}
                    ry="4"
                    fill={wing}
                    stroke={stripe}
                    strokeOpacity="0.24"
                    strokeWidth="0.6"
                />
            </g>
        </svg>
    )
}

/** A small curated set. Enough that the meadow never looks cloned. */
export const MEADOW_BEES: readonly WingVariant[] = [
    {
        id: "honey",
        size: 30,
        flap: 15,
        curve: 0.5,
        speed: 8,
        art: <Bee body="#f0c14b" stripe="#4a3320" stripes={3} wing="#e8f0f7" stout={false} />,
    },
    {
        id: "bumble",
        size: 36,
        flap: 11,
        curve: 0.3,
        speed: 5.5,
        art: <Bee body="#f7d174" stripe="#3a2a1a" stripes={2} wing="#eef4fa" stout />,
    },
    {
        id: "amber",
        size: 27,
        flap: 17,
        curve: 0.7,
        speed: 10,
        art: <Bee body="#e9a53c" stripe="#4a3320" stripes={4} wing="#f0f6fb" stout={false} />,
    },
    {
        id: "dusk",
        size: 32,
        flap: 13,
        curve: 0.42,
        speed: 7,
        art: <Bee body="#d9a441" stripe="#332415" stripes={3} wing="#e6eef6" stout />,
    },
    {
        id: "clover",
        size: 25,
        flap: 19,
        curve: 0.85,
        speed: 11.5,
        art: <Bee body="#f5c95f" stripe="#5a4126" stripes={2} wing="#f2f8fd" stout={false} />,
    },
]

/* ------------------------------------------------------------ butterflies */

function Butterfly({
    upper,
    lower,
    body,
    round,
}: {
    upper: string
    lower: string
    body: string
    round: boolean
}) {
    return (
        <svg viewBox="0 0 56 44" {...svgProps}>
            <g className="xp-meadow-wing-left">
                {round ? (
                    <>
                        <path d="M27 22C17 5 3 8 4 18c1 9 12 11 23 4Z" fill={upper} />
                        <path d="M27 23C20 35 8 37 6 29c-2-8 9-10 21-6Z" fill={lower} />
                    </>
                ) : (
                    <>
                        <path d="M27 22C18 6 4 6 4 16c0 9 11 12 23 6Z" fill={upper} />
                        <path d="M27 23C19 34 7 36 6 28c-1-7 9-9 21-5Z" fill={lower} />
                    </>
                )}
            </g>
            <g className="xp-meadow-wing-right">
                {round ? (
                    <>
                        <path d="M29 22C39 5 53 8 52 18c-1 9-12 11-23 4Z" fill={upper} />
                        <path d="M29 23C36 35 48 37 50 29c2-8-9-10-21-6Z" fill={lower} />
                    </>
                ) : (
                    <>
                        <path d="M29 22C38 6 52 6 52 16c0 9-11 12-23 6Z" fill={upper} />
                        <path d="M29 23C37 34 49 36 50 28c1-7-9-9-21-5Z" fill={lower} />
                    </>
                )}
            </g>
            <rect x="26.4" y="12" width="3.2" height="22" rx="1.6" fill={body} />
            <path
                d="M27 13c-2-4-5-5-7-5M29 13c2-4 5-5 7-5"
                stroke={body}
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

export const MEADOW_BUTTERFLIES: readonly WingVariant[] = [
    {
        id: "blush",
        size: 54,
        flap: 6,
        curve: 0.62,
        speed: 4.4,
        art: <Butterfly upper="#f4bfc9" lower="#f6cfb6" body="#8a7a6e" round={false} />,
    },
    {
        id: "cornflower",
        size: 50,
        flap: 7,
        curve: 0.8,
        speed: 5.2,
        art: <Butterfly upper="#a8c6f0" lower="#cfe0f7" body="#6f7d8f" round />,
    },
    {
        id: "buttercup",
        size: 46,
        flap: 8.5,
        curve: 0.95,
        speed: 6,
        art: <Butterfly upper="#f6dd8a" lower="#fbeec0" body="#8b7a54" round={false} />,
    },
    {
        id: "marigold",
        size: 52,
        flap: 6.5,
        curve: 0.55,
        speed: 4.8,
        art: <Butterfly upper="#f4b57a" lower="#f8d3ac" body="#8a6b52" round />,
    },
    {
        id: "lilac",
        size: 48,
        flap: 7.5,
        curve: 0.72,
        speed: 5.4,
        art: <Butterfly upper="#c9b4e8" lower="#e2d6f5" body="#7a6f8c" round />,
    },
    {
        id: "chalk",
        size: 44,
        flap: 9,
        curve: 1,
        speed: 6.4,
        art: <Butterfly upper="#f2f0ea" lower="#fbfaf6" body="#9a9288" round={false} />,
    },
]
