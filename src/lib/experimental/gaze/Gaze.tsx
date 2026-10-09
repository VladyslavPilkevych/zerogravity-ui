"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
// type-only: erased at build, so nothing here pulls three into a bundle
import type * as THREE_NS from "three"

import {
    cx,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
    wakeLoop,
} from "../../internal"
import { buildStandIn } from "./standIn"
import { aimAt, eyeAngles, gazeState, headAngles, stepGaze } from "./track"
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

const BLINK_MS = 220
const ZERO = { x: 0, y: 0 } as const

export function Gaze({
    src,
    tracking,
    sensitivity = 1,
    maxYaw = 34,
    maxPitch = 18,
    damping = 0.1,
    headDelay = 0.6,
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
    const wakeRef = useRef<(() => void) | null>(null)

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
            let blinker: ((amount: number) => void) | null = null
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
                // a little short of the frame and lifted, so a caption under it never clips
                root.scale.setScalar(1.72 / reach)
                root.position.y = 0.08
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
                    if (disposed) {
                        renderer.dispose()
                        renderer.domElement.remove()
                        return
                    }
                    frameModel(gltf.scene)
                    wire(gltf.scene)
                } else {
                    const standIn = buildStandIn(THREE)
                    frameModel(standIn.object)
                    head = standIn.head
                    leftEye = standIn.leftEye
                    rightEye = standIn.rightEye
                    blinker = standIn.blink
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

            const state = gazeState()
            const angle = { x: 0, y: 0 }
            const eyeAngle = { x: 0, y: 0 }
            const box = pointerBox(host)
            let visible = true
            let blinkFrom = -1
            let blinkTimer = 0
            let releaseTimer = 0

            const resize = () => {
                box.invalidate()
                const rect = host.getBoundingClientRect()
                const w = Math.max(1, Math.round(rect.width))
                const h = Math.max(1, Math.round(rect.height))
                renderer.setSize(w, h, false)
                camera.aspect = w / h
                camera.updateProjectionMatrix()
            }
            resize()

            const turn = (node: THREE_NS.Object3D | null, pitch: number, yaw: number) => {
                if (!node) return
                const rest = neutral.get(node)
                if (!rest) return
                // pointer below the centre means look down, which is a
                // positive rotation about X for a model facing +Z
                node.rotation.set(rest.x + pitch, rest.y + yaw, rest.z)
            }

            const pose = () => {
                const { maxYaw: yaw, maxPitch: pitch } = settings.current
                headAngles(state.head, yaw, pitch, angle)
                turn(head, angle.y, angle.x)
                // a lone eye rig (no head found) has nothing to be relative to
                eyeAngles(state.eye, head ? angle : ZERO, yaw, pitch, eyeAngle)
                turn(leftEye, eyeAngle.y, eyeAngle.x)
                turn(rightEye, eyeAngle.y, eyeAngle.x)
            }

            const loop = wakeLoop((dt, now) => {
                if (!visible) return false
                const config = settings.current

                if (config.still) {
                    state.aim.x = state.aim.y = 0
                    state.eye.x = state.eye.y = state.head.x = state.head.y = 0
                }

                // eyes lead, head follows more slowly: that difference is what
                // reads as a creature noticing you rather than a rig snapping
                const settled = stepGaze(state, config.damping, config.headDelay, dt)
                pose()

                let blinking = false
                if (blinkFrom >= 0 && blinker) {
                    if (blinkFrom === 0) blinkFrom = now
                    const t = (now - blinkFrom) / BLINK_MS
                    blinking = t < 1
                    blinker(blinking ? Math.sin(Math.PI * t) : 0)
                    if (!blinking) blinkFrom = -1
                }

                renderer.render(scene, camera)
                return !(settled && !blinking) && !config.still
            })

            // only the stand-in has lids; a blink every few seconds is the
            // difference between a model and a creature
            const scheduleBlink = () => {
                if (!blinker) return
                blinkTimer = window.setTimeout(
                    () => {
                        if (visible && !settings.current.still) {
                            blinkFrom = 0
                            loop.wake()
                        }
                        scheduleBlink()
                    },
                    2400 + Math.random() * 3600,
                )
            }

            const look = (event: PointerEvent) => {
                if (settings.current.still) return
                const at = box.at(event)
                if (!at) return
                window.clearTimeout(releaseTimer)
                aimAt(at.x, at.y, settings.current.sensitivity, state.aim)
                loop.wake()
            }

            const release = (event: PointerEvent) => {
                window.clearTimeout(releaseTimer)
                const settle = () => {
                    state.aim.x = state.aim.y = 0
                    loop.wake()
                }
                // a finger lifts the moment it taps, so hold that look a beat
                // or the tap would seem to do nothing
                if (event.pointerType === "touch") releaseTimer = window.setTimeout(settle, 1400)
                else settle()
            }

            host.addEventListener("pointermove", look, { passive: true })
            host.addEventListener("pointerdown", look, { passive: true })
            host.addEventListener("pointerleave", release)
            host.addEventListener("pointercancel", release)

            const stopResize = onResize(host, () => {
                resize()
                if (!loop.running) renderer.render(scene, camera)
            })
            const stopVisible = onVisible(host, (seen) => {
                visible = seen
                if (seen) loop.wake()
            })

            wakeRef.current = loop.wake

            // the first frame is always drawn, still or not
            pose()
            renderer.render(scene, camera)
            if (!settings.current.still) scheduleBlink()

            cleanup = () => {
                wakeRef.current = null
                loop.sleep()
                window.clearTimeout(blinkTimer)
                window.clearTimeout(releaseTimer)
                host.removeEventListener("pointermove", look)
                host.removeEventListener("pointerdown", look)
                host.removeEventListener("pointerleave", release)
                host.removeEventListener("pointercancel", release)
                stopResize()
                stopVisible()
                box.dispose()

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

    // turning still mid-flight walks the model back to neutral once
    useEffect(() => {
        wakeRef.current?.()
    }, [still])

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
