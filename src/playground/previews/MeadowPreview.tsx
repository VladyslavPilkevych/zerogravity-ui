"use client"

import { Meadow } from "@/lib"
import type { MeadowDensity, MeadowTheme } from "@/lib"
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
            <span className="xpg-meadow-word">Meadow</span>
        </Meadow>
    )
}
