import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const LIB = path.dirname(fileURLToPath(import.meta.url))

function stylesheets(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(directory, entry.name)
        if (entry.isDirectory()) return stylesheets(full)
        return entry.name.endsWith(".css") ? [full] : []
    })
}

function declarations(block: string): string[] {
    return block
        .split(";")
        .map((declaration) => declaration.split(":")[0].trim())
        .filter(Boolean)
}

/**
 * Lightning CSS keeps only the last of a `backdrop-filter` pair when the
 * standard form comes first, and Chromium ignores the prefixed one, so the
 * consumer's build silently loses the blur. The prefixed form has to lead.
 */
export function unsafeBackdropOrder(css: string): number {
    let unsafe = 0
    for (const match of css.matchAll(/\{([^{}]*)\}/g)) {
        const names = declarations(match[1])
        const standard = names.indexOf("backdrop-filter")
        const prefixed = names.indexOf("-webkit-backdrop-filter")
        if (standard !== -1 && prefixed !== -1 && standard < prefixed) unsafe++
    }
    return unsafe
}

describe("stylesheets", () => {
    it("detects a standard backdrop-filter declared before the prefixed one", () => {
        expect(
            unsafeBackdropOrder(".a{backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}"),
        ).toBe(1)
        expect(
            unsafeBackdropOrder(".a{-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}"),
        ).toBe(0)
        expect(unsafeBackdropOrder(".a{backdrop-filter:blur(4px)}")).toBe(0)
    })

    it("declares every backdrop-filter pair prefixed first", () => {
        const offenders = stylesheets(LIB)
            .filter((file) => unsafeBackdropOrder(readFileSync(file, "utf8")) > 0)
            .map((file) => path.relative(LIB, file))

        expect(offenders).toEqual([])
    })
})
