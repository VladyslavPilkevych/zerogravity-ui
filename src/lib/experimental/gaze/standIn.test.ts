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

    it("sets the eyes apart and in front, where the visor cannot swallow them", () => {
        const { leftEye, rightEye } = buildStandIn(THREE)

        expect(leftEye.position.x).toBeLessThan(0)
        expect(rightEye.position.x).toBeGreaterThan(0)
        expect(leftEye.position.z).toBeGreaterThan(0.8)
        expect(rightEye.position.z).toBeCloseTo(leftEye.position.z)
    })

    it("has nothing named for a rig it does not know, which is what makes Gaze fall back", () => {
        const { object } = buildStandIn(THREE)

        expect(object.getObjectByName("Armature|mixamorig:Head")).toBeUndefined()
    })
})
