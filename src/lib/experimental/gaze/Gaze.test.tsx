import { act, fireEvent, render, waitFor } from "@testing-library/react"
import type * as THREE_NS from "three"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Gaze } from "./Gaze"

// jsdom has no WebGL, so the renderer is a stand-in that records what it was
// asked to draw; `fail` is the answer a machine without WebGL gives
const gl = vi.hoisted(() => ({ fail: false, scene: null as unknown, load: vi.fn() }))

vi.mock("three", async (original) => {
    const actual = await original<typeof THREE_NS>()
    class FakeRenderer {
        domElement = document.createElement("canvas")
        outputColorSpace = ""
        constructor() {
            if (gl.fail) throw new Error("WebGL unavailable")
        }
        setPixelRatio() {}
        setSize() {}
        render(scene: unknown) {
            gl.scene = scene
        }
        dispose() {}
    }
    return { ...actual, WebGLRenderer: FakeRenderer }
})

vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
    GLTFLoader: class {
        loadAsync(url: string) {
            return gl.load(url)
        }
    },
}))

async function rig() {
    const THREE = await import("three")
    const scene = new THREE.Group()
    const head = new THREE.Group()
    head.name = "Head"
    const eye = new THREE.Group()
    eye.name = "Eye_L"
    head.add(eye)
    head.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)))
    scene.add(head)
    return { scene }
}

/** rAF by hand, so the test decides when a frame happens and how long it took. */
let frames = new Map<number, FrameRequestCallback>()
let nextFrame = 0
let clock = 0
function flush(count: number) {
    for (let i = 0; i < count; i++) {
        const due = [...frames.values()]
        frames.clear()
        clock += 1000 / 60
        due.forEach((run) => run(clock))
    }
}

beforeEach(() => {
    gl.fail = false
    gl.scene = null
    gl.load.mockReset()
    frames = new Map()
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((run) => {
        frames.set(++nextFrame, run)
        return nextFrame
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
        frames.delete(id)
    })
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 400,
        right: 400,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    })
})

afterEach(() => {
    act(() => flush(1))
    vi.restoreAllMocks()
})

const phase = (container: HTMLElement) =>
    (container.querySelector(".xp-gaze") as HTMLElement).dataset.phase

describe("Gaze", () => {
    it("says it is loading before the model arrives", () => {
        gl.load.mockReturnValue(new Promise(() => {}))
        const { getByRole, getByText } = render(<Gaze src="/m.glb" label="A watchful head" />)

        expect(getByRole("img", { name: "A watchful head" })).toBeInTheDocument()
        expect(getByText("Loading…")).toBeInTheDocument()
    })

    it("lands in ready once the model has loaded", async () => {
        gl.load.mockResolvedValue(await rig())
        const { container, queryByText } = render(<Gaze src="/m.glb" tracking={{ head: "Head" }} />)

        await waitFor(() => expect(phase(container)).toBe("ready"))
        expect(gl.load).toHaveBeenCalledWith("/m.glb")
        expect(queryByText("The model could not be loaded")).toBeNull()
    })

    it("announces an error when the model fails to load", async () => {
        gl.load.mockRejectedValue(new Error("404"))
        const { container, getByRole } = render(<Gaze src="/missing.glb" />)

        await waitFor(() => expect(phase(container)).toBe("error"))
        expect(getByRole("status")).toHaveTextContent("The model could not be loaded")
    })

    it("falls back to an announced error where there is no 3D context", async () => {
        gl.fail = true
        const { container, getByRole } = render(<Gaze />)

        await waitFor(() => expect(phase(container)).toBe("error"))
        expect(getByRole("status")).toHaveTextContent("The model could not be loaded")
    })

    it("builds the stand-in owl when there is no src", async () => {
        const { container } = render(<Gaze />)

        await waitFor(() => expect(phase(container)).toBe("ready"))
        const scene = gl.scene as THREE_NS.Scene
        expect(scene.getObjectByName("head")).toBeTruthy()
        expect(scene.getObjectByName("leftEye")).toBeTruthy()
    })

    it("blinks the stand-in every few seconds, fully shut at the middle", async () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
        try {
            const { container } = render(<Gaze />)
            for (let i = 0; i < 50 && phase(container) !== "ready"; i++) {
                await act(() => vi.advanceTimersByTimeAsync(1))
            }
            expect(phase(container)).toBe("ready")
            act(() => flush(120))

            const head = (gl.scene as THREE_NS.Scene).getObjectByName("head")!
            const lids = head.children.filter(
                (child) => child.type === "Group" && child.visible === false,
            )
            expect(lids).toHaveLength(2)

            act(() => vi.advanceTimersByTime(6100))
            let deepest = 0
            for (let i = 0; i < 20; i++) {
                act(() => flush(1))
                if (lids[0].visible) deepest = Math.max(deepest, lids[0].scale.y)
            }

            expect(deepest).toBeGreaterThan(0.95)
            expect(lids[0].visible).toBe(false)
        } finally {
            vi.useRealTimers()
        }
    })

    it("turns the named head within its limit and returns it to neutral on leave", async () => {
        gl.load.mockResolvedValue(await rig())
        const { container } = render(
            <Gaze src="/m.glb" tracking={{ head: "Head", leftEye: "Eye_L" }} maxYaw={30} />,
        )
        await waitFor(() => expect(phase(container)).toBe("ready"))
        const host = container.querySelector(".xp-gaze") as HTMLElement
        const head = (gl.scene as THREE_NS.Scene).getObjectByName("Head")!
        const eye = (gl.scene as THREE_NS.Scene).getObjectByName("Eye_L")!

        fireEvent.pointerMove(host, { clientX: 400, clientY: 200 })
        act(() => flush(4))
        // the eyes are already well on their way while the head has barely begun
        expect(eye.rotation.y).toBeGreaterThan(head.rotation.y)

        act(() => flush(600))
        expect(head.rotation.y).toBeGreaterThan(0)
        expect(head.rotation.y).toBeLessThanOrEqual((30 * Math.PI) / 180 + 1e-6)

        fireEvent.pointerLeave(host, { pointerType: "mouse" })
        act(() => flush(600))
        expect(Math.abs(head.rotation.y)).toBeLessThan(0.002)
        expect(Math.abs(eye.rotation.y)).toBeLessThan(0.002)
        // settled, so the frame loop has let go
        expect(frames.size).toBe(0)
    })

    it("stays out of the accessibility tree when it is only decoration", () => {
        const { container, queryByRole } = render(<Gaze decorative />)

        expect(queryByRole("img")).toBeNull()
        expect(container.querySelector(".xp-gaze")).toHaveAttribute("aria-hidden", "true")
    })

    it("marks itself still under reduced motion and ignores the pointer", async () => {
        mediaState.reducedMotion = true
        gl.load.mockResolvedValue(await rig())
        const { container } = render(<Gaze src="/m.glb" tracking={{ head: "Head" }} />)
        await waitFor(() => expect(phase(container)).toBe("ready"))
        const host = container.querySelector(".xp-gaze") as HTMLElement

        expect(host.dataset.still).toBe("true")
        fireEvent.pointerMove(host, { clientX: 400, clientY: 200 })
        act(() => flush(60))
        expect((gl.scene as THREE_NS.Scene).getObjectByName("Head")!.rotation.y).toBe(0)
    })

    it("survives an unmount while the model is still loading", () => {
        gl.load.mockReturnValue(new Promise(() => {}))
        const { unmount } = render(<Gaze src="/missing.glb" />)

        expect(() => unmount()).not.toThrow()
    })
})
