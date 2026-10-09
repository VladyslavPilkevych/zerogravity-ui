import * as THREE from "three"
import { describe, expect, it } from "vitest"

import { buildStandIn } from "./standIn"

describe("buildStandIn", () => {
    it("names the nodes Gaze looks for, so the default tracking resolves", () => {
        const { object } = buildStandIn(THREE)

        expect(object.getObjectByName("head")).toBeTruthy()
        expect(object.getObjectByName("leftEye")).toBeTruthy()
        expect(object.getObjectByName("rightEye")).toBeTruthy()
    })

    it("returns the same nodes it names, so no lookup is needed", () => {
        const { object, head, leftEye, rightEye } = buildStandIn(THREE)

        expect(object.getObjectByName("head")).toBe(head)
        expect(object.getObjectByName("leftEye")).toBe(leftEye)
        expect(object.getObjectByName("rightEye")).toBe(rightEye)
    })

    it("sets the eyes apart and in front of the face", () => {
        const { leftEye, rightEye } = buildStandIn(THREE)

        expect(leftEye.position.x).toBeLessThan(0)
        expect(rightEye.position.x).toBeGreaterThan(0)
        expect(leftEye.position.z).toBeGreaterThan(0.6)
        expect(rightEye.position.z).toBeCloseTo(leftEye.position.z)
    })

    it("keeps the body out of the head, so only the head turns", () => {
        const { object, head } = buildStandIn(THREE)
        const body = object.getObjectByName("body")!

        expect(body).toBeTruthy()
        expect(body.parent).toBe(object)
        expect(head.getObjectByName("body")).toBeUndefined()
    })

    it("blinks by closing lids over the eyes, and hides them when open", () => {
        const { head, blink } = buildStandIn(THREE)

        blink(0)
        const lids = head.children.filter((child) => child.visible === false)
        expect(lids).toHaveLength(2)
        lids.forEach((lid) => expect(lid.scale.y).toBeLessThan(0.01))

        blink(1)
        lids.forEach((lid) => {
            expect(lid.visible).toBe(true)
            expect(lid.scale.y).toBe(1)
        })
    })

    it("has nothing named for a rig it does not know, which is what makes Gaze fall back", () => {
        const { object } = buildStandIn(THREE)

        expect(object.getObjectByName("Armature|mixamorig:Head")).toBeUndefined()
    })
})
