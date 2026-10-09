"use client"

import type { ReactNode } from "react"

import { Diorama, type DioramaPlane } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { DIORAMA_EXAMPLES, type DioramaExample } from "../experimental/schemas"

interface Scene {
    caption: string
    background: ReactNode
    planes: DioramaPlane[]
}

const HEADPHONES = [
    "..####..",
    ".#....#.",
    "#......#",
    "#......#",
    "##....##",
    "##....##",
    "##....##",
    "........",
]

const HEADPHONES_PATH = HEADPHONES.flatMap((row, y) =>
    Array.from(row).map((cell, x) => (cell === "#" ? `M${x} ${y}h1v1h-1z` : "")),
).join("")

const SCENES: Record<DioramaExample, Scene> = {
    product: {
        caption: "Sharp product on the far plane, labels at mid depth, blurred shapes up close",
        background: (
            <div className="xpg-dio-product">
                <article className="xpg-dio-card">
                    <svg viewBox="0 0 8 8" aria-hidden="true" shapeRendering="crispEdges">
                        <path d={HEADPHONES_PATH} />
                    </svg>
                    <h3>Halo One</h3>
                    <span>Wireless · $249</span>
                </article>
            </div>
        ),
        planes: [
            {
                depth: 0.5,
                content: (
                    <div className="xpg-dio-chips">
                        <span>40 h battery</span>
                        <span>Noise cancelling</span>
                        <span>USB-C</span>
                    </div>
                ),
            },
            {
                depth: 1,
                content: (
                    <div className="xpg-dio-blocks">
                        <i style={{ top: "12%", left: "8%", background: "#4ee1f2" }} />
                        <i style={{ top: "68%", left: "78%", background: "#ff5fa2" }} />
                        <i style={{ top: "72%", left: "12%", background: "#c6f24e" }} />
                    </div>
                ),
            },
        ],
    },
    editorial: {
        caption: "Copy and picture share the far plane; the caption floats just in front",
        background: (
            <div className="xpg-dio-editorial">
                <div className="xpg-dio-copy">
                    <span>Field notes</span>
                    <h3>The coast at low tide</h3>
                    <p>Twelve kilometres of sand appear twice a day, then vanish again.</p>
                </div>
                <div className="xpg-dio-picture" aria-hidden="true">
                    <i className="xpg-dio-sun" />
                    <i className="xpg-dio-sea" />
                </div>
            </div>
        ),
        planes: [
            {
                depth: 0.4,
                content: (
                    <div className="xpg-dio-caption-plane">
                        <span>Fig. 1 — 06:12, ebb</span>
                    </div>
                ),
            },
            {
                depth: 1,
                content: (
                    <div className="xpg-dio-blocks xpg-dio-blocks-soft">
                        <i style={{ top: "6%", left: "4%", background: "#c6f24e" }} />
                        <i style={{ top: "74%", left: "90%", background: "#4ee1f2" }} />
                    </div>
                ),
            },
        ],
    },
    poster: {
        caption: "Title behind the ridge; the nearest hills travel furthest",
        background: (
            <div className="xpg-dio-poster">
                <i className="xpg-dio-poster-sun" />
                <h3>Summit</h3>
            </div>
        ),
        planes: [
            {
                depth: 0.45,
                content: (
                    <svg
                        className="xpg-dio-ridge xpg-dio-ridge-mid"
                        viewBox="0 0 100 40"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path d="M0 40V22l10-8 8 6 12-14 10 9 9-5 13 13 10-10 9 6 10-9 9 7v23z" />
                    </svg>
                ),
            },
            {
                depth: 1,
                content: (
                    <svg
                        className="xpg-dio-ridge xpg-dio-ridge-near"
                        viewBox="0 0 100 40"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path d="M0 40V24l14-6 16 8 18-12 20 10 16-6 16 6v16z" />
                    </svg>
                ),
            },
        ],
    },
    frame: {
        caption: "Out-of-focus foreground frames a centre that never moves out of view",
        background: (
            <div className="xpg-dio-framed">
                <h3>Look past the foreground</h3>
                <p>Near layers blur and move most. The centre stays sharp.</p>
            </div>
        ),
        planes: [
            {
                depth: 0.55,
                content: (
                    <div className="xpg-dio-steps xpg-dio-steps-mid">
                        <i style={{ top: "6%", right: "6%" }} />
                        <i style={{ bottom: "8%", left: "10%" }} />
                    </div>
                ),
            },
            {
                depth: 1,
                content: (
                    <div className="xpg-dio-steps xpg-dio-steps-near">
                        <i style={{ top: "4%", left: "4%" }} />
                        <i style={{ bottom: "4%", right: "4%" }} />
                    </div>
                ),
            },
        ],
    },
}

export function DioramaPreview({ config, setPreset }: PreviewApi) {
    const c = config as {
        example: DioramaExample
        parallax: number
        blur: number
        perspective: number
        ease: number
    }
    const scene = SCENES[c.example] ?? SCENES.product

    return (
        <div className="xpg-dio">
            <div className="xpg-dio-bar" role="group" aria-label="Example">
                {DIORAMA_EXAMPLES.map((example) => (
                    <button
                        key={example.id}
                        type="button"
                        aria-pressed={example.id === c.example}
                        onClick={() => setPreset(example.id)}
                    >
                        {example.label}
                    </button>
                ))}
            </div>

            <Diorama
                key={c.example}
                parallax={c.parallax}
                blur={c.blur}
                perspective={c.perspective}
                ease={c.ease}
                className="xpg-dio-scene"
                background={scene.background}
                planes={scene.planes}
            />

            <p className="xpg-dio-note">
                <span>{scene.caption}</span>
                <span className="xpg-dio-legend" aria-hidden="true">
                    <i data-depth="far" />
                    far
                    <i data-depth="mid" />
                    mid
                    <i data-depth="near" />
                    near
                </span>
            </p>
        </div>
    )
}
