"use client"

import { Diorama } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = { parallax: 46, blur: 7, perspective: 1200, ease: 0.11 }

const CONTROLS: ControlGroup[] = [
    {
        id: "optics",
        title: "Optics",
        hint: "how strongly depth separates the layers",
        open: true,
        controls: [
            {
                kind: "number",
                path: "parallax",
                label: "Parallax",
                min: 0,
                max: 140,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "blur",
                label: "Foreground blur",
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
            },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 400,
                max: 2400,
                step: 50,
                unit: "px",
            },
            { kind: "number", path: "ease", label: "Ease", min: 0.02, max: 1, step: 0.02 },
        ],
    },
]

export function DioramaDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Diorama" blurb="move the pointer to look past the foreground">
                <Diorama
                    parallax={config.parallax}
                    blur={config.blur}
                    perspective={config.perspective}
                    ease={config.ease}
                    className="xpg-frame"
                    background={
                        <div className="xpg-diorama-far">
                            <h2>Distant subject</h2>
                            <p>Move the pointer to see more of this.</p>
                        </div>
                    }
                    planes={[
                        { content: <div className="xpg-leaves xpg-leaves-mid" />, depth: 0.45 },
                        { content: <div className="xpg-leaves xpg-leaves-near" />, depth: 1 },
                    ]}
                />
            </Stage>

            <Panel
                component="Diorama"
                subtitle="looking past blurred foreground layers"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
                omit={[]}
            />
        </>
    )
}
