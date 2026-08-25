"use client"

import { useRef, type CSSProperties, type ReactNode } from "react"

import { cx, useMediaQuery, usePrefersReducedMotion } from "../internal"
import { Flyers } from "./Flyers"
import { useLocalHour } from "./clock"
import {
    MEADOW_ART,
    MEADOW_CAST,
    MEADOW_CLOUDS,
    MEADOW_COMETS,
    MEADOW_MOON_ART,
    MEADOW_PLANET_ART,
    MEADOW_BALLOON_SILKS,
    MeadowBalloon,
    MEADOW_PLANETS,
    MEADOW_PLANTS,
    MEADOW_SPACE_CAST,
    MEADOW_SUN_ART,
    MeadowCloud,
    MeadowHills,
    type MeadowItem,
    type MeadowPlanetSpot,
    type MeadowPlantSpot,
} from "./art"
import {
    MEADOW_CLOCK,
    MEADOW_DENSITY,
    MEADOW_THEMES,
    daypartForHour,
    orbSpot,
    pickVariant,
    planBalloons,
    planCast,
    planGhosts,
    planStars,
    resolveLife,
    type MeadowClock,
    type MeadowCreatures,
    type MeadowDaypart,
    type MeadowDensity,
    type MeadowEventPace,
    type MeadowBalloonSpot,
    type MeadowGhostSpot,
    type MeadowInteraction,
    type MeadowKind,
    type MeadowSpaceScene,
    type MeadowPlanEntry,
    type MeadowScene,
    type MeadowScenePart,
    type MeadowTheme,
} from "./plan"
import { MEADOW_GHOST_VARIANTS } from "./variants"
import "./Meadow.css"

export interface MeadowProps {
    children?: ReactNode
    items?: readonly MeadowItem[]
    density?: MeadowDensity
    scene?: MeadowScene
    theme?: MeadowTheme
    /** follow the browser's local clock instead of the fixed theme */
    timeAware?: boolean
    /** advanced: move the sunrise/day/sunset/night boundaries */
    clock?: Partial<MeadowClock>
    animated?: boolean
    trails?: boolean
    /** how many bees, butterflies, ghosts and fireflies the scene carries */
    creatures?: MeadowCreatures
    /** pointer reactions; off unless `enabled` is set */
    interaction?: MeadowInteraction
    /** rare ambient moments: a bee gathering, a shooting star, an abduction */
    events?: boolean
    eventFrequency?: MeadowEventPace
    /** space-only scenery */
    space?: MeadowSpaceScene
    seed?: number
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const TIGHT_QUERY = "(max-width: 1080px)"
const SMALL_QUERY = "(max-width: 700px)"
const SMALL_CAST = 3
const ECHOES = [0.13, 0.27] as const
const SMALL_STARS = 0.6

const TOGGLE: Record<MeadowKind, MeadowScenePart> = {
    balloon: "balloon",
    butterfly: "butterflies",
    bird: "birds",
    mascot: "mascots",
    star: "stars",
    rocket: "rockets",
    ufo: "ufos",
}

const POINTER_QUERY = "(hover: hover) and (pointer: fine)"

export function Meadow({
    children,
    items,
    density = "cosy",
    scene,
    theme = "day",
    timeAware = false,
    clock,
    animated = true,
    trails = true,
    creatures,
    interaction,
    events = true,
    eventFrequency = "rare",
    space,
    seed = 5,
    respectReducedMotion = true,
    className,
    style,
}: MeadowProps) {
    const reduced = usePrefersReducedMotion()
    const tight = useMediaQuery(TIGHT_QUERY)
    const small = useMediaQuery(SMALL_QUERY)
    const fine = useMediaQuery(POINTER_QUERY)
    const local = useLocalHour(timeAware)
    const rootRef = useRef<HTMLDivElement>(null)

    const bounds: MeadowClock = { ...MEADOW_CLOCK, ...clock }
    // explicit space always wins; otherwise the clock, once it is known; otherwise the prop
    const daypart: MeadowDaypart | null =
        timeAware && local !== null ? daypartForHour(local, bounds) : null
    const active: MeadowTheme = theme === "space" ? "space" : (daypart ?? theme)

    const look = MEADOW_THEMES[active] ?? MEADOW_THEMES.day
    const arc = look.arc && local !== null ? orbSpot(local, bounds) : (look.orbAt ?? null)
    const still = !animated || (respectReducedMotion && reduced)
    const shows = (part: MeadowScenePart) =>
        !look.forbid.includes(part) && (scene?.[part] ?? !look.quiet.includes(part))

    const base = MEADOW_DENSITY[density] ?? MEADOW_DENSITY.cosy
    const count = small ? Math.min(base, SMALL_CAST) : base

    const life = resolveLife(active, density, creatures, space, small)
    const touchable = interaction?.enabled === true && fine && !still
    const ghosts =
        shows("mascots") && life.ghosts > 0
            ? planGhosts(life.ghosts, seed, MEADOW_GHOST_VARIANTS.length, tight)
            : []
    const balloons =
        shows("balloon") && life.balloons > 0
            ? planBalloons(life.balloons, seed, MEADOW_BALLOON_SILKS.length, tight)
            : []

    const cast_ = items ?? (theme === "space" ? MEADOW_SPACE_CAST : MEADOW_CAST)
    const allowed = cast_.filter((item) => !item.kind || shows(TOGGLE[item.kind]))
    const cast = planCast(allowed, count, seed, tight)

    const clouds = shows("clouds") ? (small ? MEADOW_CLOUDS.slice(0, 3) : MEADOW_CLOUDS) : []
    const plants = (small ? MEADOW_PLANTS.filter((plant) => !plant.dense) : MEADOW_PLANTS).filter(
        (plant) => (plant.kind === "tuft" ? shows("hills") : shows("flowers")),
    )

    const starCount = shows("stars") ? Math.round(look.stars * (small ? SMALL_STARS : 1)) : 0
    const stars = starCount > 0 ? planStars(starCount, seed, look.starSize) : []
    const comets = look.stars > 0 && !small && shows("comets") ? MEADOW_COMETS : []
    const planets = shows("planets")
        ? (small ? MEADOW_PLANETS.filter((planet) => !planet.dense) : MEADOW_PLANETS).slice(
              0,
              life.planets,
          )
        : []
    const orb = look.orb !== null && shows("sun")
    const Orb =
        look.orb === "moon"
            ? MEADOW_MOON_ART[pickVariant(MEADOW_MOON_ART.length, seed, 31)]
            : MEADOW_SUN_ART[pickVariant(MEADOW_SUN_ART.length, seed, 17)]
    const sky = orb || clouds.length > 0 || stars.length > 0 || planets.length > 0
    const land = shows("hills") || plants.length > 0
    const near = plants.filter((plant) => plant.near)

    return (
        <div
            ref={rootRef}
            className={cx(
                "xp-meadow",
                look.surface,
                arc && "xp-meadow-arc",
                still && "xp-meadow-still",
                className,
            )}
            data-scene={active}
            data-interactive={touchable ? "true" : undefined}
            style={
                arc
                    ? {
                          ...style,
                          ["--orb-x" as string]: arc.x,
                          ["--orb-y" as string]: arc.y,
                      }
                    : style
            }
        >
            {sky ? (
                <div className="xp-meadow-layer xp-meadow-far" aria-hidden="true">
                    <div className="xp-meadow-drift">
                        {stars.map((star, index) => (
                            <div
                                key={index}
                                className="xp-meadow-star"
                                style={{
                                    ["--m-x" as string]: star.x,
                                    ["--m-y" as string]: star.y,
                                    ["--m-size" as string]: star.size,
                                    ["--m-tone" as string]: star.tone,
                                    ["--m-beat" as string]: star.beat,
                                }}
                            />
                        ))}

                        {comets.map((comet, index) => (
                            <div
                                key={index}
                                className="xp-meadow-comet"
                                style={{
                                    ["--m-x" as string]: comet.x,
                                    ["--m-y" as string]: comet.y,
                                    ["--m-size" as string]: comet.size,
                                    ["--m-beat" as string]: comet.beat,
                                    ["--m-delay" as string]: comet.delay,
                                    ["--m-tilt" as string]: comet.tilt,
                                }}
                            />
                        ))}

                        {orb ? (
                            <>
                                <div className="xp-meadow-glow" />
                                <div className="xp-meadow-orb" data-lit={look.orb ?? undefined}>
                                    {look.orb === "sun" ? (
                                        <span className="xp-meadow-corona" />
                                    ) : null}
                                    <Orb />
                                </div>
                            </>
                        ) : null}

                        {clouds.map((cloud, index) => (
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
                        ))}

                        {planets.map((planet, index) => (
                            <Planet key={index} planet={planet} tight={tight} />
                        ))}
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

            {cast.length > 0 || ghosts.length > 0 || balloons.length > 0 ? (
                <div className="xp-meadow-layer xp-meadow-air" aria-hidden="true">
                    {cast.map((entry) => (
                        <Creature
                            key={entry.index}
                            entry={entry}
                            content={allowed[entry.item].content}
                            trail={trails && entry.kind === "mascot"}
                            glow={look.glow && entry.kind === "mascot"}
                        />
                    ))}

                    {balloons.map((balloon, index) => (
                        <Balloon key={`balloon-${index}`} balloon={balloon} />
                    ))}

                    {ghosts.map((ghost, index) => (
                        <Ghost
                            key={`ghost-${index}`}
                            ghost={ghost}
                            glow={look.glow}
                            reacts={touchable && (interaction?.ghostsReact ?? true)}
                        />
                    ))}
                </div>
            ) : null}

            {life.bees + life.butterflies + life.fireflies > 0 ? (
                <Flyers
                    host={rootRef}
                    bees={life.bees}
                    butterflies={life.butterflies}
                    fireflies={life.fireflies}
                    interactive={touchable}
                    avoid={interaction?.pointerAvoidance ?? true}
                    curious={interaction?.curiousButterflies ?? true}
                    interactionRadius={interaction?.radius ?? 16}
                    events={events && !still}
                    pace={eventFrequency}
                    night={active === "night"}
                    still={still}
                    seed={seed}
                />
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

function Planet({ planet, tight }: { planet: MeadowPlanetSpot; tight: boolean }) {
    const Art = MEADOW_PLANET_ART[planet.art]
    const spot = tight && planet.compact ? planet.compact : planet

    return (
        <div
            className="xp-meadow-planet"
            data-faint={planet.faint ? "true" : undefined}
            data-layer={planet.layer ?? "mid"}
            style={{
                ["--m-x" as string]: spot.x,
                ["--m-y" as string]: spot.y,
                ["--m-size" as string]: spot.size,
                ["--m-beat" as string]: planet.beat,
            }}
        >
            <Art />
            {planet.orbit ? (
                <div className="xp-meadow-orbit" style={{ ["--m-ring" as string]: planet.orbit }}>
                    <div className="xp-meadow-orbit-ring" />
                    <div className="xp-meadow-orbit-spin">
                        <span className="xp-meadow-orbit-dot" />
                    </div>
                </div>
            ) : null}
        </div>
    )
}

function Balloon({ balloon }: { balloon: MeadowBalloonSpot }) {
    return (
        <div
            className="xp-meadow-object"
            data-motion="bob"
            data-kind="balloon"
            style={{
                ["--m-x" as string]: balloon.x,
                ["--m-y" as string]: balloon.y,
                ["--m-size" as string]: balloon.size,
                ["--m-alpha" as string]: 0.72 + balloon.depth * 0.28,
                ["--m-beat" as string]: balloon.duration,
                ["--m-delay" as string]: balloon.delay,
                ["--m-reach" as string]: balloon.amplitude,
                ["--m-sway" as string]: balloon.sway,
                ["--m-spin" as string]: 2.4,
                ["--m-rest" as string]: 40,
                ["--m-swing" as string]: balloon.x < 50 ? -1 : 1,
            }}
        >
            <div className="xp-meadow-track" data-motion="bob">
                <div className="xp-meadow-body" data-motion="bob">
                    <MeadowBalloon silk={balloon.silk} rider={balloon.rider} />
                </div>
            </div>
        </div>
    )
}

function Ghost({
    ghost,
    glow,
    reacts,
}: {
    ghost: MeadowGhostSpot
    glow: boolean
    reacts: boolean
}) {
    const Art = MEADOW_GHOST_VARIANTS[ghost.variant % MEADOW_GHOST_VARIANTS.length].Art

    return (
        <div
            className="xp-meadow-object xp-meadow-ghost"
            data-motion={ghost.motion}
            data-kind="mascot"
            data-behaviour={ghost.behaviour}
            data-reacts={reacts ? "true" : undefined}
            style={{
                ["--m-x" as string]: ghost.x,
                ["--m-y" as string]: ghost.y,
                ["--m-size" as string]: ghost.size,
                ["--m-alpha" as string]: 0.62 + ghost.depth * 0.38,
                ["--m-beat" as string]: ghost.duration,
                ["--m-delay" as string]: ghost.delay,
                ["--m-reach" as string]: ghost.amplitude,
                ["--m-sway" as string]: ghost.sway,
                ["--m-spin" as string]: 2.4,
                ["--m-rest" as string]: ghost.beatEvery,
                ["--m-swing" as string]: ghost.x < 50 ? -1 : 1,
                ["--m-depth" as string]: ghost.depth,
            }}
        >
            <div className="xp-meadow-track" data-motion={ghost.motion}>
                {glow ? <div className="xp-meadow-halo" /> : null}
                <div className="xp-meadow-gesture">
                    <div className="xp-meadow-body" data-motion={ghost.motion}>
                        <Art />
                    </div>
                </div>
            </div>
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
    glow: boolean
}

function Creature({ entry, content, trail, glow }: CreatureProps) {
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
                {glow ? <div className="xp-meadow-halo" /> : null}
                <div className="xp-meadow-body" data-motion={entry.motion}>
                    {content}
                </div>
            </div>
        </div>
    )
}
