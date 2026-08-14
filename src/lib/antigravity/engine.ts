import type { AntigravityConfig, AntigravityStats } from "./types"
import { ANTIGRAVITY_DEFAULTS } from "./types"
import { TAU, DEG, clamp, envelopeFn, fastCos, fastSin, frac, hash01, lerp, waveFn } from "./math"
import { RAMP_SIZE, buildRamp, hslToRgb, parseColor, rampStop } from "./color"
import { SALT, formationPoint, isVolumetric, type Point } from "./formations"
import { SHAPE_EMITTERS, isRotationInvariant, shapeExtent, shapeParams } from "./shapes"

const MAX_PARTICLES = 30000

const SLOT_COUNT = 1 << 17
const ALPHA_STEPS = 31
const ALPHA_STRINGS: string[] = []
for (let i = 0; i <= ALPHA_STEPS; i += 1) {
    ALPHA_STRINGS.push((i / ALPHA_STEPS).toFixed(4))
}

const RIPPLE_SLOTS = 4

interface Ripple {
    x: number
    y: number
    age: number
    life: number
    active: boolean
}

export class AntigravityEngine {
    private readonly canvas: HTMLCanvasElement
    private readonly container: HTMLElement
    private readonly ctx: CanvasRenderingContext2D

    private cfg: AntigravityConfig = ANTIGRAVITY_DEFAULTS
    private count = 0
    private spawned = 0

    private px = new Float32Array(0)
    private py = new Float32Array(0)
    private ox = new Float32Array(0)
    private oy = new Float32Array(0)
    private theta = new Float32Array(0)
    private rad = new Float32Array(0)
    private volX = new Float32Array(0)
    private volY = new Float32Array(0)
    private volZ = new Float32Array(0)
    private volumetric = false
    private baseSize = new Float32Array(0)
    private baseAlpha = new Float32Array(0)
    private ease = new Float32Array(0)
    private phase = new Float32Array(0)
    private driftAmpX = new Float32Array(0)
    private driftAmpY = new Float32Array(0)
    private driftRate = new Float32Array(0)
    private spinDir = new Float32Array(0)
    private colorIdx = new Float32Array(0)

    private drawX = new Float32Array(0)
    private drawY = new Float32Array(0)
    private drawSize = new Float32Array(0)
    private drawCos = new Float32Array(0)
    private drawSin = new Float32Array(0)

    private bucketHead = new Int32Array(SLOT_COUNT).fill(-1)
    private bucketNext = new Int32Array(0)
    private usedSlots = new Int32Array(0)

    private ramp = new Uint8Array(RAMP_SIZE * 3)
    private glowSprite: HTMLCanvasElement | null = null
    private bgRgb: string | null = null

    private width = 0
    private height = 0
    private dpr = 1

    private centerX = 0
    private centerY = 0
    private pointerX = 0
    private pointerY = 0
    private pointerActive = false

    private time = 0
    private elapsed = 0
    private pulseTime = 0
    private waveTime = 0
    private spinAngle = 0
    private particleSpin = 0
    private colorPhase = 0
    private lastTime = 0

    private readonly ripples: Ripple[] = Array.from({ length: RIPPLE_SLOTS }, () => ({
        x: 0,
        y: 0,
        age: 0,
        life: 0,
        active: false,
    }))
    private burstTimer = 0
    private readonly rippleX = new Float64Array(RIPPLE_SLOTS)
    private readonly rippleY = new Float64Array(RIPPLE_SLOTS)
    private readonly rippleR = new Float64Array(RIPPLE_SLOTS)

    private cwActive = false
    private cwX = 0
    private cwY = 0
    private cwAge = 0
    private cwR = 255
    private cwG = 255
    private cwB = 255
    private cwTimer = 0

    private raf = 0
    private running = false
    private intersecting = true
    private pageVisible = true
    private staticMode = false
    private destroyed = false

    private observer: IntersectionObserver | null = null
    private resizeObserver: ResizeObserver | null = null

    private statsHandler: ((stats: AntigravityStats) => void) | null = null
    private statsFrames = 0
    private statsTime = 0
    private statsMs = 0
    private lastDrawn = 0
    private lastBatches = 0

    private readonly scratchPoint: Point = { x: 0, y: 0, z: 0 }
    private readonly scratchParams: [number, number] = [0, 0]

    private sigStatics = ""
    private sigRamp = ""
    private sigGlow = ""

    constructor(canvas: HTMLCanvasElement, container: HTMLElement, config: AntigravityConfig) {
        this.canvas = canvas
        this.container = container

        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) throw new Error("Antigravity: 2D canvas context is unavailable")
        this.ctx = ctx

        this.cfg = config
        this.staticMode =
            config.render.respectReducedMotion &&
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        this.measure()
        this.centerX = this.width * 0.5
        this.centerY = this.height * 0.5
        this.pointerX = this.centerX
        this.pointerY = this.centerY

        this.applyConfig(config, true)

        this.burstTimer = config.burst.minInterval
        this.cwTimer = config.colorWave.minInterval

        if (typeof ResizeObserver === "function") {
            this.resizeObserver = new ResizeObserver(this.handleResize)
            this.resizeObserver.observe(container)
        }

        if (!this.staticMode && typeof IntersectionObserver === "function") {
            this.observer = new IntersectionObserver(this.handleIntersect, { threshold: 0 })
            this.observer.observe(container)
        }

        window.addEventListener("pointermove", this.handlePointerMove, { passive: true })
        window.addEventListener("pointerdown", this.handlePointerMove, { passive: true })
        window.addEventListener("blur", this.handlePointerRelease)
        document.addEventListener("pointerout", this.handlePointerOut, { passive: true })
        document.addEventListener("visibilitychange", this.handleVisibility)

        if (this.staticMode) this.elapsed = config.render.fadeIn / 1000

        this.sync()
        if (!this.running) this.renderFrame(0)
    }

    setConfig(config: AntigravityConfig): void {
        if (this.destroyed) return
        this.applyConfig(config, false)
        this.sync()
        if (!this.running) this.renderFrame(0)
    }

    setStatsHandler(handler: ((stats: AntigravityStats) => void) | null): void {
        this.statsHandler = handler
    }

    burst(): void {
        this.spawnRipple()
        if (this.staticMode) this.renderFrame(0)
    }

    colorBurst(): void {
        this.spawnColorWave()
        if (this.staticMode) this.renderFrame(0)
    }

    private applyConfig(config: AntigravityConfig, initial: boolean): void {
        const prevDprCap = this.cfg.render.dprCap
        this.cfg = config

        if (!initial && config.render.dprCap !== prevDprCap) this.measure()

        const count = clamp(Math.round(config.count), 1, MAX_PARTICLES)
        if (count !== this.count) this.allocate(count)

        const statics = [
            count,
            config.seed,
            config.formation.shape,
            config.formation.radius,
            config.formation.innerRatio,
            config.formation.sides,
            config.formation.depth,
            config.formation.turns,
            config.formation.jitter,
            config.formation.angle,
            config.formation.aspect,
            config.formation.tilt,
            config.particle.size,
            config.particle.sizeVariance,
            config.particle.depthScale,
            config.color.mode,
            config.color.palette.length,
            config.color.opacity,
            config.color.opacityDepth,
            config.follow.lag,
            config.follow.lagSpread,
            config.drift.amount,
        ].join("|")

        if (initial || statics !== this.sigStatics) {
            this.sigStatics = statics
            this.rebuildStatics()
        }

        const ramp = config.color.palette.join("|")
        if (initial || ramp !== this.sigRamp) {
            this.sigRamp = ramp
            buildRamp(config.color.palette, this.ramp)
        }

        const glow = [
            config.glow.enabled,
            config.glow.radius,
            config.glow.color,
            config.glow.intensity,
            this.dpr,
        ].join("|")
        if (initial || glow !== this.sigGlow) {
            this.sigGlow = glow
            this.buildGlow()
        }

        this.bgRgb = config.render.background
            ? parseColor(config.render.background).join(",")
            : null
    }

    private allocate(count: number): void {
        const keep = Math.min(this.count, count)

        this.px = copyInto(this.px, count, keep)
        this.py = copyInto(this.py, count, keep)
        this.ox = new Float32Array(count)
        this.oy = new Float32Array(count)
        this.theta = new Float32Array(count)
        this.rad = new Float32Array(count)
        this.volX = new Float32Array(count)
        this.volY = new Float32Array(count)
        this.volZ = new Float32Array(count)
        this.baseSize = new Float32Array(count)
        this.baseAlpha = new Float32Array(count)
        this.ease = new Float32Array(count)
        this.phase = new Float32Array(count)
        this.driftAmpX = new Float32Array(count)
        this.driftAmpY = new Float32Array(count)
        this.driftRate = new Float32Array(count)
        this.spinDir = new Float32Array(count)
        this.colorIdx = new Float32Array(count)

        this.drawX = new Float32Array(count)
        this.drawY = new Float32Array(count)
        this.drawSize = new Float32Array(count)
        this.drawCos = new Float32Array(count)
        this.drawSin = new Float32Array(count)

        this.bucketNext = new Int32Array(count)
        this.usedSlots = new Int32Array(count)

        this.count = count
        this.spawned = keep
    }

    private rebuildStatics(): void {
        const cfg = this.cfg
        const count = this.count
        const seed = cfg.seed | 0
        const point = this.scratchPoint

        const paletteLen = Math.max(1, cfg.color.palette.length)
        const sizeVar = clamp(cfg.particle.sizeVariance, 0, 1)
        const depthScale = clamp(cfg.particle.depthScale, 0, 1)
        const opacityDepth = clamp(cfg.color.opacityDepth, 0, 1)
        const opacity = clamp(cfg.color.opacity, 0, 1)
        const drift = cfg.drift.amount
        const radius = cfg.formation.radius
        const invRadius = radius > 0 ? 1 / radius : 0
        const mode = cfg.color.mode

        const volumetric = isVolumetric(cfg.formation.shape)
        this.volumetric = volumetric
        const tilt = cfg.formation.tilt * DEG
        const tiltCos = Math.cos(tilt)
        const tiltSin = Math.sin(tilt)

        for (let i = 0; i < count; i += 1) {
            formationPoint(i, count, seed, cfg.formation, point)

            const ox = point.x
            let oy = point.y
            let depthSource = hash01(seed, i, SALT.depth) * 2 - 1

            if (volumetric) {
                this.volX[i] = point.x
                this.volY[i] = point.y
                this.volZ[i] = point.z
                oy = point.y * tiltCos - point.z * tiltSin
                depthSource = clamp((point.y * tiltSin + point.z * tiltCos) * invRadius, -1, 1)
            }

            const rad = Math.sqrt(ox * ox + oy * oy)
            const theta = Math.atan2(oy, ox)

            this.ox[i] = ox
            this.oy[i] = oy
            this.rad[i] = rad
            this.theta[i] = theta

            const z = depthSource
            const depth01 = (z + 1) * 0.5

            this.baseSize[i] = Math.max(
                0.05,
                cfg.particle.size *
                    (volumetric ? 1 : 1 + depthScale * z) *
                    (1 + (hash01(seed, i, SALT.size) - 0.5) * sizeVar),
            )
            this.baseAlpha[i] = volumetric ? opacity : opacity * lerp(1 - opacityDepth, 1, depth01)
            this.ease[i] = Math.max(0.0005, cfg.follow.lag + depth01 * cfg.follow.lagSpread)
            this.phase[i] = hash01(seed, i, SALT.phase)
            this.driftAmpX[i] = drift * (0.5 + hash01(seed, i, SALT.driftX))
            this.driftAmpY[i] = drift * (0.5 + hash01(seed, i, SALT.driftY))
            this.driftRate[i] = 0.5 + hash01(seed, i, SALT.driftSpeed)
            this.spinDir[i] = hash01(seed, i, SALT.spinDir) < 0.5 ? -1 : 1

            let ci: number
            switch (mode) {
                case "radial":
                    ci = clamp(rad * invRadius, 0, 1) * (RAMP_SIZE - 1)
                    break
                case "angular":
                    ci = frac(theta / TAU) * RAMP_SIZE
                    break
                case "linear":
                    ci = clamp((oy * invRadius + 1) * 0.5, 0, 1) * (RAMP_SIZE - 1)
                    break
                case "depth":
                    ci = depth01 * (RAMP_SIZE - 1)
                    break
                default:
                    ci = rampStop(Math.floor(hash01(seed, i, SALT.color) * paletteLen), paletteLen)
            }
            this.colorIdx[i] = ci

            if (i >= this.spawned) {
                this.px[i] = this.centerX + ox
                this.py[i] = this.centerY + oy
            }
        }

        this.spawned = count
    }

    private buildGlow(): void {
        const cfg = this.cfg.glow
        if (!cfg.enabled || cfg.radius <= 0 || cfg.intensity <= 0) {
            this.glowSprite = null
            return
        }

        const size = Math.max(2, Math.min(2048, Math.ceil(cfg.radius * 2 * this.dpr)))
        const sprite = this.glowSprite ?? document.createElement("canvas")
        sprite.width = size
        sprite.height = size

        const g = sprite.getContext("2d")
        if (!g) {
            this.glowSprite = null
            return
        }

        const half = size * 0.5
        const [r, gg, b] = parseColor(cfg.color)
        const gradient = g.createRadialGradient(half, half, 0, half, half, half)
        gradient.addColorStop(0, `rgba(${r},${gg},${b},${cfg.intensity})`)
        gradient.addColorStop(0.4, `rgba(${r},${gg},${b},${cfg.intensity * 0.25})`)
        gradient.addColorStop(1, `rgba(${r},${gg},${b},0)`)

        g.clearRect(0, 0, size, size)
        g.fillStyle = gradient
        g.fillRect(0, 0, size, size)

        this.glowSprite = sprite
    }

    private measure(): void {
        const rect = this.container.getBoundingClientRect()
        const dpr = clamp(
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
            1,
            Math.max(1, this.cfg.render.dprCap),
        )

        const width = Math.max(1, Math.round(rect.width))
        const height = Math.max(1, Math.round(rect.height))

        if (width === this.width && height === this.height && dpr === this.dpr) return

        this.width = width
        this.height = height
        this.dpr = dpr

        this.canvas.width = Math.round(width * dpr)
        this.canvas.height = Math.round(height * dpr)
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    private handleResize = (): void => {
        const prevDpr = this.dpr
        this.measure()
        if (this.dpr !== prevDpr) this.buildGlow()
        if (!this.running) this.renderFrame(0)
    }

    private handleIntersect = (entries: IntersectionObserverEntry[]): void => {
        this.intersecting = entries.some((entry) => entry.isIntersecting)
        this.sync()
    }

    private handleVisibility = (): void => {
        this.pageVisible = document.visibilityState !== "hidden"
        this.sync()
    }

    private handlePointerMove = (event: PointerEvent): void => {
        const follow = this.cfg.follow
        if (!follow.enabled && !this.cfg.repel.enabled) {
            this.pointerActive = false
            return
        }

        const rect = this.container.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        if (follow.source === "parent" && (x < 0 || y < 0 || x > rect.width || y > rect.height)) {
            this.pointerActive = false
            return
        }

        this.pointerX = x
        this.pointerY = y
        this.pointerActive = true
    }

    private handlePointerRelease = (): void => {
        this.pointerActive = false
        if (!this.running) this.renderFrame(0)
    }

    private handlePointerOut = (event: PointerEvent): void => {
        if (event.relatedTarget === null) this.handlePointerRelease()
    }

    private sync(): void {
        const shouldRun =
            !this.destroyed &&
            !this.staticMode &&
            !this.cfg.paused &&
            this.intersecting &&
            this.pageVisible

        if (shouldRun === this.running) return
        this.running = shouldRun

        if (shouldRun) {
            this.lastTime = 0
            this.raf = requestAnimationFrame(this.tick)
        } else {
            cancelAnimationFrame(this.raf)
            this.raf = 0
        }
    }

    private tick = (now: number): void => {
        if (!this.running) return

        const delta = this.lastTime === 0 ? 1 / 60 : (now - this.lastTime) / 1000
        this.lastTime = now

        const start = performance.now()
        this.renderFrame(clamp(delta, 0, 1 / 15))
        this.statsMs += performance.now() - start
        this.statsFrames += 1
        this.statsTime += delta

        if (this.statsHandler && this.statsTime >= 0.5) {
            this.statsHandler({
                fps: this.statsFrames / this.statsTime,
                drawn: this.lastDrawn,
                batches: this.lastBatches,
                frameMs: this.statsMs / this.statsFrames,
            })
            this.statsFrames = 0
            this.statsTime = 0
            this.statsMs = 0
        }

        this.raf = requestAnimationFrame(this.tick)
    }

    destroy(): void {
        this.destroyed = true
        this.running = false
        cancelAnimationFrame(this.raf)
        this.observer?.disconnect()
        this.resizeObserver?.disconnect()
        window.removeEventListener("pointermove", this.handlePointerMove)
        window.removeEventListener("pointerdown", this.handlePointerMove)
        window.removeEventListener("blur", this.handlePointerRelease)
        document.removeEventListener("pointerout", this.handlePointerOut)
        document.removeEventListener("visibilitychange", this.handleVisibility)
        this.observer = null
        this.resizeObserver = null
        this.statsHandler = null
    }

    private spawnRipple(): void {
        const cfg = this.cfg.burst
        let slot = this.ripples.find((r) => !r.active)
        if (!slot) {
            slot = this.ripples[0]
            for (const candidate of this.ripples) {
                if (candidate.age > slot.age) slot = candidate
            }
        }

        const radius = this.cfg.formation.radius
        if (cfg.origin === "random") {
            const angle = Math.random() * TAU
            slot.x = Math.cos(angle) * radius * 1.05
            slot.y = Math.sin(angle) * radius * 1.05
        } else {
            slot.x = 0
            slot.y = 0
        }

        slot.age = 0
        slot.life = (radius * 2.4 + cfg.width) / Math.max(1, cfg.speed)
        slot.active = true
    }

    private spawnColorWave(): void {
        const cfg = this.cfg.colorWave
        const radius = this.cfg.formation.radius

        if (cfg.origin === "random") {
            const angle = Math.random() * TAU
            this.cwX = Math.cos(angle) * radius * 1.05
            this.cwY = Math.sin(angle) * radius * 1.05
        } else {
            this.cwX = 0
            this.cwY = 0
        }

        const [r, g, b] =
            cfg.palette.length > 0
                ? parseColor(cfg.palette[Math.floor(Math.random() * cfg.palette.length)])
                : hslToRgb(Math.random() * 360, cfg.saturation, cfg.lightness)

        this.cwR = r
        this.cwG = g
        this.cwB = b
        this.cwAge = 0
        this.cwActive = true
    }

    private renderFrame(dt: number): void {
        if (this.width <= 0 || this.height <= 0 || this.count === 0) return

        const cfg = this.cfg
        const ctx = this.ctx
        const width = this.width
        const height = this.height

        this.time += dt
        this.elapsed += dt
        this.pulseTime += dt * cfg.pulse.speed
        this.waveTime += dt * cfg.wave.speed
        this.spinAngle += cfg.formation.spin * DEG * dt
        this.particleSpin += cfg.particle.spin * DEG * dt

        if (cfg.color.cycle !== 0) {
            this.colorPhase =
                (((this.colorPhase + dt * cfg.color.cycle * RAMP_SIZE) % RAMP_SIZE) + RAMP_SIZE) %
                RAMP_SIZE
        }

        const dtFrames = dt * 60
        const fade =
            cfg.render.fadeIn > 0 ? clamp((this.elapsed * 1000) / cfg.render.fadeIn, 0, 1) : 1

        const follow = cfg.follow
        const repel = cfg.repel
        const repelOn = repel.enabled && this.pointerActive && repel.strength !== 0
        const repelRadius = Math.max(1, repel.radius)
        const repelInv = 1 / repelRadius
        const repelStrength = repel.strength
        const repelEase = clamp(repel.ease, 0.001, 1)
        const repelCurve = repel.falloff === "linear" ? 0 : repel.falloff === "sharp" ? 2 : 1
        const pointerX = this.pointerX
        const pointerY = this.pointerY

        let targetX = width * 0.5
        let targetY = height * 0.5

        if (follow.enabled) {
            if (this.pointerActive) {
                targetX = this.pointerX
                targetY = this.pointerY
            } else if (!follow.returnToCenter) {
                targetX = this.centerX
                targetY = this.centerY
            }
        }

        const centerEase = clamp(follow.smooth * dtFrames, 0, 1)
        this.centerX += (targetX - this.centerX) * centerEase
        this.centerY += (targetY - this.centerY) * centerEase

        const centerX = this.centerX
        const centerY = this.centerY

        const trail = clamp(cfg.render.trail, 0, 0.98)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"

        if (this.bgRgb) {
            ctx.fillStyle = trail > 0 ? `rgba(${this.bgRgb},${1 - trail})` : `rgb(${this.bgRgb})`
            ctx.fillRect(0, 0, width, height)
        } else if (trail > 0) {
            ctx.globalCompositeOperation = "destination-out"
            ctx.fillStyle = `rgba(0,0,0,${1 - trail})`
            ctx.fillRect(0, 0, width, height)
            ctx.globalCompositeOperation = "source-over"
        } else {
            ctx.clearRect(0, 0, width, height)
        }

        if (this.glowSprite && fade > 0) {
            const r = cfg.glow.radius
            ctx.globalAlpha = fade
            ctx.drawImage(this.glowSprite, centerX - r, centerY - r, r * 2, r * 2)
        }

        const burst = cfg.burst
        let activeRipples = 0

        if (burst.enabled) {
            this.burstTimer -= dt
            if (this.burstTimer <= 0) {
                this.spawnRipple()
                this.burstTimer =
                    burst.minInterval +
                    Math.random() * Math.max(0, burst.maxInterval - burst.minInterval)
            }
        }

        for (const ripple of this.ripples) {
            if (!ripple.active) continue
            ripple.age += dt
            if (ripple.age >= ripple.life) {
                ripple.active = false
                continue
            }
            this.rippleX[activeRipples] = ripple.x
            this.rippleY[activeRipples] = ripple.y
            this.rippleR[activeRipples] = ripple.age * burst.speed
            activeRipples += 1
        }

        const colorWave = cfg.colorWave
        let cwStrength = 0
        let cwRadius = 0

        if (colorWave.enabled) {
            if (this.cwActive) {
                this.cwAge += dt
                if (this.cwAge >= colorWave.duration) {
                    this.cwActive = false
                    this.cwTimer =
                        colorWave.minInterval +
                        Math.random() * Math.max(0, colorWave.maxInterval - colorWave.minInterval)
                }
            } else {
                this.cwTimer -= dt
                if (this.cwTimer <= 0) this.spawnColorWave()
            }

            if (this.cwActive) {
                const remaining = colorWave.duration - this.cwAge
                cwStrength = clamp(colorWave.strength, 0, 1) * clamp(remaining / 1.5, 0, 1)
                cwRadius = this.cwAge * colorWave.speed
            }
        } else {
            this.cwActive = false
        }

        const volumetric = this.volumetric
        const deformOn = !volumetric && cfg.deform.amount !== 0 && cfg.deform.layers >= 1
        const polar = deformOn || this.spinAngle !== 0
        const spinAngle = this.spinAngle

        const spinCos = fastCos(spinAngle)
        const spinSin = fastSin(spinAngle)
        const tiltRad = cfg.formation.tilt * DEG
        const tiltCos = Math.cos(tiltRad)
        const tiltSin = Math.sin(tiltRad)
        const volRadius = cfg.formation.radius > 0 ? 1 / cfg.formation.radius : 0
        const volDepth = clamp(cfg.particle.depthScale, 0, 1)
        const volFade = clamp(cfg.color.opacityDepth, 0, 1)

        const dAmp = cfg.deform.amount
        const dFreq = cfg.deform.frequency
        const dLayers = clamp(Math.round(cfg.deform.layers), 1, 4)
        const dT = this.time * cfg.deform.speed

        const pulse = cfg.pulse
        const pulseOn = pulse.enabled && (pulse.size !== 0 || pulse.opacity !== 0)
        const pulseWave = waveFn(pulse.waveform)
        const pulseTime = this.pulseTime
        const pulseRadialK = pulse.spread * 0.002
        const pulseAngularK = pulse.spread / TAU

        const wave = cfg.wave
        const waveOn =
            wave.enabled && (wave.displace !== 0 || wave.opacity !== 0 || wave.size !== 0)
        const waveWave = waveFn(wave.waveform)
        const waveTime = this.waveTime
        const waveK = wave.wavelength > 0 ? 1 / wave.wavelength : 0

        const burstEnvelope = envelopeFn(burst.waveform)
        const burstWidth = Math.max(1, burst.width)
        const burstStrength = burst.strength
        const cwWidth = Math.max(1, colorWave.width)

        const driftT = this.time * cfg.drift.speed
        const driftOn = cfg.drift.amount !== 0

        const snap = !this.running

        const emit = SHAPE_EMITTERS[cfg.particle.shape] ?? SHAPE_EMITTERS.dot
        const [pa, pb] = shapeParams(cfg.particle, this.scratchParams)
        const rotationMode = isRotationInvariant(cfg.particle.shape)
            ? "none"
            : cfg.particle.rotation
        const baseAngle = cfg.particle.angle * DEG
        const fixedCos = Math.cos(baseAngle)
        const fixedSin = Math.sin(baseAngle)
        const particleSpin = this.particleSpin

        const maxSize =
            cfg.particle.size *
            (1 + cfg.particle.depthScale) *
            (1 + cfg.particle.sizeVariance * 0.5) *
            (1 + Math.abs(pulse.size) + Math.abs(wave.size) + (burst.enabled ? burstStrength : 0))
        const margin = maxSize * shapeExtent(cfg.particle) + 4

        const ramp = this.ramp
        const colorPhase = this.colorPhase
        const bucketHead = this.bucketHead
        const bucketNext = this.bucketNext
        const usedSlots = this.usedSlots

        let usedCount = 0
        let drawn = 0

        for (let i = 0; i < this.count; i += 1) {
            const theta = this.theta[i] + spinAngle
            let radius = this.rad[i]

            if (deformOn) {
                radius += fastSin(theta * dFreq + dT) * dAmp
                if (dLayers > 1) radius += fastSin(theta * dFreq * 1.67 - dT * 0.62) * dAmp * 0.57
                if (dLayers > 2) radius += fastSin(theta * dFreq * 2.33 + dT * 1.37) * dAmp * 0.34
                if (dLayers > 3) radius += fastSin(theta * dFreq * 0.67 - dT * 0.37) * dAmp * 0.71
            }

            let offsetX: number
            let offsetY: number
            let dirX: number
            let dirY: number
            let sizeScale = 1
            let alphaScale = 1

            if (volumetric) {
                const sx = this.volX[i]
                const sy = this.volY[i]
                const sz = this.volZ[i]
                const rx = sx * spinCos + sz * spinSin
                const rz = sz * spinCos - sx * spinSin

                offsetX = rx
                offsetY = sy * tiltCos - rz * tiltSin

                const depth = clamp((sy * tiltSin + rz * tiltCos) * volRadius, -1, 1)
                sizeScale = 1 + volDepth * depth
                alphaScale = 1 - volFade * 0.5 * (1 - depth)

                radius = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
                const inv = radius > 1e-4 ? 1 / radius : 0
                dirX = offsetX * inv
                dirY = offsetY * inv
            } else if (polar) {
                dirX = fastCos(theta)
                dirY = fastSin(theta)
                offsetX = dirX * radius
                offsetY = dirY * radius
            } else {
                offsetX = this.ox[i]
                offsetY = this.oy[i]
                const inv = radius > 1e-4 ? 1 / radius : 0
                dirX = offsetX * inv
                dirY = offsetY * inv
            }

            if (pulseOn) {
                let phase = pulseTime
                switch (pulse.mode) {
                    case "scatter":
                        phase += this.phase[i]
                        break
                    case "radial":
                        phase -= radius * pulseRadialK
                        break
                    case "angular":
                        phase += theta * pulseAngularK
                        break
                    default:
                        break
                }
                const value = pulseWave(frac(phase))
                sizeScale += value * pulse.size
                alphaScale += value * pulse.opacity
            }

            if (waveOn) {
                const value = waveWave(frac(waveTime - radius * waveK))
                if (wave.displace !== 0) {
                    const push = value * wave.displace
                    offsetX += dirX * push
                    offsetY += dirY * push
                }
                sizeScale += value * wave.size
                alphaScale += value * wave.opacity
            }

            for (let k = 0; k < activeRipples; k += 1) {
                const dx = offsetX - this.rippleX[k]
                const dy = offsetY - this.rippleY[k]
                const band = this.rippleR[k] - Math.sqrt(dx * dx + dy * dy)
                if (band > 0 && band < burstWidth) {
                    const power = burstEnvelope(band / burstWidth) * burstStrength
                    sizeScale += power
                    alphaScale += power
                }
            }

            let targetPX = centerX + offsetX
            let targetPY = centerY + offsetY

            if (driftOn) {
                const wobble = driftT * this.driftRate[i] + this.phase[i] * TAU
                targetPX += fastSin(wobble) * this.driftAmpX[i]
                targetPY += fastCos(wobble) * this.driftAmpY[i]
            }

            let repelBoost = 0

            if (repelOn) {
                const rdx = targetPX - pointerX
                const rdy = targetPY - pointerY
                const distance = Math.sqrt(rdx * rdx + rdy * rdy)

                if (distance < repelRadius) {
                    const near = 1 - distance * repelInv
                    const influence =
                        repelCurve === 0
                            ? near
                            : repelCurve === 2
                              ? near * near
                              : near * near * (3 - 2 * near)
                    const inv = distance > 0.001 ? 1 / distance : 0
                    const push = repelStrength * influence
                    targetPX += rdx * inv * push
                    targetPY += rdy * inv * push
                    repelBoost = influence
                }
            }

            const vx = targetPX - this.px[i]
            const vy = targetPY - this.py[i]
            const baseEase = this.ease[i]
            const step = snap ? 1 : (baseEase + (repelEase - baseEase) * repelBoost) * dtFrames
            const t = step > 1 ? 1 : step

            const nextX = this.px[i] + vx * t
            const nextY = this.py[i] + vy * t
            this.px[i] = nextX
            this.py[i] = nextY

            if (
                nextX < -margin ||
                nextY < -margin ||
                nextX > width + margin ||
                nextY > height + margin
            ) {
                continue
            }

            const size = this.baseSize[i] * sizeScale
            if (size < 0.12) continue

            let alpha = this.baseAlpha[i] * alphaScale
            if (alpha < 0.004) continue
            if (alpha > 1) alpha = 1

            let ci = (this.colorIdx[i] + colorPhase) | 0
            ci = (ci & 255) * 3
            let cr = ramp[ci]
            let cg = ramp[ci + 1]
            let cb = ramp[ci + 2]

            if (cwStrength > 0) {
                const dx = offsetX - this.cwX
                const dy = offsetY - this.cwY
                const band = cwRadius - Math.sqrt(dx * dx + dy * dy)
                if (band > 0 && band < cwWidth) {
                    const influence = fastSin((band / cwWidth) * Math.PI) * cwStrength
                    cr += (this.cwR - cr) * influence
                    cg += (this.cwG - cg) * influence
                    cb += (this.cwB - cb) * influence
                }
            }

            let cosA = fixedCos
            let sinA = fixedSin

            switch (rotationMode) {
                case "radial":
                    cosA = dirX
                    sinA = dirY
                    break
                case "tangential":
                    cosA = -dirY
                    sinA = dirX
                    break
                case "velocity": {
                    const speed = Math.sqrt(vx * vx + vy * vy)
                    if (speed > 0.02) {
                        cosA = vx / speed
                        sinA = vy / speed
                    } else {
                        cosA = dirX
                        sinA = dirY
                    }
                    break
                }
                case "spin": {
                    const angle = baseAngle + particleSpin * this.spinDir[i] + this.phase[i] * TAU
                    cosA = fastCos(angle)
                    sinA = fastSin(angle)
                    break
                }
                default:
                    break
            }

            this.drawX[i] = nextX
            this.drawY[i] = nextY
            this.drawSize[i] = size
            this.drawCos[i] = cosA
            this.drawSin[i] = sinA

            const key =
                (((cr * 0.058824 + 0.5) | 0) << 13) |
                (((cg * 0.058824 + 0.5) | 0) << 9) |
                (((cb * 0.058824 + 0.5) | 0) << 5) |
                ((alpha * ALPHA_STEPS + 0.5) | 0)

            const head = bucketHead[key]
            if (head === -1) {
                usedSlots[usedCount] = key
                usedCount += 1
            }
            bucketNext[i] = head
            bucketHead[key] = i
            drawn += 1
        }

        ctx.globalAlpha = fade
        ctx.globalCompositeOperation = cfg.render.blend === "lighter" ? "lighter" : "source-over"

        for (let s = 0; s < usedCount; s += 1) {
            const key = usedSlots[s]
            ctx.fillStyle = `rgba(${(key >>> 13) * 17},${((key >>> 9) & 15) * 17},${
                ((key >>> 5) & 15) * 17
            },${ALPHA_STRINGS[key & 31]})`

            ctx.beginPath()
            for (let i = bucketHead[key]; i !== -1; i = bucketNext[i]) {
                emit(
                    ctx,
                    this.drawX[i],
                    this.drawY[i],
                    this.drawSize[i],
                    this.drawCos[i],
                    this.drawSin[i],
                    pa,
                    pb,
                )
            }
            ctx.fill()
            bucketHead[key] = -1
        }

        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"

        this.lastDrawn = drawn
        this.lastBatches = usedCount
    }
}

function copyInto(source: Float32Array, count: number, keep: number) {
    const next = new Float32Array(count)
    if (keep > 0) next.set(source.subarray(0, keep))
    return next
}
