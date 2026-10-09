import { readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

/**
 * Cloud sync (iCloud, Dropbox, OneDrive) resolves conflicts by writing a copy
 * next to the original: `Wash.test 2.tsx`, `index 3.ts`, `dist 2`, `Card (1).tsx`.
 * tsup builds every file under src/lib, so one such copy ships a duplicate
 * module, or a test, in the npm tarball. A real name never puts a space before
 * its number, so `v2.ts`, `es2022` and `h264.ts` stay clear.
 */
const COPY_SUFFIX = / (\d+|\(\d+\))(\.[^/\\]+)?$/

export function isCloudCopy(file) {
    return COPY_SUFFIX.test(path.basename(file))
}

/** Generated or vendored trees that never feed the package build. */
const SKIP = new Set([".git", "node_modules", ".next", "storybook-static", "test-results"])

/** Every suspicious file or folder under `root`, as paths relative to it. */
export function findCloudCopies(root, { skip = SKIP } = {}) {
    const found = []

    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (skip.has(entry.name)) continue
            const full = path.join(dir, entry.name)
            if (isCloudCopy(entry.name)) found.push(path.relative(root, full))
            // a copied folder is reported once, not file by file
            else if (entry.isDirectory()) walk(full)
        }
    }

    walk(root)
    return found.sort()
}

export function cloudCopyMessage(paths, where) {
    return [
        `${paths.length} cloud-sync duplicate ${paths.length === 1 ? "copy" : "copies"} in ${where}:`,
        ...paths.map((file) => `  ${file}`),
        "Files like 'Bezel 2.tsx' are conflict copies written by iCloud, Dropbox or OneDrive.",
        "The build picks them up and they end up in the npm tarball. Compare each one with",
        "its original, delete the copy, and keep the repository out of a synced folder.",
    ].join("\n")
}

// `node scripts/duplicates.mjs` guards prepack, so `npm publish` stops before building
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
    const found = findCloudCopies(root)
    if (found.length) {
        console.error(cloudCopyMessage(found, "the repository"))
        process.exit(1)
    }
}
