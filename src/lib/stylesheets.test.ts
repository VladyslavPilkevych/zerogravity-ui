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

/** Every selector whose rule declares a backdrop-filter, with the file it lives in. */
export function blurredSelectors(css: string): string[] {
    const found: string[] = []
    for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (!declarations(match[2]).includes("backdrop-filter")) continue
        found.push(
            match[1]
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/\s+/g, " ")
                .trim(),
        )
    }
    return found
}

/**
 * Backdrop blur is reserved for small, still surfaces that sit alone: Frost,
 * whose concept is glass, and single glass controls. Anything large, anything
 * that repeats in a list and anything that moves uses the tint instead, so a
 * new blur has to be added here on purpose.
 */
const BLUR_ALLOWED = [
    'clock/Clock.css .zg-clock[data-variant="glass"]',
    'detent/Detent.css .zg-detent[data-variant="glass"]',
    'frost/Frost.css .zg-frost[data-variant="blur"]',
    "reel/Reel.css .reel-arrow",
]

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

    it("blurs only the surfaces the glass policy allows", () => {
        expect(
            blurredSelectors(".a{color:red}.b , .c{-webkit-backdrop-filter:x;backdrop-filter:x}"),
        ).toEqual([".b , .c"])
        const blurred = stylesheets(LIB).flatMap((file) =>
            blurredSelectors(readFileSync(file, "utf8")).map(
                (selector) => `${path.relative(LIB, file)} ${selector}`,
            ),
        )

        expect(blurred.sort()).toEqual(BLUR_ALLOWED)
    })
})
