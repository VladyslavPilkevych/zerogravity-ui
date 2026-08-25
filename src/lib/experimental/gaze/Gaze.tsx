"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
// type-only: erased at build, so nothing here pulls three into a bundle
import type * as THREE_NS from "three"

import { cx, useLatestRef, useMediaQuery, usePrefersReducedMotion } from "../../internal"
import { buildStandIn } from "./standIn"
import "./Gaze.css"

export interface GazeTracking {
    /** node names in the loaded model; missing ones are simply skipped */
    head?: string
    leftEye?: string
    rightEye?: string
}

export interface GazeProps {
    /** a `.glb` or `.gltf` URL; omit it for the built-in stand-in head */
    src?: string
    /** which nodes turn; ignored by the stand-in, which names its own */
    tracking?: GazeTracking
    /** how far the pointer has to travel for a full turn, 0.2 to 3 */
    sensitivity?: number
    /** how far the head may turn, in degrees */
    maxYaw?: number
    maxPitch?: number
    /** how quickly it catches up, 0.02 to 1; smaller is heavier */
    damping?: number
    /** eyes lead, head follows: how much slower the head is */
    headDelay?: number
    background?: string
    /** describes the model for anything that cannot see it */
    label?: string
    /** purely decorative, so no label is announced */
    decorative?: boolean
    /** hold the neutral pose instead of following the pointer */
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

type Phase = "loading" | "ready" | "error"

const DEG = Math.PI / 180

function clamp(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

export function Gaze({
    src,
    tracking,
    sensitivity = 1,
    maxYaw = 26,
    maxPitch = 16,
    damping = 0.12,
    headDelay = 0.45,
    background = "transparent",
    label = "A model that follows the pointer",
    decorative = false,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: GazeProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const [phase, setPhase] = useState<Phase>("loading")

    const reduced = usePrefersReducedMotion()
    const coarse = useMediaQuery("(pointer: coarse)")
    const still = disabled || (respectReducedMotion && reduced)

    const settings = useLatestRef({
        sensitivity,
        maxYaw,
        maxPitch,
        damping,
        headDelay,
        still,
        tracking,
    })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        let disposed = false
        let cleanup: (() => void) | null = null

        // three is loaded only when a Gaze actually mounts, so nothing else in
        // the library — or in a page that never shows one — pays for it
        const start = async () => {
            const THREE = await import("three")
            const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js")
            if (disposed) return

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
            renderer.outputColorSpace = THREE.SRGBColorSpace
            host.append(renderer.domElement)
            renderer.domElement.className = "xp-gaze-stage"

            const scene = new THREE.Scene()
            const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
            camera.position.set(0, 0, 4.2)

            scene.add(new THREE.AmbientLight(0xffffff, 1.5))
            const key = new THREE.DirectionalLight(0xffffff, 2.1)
            key.position.set(2, 3, 4)
            scene.add(key)
            const rim = new THREE.DirectionalLight(0x8fb8ff, 1.1)
            rim.position.set(-3, 1, -2)
            scene.add(rim)

            const root = new THREE.Group()
            scene.add(root)

            let head: THREE_NS.Object3D | null = null
            let leftEye: THREE_NS.Object3D | null = null
            let rightEye: THREE_NS.Object3D | null = null
            const neutral = new Map<THREE_NS.Object3D, THREE_NS.Euler>()

            const remember = (node: THREE_NS.Object3D | null) => {
                if (node) neutral.set(node, node.rotation.clone())
            }

            /** Frames whatever was loaded, so any model lands the same way. */
            const frameModel = (object: THREE_NS.Object3D) => {
                const box = new THREE.Box3().setFromObject(object)
                const size = box.getSize(new THREE.Vector3())
                const centre = box.getCenter(new THREE.Vector3())
                const reach = Math.max(size.x, size.y, size.z) || 1

                object.position.sub(centre)
                root.scale.setScalar(1.9 / reach)
                root.add(object)
            }

            const wire = (object: THREE_NS.Object3D) => {
                const names = settings.current.tracking ?? {}
                head = names.head ? (object.getObjectByName(names.head) ?? null) : null
                leftEye = names.leftEye ? (object.getObjectByName(names.leftEye) ?? null) : null
                rightEye = names.rightEye ? (object.getObjectByName(names.rightEye) ?? null) : null

                // nothing named, or nothing found: turn the whole model instead
                // of failing, so an unfamiliar rig still does something sensible
                if (!head && !leftEye && !rightEye) head = object

                remember(head)
                remember(leftEye)
                remember(rightEye)
            }

            try {
                if (src) {
                    const loader = new GLTFLoader()
                    const gltf = await loader.loadAsync(src)
                    if (disposed) return
                    frameModel(gltf.scene)
                    wire(gltf.scene)
                } else {
                    const standIn = buildStandIn(THREE)
                    frameModel(standIn.object)
                    head = standIn.head
                    leftEye = standIn.leftEye
                    rightEye = standIn.rightEye
                    remember(head)
                    remember(leftEye)
                    remember(rightEye)
                }
                if (!disposed) setPhase("ready")
            } catch {
                if (!disposed) setPhase("error")
                renderer.dispose()
                renderer.domElement.remove()
                return
            }

            const aim = { x: 0, y: 0 }
            const eyeAt = { x: 0, y: 0 }
            const headAt = { x: 0, y: 0 }
            let frame = 0
            let seen = true

            const resize = () => {
                const box = host.getBoundingClientRect()
                const w = Math.max(1, Math.round(box.width))
                const h = Math.max(1, Math.round(box.height))
                renderer.setSize(w, h, false)
                camera.aspect = w / h
                camera.updateProjectionMatrix()
            }
            resize()

            const turn = (node: THREE_NS.Object3D | null, x: number, y: number, gain: number) => {
                if (!node) return
                const rest = neutral.get(node)
                if (!rest) return
                const config = settings.current
                node.rotation.set(
                    // pointer below the centre means look down, which is a
                    // positive rotation about X for a model facing +Z
                    rest.x + y * config.maxPitch * DEG * gain,
                    rest.y + x * config.maxYaw * DEG * gain,
                    rest.z,
                )
            }

            const render = () => {
                frame = requestAnimationFrame(render)
                if (!seen) return

                const config = settings.current
                const ease = clamp(config.damping, 0.02, 1)

                // eyes lead, head follows more slowly: that difference is what
                // reads as a creature noticing you rather than a rig snapping
                eyeAt.x += (aim.x - eyeAt.x) * ease
                eyeAt.y += (aim.y - eyeAt.y) * ease
                const slow = ease * clamp(1 - config.headDelay, 0.05, 1)
                headAt.x += (aim.x - headAt.x) * slow
                headAt.y += (aim.y - headAt.y) * slow

                turn(head, headAt.x, headAt.y, 1)
                turn(leftEye, eyeAt.x, eyeAt.y, 1.5)
                turn(rightEye, eyeAt.x, eyeAt.y, 1.5)

                renderer.render(scene, camera)
            }

            const onMove = (event: PointerEvent) => {
                if (settings.current.still) return
                const box = host.getBoundingClientRect()
                if (box.width === 0 || box.height === 0) return
                const gain = settings.current.sensitivity
                aim.x = clamp(((event.clientX - box.left) / box.width - 0.5) * 2 * gain, -1, 1)
                aim.y = clamp(((event.clientY - box.top) / box.height - 0.5) * 2 * gain, -1, 1)
            }

            const onLeave = () => {
                aim.x = 0
                aim.y = 0
            }

            host.addEventListener("pointermove", onMove, { passive: true })
            host.addEventListener("pointerleave", onLeave)

            const sizer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null
            sizer?.observe(host)

            const watcher =
                typeof IntersectionObserver === "function"
                    ? new IntersectionObserver(([entry]) => {
                          seen = entry.isIntersecting
                      })
                    : null
            watcher?.observe(host)

            if (settings.current.still) {
                // neutral pose, rendered once
                renderer.render(scene, camera)
            } else {
                frame = requestAnimationFrame(render)
            }

            cleanup = () => {
                cancelAnimationFrame(frame)
                host.removeEventListener("pointermove", onMove)
                host.removeEventListener("pointerleave", onLeave)
                sizer?.disconnect()
                watcher?.disconnect()

                scene.traverse((node) => {
                    const mesh = node as THREE_NS.Mesh
                    mesh.geometry?.dispose?.()
                    const material = mesh.material
                    if (Array.isArray(material)) material.forEach((one) => one.dispose())
                    else material?.dispose?.()
                })
                renderer.dispose()
                renderer.domElement.remove()
            }
        }

        // a machine with no WebGL — or a build with no three — lands in the
        // error state rather than throwing past the effect
        void start().catch(() => {
            if (!disposed) setPhase("error")
        })

        return () => {
            disposed = true
            cleanup?.()
        }
    }, [src, settings])

    return (
        <div
            ref={hostRef}
            className={cx("xp-gaze", className)}
            data-phase={phase}
            data-touch={coarse ? "true" : undefined}
            data-still={still ? "true" : undefined}
            style={{ ...style, background } as CSSProperties}
            role={decorative ? undefined : "img"}
            aria-label={decorative ? undefined : label}
            aria-hidden={decorative ? true : undefined}
        >
            {phase === "loading" ? <span className="xp-gaze-note">Loading…</span> : null}
            {phase === "error" ? (
                <span className="xp-gaze-note" role="status">
                    The model could not be loaded
                </span>
            ) : null}
        </div>
    )
}
