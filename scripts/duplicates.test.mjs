import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { cloudCopyMessage, findCloudCopies, isCloudCopy } from "./duplicates.mjs"

describe("isCloudCopy", () => {
    it("passes ordinary names", () => {
        for (const name of ["Button.tsx", "index.ts", "Wash.test.tsx", "README.md", "dist"]) {
            expect(isCloudCopy(name), name).toBe(false)
        }
    })

    it("passes names where the number belongs to the name", () => {
        for (const name of [
            "v2.ts",
            "es2022.d.ts",
            "h264.ts",
            "page2.tsx",
            "Base64.ts",
            "3d.css",
        ]) {
            expect(isCloudCopy(name), name).toBe(false)
        }
    })

    it("flags the copies cloud sync writes", () => {
        for (const name of [
            "Button 2.tsx",
            "Wash.test 2.tsx",
            "index 3.ts",
            "Component 3.css",
            "package 2.json",
            "Card (1).tsx",
            "dist 2",
        ]) {
            expect(isCloudCopy(name), name).toBe(true)
        }
    })

    it("judges the file name, not the folders above it", () => {
        expect(isCloudCopy("src/lib/bezel/Bezel 2.tsx")).toBe(true)
        expect(isCloudCopy("my repo 2/src/Button.tsx")).toBe(false)
    })
})

describe("findCloudCopies", () => {
    let root

    afterEach(() => rmSync(root, { recursive: true, force: true }))

    function tree(files) {
        root = mkdtempSync(path.join(tmpdir(), "zg-dup-"))
        for (const file of files) {
            mkdirSync(path.join(root, path.dirname(file)), { recursive: true })
            writeFileSync(path.join(root, file), "")
        }
    }

    it("finds nested copies and copied folders, and skips generated trees", () => {
        tree([
            "src/lib/bezel/Bezel.tsx",
            "src/lib/bezel/Bezel 2.tsx",
            "src/lib/wash/Wash.test 2.tsx",
            "src/lib/tag 2/index.ts",
            "dist/tag/Tag 2.js",
            "node_modules/pkg/index 2.js",
            ".git/index 2",
        ])

        expect(findCloudCopies(root)).toEqual([
            path.join("dist", "tag", "Tag 2.js"),
            path.join("src", "lib", "bezel", "Bezel 2.tsx"),
            path.join("src", "lib", "tag 2"),
            path.join("src", "lib", "wash", "Wash.test 2.tsx"),
        ])
    })

    it("returns nothing for a clean tree", () => {
        tree(["src/lib/reel/Reel.tsx", "src/lib/reel/v2.ts", "scripts/pack.mjs"])

        expect(findCloudCopies(root)).toEqual([])
    })

    it("explains why the copies matter", () => {
        const message = cloudCopyMessage(["src/Button 2.tsx"], "the repository")

        expect(message).toContain("src/Button 2.tsx")
        expect(message).toMatch(/npm tarball/)
    })
})
