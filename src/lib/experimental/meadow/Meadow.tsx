"use client"

import type { CSSProperties, ReactNode } from "react"

import { cx, useMediaQuery, usePrefersReducedMotion } from "../../internal"
import {
    MEADOW_ART,
    MEADOW_CAST,
    MEADOW_CLOUDS,
    MEADOW_PLANTS,
    MeadowCloud,
    MeadowHills,
    MeadowSun,
    type MeadowItem,
    type MeadowPlantSpot,
} from "./art"
import {
    MEADOW_DENSITY,
    planCast,
    type MeadowDensity,
    type MeadowKind,
    type MeadowPlanEntry,
} from "./plan"
import "./Meadow.css"

export interface MeadowScene {
    sun?: boolean
    clouds?: boolean
    hills?: boolean
    flowers?: boolean
    balloon?: boolean
    plane?: boolean
    butterflies?: boolean
    birds?: boolean
    mascots?: boolean
    stars?: boolean
}

export interface MeadowProps {
    children?: ReactNode
    items?: readonly MeadowItem[]
    density?: MeadowDensity
    scene?: MeadowScene
    animated?: boolean
    trails?: boolean
    seed?: number
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const TIGHT_QUERY = "(max-width: 1080px)"
const SMALL_QUERY = "(max-width: 700px)"
const SMALL_CAST = 3
const ECHOES = [0.13, 0.27] as const

const TOGGLE: Record<MeadowKind, keyof MeadowScene> = {
    balloon: "balloon",
    plane: "plane",
    butterfly: "butterflies",
    bird: "birds",
    mascot: "mascots",
    star: "stars",
}

export function Meadow({
    children,
    items = MEADOW_CAST,
    density = "cosy",
    scene,
    animated = true,
    trails = true,
    seed = 5,
    respectReducedMotion = true,
    className,
    style,
}: MeadowProps) {
    const reduced = usePrefersReducedMotion()
    const tight = useMediaQuery(TIGHT_QUERY)
    const small = useMediaQuery(SMALL_QUERY)

    const still = !animated || (respectReducedMotion && reduced)
    const shows = (part: keyof MeadowScene) => scene?.[part] !== false

    const base = MEADOW_DENSITY[density] ?? MEADOW_DENSITY.cosy
    const count = small ? Math.min(base, SMALL_CAST) : base

    const allowed = items.filter((item) => !item.kind || shows(TOGGLE[item.kind]))
    const cast = planCast(allowed, count, seed, tight)

    const clouds = small ? MEADOW_CLOUDS.slice(0, 3) : MEADOW_CLOUDS
    const plants = (small ? MEADOW_PLANTS.filter((plant) => !plant.dense) : MEADOW_PLANTS).filter(
        (plant) => (plant.kind === "tuft" ? shows("hills") : shows("flowers")),
    )

    const sky = shows("sun") || shows("clouds")
    const land = shows("hills") || plants.length > 0
    const near = plants.filter((plant) => plant.near)

    return (
        <div className={cx("xp-meadow", still && "xp-meadow-still", className)} style={style}>
            {sky ? (
                <div className="xp-meadow-layer xp-meadow-far" aria-hidden="true">
                    <div className="xp-meadow-drift">
                        {shows("sun") ? (
                            <>
                                <div className="xp-meadow-glow" />
                                <div className="xp-meadow-sun">
                                    <MeadowSun />
                                </div>
                            </>
                        ) : null}

                        {shows("clouds")
                            ? clouds.map((cloud, index) => (
                                  <div
                                      key={index}
                                      className={cx(
                                          "xp-meadow-cloud",
                                          cloud.far && "xp-meadow-cloud-far",
                                      )}
                                      style={{
                                          ["--m-x" as string]: cloud.x,
                                          ["--m-y" as string]: cloud.y,
                                          ["--m-size" as string]: cloud.size,
                                          ["--m-tone" as string]: cloud.tone,
                                          ["--m-beat" as string]: cloud.drift,
                                      }}
                                  >
                                      <MeadowCloud />
                                  </div>
                              ))
                            : null}
                    </div>
                </div>
            ) : null}

            {land ? (
                <div className="xp-meadow-layer xp-meadow-land" aria-hidden="true">
                    <div className="xp-meadow-drift">
                        {shows("hills") ? (
                            <div className="xp-meadow-hills">
                                <MeadowHills />
                            </div>
                        ) : null}
                        {plants
                            .filter((plant) => !plant.near)
                            .map((plant, index) => (
                                <Plant key={index} plant={plant} />
                            ))}
                    </div>
                </div>
            ) : null}

            {cast.length > 0 ? (
                <div className="xp-meadow-layer xp-meadow-air" aria-hidden="true">
                    {cast.map((entry) => (
                        <Creature
                            key={entry.index}
                            entry={entry}
                            content={allowed[entry.item].content}
                            trail={trails && entry.kind === "mascot"}
                        />
                    ))}
                </div>
            ) : null}

            <div className="xp-meadow-content">{children}</div>

            {near.length > 0 ? (
                <div className="xp-meadow-layer xp-meadow-fore" aria-hidden="true">
                    <div className="xp-meadow-drift">
                        {near.map((plant, index) => (
                            <Plant key={index} plant={plant} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}

function Plant({ plant }: { plant: MeadowPlantSpot }) {
    const Art = MEADOW_ART[plant.kind]

    return (
        <div
            className={cx("xp-meadow-plant", `xp-meadow-tint-${plant.tint}`)}
            style={{
                ["--m-x" as string]: plant.x,
                ["--m-bottom" as string]: plant.bottom,
                ["--m-size" as string]: plant.size,
                ["--m-beat" as string]: plant.sway,
            }}
        >
            <Art />
        </div>
    )
}

interface CreatureProps {
    entry: MeadowPlanEntry
    content: ReactNode
    trail: boolean
}

function Creature({ entry, content, trail }: CreatureProps) {
    return (
        <div
            className="xp-meadow-object"
            data-motion={entry.motion}
            data-kind={entry.kind}
            data-flip={entry.flip ? "true" : undefined}
            style={{
                ["--m-x" as string]: entry.x,
                ["--m-y" as string]: entry.y,
                ["--m-size" as string]: entry.size,
                ["--m-alpha" as string]: 0.8 + entry.depth * 0.2,
                ["--m-beat" as string]: entry.duration,
                ["--m-delay" as string]: entry.delay,
                ["--m-reach" as string]: entry.amplitude,
                ["--m-sway" as string]: entry.sway,
                ["--m-spin" as string]: entry.spin,
                ["--m-rest" as string]: entry.rest,
                ["--m-swing" as string]: entry.swing,
            }}
        >
            {trail
                ? ECHOES.map((lag, index) => (
                      <div
                          key={lag}
                          className="xp-meadow-echo"
                          data-motion={entry.motion}
                          style={{
                              ["--m-lag" as string]: lag,
                              ["--m-fade" as string]: 0.46 - index * 0.22,
                              ["--m-shrink" as string]: 0.92 + index * 0.24,
                          }}
                      />
                  ))
                : null}
            <div className="xp-meadow-track" data-motion={entry.motion}>
                <div className="xp-meadow-body" data-motion={entry.motion}>
                    {content}
                </div>
            </div>
        </div>
    )
}
