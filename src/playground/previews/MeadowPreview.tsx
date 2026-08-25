"use client"

import { useRef } from "react"

import { Meadow } from "@/lib"
import type { MeadowDensity, MeadowEventPace, MeadowTheme } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function MeadowPreview({ config }: PreviewApi) {
    const c = config as unknown as Record<string, boolean> & {
        density: MeadowDensity
        theme: MeadowTheme
        eventFrequency: MeadowEventPace
        seed: number
        bees: number
        butterflyCount: number
        ghostCount: number
        balloonCount: number
        fireflyCount: number
        planetCount: number
    }
    const stage = useRef<HTMLDivElement>(null)

    // rare events are rare on purpose, so the docs can ask for one directly
    const fire = (name: string) =>
        stage.current
            ?.querySelector(".xp-meadow")
            ?.dispatchEvent(new CustomEvent("meadow:event", { detail: name }))

    return (
        <div className="xpg-meadow-stage" ref={stage}>
            <Meadow
                density={c.density}
                theme={c.theme}
                timeAware={c.timeAware}
                animated={c.animated}
                trails={c.trails}
                seed={c.seed}
                interaction={{ enabled: c.interactive }}
                events={c.events}
                eventFrequency={c.eventFrequency}
                creatures={{
                    bees: c.bees,
                    butterflies: c.butterflyCount,
                    ghosts: c.ghostCount,
                    balloons: c.balloonCount,
                    fireflies: c.fireflyCount,
                }}
                space={{ planets: c.planetCount }}
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

            <div className="xpg-meadow-events">
                <button type="button" onClick={() => fire("beeGather")}>
                    Bee gathering
                </button>
                <button type="button" onClick={() => fire("butterflyLand")}>
                    Butterfly lands
                </button>
                <button type="button" onClick={() => fire("shootingStar")}>
                    Shooting star
                </button>
                <button type="button" onClick={() => fire("ufoAbduction")}>
                    UFO abduction
                </button>
            </div>
        </div>
    )
}
