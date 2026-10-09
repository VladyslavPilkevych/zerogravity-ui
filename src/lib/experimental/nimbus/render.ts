import { bayer4, rngFor, smoothstep } from "../../internal"
import type { NimbusConfig, ResolvedScene } from "./presets"

/**
 * Everything here is a pure function of time, so a frozen frame, a reduced
 * motion frame and a live frame at the same moment are identical. Nothing is
 * integrated: positions wrap from their seed, which is also why a long-lived
 * page never drifts into a clump.
 */

export const PARTICLE_LIMIT = 120
/** longest side of the buffer, whatever the element's size */
export const BUFFER_CAP = 420

/**
 * Two luminous layers in the distance and one dark bank in front. The dark one
 * is what gives the haze a foreground, and the copy above it some contrast.
 */
const LAYERS = [
    { depth: 0.25, top: 0.16, span: 0.3, reach: 0.4, alpha: 0.8, drift: 0.005, shade: false },
    { depth: 0.55, top: 0.36, span: 0.3, reach: 0.33, alpha: 0.7, drift: 0.01, shade: false },
    { depth: 1, top: 0.8, span: 0.22, reach: 0.34, alpha: 0.7, drift: 0.02, shade: true },
] as const
const SHADE = "#030308"
const PER_LAYER = 3
const BODIES = LAYERS.length * PER_LAYER
/** fog banks are wider than they are tall */
const STRETCH = 1.7
const TAU = Math.PI * 2
const SWEEP_PERIOD = 21
const SWEEP_LENGTH = 7
const SPRITE = 96

export interface Field {
    /** per body: starting x, y, reach, colour slot, phase */
    bx: Float32Array
    by: Float32Array
    br: Float32Array
    bc: Uint8Array
    bp: Float32Array
    /** per mote: x, y, depth, drift x, drift y, phase */
    px: Float32Array
    py: Float32Array
    pz: Float32Array
    pvx: Float32Array
    pvy: Float32Array
    pp: Float32Array
}

export function createField(seed: number): Field {
    const field: Field = {
        bx: new Float32Array(BODIES),
        by: new Float32Array(BODIES),
        br: new Float32Array(BODIES),
        bc: new Uint8Array(BODIES),
        bp: new Float32Array(BODIES),
        px: new Float32Array(PARTICLE_LIMIT),
        py: new Float32Array(PARTICLE_LIMIT),
        pz: new Float32Array(PARTICLE_LIMIT),
        pvx: new Float32Array(PARTICLE_LIMIT),
        pvy: new Float32Array(PARTICLE_LIMIT),
        pp: new Float32Array(PARTICLE_LIMIT),
    }

    for (let layer = 0; layer < LAYERS.length; layer += 1) {
        const spec = LAYERS[layer]
        for (let slot = 0; slot < PER_LAYER; slot += 1) {
            const index = layer * PER_LAYER + slot
            const random = rngFor(seed + 31, index)
            // stratified, so a layer is an even band that never bunches up
            field.bx[index] = (slot + 0.2 + random() * 0.6) / PER_LAYER
            field.by[index] = spec.top + random() * spec.span
            field.br[index] = spec.reach * (0.8 + random() * 0.4)
            field.bc[index] = Math.floor(random() * 251)
            field.bp[index] = random() * TAU
        }
    }

    const random = rngFor(seed + 77, 0)
    for (let index = 0; index < PARTICLE_LIMIT; index += 1) {
        field.px[index] = random()
        field.py[index] = random()
        field.pz[index] = 0.15 + random() * 0.85
        field.pvx[index] = 0.004 + random() * 0.012
        field.pvy[index] = -(0.003 + random() * 0.01)
        field.pp[index] = random() * TAU
    }

    return field
}

export function particleCount(density: number): number {
    return Math.round(Math.min(1, Math.max(0, density)) * PARTICLE_LIMIT)
}

export interface SceneMix {
    from: number
    to: number
    /** 0 while holding `from`, rising to 1 as `to` takes over */
    mix: number
}

export function sceneAt(
    time: number,
    count: number,
    hold: number,
    fade: number,
    out: SceneMix,
): SceneMix {
    out.from = 0
    out.to = 0
    out.mix = 0
    if (count < 2 || hold + fade <= 0) return out

    const cycle = hold + fade
    const round = Math.floor(Math.max(0, time) / cycle)
    const local = Math.max(0, time) - round * cycle
    out.from = round % count
    out.to = (round + 1) % count
    out.mix = local < hold ? 0 : smoothstep((local - hold) / Math.max(fade, 0.001))
    return out
}

export interface Camera {
    x: number
    y: number
    zoom: number
}

/** A slow Ken Burns move: periods that never line up, so it never visibly loops. */
export function cameraAt(time: number, motion: number, out: Camera): Camera {
    out.zoom = 1 + 0.12 * motion * (0.5 - 0.5 * Math.cos((TAU * time) / 46))
    out.x = 0.05 * motion * Math.sin((TAU * time) / 58)
    out.y = 0.03 * motion * Math.sin((TAU * time) / 77 + 1.3)
    return out
}

function wrap(value: number, low: number, span: number): number {
    return low + ((((value - low) % span) + span) % span)
}

function canvas(width: number, height: number): HTMLCanvasElement {
    const element = document.createElement("canvas")
    element.width = width
    element.height = height
    return element
}

/** A white soft disc, tinted: built once per colour, scaled on every draw. */
function fogSprite(color: string): HTMLCanvasElement {
    const sprite = canvas(SPRITE, SPRITE)
    const context = sprite.getContext("2d")
    if (!context) return sprite
    const half = SPRITE / 2
    const glow = context.createRadialGradient(half, half, 0, half, half, half)
    glow.addColorStop(0, "rgba(255,255,255,1)")
    glow.addColorStop(0.25, "rgba(255,255,255,0.66)")
    glow.addColorStop(0.55, "rgba(255,255,255,0.2)")
    glow.addColorStop(1, "rgba(255,255,255,0)")
    context.fillStyle = glow
    context.fillRect(0, 0, SPRITE, SPRITE)
    context.globalCompositeOperation = "source-in"
    context.fillStyle = color
    context.fillRect(0, 0, SPRITE, SPRITE)
    return sprite
}

/** A shaft of light: soft across, fading out along its length. */
function raySprite(color: string): HTMLCanvasElement {
    const sprite = canvas(32, 128)
    const context = sprite.getContext("2d")
    if (!context) return sprite
    const across = context.createLinearGradient(0, 0, 32, 0)
    across.addColorStop(0, "rgba(255,255,255,0)")
    across.addColorStop(0.5, "rgba(255,255,255,1)")
    across.addColorStop(1, "rgba(255,255,255,0)")
    context.fillStyle = across
    context.fillRect(0, 0, 32, 128)
    const along = context.createLinearGradient(0, 0, 0, 128)
    along.addColorStop(0, "rgba(255,255,255,0)")
    along.addColorStop(0.18, "rgba(255,255,255,1)")
    along.addColorStop(1, "rgba(255,255,255,0)")
    context.globalCompositeOperation = "destination-in"
    context.fillStyle = along
    context.fillRect(0, 0, 32, 128)
    context.globalCompositeOperation = "source-in"
    context.fillStyle = color
    context.fillRect(0, 0, 32, 128)
    return sprite
}

interface SceneArt {
    fog: HTMLCanvasElement[]
    glow: HTMLCanvasElement
    ray: HTMLCanvasElement
    light: string
    sky: readonly [string, string]
    gradient: CanvasGradient | null
}

export interface Pointer {
    x: number
    y: number
}

export interface Renderer {
    resize(width: number, height: number): void
    paint(time: number, config: NimbusConfig, pointer: Pointer): void
}

/**
 * Sprites and gradients are built here, once per scene list and once per
 * resize; `paint` itself allocates nothing but the dither read-back.
 */
export function createRenderer(
    context: CanvasRenderingContext2D,
    scenes: readonly ResolvedScene[],
    field: Field,
): Renderer {
    const cache = new Map<string, HTMLCanvasElement>()
    const tinted = (color: string) => {
        let sprite = cache.get(color)
        if (!sprite) {
            sprite = fogSprite(color)
            cache.set(color, sprite)
        }
        return sprite
    }

    const art: SceneArt[] = scenes.map((scene) => ({
        fog: scene.fog.map(tinted),
        glow: tinted(scene.light),
        ray: raySprite(scene.light),
        light: scene.light,
        sky: scene.sky,
        gradient: null,
    }))

    let width = 1
    let height = 1
    let vignette: CanvasGradient | null = null
    let letterbox: CanvasGradient | null = null
    const shade = fogSprite(SHADE)
    const mix: SceneMix = { from: 0, to: 0, mix: 0 }
    const camera: Camera = { x: 0, y: 0, zoom: 1 }

    const resize = (nextWidth: number, nextHeight: number) => {
        width = nextWidth
        height = nextHeight
        for (const scene of art) {
            const sky = context.createLinearGradient(0, 0, 0, height)
            sky.addColorStop(0, scene.sky[0])
            sky.addColorStop(1, scene.sky[1])
            scene.gradient = sky
        }
        const reach = Math.hypot(width, height) / 2
        vignette = context.createRadialGradient(
            width / 2,
            height * 0.46,
            reach * 0.35,
            width / 2,
            height / 2,
            reach,
        )
        vignette.addColorStop(0, "rgba(0,0,0,0)")
        vignette.addColorStop(1, "rgba(0,0,0,0.9)")
        letterbox = context.createLinearGradient(0, 0, 0, height)
        letterbox.addColorStop(0, "rgba(0,0,0,0.85)")
        letterbox.addColorStop(0.16, "rgba(0,0,0,0)")
        letterbox.addColorStop(0.84, "rgba(0,0,0,0)")
        letterbox.addColorStop(1, "rgba(0,0,0,0.85)")
    }

    const layerTransform = (depth: number, config: NimbusConfig, pointer: Pointer) => {
        const zoom = 1 + (camera.zoom - 1) * (0.4 + 0.6 * depth)
        const offsetX = (camera.x + pointer.x * config.parallax * 0.07) * depth * width
        const offsetY = (camera.y + pointer.y * config.parallax * 0.05) * depth * height
        context.setTransform(
            zoom,
            0,
            0,
            zoom,
            (width / 2) * (1 - zoom) + offsetX,
            (height / 2) * (1 - zoom) + offsetY,
        )
    }

    const drawLayer = (
        layer: number,
        scene: SceneArt,
        weight: number,
        time: number,
        config: NimbusConfig,
        pointer: Pointer,
    ) => {
        const spec = LAYERS[layer]
        const span = Math.max(width, height)
        const travel = 0.35 + config.motion
        layerTransform(spec.depth, config, pointer)

        for (let slot = 0; slot < PER_LAYER; slot += 1) {
            const index = layer * PER_LAYER + slot
            const reach = field.br[index] * span
            const reachX = (reach * STRETCH) / width
            const x = wrap(field.bx[index] + spec.drift * travel * time, -reachX, 1 + reachX * 2)
            const y = field.by[index] + Math.sin(time * 0.09 + field.bp[index]) * 0.035 * travel
            const pulse = 0.8 + 0.2 * Math.sin(time * 0.21 + field.bp[index] * 3)
            const sprite = spec.shade ? shade : scene.fog[field.bc[index] % scene.fog.length]
            context.globalAlpha = weight * spec.alpha * config.intensity * pulse
            context.drawImage(
                sprite,
                x * width - reach * STRETCH,
                y * height - reach,
                reach * STRETCH * 2,
                reach * 2,
            )
        }
        context.setTransform(1, 0, 0, 1, 0, 0)
    }

    const drawRay = (
        sprite: HTMLCanvasElement,
        x: number,
        y: number,
        angle: number,
        thickness: number,
        length: number,
    ) => {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        context.setTransform(cos, sin, -sin, cos, x, y)
        context.drawImage(sprite, -thickness / 2, 0, thickness, length)
        context.setTransform(1, 0, 0, 1, 0, 0)
    }

    const drawLight = (scene: SceneArt, weight: number, time: number, config: NimbusConfig) => {
        // rays from above the top left, breathing slowly
        const originX = width * (0.1 + camera.x * 0.4)
        const originY = -height * 0.2
        for (let ray = 0; ray < 3; ray += 1) {
            const breath = 0.6 + 0.4 * Math.sin(time * 0.17 + ray * 2.1)
            context.globalAlpha = weight * config.lighting * 0.3 * breath
            drawRay(
                scene.ray,
                originX + ray * width * 0.1,
                originY,
                -0.42 - ray * 0.16,
                width * (0.07 + ray * 0.03),
                height * 1.6,
            )
        }

        // now and then a broad sweep crosses the whole frame
        const sweep = wrap(time - 4, 0, SWEEP_PERIOD) / SWEEP_LENGTH
        if (sweep < 1) {
            const envelope = Math.sin(Math.PI * sweep) ** 2
            context.globalAlpha = weight * config.lighting * 0.42 * envelope
            drawRay(
                scene.ray,
                width * (-0.35 + 1.7 * sweep),
                -height * 0.3,
                -0.3,
                width * 0.32,
                height * 2,
            )
        }
    }

    const drawDust = (
        scene: SceneArt,
        weight: number,
        time: number,
        config: NimbusConfig,
        pointer: Pointer,
    ) => {
        const motes = particleCount(config.density)
        if (motes === 0) return
        const travel = 0.35 + config.motion
        const crisp = config.dither > 0
        const unit = Math.max(1, Math.min(width, height) / 90)
        context.globalCompositeOperation = "lighter"
        context.fillStyle = scene.light
        for (let index = 0; index < motes; index += 1) {
            const depth = field.pz[index]
            const shiftX = (camera.x + pointer.x * config.parallax * 0.07) * depth * 1.4
            const shiftY = (camera.y + pointer.y * config.parallax * 0.05) * depth * 1.4
            const x =
                wrap(field.px[index] + field.pvx[index] * travel * time + shiftX, 0, 1) * width
            const y =
                wrap(field.py[index] + field.pvy[index] * travel * time + shiftY, 0, 1) * height
            const twinkle = 0.45 + 0.55 * Math.sin(time * (0.5 + depth) + field.pp[index] * 5)
            context.globalAlpha = weight * (0.25 + 0.75 * depth) * Math.max(0, twinkle)
            if (crisp) {
                context.fillRect(Math.floor(x), Math.floor(y), 1, 1)
            } else {
                // a soft round mote, bigger and brighter the nearer it is
                const size = unit * (0.7 + depth * 1.6)
                context.drawImage(scene.glow, x - size, y - size, size * 2, size * 2)
            }
        }
    }

    /**
     * Brightness is posterised through the Bayer matrix and the hue is kept, so
     * the fog breaks into a few dithered bands instead of RGB confetti.
     */
    const dither = (levels: number) => {
        const image = context.getImageData(0, 0, width, height)
        const data = image.data
        const steps = levels - 1
        for (let row = 0; row < height; row += 1) {
            for (let column = 0; column < width; column += 1) {
                const index = (row * width + column) * 4
                const red = data[index]
                const green = data[index + 1]
                const blue = data[index + 2]
                const peak = Math.max(red, green, blue, 1)
                // banded on a square-root curve, so the dark range gets its share of steps
                const level = Math.min(
                    steps,
                    Math.floor(Math.sqrt(peak / 255) * steps + bayer4(column, row)),
                )
                const scale = ((level / steps) * (level / steps) * 255) / peak
                data[index] = red * scale
                data[index + 1] = green * scale
                data[index + 2] = blue * scale
            }
        }
        context.putImageData(image, 0, 0)
    }

    const paint = (time: number, config: NimbusConfig, pointer: Pointer) => {
        const count = art.length
        if (count === 0) return
        sceneAt(time, count, config.hold, config.fade, mix)
        cameraAt(time, config.motion, camera)
        const from = art[mix.from]
        const to = art[mix.to]

        context.setTransform(1, 0, 0, 1, 0, 0)
        context.globalCompositeOperation = "source-over"
        context.globalAlpha = 1
        context.fillStyle = from.gradient ?? from.sky[1]
        context.fillRect(0, 0, width, height)
        if (mix.mix > 0) {
            context.globalAlpha = mix.mix
            context.fillStyle = to.gradient ?? to.sky[1]
            context.fillRect(0, 0, width, height)
        }

        const weightTo = mix.mix
        const weightFrom = 1 - weightTo
        const both = weightTo > 0.002

        context.globalCompositeOperation = "screen"
        if (config.lighting > 0) {
            // a wide low glow on the horizon, behind every fog layer
            const glowWidth = width * 1.6
            const glowX = (width - glowWidth) / 2 + camera.x * 0.2 * width
            context.globalAlpha = weightFrom * config.lighting * 0.42
            context.drawImage(from.glow, glowX, height * 0.28, glowWidth, height * 0.7)
            if (both) {
                context.globalAlpha = weightTo * config.lighting * 0.42
                context.drawImage(to.glow, glowX, height * 0.28, glowWidth, height * 0.7)
            }
        }
        for (let layer = 0; layer < LAYERS.length; layer += 1) {
            if (LAYERS[layer].shade) {
                if (config.lighting > 0) {
                    drawLight(from, weightFrom, time, config)
                    if (both) drawLight(to, weightTo, time, config)
                }
                // the dark bank is the same in every scene, so it is drawn once
                context.globalCompositeOperation = "source-over"
                drawLayer(layer, from, 1, time, config, pointer)
                context.globalCompositeOperation = "screen"
            } else {
                drawLayer(layer, from, weightFrom, time, config, pointer)
                if (both) drawLayer(layer, to, weightTo, time, config, pointer)
            }
        }
        drawDust(from, weightFrom, time, config, pointer)
        if (both) drawDust(to, weightTo, time, config, pointer)

        context.setTransform(1, 0, 0, 1, 0, 0)
        context.globalCompositeOperation = "source-over"
        const breathe = 0.9 + 0.1 * config.motion * Math.sin(time * 0.23)
        if (vignette && config.vignette > 0) {
            context.globalAlpha = Math.min(1, config.vignette * breathe)
            context.fillStyle = vignette
            context.fillRect(0, 0, width, height)
        }
        if (letterbox && config.letterbox > 0) {
            context.globalAlpha = config.letterbox
            context.fillStyle = letterbox
            context.fillRect(0, 0, width, height)
        }
        context.globalAlpha = 1

        if (config.dither > 1) dither(config.dither)
    }

    return { resize, paint }
}

/** The buffer size for an element: one buffer pixel per `cell`, capped. */
export function bufferSize(
    cssWidth: number,
    cssHeight: number,
    cell: number,
): { width: number; height: number } {
    let width = Math.max(1, Math.round(cssWidth / cell))
    let height = Math.max(1, Math.round(cssHeight / cell))
    const longest = Math.max(width, height)
    if (longest > BUFFER_CAP) {
        const scale = BUFFER_CAP / longest
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
    }
    return { width, height }
}
