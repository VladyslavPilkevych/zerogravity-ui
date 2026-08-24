"use client"

import { useId, useMemo, useRef, type CSSProperties, type ReactNode } from "react"

import { cx, useMediaQuery, usePrefersReducedMotion } from "../internal"
import { useEdgeCursor } from "./useEdgeCursor"
import { useEdgeBox, type EdgeBox } from "./useEdgeBox"
import { clamp, specFor, type ElementalVariant, type VariantSpec } from "./variants"
import "./Elemental.css"

export type { ElementalVariant } from "./variants"

export interface ElementalProps {
    children: ReactNode
    variant?: ElementalVariant
    /** Overrides the variant accent. Highlight and shadow tones follow it. */
    color?: string
    /** 0 calms the edge right down, 2 pushes it. */
    intensity?: number
    /** Multiplier on every animation; 1 is the variant's own pace. */
    speed?: number
    /** Corner radius in px. The stroke and the content both follow it. */
    radius?: number
    /** Embers, snow or droplets, depending on the variant. */
    particles?: boolean
    /** A small variant-tinted pointer, shown only inside the wrapper. */
    cursorEffect?: boolean
    /** Freeze the edge in its static state. */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const GOLDEN = 0.6180339887
/** Arcs are dashed in hundredths of the path, so one lap fits any size. */
const PATH = 100

/** Deterministic placement, so a given index always draws the same particle. */
function bitStyle(index: number): CSSProperties {
    const spread = (index * GOLDEN) % 1

    return {
        "--x": Math.round((6 + spread * 86) * 10) / 10,
        "--s": 2 + (index % 3),
        "--d": Math.round((5.2 + (index % 4) * 1.9) * 10) / 10,
        "--w": Math.round(spread * 9 * 10) / 10,
        "--dx": ((index % 3) - 1) * 13,
    } as CSSProperties
}

function Edge({ radius, cls, extra }: { radius: number; cls: string; extra?: CSSProperties }) {
    return (
        <rect
            className={cls}
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={radius}
            ry={radius}
            pathLength={PATH}
            fill="none"
            style={extra}
        />
    )
}

/**
 * A zigzag transfer table. `table` interpolates between its entries, so a field
 * that drifts smoothly comes out ramping linearly up and down instead: straight
 * diagonal runs meeting at hard reversals, which is the shape of a bolt.
 * Quantising instead would give plateaus parallel to the edge, which reads as a
 * dashed rectangle rather than electricity. The wobble is a fixed pattern off
 * the index, so no two teeth match and nothing is random.
 */
function zigzag(teeth: number): string {
    return Array.from({ length: teeth }, (_, i) => {
        const wobble = ((i * 37) % 11) / 40
        return i % 2 === 1 ? 1 - wobble : wobble
    }).join(" ")
}

/** The second transfer: how the recentred field is cut before it displaces. */
function cutFor(shape: "smooth" | "facet" | "bolt", steps?: number) {
    if (!steps || shape === "smooth") return null

    return shape === "bolt"
        ? { type: "table" as const, values: zigzag(steps) }
        : {
              type: "discrete" as const,
              values: Array.from({ length: steps }, (_, i) => i / (steps - 1)).join(" "),
          }
}

/**
 * Where a sheet sits, and the box its silhouette can reach once displaced. A
 * body has to stay a body: half the box at most, however small the box.
 */
function sheetBox(sheet: Sheet, box: EdgeBox) {
    const reach = box.h > 0 ? Math.min(sheet.reach, box.h * 0.5) : sheet.reach
    const top = sheet.from === "top" ? -reach : Math.max(box.h - reach, 0)
    // buried deep enough that the displacement can never lift the far edge back
    // out into view, but never past the opposite side of a short box, where
    // there is no content left to bury it under
    const span = Math.max(box.h, 0)
    const height = Math.min(reach + sheet.bend + 16, reach + span || reach + sheet.bend + 16)
    const pad = sheet.bend

    return {
        reach,
        top,
        height,
        x: -sheet.spill,
        width: Math.max(box.w, 1) + sheet.spill * 2,
        /**
         * In pixels, sized to the displacement it has to hold. A percentage
         * region either wastes most of its area on a large box or clips a
         * small one, and every wasted pixel is turbulence evaluated per frame.
         * Safe here because a sheet's motion sits outside its filter.
         */
        reachedBy: {
            x: -sheet.spill - pad,
            y: top - pad,
            width: Math.max(box.w, 1) + sheet.spill * 2 + pad * 2,
            height: height + pad * 2,
        },
    }
}

/*
 * Relative units for the edge, not pixels: the hop carries the strokes tens of
 * pixels through the field, and a region pinned to the box would clip whichever
 * side they travelled off. Still far tighter than the 190% a filter reaches for
 * by default.
 */
function Field({ id, spec, power }: { id: string; spec: VariantSpec; power: number }) {
    const { kind, x, y, octaves, seed, blur, bite, shape, steps } = spec.noise

    const cut = cutFor(shape, steps)

    return (
        <filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
            <feTurbulence
                type={kind}
                baseFrequency={`${x} ${y}`}
                numOctaves={octaves}
                seed={seed}
                result="field"
            />
            {blur > 0 ? <feGaussianBlur in="field" stdDeviation={blur} result="field" /> : null}

            {/* recentre on 0.5 and sharpen, so the line bends both ways evenly */}
            {shape !== "facet" ? (
                <feComponentTransfer in="field" result="field">
                    <feFuncR type="linear" slope={bite} intercept={0.5 - bite * 0.5} />
                    <feFuncG type="linear" slope={bite} intercept={0.5 - bite * 0.5} />
                </feComponentTransfer>
            ) : null}

            {cut ? (
                <feComponentTransfer in="field" result="field">
                    <feFuncR type={cut.type} tableValues={cut.values} />
                    <feFuncG type={cut.type} tableValues={cut.values} />
                </feComponentTransfer>
            ) : null}

            <feDisplacementMap
                in="SourceGraphic"
                in2="field"
                scale={Math.round(spec.bend * (0.4 + power * 0.6) * 10) / 10}
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    )
}

type Sheet = NonNullable<VariantSpec["sheet"]>

/**
 * The sheet's own field. `sway` scales the horizontal channel on its own, so
 * one displacement scale can cut deep vertically while barely wandering
 * sideways — flames climb, they do not slide along the edge.
 */
function SheetField({
    id,
    sheet,
    power,
    box,
}: {
    id: string
    sheet: Sheet
    power: number
    box: EdgeBox
}) {
    const cut = cutFor(sheet.shape, sheet.steps)
    const sway = sheet.sway

    return (
        <filter
            id={id}
            filterUnits="userSpaceOnUse"
            {...sheetBox(sheet, box).reachedBy}
            colorInterpolationFilters="sRGB"
        >
            <feTurbulence
                type="fractalNoise"
                baseFrequency={`${sheet.x} ${sheet.y}`}
                numOctaves={sheet.octaves}
                seed={sheet.seed}
                result="field"
            />
            <feComponentTransfer in="field" result="field">
                <feFuncR type="linear" slope={sway} intercept={0.5 - sway * 0.5} />
                <feFuncG type="linear" slope={sheet.bite} intercept={0.5 - sheet.bite * 0.5} />
            </feComponentTransfer>
            {cut ? (
                <feComponentTransfer in="field" result="field">
                    <feFuncG type={cut.type} tableValues={cut.values} />
                </feComponentTransfer>
            ) : null}
            <feDisplacementMap
                in="SourceGraphic"
                in2="field"
                scale={Math.round(sheet.bend * (0.4 + power * 0.6) * 10) / 10}
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    )
}

/**
 * Solid rects, displaced into a ragged silhouette and only then thinned by a
 * mask. Fading the fill first would blur the outline into a smudge; fading
 * after the displacement keeps the tongues and crests cut sharp.
 *
 * The travel distance is exactly one wavelength of the sheet's own noise, so
 * the field lines up with itself at the end of a lap and the loop never jumps.
 */
function Sheets({
    sheet,
    box,
    warp,
    paint,
    veil,
}: {
    sheet: Sheet
    box: EdgeBox
    warp: string
    paint: string
    veil?: string
}) {
    const tide = Math.round(1 / sheet.x)
    const { top, height, x, width } = sheetBox(sheet, box)

    return (
        <g className="xp-el-sheet" data-from={sheet.from} mask={veil}>
            {Array.from({ length: sheet.layers }, (_, i) => (
                <rect
                    key={i}
                    className="xp-el-tide"
                    x={x}
                    y={top}
                    width={width}
                    height={height}
                    fill={`url(#${paint})`}
                    filter={`url(#${warp})`}
                    style={{ "--i": i, "--el-tide": tide } as CSSProperties}
                />
            ))}
        </g>
    )
}

/**
 * One layer, drawn above the content. The stroke straddles the border line, so
 * painting it on top is what lets the discharge cross the edge instead of
 * stopping at it — and one filtered pass costs half what two faces did.
 */
function Art({
    fit,
    arcs,
    face,
    clip,
    mask,
    defs,
    body,
    wash,
}: {
    fit: number
    arcs?: number[]
    face: "out" | "in"
    clip?: string
    mask?: string
    defs?: ReactNode
    body?: ReactNode
    wash?: boolean
}) {
    return (
        <svg className="xp-el-art" data-face={face} aria-hidden="true" focusable="false">
            {defs ? <defs>{defs}</defs> : null}

            {wash || body ? (
                /*
                 * The body is held by the clip alone. The band mask exists to
                 * keep the edge off the content, and a body is meant to reach
                 * well past it.
                 */
                <g clipPath={clip}>
                    {wash ? (
                        <rect
                            className="xp-el-wash"
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            rx={fit}
                            ry={fit}
                        />
                    ) : null}
                    {body}
                </g>
            ) : null}

            {arcs ? (
                <g mask={mask}>
                    <Edge radius={fit} cls="xp-el-edge xp-el-halo" />
                    <Edge radius={fit} cls="xp-el-edge xp-el-base" />

                    {/*
                     * `back` and `shift` carry equal and opposite offsets. The
                     * inner one drags the strokes across the noise field so
                     * every snap cuts a different set of angles; the outer one
                     * puts the result back on the border. Only the shape
                     * changes, never the place.
                     */}
                    <g className="xp-el-back">
                        <g className="xp-el-crackle">
                            <g className="xp-el-shift">
                                <Edge radius={fit} cls="xp-el-edge xp-el-core" />
                                <Edge radius={fit} cls="xp-el-edge xp-el-hot" />
                            </g>
                        </g>

                        <g className="xp-el-arcs">
                            <g className="xp-el-shift">
                                {arcs.map((index) => (
                                    <Edge
                                        key={index}
                                        radius={fit}
                                        cls="xp-el-edge xp-el-arc"
                                        extra={{ "--i": index } as CSSProperties}
                                    />
                                ))}
                            </g>
                        </g>
                    </g>
                </g>
            ) : null}
        </svg>
    )
}

export function Elemental({
    children,
    variant = "electric",
    color,
    intensity = 1,
    speed = 1,
    radius = 16,
    particles = true,
    cursorEffect = false,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: ElementalProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const dotRef = useRef<HTMLSpanElement>(null)
    const uid = useId().replace(/:/g, "")
    const warpId = `${uid}w`
    const clipId = `${uid}c`
    const maskId = `${uid}m`
    const sheetId = `${uid}s`
    const paintId = `${uid}p`
    const veilId = `${uid}v`

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")

    const still = disabled || (respectReducedMotion && reduced)
    const spec = specFor(variant)
    const power = clamp(intensity, 0, 2)
    const rate = clamp(speed, 0.1, 4)
    const box = useEdgeBox(rootRef, Math.max(0, radius))
    const fit = box.r

    const showCursor = cursorEffect && fine && !still
    useEdgeCursor(rootRef, dotRef, showCursor)

    const bits = useMemo(
        () => (particles && !still ? Array.from({ length: spec.bits }, (_, i) => i) : []),
        [particles, still, spec.bits],
    )

    const arcs = useMemo(
        () => Array.from({ length: spec.arc.count }, (_, i) => i),
        [spec.arc.count],
    )

    const sheet = spec.sheet
    // in pixels, not a share of the width, so the ends die at the box corner
    // whatever the box measures
    const halo = Math.ceil(spec.halo * 3 + spec.bend / 2 + 16)
    const frame = {
        x: -halo,
        y: -halo,
        width: Math.max(box.w, 1) + halo * 2,
        height: Math.max(box.h, 1) + halo * 2,
        maskUnits: "userSpaceOnUse" as const,
    }
    const endFade = sheet ? Math.min(20 / Math.max(box.w, 1), 0.45) : 0
    const sheetArt = sheet ? (
        <Sheets
            sheet={sheet}
            box={box}
            warp={sheetId}
            paint={paintId}
            veil={sheet.fade ? `url(#${veilId})` : undefined}
        />
    ) : null

    const tone = color
        ? {
              "--el-a": color,
              "--el-b": `color-mix(in oklab, ${color} 34%, white)`,
              "--el-c": `color-mix(in oklab, ${color} 60%, black)`,
          }
        : null

    return (
        <div
            ref={rootRef}
            className={cx("xp-el", className)}
            data-variant={variant}
            data-still={still ? "true" : undefined}
            data-live={still ? undefined : "true"}
            data-cursor={showCursor ? "true" : undefined}
            data-bits={spec.bitsInside ? "in" : undefined}
            style={
                {
                    ...style,
                    "--el-radius": fit,
                    "--el-bleed": spec.bleed,
                    "--el-line": spec.line,
                    "--el-halo": spec.halo,
                    "--el-lap": spec.lap,
                    "--el-beat": spec.beat,
                    "--el-dash": spec.arc.dash,
                    "--el-power": power,
                    "--el-rate": rate,
                    "--el-warp": `url(#${warpId})`,
                    "--el-hop": spec.hop ?? 0,
                    "--el-w": Math.round(box.w),
                    "--el-h": Math.round(box.h),
                    ...tone,
                } as CSSProperties
            }
        >
            <Art
                fit={fit}
                face="out"
                body={sheet && sheet.face === "out" ? sheetArt : null}
                defs={
                    <>
                        <Field id={warpId} spec={spec} power={power} />
                        {sheet ? (
                            <SheetField id={sheetId} sheet={sheet} power={power} box={box} />
                        ) : null}
                        {sheet ? (
                            <linearGradient id={paintId} x1="0" y1="0" x2="0" y2="1">
                                <stop className="xp-el-p0" offset="0" />
                                <stop className="xp-el-p1" offset={sheet.crest} />
                                <stop className="xp-el-p2" offset="1" />
                            </linearGradient>
                        ) : null}
                        {sheet?.fade ? (
                            <>
                                {/*
                                 * Only the ends. The vertical fade belongs to
                                 * the fill, which carries it through the
                                 * displacement and keeps the tongues cut sharp;
                                 * a blurred mask would smear them into haze.
                                 */}
                                <linearGradient
                                    id={`${veilId}g`}
                                    gradientUnits="userSpaceOnUse"
                                    x1="0"
                                    y1="0"
                                    x2={Math.max(box.w, 1)}
                                    y2="0"
                                >
                                    <stop offset="0" stopColor="#000" />
                                    <stop offset={endFade} stopColor="#fff" />
                                    <stop offset={1 - endFade} stopColor="#fff" />
                                    <stop offset="1" stopColor="#000" />
                                </linearGradient>
                                <mask
                                    id={veilId}
                                    maskUnits="userSpaceOnUse"
                                    {...sheetBox(sheet, box).reachedBy}
                                >
                                    <rect
                                        {...sheetBox(sheet, box).reachedBy}
                                        fill={`url(#${veilId}g)`}
                                    />
                                </mask>
                            </>
                        ) : null}

                        <clipPath id={clipId}>
                            <rect x="0" y="0" width="100%" height="100%" rx={fit} ry={fit} />
                        </clipPath>

                        {/*
                         * Everything outside the box, plus a blurred band that
                         * carries the edge a little way inside it. Full
                         * strength on the border, so there is no step where
                         * the line crosses, and gone before it reaches text.
                         */}
                        <mask id={maskId} {...frame}>
                            <rect {...frame} fill="#fff" />
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                rx={fit}
                                ry={fit}
                                fill="#000"
                            />
                            <rect
                                className="xp-el-band"
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                rx={fit}
                                ry={fit}
                                fill="none"
                                stroke="#fff"
                            />
                        </mask>
                    </>
                }
            />

            {bits.length > 0 ? (
                <span className="xp-el-bits" aria-hidden="true">
                    {bits.map((index) => (
                        <i key={index} className="xp-el-bit" style={bitStyle(index)} />
                    ))}
                </span>
            ) : null}

            {showCursor ? (
                <span ref={dotRef} className="xp-el-cursor" data-on="false" aria-hidden="true" />
            ) : null}

            <div className="xp-el-content">{children}</div>

            <Art
                fit={fit}
                arcs={arcs}
                face="in"
                clip={`url(#${clipId})`}
                mask={`url(#${maskId})`}
                wash={spec.wash}
                body={sheet && sheet.face === "in" ? sheetArt : null}
            />
        </div>
    )
}
