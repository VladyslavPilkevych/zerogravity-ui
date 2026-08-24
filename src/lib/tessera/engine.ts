import type { TesseraSequence } from "./sequence"

export type TesseraPhase = "idle" | "covering" | "covered" | "revealing"

export type TesseraNavigate = () => void | Promise<void>

export interface TesseraRunOptions {
    color?: string
    rows?: number
    columns?: number
    duration?: number
    stagger?: number
    sequence?: TesseraSequence
    revealSequence?: TesseraSequence
}

export interface TesseraSnapshot {
    phase: TesseraPhase
    runId: number
    options: TesseraRunOptions
}

export interface TesseraRun {
    (navigate: TesseraNavigate): Promise<void>
    (options: TesseraRunOptions, navigate: TesseraNavigate): Promise<void>
}

export interface TesseraController {
    run: TesseraRun
}

export interface TesseraEngine extends TesseraController {
    subscribe(listener: () => void): () => void
    getSnapshot(): TesseraSnapshot
    reportCovered(): void
    reportRevealed(): void
}

const IDLE: TesseraSnapshot = { phase: "idle", runId: 0, options: {} }

const NEXT_PAINT_FRAMES = 2

interface Deferred {
    promise: Promise<void>
    resolve: () => void
}

function deferred(): Deferred {
    let resolve = () => {}
    const promise = new Promise<void>((done) => {
        resolve = done
    })
    return { promise, resolve }
}

function nextPaint(): Promise<void> {
    if (typeof requestAnimationFrame !== "function") return Promise.resolve()

    return new Promise((resolve) => {
        let remaining = NEXT_PAINT_FRAMES

        const step = () => {
            remaining -= 1
            if (remaining <= 0) resolve()
            else requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
    })
}

async function settleWithin(value: void | Promise<void>, limit: number): Promise<void> {
    const tracked = Promise.resolve(value).then(
        () => null,
        (error: unknown) => ({ error }),
    )

    if (limit <= 0) {
        const outcome = await tracked
        if (outcome) throw outcome.error
        return
    }

    let timer: ReturnType<typeof setTimeout> | undefined

    const expiry = new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), limit)
    })

    try {
        const outcome = await Promise.race([tracked, expiry])
        if (outcome) throw outcome.error
    } finally {
        clearTimeout(timer)
    }
}

export function createTesseraEngine(readTimeout: () => number): TesseraEngine {
    const listeners = new Set<() => void>()

    let snapshot: TesseraSnapshot = IDLE
    let covered: Deferred | null = null
    let revealed: Deferred | null = null

    const publish = (patch: Partial<TesseraSnapshot>) => {
        snapshot = { ...snapshot, ...patch }
        for (const listener of listeners) listener()
    }

    const run = async (
        first: TesseraRunOptions | TesseraNavigate,
        second?: TesseraNavigate,
    ): Promise<void> => {
        const navigate = typeof first === "function" ? first : second
        const options = typeof first === "function" ? {} : first

        if (!navigate || snapshot.phase !== "idle") return

        covered = deferred()
        publish({ phase: "covering", runId: snapshot.runId + 1, options })
        await covered.promise

        publish({ phase: "covered" })
        await nextPaint()

        let failure: { error: unknown } | null = null

        try {
            await settleWithin(navigate(), Math.max(0, readTimeout()))
        } catch (error) {
            failure = { error }
        }

        await nextPaint()

        revealed = deferred()
        publish({ phase: "revealing" })
        await revealed.promise

        publish({ phase: "idle", options: {} })

        if (failure) throw failure.error
    }

    return {
        run: run as TesseraRun,

        subscribe(listener) {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },

        getSnapshot() {
            return snapshot
        },

        reportCovered() {
            if (snapshot.phase !== "covering") return
            covered?.resolve()
        },

        reportRevealed() {
            if (snapshot.phase !== "revealing") return
            revealed?.resolve()
        },
    }
}
