import type * as THREE_NS from "three"

export interface StandIn {
    object: THREE_NS.Object3D
    head: THREE_NS.Object3D
    leftEye: THREE_NS.Object3D
    rightEye: THREE_NS.Object3D
}

/**
 * A small original head built from primitives, so the docs need no binary asset
 * and nothing is downloaded to see the component work. A real `src` replaces it
 * entirely; this only exists so `<Gaze />` on its own is already something.
 */
export function buildStandIn(THREE: typeof THREE_NS): StandIn {
    const object = new THREE.Group()
    object.name = "standIn"

    const head = new THREE.Group()
    head.name = "head"
    object.add(head)

    const shell = new THREE.MeshStandardMaterial({
        color: 0xf3f1ea,
        roughness: 0.42,
        metalness: 0.08,
    })
    const trim = new THREE.MeshStandardMaterial({
        color: 0x6f7d97,
        roughness: 0.3,
        metalness: 0.5,
    })
    const glass = new THREE.MeshStandardMaterial({
        color: 0x11151f,
        roughness: 0.12,
        metalness: 0.6,
    })
    const iris = new THREE.MeshStandardMaterial({
        color: 0x63d3ff,
        emissive: 0x2aa6d8,
        emissiveIntensity: 1.5,
        roughness: 0.25,
    })

    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 42, 32), shell)
    skull.scale.set(1, 1.06, 0.94)
    head.add(skull)

    const visor = new THREE.Mesh(
        new THREE.SphereGeometry(0.99, 42, 24, 0, Math.PI * 2, 0.72, 0.62),
        glass,
    )
    visor.position.z = 0.03
    head.add(visor)

    const jaw = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.5, 6, 18), trim)
    jaw.rotation.z = Math.PI / 2
    jaw.position.set(0, -0.82, 0.24)
    jaw.scale.set(1, 1, 0.5)
    head.add(jaw)

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 12), trim)
    antenna.position.set(0.42, 1.02, -0.1)
    antenna.rotation.z = -0.28
    head.add(antenna)

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), iris)
    bulb.position.set(0.55, 1.24, -0.1)
    head.add(bulb)

    /** An eye is a socket plus a pupil, grouped so the group is what rotates. */
    const makeEye = (name: string, x: number) => {
        const eye = new THREE.Group()
        eye.name = name
        // in front of the visor, or the visor simply hides them
        eye.position.set(x, 0.14, 0.84)

        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 26, 20), shell)
        eye.add(ball)

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.105, 22, 18), iris)
        pupil.position.z = 0.14
        pupil.scale.set(1, 1, 0.6)
        eye.add(pupil)

        head.add(eye)
        return eye
    }

    const leftEye = makeEye("leftEye", -0.3)
    const rightEye = makeEye("rightEye", 0.3)

    return { object, head, leftEye, rightEye }
}
