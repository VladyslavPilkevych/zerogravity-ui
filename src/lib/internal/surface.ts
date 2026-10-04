/**
 * Canvas plumbing every drawing component repeats: size the backing store to
 * the element, cap the device pixel ratio, and keep the CSS size honest.
 */
export interface SurfaceSize {
    width: number
    height: number
    dpr: number
}

/** Beyond 2× the extra pixels cost real time and buy almost nothing. */
export const DPR_CAP = 2

export function fitCanvas(
    canvas: HTMLCanvasElement,
    host: HTMLElement,
    cap: number = DPR_CAP,
): SurfaceSize {
    const box = host.getBoundingClientRect()
    const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, cap)
    const cssWidth = Math.max(1, Math.round(box.width))
    const cssHeight = Math.max(1, Math.round(box.height))
    const width = Math.max(1, Math.round(cssWidth * dpr))
    const height = Math.max(1, Math.round(cssHeight * dpr))

    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`

    return { width, height, dpr }
}

/** A 2D context, or null on a machine that cannot give one. Never throws. */
export function context2d(
    canvas: HTMLCanvasElement,
    options?: CanvasRenderingContext2DSettings,
): CanvasRenderingContext2D | null {
    try {
        return canvas.getContext("2d", options)
    } catch {
        return null
    }
}
