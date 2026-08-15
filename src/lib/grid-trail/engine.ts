import { resolveColor } from "../pointer-fx"
import { GRID_TRAIL_DEFAULTS, type GridTrailConfig } from "./types"

interface Cell {
    x: number
    y: number
    life: number
}

const NEIGHBOUR_OFFSETS = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
] as const

export class GridTrailEngine {
    private readonly canvas: HTMLCanvasElement
    private readonly ctx: CanvasRenderingContext2D | null
    private readonly host: HTMLElement | null

    private cfg: GridTrailConfig = GRID_TRAIL_DEFAULTS
    private readonly cells = new Map<string, Cell>()

    private width = 0
    private height = 0
    private frame: number | null = null
    private last = 0
    private destroyed = false
    private paused = false

    private trailColor = GRID_TRAIL_DEFAULTS.color
    private lineColor = GRID_TRAIL_DEFAULTS.gridColor

    private resizeObserver: ResizeObserver | null = null
    private hostRect: DOMRect | null = null

    constructor(canvas: HTMLCanvasElement, host: HTMLElement | null, config: GridTrailConfig) {
        this.canvas = canvas
        this.host = host
        this.ctx = canvas.getContext("2d", { alpha: true })
        this.cfg = config
        this.resolveColors()

        this.measure()

        if (host && typeof ResizeObserver === "function") {
            this.resizeObserver = new ResizeObserver(this.handleResize)
            this.resizeObserver.observe(host)
        } else {
            window.addEventListener("resize", this.handleResize)
        }

        const target: EventTarget = host ?? window
        target.addEventListener("pointermove", this.handlePointerMove as EventListener, {
            passive: true,
        })
        document.addEventListener("visibilitychange", this.handleVisibility)
        if (host) {
            window.addEventListener("scroll", this.invalidateHostRect, {
                passive: true,
                capture: true,
            })
        }

        this.paint()
    }

    setConfig(config: GridTrailConfig): void {
        if (this.destroyed) return

        const previousCell = this.cfg.cellSize
        this.cfg = config
        this.resolveColors()

        if (config.cellSize !== previousCell) this.cells.clear()
        if (this.cells.size > config.maxCells) {
            const excess = this.cells.size - config.maxCells
            const keys = this.cells.keys()
            for (let i = 0; i < excess; i += 1) {
                const key = keys.next().value
                if (key !== undefined) this.cells.delete(key)
            }
        }

        if (this.frame === null) this.paint()
    }

    destroy(): void {
        this.destroyed = true
        this.stop()
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        } else {
            window.removeEventListener("resize", this.handleResize)
        }

        const target: EventTarget = this.host ?? window
        target.removeEventListener("pointermove", this.handlePointerMove as EventListener)
        document.removeEventListener("visibilitychange", this.handleVisibility)
        if (this.host) {
            window.removeEventListener("scroll", this.invalidateHostRect, { capture: true })
        }
        this.cells.clear()
    }

    isRunning(): boolean {
        return this.frame !== null
    }

    private resolveColors(): void {
        const element = this.host ?? this.canvas
        this.trailColor = resolveColor(this.cfg.color, element)
        this.lineColor = resolveColor(this.cfg.gridColor, element)
    }

    private measure(): void {
        const ratio = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 2)
        const width = this.host ? this.host.clientWidth : window.innerWidth
        const height = this.host ? this.host.clientHeight : window.innerHeight

        this.width = width
        this.height = height
        this.canvas.width = Math.max(1, Math.floor(width * ratio))
        this.canvas.height = Math.max(1, Math.floor(height * ratio))
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    private invalidateHostRect = (): void => {
        this.hostRect = null
    }

    private handleResize = (): void => {
        this.hostRect = null
        this.measure()
        if (this.frame === null) this.paint()
    }

    private handleVisibility = (): void => {
        this.paused = document.visibilityState === "hidden"
        if (this.paused) {
            this.stop()
            return
        }
        if (this.cells.size > 0) this.start()
    }

    private handlePointerMove = (event: PointerEvent): void => {
        if (this.destroyed || this.paused) return

        let x = event.clientX
        let y = event.clientY

        if (this.host) {
            if (!this.hostRect) this.hostRect = this.host.getBoundingClientRect()
            const rect = this.hostRect
            x -= rect.left
            y -= rect.top
            if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
        }

        const size = Math.max(4, this.cfg.cellSize)
        const column = Math.floor(x / size)
        const row = Math.floor(y / size)

        this.touch(column, row, 1)

        const falloff = this.cfg.neighborFalloff
        if (falloff > 0) {
            for (const [dx, dy] of NEIGHBOUR_OFFSETS) {
                this.touch(column + dx, row + dy, falloff)
            }
        }

        this.start()
    }

    private touch(column: number, row: number, life: number): void {
        const size = Math.max(4, this.cfg.cellSize)
        const key = `${column}:${row}`
        const existing = this.cells.get(key)

        if (existing) {
            if (existing.life < life) existing.life = life
            return
        }

        if (this.cells.size >= Math.max(1, this.cfg.maxCells)) {
            const oldest = this.cells.keys().next().value
            if (oldest !== undefined) this.cells.delete(oldest)
        }

        this.cells.set(key, { x: column * size, y: row * size, life })
    }

    private start(): void {
        if (this.frame !== null || this.destroyed || this.paused) return
        this.last = 0
        this.frame = requestAnimationFrame(this.tick)
    }

    private stop(): void {
        if (this.frame === null) return
        cancelAnimationFrame(this.frame)
        this.frame = null
        this.last = 0
    }

    private tick = (now: number): void => {
        this.hostRect = null
        const elapsed = this.last === 0 ? 16 : now - this.last
        this.last = now

        const duration = Math.max(16, this.cfg.fadeDuration)
        const decay = elapsed / duration

        for (const [key, cell] of this.cells) {
            cell.life -= decay
            if (cell.life <= 0) this.cells.delete(key)
        }

        this.paint()

        if (this.cells.size > 0) {
            this.frame = requestAnimationFrame(this.tick)
            return
        }

        this.frame = null
        this.last = 0
    }

    private paint(): void {
        const ctx = this.ctx
        if (!ctx) return

        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 1
        ctx.clearRect(0, 0, this.width, this.height)

        if (this.cfg.showGrid) this.paintGrid(ctx)

        if (this.cells.size === 0) return

        ctx.globalCompositeOperation = this.cfg.blendMode
        ctx.fillStyle = this.trailColor

        const size = Math.max(4, this.cfg.cellSize)
        const gap = Math.min(this.cfg.gap, size / 2 - 1)
        const inner = Math.max(1, size - gap * 2)
        const peak = this.cfg.peakOpacity
        const radius = Math.min(this.cfg.cornerRadius, inner / 2)
        const circle = this.cfg.shape === "circle"
        const roundable = typeof ctx.roundRect === "function"

        for (const cell of this.cells.values()) {
            const alpha = cell.life * peak
            if (alpha <= 0.001) continue

            ctx.globalAlpha = alpha > 1 ? 1 : alpha
            const x = cell.x + gap
            const y = cell.y + gap

            if (circle) {
                ctx.beginPath()
                ctx.arc(x + inner / 2, y + inner / 2, inner / 2, 0, Math.PI * 2)
                ctx.fill()
            } else if (radius > 0 && roundable) {
                ctx.beginPath()
                ctx.roundRect(x, y, inner, inner, radius)
                ctx.fill()
            } else {
                ctx.fillRect(x, y, inner, inner)
            }
        }

        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
    }

    private paintGrid(ctx: CanvasRenderingContext2D): void {
        const size = Math.max(4, this.cfg.cellSize)
        ctx.globalAlpha = this.cfg.gridOpacity
        ctx.strokeStyle = this.lineColor
        ctx.lineWidth = 1
        ctx.beginPath()

        for (let x = 0.5; x <= this.width; x += size) {
            ctx.moveTo(x, 0)
            ctx.lineTo(x, this.height)
        }
        for (let y = 0.5; y <= this.height; y += size) {
            ctx.moveTo(0, y)
            ctx.lineTo(this.width, y)
        }

        ctx.stroke()
        ctx.globalAlpha = 1
    }
}
