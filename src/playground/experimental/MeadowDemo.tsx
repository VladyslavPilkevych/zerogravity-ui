"use client"

import { Meadow } from "@/lib/experimental"
import type { MeadowDensity } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = {
    density: "cosy",
    animated: true,
    trails: true,
    seed: 5,
    sun: true,
    clouds: true,
    hills: true,
    flowers: true,
    balloon: true,
    plane: true,
    butterflies: true,
    birds: true,
    mascots: true,
    stars: true,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "life",
        title: "Life",
        hint: "how many characters drift through and how they move",
        open: true,
        controls: [
            {
                kind: "select",
                path: "density",
                label: "Density",
                options: ["calm", "cosy", "lively"],
            },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 99, step: 1 },
            { kind: "boolean", path: "animated", label: "Animated" },
            { kind: "boolean", path: "trails", label: "Mascot trails" },
        ],
    },
    {
        id: "landscape",
        title: "Landscape",
        hint: "the scenery behind everything",
        open: true,
        controls: [
            { kind: "boolean", path: "sun", label: "Sun" },
            { kind: "boolean", path: "clouds", label: "Clouds" },
            { kind: "boolean", path: "hills", label: "Hills and grass" },
            { kind: "boolean", path: "flowers", label: "Flowers" },
        ],
    },
    {
        id: "cast",
        title: "Cast",
        hint: "which characters are allowed on stage",
        open: false,
        controls: [
            { kind: "boolean", path: "balloon", label: "Balloon" },
            { kind: "boolean", path: "plane", label: "Paper plane" },
            { kind: "boolean", path: "butterflies", label: "Butterflies" },
            { kind: "boolean", path: "birds", label: "Birds" },
            { kind: "boolean", path: "mascots", label: "Mascots" },
            { kind: "boolean", path: "stars", label: "Stars" },
        ],
    },
]

export function MeadowDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage
                title="Meadow"
                blurb="a warm pastel scene that drifts, bobs and flutters around your content"
            >
                <Meadow
                    density={config.density as MeadowDensity}
                    animated={config.animated}
                    trails={config.trails}
                    seed={config.seed}
                    scene={{
                        sun: config.sun,
                        clouds: config.clouds,
                        hills: config.hills,
                        flowers: config.flowers,
                        balloon: config.balloon,
                        plane: config.plane,
                        butterflies: config.butterflies,
                        birds: config.birds,
                        mascots: config.mascots,
                        stars: config.stars,
                    }}
                    className="xpg-meadow-scene"
                >
                    <div className="xpg-meadow-copy">
                        <span className="xpg-meadow-badge">Ages 4–10</span>
                        <h2>A little world that grows with them</h2>
                        <p>
                            Ten warm minutes a day of stories, sounds and small puzzles — made with
                            teachers, loved by families.
                        </p>
                        <div className="xpg-meadow-actions">
                            <button type="button" className="xpg-meadow-primary">
                                Start the journey
                            </button>
                            <button type="button" className="xpg-meadow-secondary">
                                Watch a lesson
                            </button>
                        </div>
                    </div>
                </Meadow>
            </Stage>

            <Panel
                component="Meadow"
                subtitle="a living pastel hero scene"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
            />
        </>
    )
}
