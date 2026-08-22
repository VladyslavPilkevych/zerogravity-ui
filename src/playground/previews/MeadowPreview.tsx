"use client"

import { Meadow } from "@/lib/experimental"
import type { MeadowDensity, MeadowTheme } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function MeadowPreview({ config }: PreviewApi) {
    const c = config as unknown as Record<string, boolean> & {
        density: MeadowDensity
        theme: MeadowTheme
        seed: number
    }

    return (
        <Meadow
            density={c.density}
            theme={c.theme}
            timeAware={c.timeAware}
            animated={c.animated}
            trails={c.trails}
            seed={c.seed}
            scene={{
                sun: c.sun,
                clouds: c.clouds,
                hills: c.hills,
                flowers: c.flowers,
                balloon: c.balloon,
                butterflies: c.butterflies,
                birds: c.birds,
                mascots: c.mascots,
                stars: c.stars,
                comets: c.comets,
                planets: c.planets,
                rockets: c.rockets,
                ufos: c.ufos,
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
    )
}
