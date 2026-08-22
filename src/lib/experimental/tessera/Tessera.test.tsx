import { act, render } from "@testing-library/react"
import { useEffect } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { useTessera, useTesseraPhase } from "./context"
import type { TesseraController, TesseraPhase } from "./engine"
import { TesseraProvider, type TesseraProviderProps } from "./TesseraProvider"

afterEach(() => {
    mediaState.reducedMotion = false
})

function Probe({ onReady }: { onReady: (controller: TesseraController) => void }) {
    const tessera = useTessera()

    useEffect(() => {
        onReady(tessera)
    }, [onReady, tessera])

    return null
}

function PhaseLog({ onPhase }: { onPhase: (phase: TesseraPhase) => void }) {
    const phase = useTesseraPhase()

    useEffect(() => {
        onPhase(phase)
    }, [onPhase, phase])

    return null
}

function setup(props: Partial<TesseraProviderProps> = {}, extra?: React.ReactNode) {
    let controller: TesseraController | null = null

    const view = render(
        <TesseraProvider duration={20} stagger={0} {...props}>
            <Probe
                onReady={(next) => {
                    controller = next
                }}
            />
            {extra}
        </TesseraProvider>,
    )

    const overlay = () => view.container.querySelector(".xp-tessera")
    const phase = () => overlay()?.getAttribute("data-phase") ?? "idle"

    return {
        ...view,
        overlay,
        phase,
        tessera: () => controller as TesseraController,
    }
}

const settle = (ms: number) => act(async () => void (await new Promise((r) => setTimeout(r, ms))))

describe("Tessera", () => {
    it("renders nothing at all while idle", () => {
        const { overlay } = setup()

        expect(overlay()).toBeNull()
    })

    it("builds one tile per grid cell", async () => {
        const { tessera, container } = setup({ rows: 3, columns: 4 })

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(80)

        expect(container.querySelectorAll(".xp-tessera-tile")).toHaveLength(12)
        void pending
    })

    it("defaults to a scattered grid of squares", async () => {
        const { tessera, container } = setup()

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(80)

        const delays = Array.from(container.querySelectorAll<HTMLElement>(".xp-tessera-tile")).map(
            (tile) => tile.style.getPropertyValue("--tessera-in"),
        )

        const numeric = delays.map(Number)
        const sequential = [...numeric].sort((a, b) => a - b)

        expect(delays).toHaveLength(24)
        expect(new Set(delays).size).toBe(24)
        expect(numeric).not.toEqual(sequential)
        void pending
    })

    it("scatters the tiles differently on every navigation", async () => {
        const { tessera, container } = setup()

        const order = () =>
            Array.from(container.querySelectorAll<HTMLElement>(".xp-tessera-tile"))
                .map((tile) => tile.style.getPropertyValue("--tessera-in"))
                .join(",")

        let before = ""
        await act(async () => {
            await tessera().run(() => {
                before = order()
            })
        })

        let after = ""
        await act(async () => {
            await tessera().run(() => {
                after = order()
            })
        })

        expect(before).not.toBe("")
        expect(after).not.toBe(before)
    })

    it("clamps absurd grids instead of rendering thousands of nodes", async () => {
        const { tessera, container } = setup({ rows: 400, columns: 900 })

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(80)

        expect(container.querySelectorAll(".xp-tessera-tile")).toHaveLength(144)
        void pending
    })

    it("runs the navigation callback only once the viewport is fully covered", async () => {
        const { tessera, phase } = setup()
        const seen: string[] = []

        const navigate = vi.fn(() => {
            seen.push(phase())
        })

        const pending = tessera().run(navigate)
        expect(navigate).not.toHaveBeenCalled()
        expect(phase()).toBe("idle")

        await act(async () => {
            await pending
        })

        expect(navigate).toHaveBeenCalledTimes(1)
        expect(seen).toEqual(["covered"])
    })

    it("waits for the whole staggered cover to finish before navigating", async () => {
        const { tessera } = setup({ duration: 200, stagger: 100 })
        let elapsed = 0

        const started = performance.now()
        await act(async () => {
            await tessera().run(() => {
                elapsed = performance.now() - started
            })
        })

        expect(elapsed).toBeGreaterThanOrEqual(250)
    })

    it("holds the cover until the consumer signals the next route is ready", async () => {
        const { tessera, phase, overlay } = setup()
        let release = () => {}
        const ready = new Promise<void>((resolve) => {
            release = resolve
        })

        const pending = tessera().run(() => ready)
        await settle(120)

        expect(phase()).toBe("covered")

        await settle(200)
        expect(phase()).toBe("covered")

        release()
        await act(async () => {
            await pending
        })

        expect(overlay()).toBeNull()
    })

    it("moves through the lifecycle in order and returns to idle", async () => {
        const phases: TesseraPhase[] = []
        const { tessera } = setup({}, <PhaseLog onPhase={(phase) => phases.push(phase)} />)

        await act(async () => {
            await tessera().run(() => {})
        })

        expect(phases).toEqual(["idle", "covering", "covered", "revealing", "idle"])
    })

    it("ignores a second navigation while a transition is already running", async () => {
        const { tessera, container } = setup()
        const first = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 40)))
        const second = vi.fn()

        const pending = tessera().run(first)
        await settle(80)

        await act(async () => {
            await tessera().run(second)
        })

        expect(second).not.toHaveBeenCalled()
        expect(container.querySelectorAll(".xp-tessera")).toHaveLength(1)

        await act(async () => {
            await pending
        })

        expect(first).toHaveBeenCalledTimes(1)
        expect(second).not.toHaveBeenCalled()
    })

    it("accepts a fresh navigation once the previous one has finished", async () => {
        const { tessera } = setup()
        const navigate = vi.fn()

        await act(async () => {
            await tessera().run(navigate)
        })
        await act(async () => {
            await tessera().run(navigate)
        })

        expect(navigate).toHaveBeenCalledTimes(2)
    })

    it("reveals the page again and rethrows when navigation fails", async () => {
        const { tessera, overlay } = setup()
        const failure = new Error("navigation blew up")
        let caught: unknown = null

        await act(async () => {
            await tessera()
                .run(() => {
                    throw failure
                })
                .catch((error: unknown) => {
                    caught = error
                })
        })

        expect(caught).toBe(failure)
        expect(overlay()).toBeNull()
    })

    it("never stays covered when the readiness promise never settles", async () => {
        const { tessera, overlay } = setup({ timeout: 60 })

        await act(async () => {
            await tessera().run(() => new Promise(() => {}))
        })

        expect(overlay()).toBeNull()
    })

    it("applies per-navigation overrides and forgets them afterwards", async () => {
        const { tessera, container, overlay } = setup({ rows: 3, columns: 4, color: "#000000" })

        const pending = tessera().run({ rows: 2, columns: 2, color: "#ff0055" }, () => {
            return new Promise(() => {})
        })
        await settle(80)

        expect(container.querySelectorAll(".xp-tessera-tile")).toHaveLength(4)
        expect(overlay()?.getAttribute("style")).toContain("#ff0055")
        void pending
    })

    it("keeps the overlay decorative and free of focus targets", async () => {
        const { tessera, overlay } = setup()

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(80)

        const node = overlay() as HTMLElement
        expect(node.getAttribute("aria-hidden")).toBe("true")
        expect(
            node.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
        ).toHaveLength(0)
        void pending
    })

    it("uses the plain opacity path under reduced motion", async () => {
        mediaState.reducedMotion = true
        const { tessera, overlay } = setup()

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(260)

        const node = overlay() as HTMLElement
        expect(node.className).toContain("xp-tessera-plain")
        expect(node.getAttribute("style")).toContain("--tessera-stagger: 0ms")
        expect(node.getAttribute("data-phase")).toBe("covered")
        void pending
    })

    it("keeps the staggered path when reduced motion is not respected", async () => {
        mediaState.reducedMotion = true
        const { tessera, overlay } = setup({ respectReducedMotion: false, stagger: 90 })

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(160)

        const node = overlay() as HTMLElement
        expect(node.className).not.toContain("xp-tessera-plain")
        expect(node.getAttribute("style")).toContain("--tessera-stagger: 90ms")
        void pending
    })

    it("stops cleanly when the provider unmounts mid-transition", async () => {
        const errors = vi.spyOn(console, "error").mockImplementation(() => {})
        const { tessera, unmount } = setup()

        const pending = tessera().run(() => new Promise(() => {}))
        await settle(40)
        unmount()
        await settle(200)

        expect(errors).not.toHaveBeenCalled()
        void pending
    })

    it("throws a helpful error when the hook is used without a provider", () => {
        const errors = vi.spyOn(console, "error").mockImplementation(() => {})

        expect(() => render(<Probe onReady={() => {}} />)).toThrow(/TesseraProvider/)

        errors.mockRestore()
    })
})
