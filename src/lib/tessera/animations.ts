const STALL_MARGIN = 400

export function whenAnimationsSettle(
    root: HTMLElement,
    expected: number,
    done: () => void,
): () => void {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let frame = 0

    const finish = () => {
        if (cancelled) return
        cancelled = true
        clearTimeout(timer)
        done()
    }

    const inspect = () => {
        frame = 0
        if (cancelled) return

        const running =
            typeof root.getAnimations === "function" ? root.getAnimations({ subtree: true }) : []

        if (running.length === 0) {
            timer = setTimeout(finish, Math.max(0, expected))
            return
        }

        timer = setTimeout(finish, Math.max(0, expected) + STALL_MARGIN)
        void Promise.allSettled(running.map((animation) => animation.finished)).then(finish)
    }

    if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(inspect)
    else timer = setTimeout(inspect, 0)

    return () => {
        cancelled = true
        if (frame !== 0) cancelAnimationFrame(frame)
        clearTimeout(timer)
    }
}
