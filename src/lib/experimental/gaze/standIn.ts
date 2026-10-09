import type * as THREE_NS from "three"

export interface StandIn {
    object: THREE_NS.Object3D
    head: THREE_NS.Object3D
    leftEye: THREE_NS.Object3D
    rightEye: THREE_NS.Object3D
    /** 0 is open, 1 is shut */
    blink(amount: number): void
}

const EYE = 0.22

/**
 * A small original owl built from primitives, so the docs need no binary asset,
 * nothing is downloaded and there is no third-party licence to carry. Faceted
 * feathers against glossy eyes keep it readable at any size; the body stays put
 * so the head turning on it is unmistakable. A real `src` replaces it entirely.
 */
export function buildStandIn(THREE: typeof THREE_NS): StandIn {
    const object = new THREE.Group()
    object.name = "standIn"

    const matte = (color: number) =>
        new THREE.MeshStandardMaterial({ color, roughness: 0.78, flatShading: true })
    const gloss = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.18 })

    const plumage = matte(0xd9773f)
    const wing = matte(0xa9512a)
    const cream = matte(0xf6dfb8)
    const disc = matte(0xfcefdc)
    const speckle = matte(0xd9a978)
    const horn = matte(0xf4b13c)
    const white = gloss(0xfffdf7)
    const iris = gloss(0xffb02e)
    const pupil = gloss(0x17110d)
    const shine = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const blob = (radius: number, detail: number) => new THREE.IcosahedronGeometry(radius, detail)
    const ball = (radius: number) => new THREE.SphereGeometry(radius, 28, 20)

    const add = (
        parent: THREE_NS.Object3D,
        geometry: THREE_NS.BufferGeometry,
        material: THREE_NS.Material,
        [x, y, z]: [number, number, number],
        [sx, sy, sz]: [number, number, number] = [1, 1, 1],
    ) => {
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.scale.set(sx, sy, sz)
        parent.add(mesh)
        return mesh
    }

    // the body never turns, which is what makes the head's turn legible
    const body = new THREE.Group()
    body.name = "body"
    object.add(body)

    add(body, blob(0.8, 2), plumage, [0, -0.55, 0], [1, 1.05, 0.88])
    add(body, blob(0.56, 2), cream, [0, -0.62, 0.42], [1, 1.12, 0.55])

    for (const [x, y] of [
        [-0.17, -0.42],
        [0.17, -0.42],
        [0, -0.6],
        [-0.2, -0.78],
        [0.2, -0.78],
    ] as const) {
        add(body, blob(0.06, 0), speckle, [x, y, 0.72], [1.4, 0.8, 0.5])
    }

    for (const side of [-1, 1]) {
        const flap = add(body, blob(0.45, 1), wing, [side * 0.78, -0.58, 0.02], [0.38, 1, 0.78])
        flap.rotation.z = side * 0.18
        for (const toe of [-0.08, 0, 0.08]) {
            add(body, blob(0.075, 1), horn, [side * 0.24 + toe, -1.37, 0.5], [1, 0.7, 1.4])
        }
    }

    // pivots at the neck, so pitch nods the head instead of spinning it in place
    const head = new THREE.Group()
    head.name = "head"
    object.add(head)

    add(head, blob(0.8, 2), plumage, [0, 0.72, 0], [1.14, 0.94, 0.96])

    for (const side of [-1, 1]) {
        const tuft = add(head, new THREE.ConeGeometry(0.17, 0.42, 5), wing, [
            side * 0.66,
            1.42,
            -0.05,
        ])
        tuft.rotation.z = -side * 0.45
        add(head, blob(0.36, 2), disc, [side * 0.34, 0.74, 0.66], [1, 1.02, 0.32])
    }

    const beak = add(head, new THREE.ConeGeometry(0.09, 0.24, 4), horn, [0, 0.54, 0.84])
    beak.rotation.x = Math.PI - 0.4

    const lids: THREE_NS.Object3D[] = []
    const glints: THREE_NS.Object3D[] = []

    /**
     * The eye group is what rotates, carrying iris and pupil across the ball.
     * The highlight belongs to the head, so it holds still while the pupil
     * slides under it, the way a real catchlight does.
     */
    const makeEye = (name: string, side: number) => {
        const x = side * 0.34
        const y = 0.75
        const z = 0.7

        const eye = new THREE.Group()
        eye.name = name
        eye.position.set(x, y, z)
        head.add(eye)

        add(eye, ball(EYE), white, [0, 0, 0])
        add(eye, ball(0.14), iris, [0, 0, EYE - 0.035], [1, 1, 0.42])
        add(eye, ball(0.085), pupil, [0, 0, EYE + 0.005], [1, 1, 0.42])

        const glint = new THREE.Vector3(0.32, 0.4, 0.86).normalize().multiplyScalar(EYE + 0.045)
        glints.push(add(head, ball(0.04), shine, [x + glint.x, y + glint.y, z + glint.z]))

        // a lid hinged at the top of the eye: scaling it down from there is a blink
        const lid = new THREE.Group()
        lid.position.set(x, y + EYE + 0.012, z)
        lid.visible = false
        add(lid, ball(EYE + 0.018), plumage, [0, -(EYE + 0.018), 0])
        head.add(lid)
        lids.push(lid)

        return eye
    }

    const leftEye = makeEye("leftEye", -1)
    const rightEye = makeEye("rightEye", 1)

    const blink = (amount: number) => {
        const shut = Math.min(1, Math.max(0, amount))
        for (const lid of lids) {
            lid.visible = shut > 0.02
            lid.scale.y = Math.max(shut, 0.001)
        }
        // the highlight floats just off the ball, so a shut lid would not hide it
        for (const glint of glints) glint.visible = shut < 0.6
    }

    return { object, head, leftEye, rightEye, blink }
}
