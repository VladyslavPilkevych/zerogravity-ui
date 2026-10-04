import { vi } from "vitest"

export interface FrameHarness {
    pending(): number
    advance(steps?: number, delta?: number): void
    restore(): void
}

export function installFrameHarness(): FrameHarness {
    let queue = new Map<number, FrameRequestCallback>()
    let id = 0
    let now = 0

    const request = vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
        id += 1
        queue.set(id, callback)
        return id
    })

    const cancel = vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((handle) => {
        queue.delete(handle as number)
    })

    return {
        pending: () => queue.size,
        advance(steps = 1, delta = 16) {
            for (let step = 0; step < steps; step += 1) {
                const current = queue
                queue = new Map()
                now += delta
                for (const callback of current.values()) callback(now)
            }
        },
        restore() {
            request.mockRestore()
            cancel.mockRestore()
        },
    }
}

export interface CanvasHarness {
    restore(): void
}

export function installCanvasHarness(): CanvasHarness {
    const context = {
        canvas: null,
        globalAlpha: 1,
        globalCompositeOperation: "source-over" as GlobalCompositeOperation,
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        lineCap: "butt" as CanvasLineCap,
        lineJoin: "miter" as CanvasLineJoin,
        font: "",
        textAlign: "start" as CanvasTextAlign,
        textBaseline: "alphabetic" as CanvasTextBaseline,
        save: () => {},
        restore: () => {},
        setTransform: () => {},
        clearRect: () => {},
        fillRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        closePath: () => {},
        fillText: () => {},
        strokeText: () => {},
        roundRect: () => {},
        fill: () => {},
        stroke: () => {},
        drawImage: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        measureText: () => ({ width: 0 }),
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    }

    const spy = vi
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockImplementation(() => context as unknown as CanvasRenderingContext2D)

    return {
        restore() {
            spy.mockRestore()
        },
    }
}
