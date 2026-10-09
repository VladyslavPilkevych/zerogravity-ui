import { onFrame } from "./frames"

/**
 * A frame subscription that exists only while there is something to animate.
 * `wake` joins the shared loop (once, however often it is called); the tick
 * returns `false` when it has settled, and the subscription is dropped.
 */
export interface WakeLoop {
    wake(): void
    sleep(): void
    readonly running: boolean
}

export function wakeLoop(tick: (dt: number, now: number) => boolean | void): WakeLoop {
    let stop: (() => void) | null = null

    const sleep = () => {
        stop?.()
        stop = null
    }

    return {
        wake() {
            if (stop) return
            stop = onFrame((dt, now) => {
                if (tick(dt, now) === false) sleep()
            })
        },
        sleep,
        get running() {
            return stop !== null
        },
    }
}
