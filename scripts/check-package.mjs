import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

import { packLibrary, REPO_ROOT } from "./pack.mjs"

const ALLOWED_ROOTS = new Set(["dist", "package.json", "README.md", "CHANGELOG.md", "LICENSE"])

/** Everything in src/lib is public except the shared helpers and the prototypes. */
const PRIVATE_DIRS = new Set(["internal", "experimental"])

function publicSlugs() {
    return readdirSync(path.join(REPO_ROOT, "src", "lib"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !PRIVATE_DIRS.has(entry.name))
        .map((entry) => entry.name)
        .sort()
}

const FORBIDDEN = [
    /^package\/src\//,
    /^package\/e2e\//,
    /^package\/test\//,
    /^package\/scripts\//,
    /\.stories\./,
    /\.test\./,
    /^package\/\.next\//,
    /^package\/storybook-static\//,
    /^package\/\.storybook\//,
    /playwright/i,
    /\.tgz$/,
    /^package\/test-results\//,
]

const failures = []

function step(name, fn) {
    try {
        const detail = fn()
        console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`)
    } catch (error) {
        failures.push(name)
        const output = error.stdout || error.stderr || error.message
        console.log(`  FAIL  ${name}\n${String(output).split("\n").slice(-30).join("\n")}`)
    }
}

const tarball = packLibrary()
const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)

console.log(`Package validation for ${path.basename(tarball)}\n`)

step("tarball contains only publishable files", () => {
    const roots = new Set(
        entries.map((entry) => entry.replace(/^package\//, "").split("/")[0]).filter(Boolean),
    )
    const unexpected = [...roots].filter((root) => !ALLOWED_ROOTS.has(root))
    if (unexpected.length) throw new Error(`unexpected root entries: ${unexpected.join(", ")}`)
    return [...roots].sort().join(", ")
})

step("tarball excludes source, tests and tooling", () => {
    const leaked = entries.filter((entry) => FORBIDDEN.some((pattern) => pattern.test(entry)))
    if (leaked.length) throw new Error(`leaked: ${leaked.slice(0, 10).join(", ")}`)
    return "no leakage"
})

step("tarball ships declarations and stylesheets", () => {
    const declarations = entries.filter((entry) => entry.endsWith(".d.ts")).length
    const styles = entries.filter((entry) => entry.endsWith(".css")).length
    if (declarations === 0) throw new Error("no .d.ts files")
    if (styles === 0) throw new Error("no .css files")
    return `${declarations} declarations, ${styles} stylesheets`
})

step("publint reports no packaging problems", () => {
    execFileSync("npx", ["publint", "--strict", tarball], {
        cwd: REPO_ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    })
    return "strict mode clean"
})

step("type resolution is correct for modern consumers", () => {
    execFileSync(
        "npx",
        ["attw", "--pack", tarball, "--profile", "node16", "--ignore-rules", "cjs-resolves-to-esm"],
        { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    )
    return "ESM-only resolution verified"
})

step("the package declares no runtime dependencies", () => {
    const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"))
    const deps = Object.keys(manifest.dependencies ?? {})
    if (deps.length) throw new Error(`runtime dependencies: ${deps.join(", ")}`)
    return "react and react-dom are peers, nothing else"
})

step("package size stays within the tracked baseline", () => {
    const bytes = statSync(tarball).size
    const kb = bytes / 1024
    if (kb > 250) throw new Error(`tarball grew to ${kb.toFixed(0)} kB (baseline ceiling 250 kB)`)
    return `${kb.toFixed(0)} kB tarball`
})

step("every public component has a subpath export, and nothing else does", () => {
    const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"))
    const declared = Object.keys(manifest.exports ?? {})
    const expected = [".", ...publicSlugs().map((slug) => `./${slug}`), "./package.json"]

    const missing = expected.filter((entry) => !declared.includes(entry))
    const extra = declared.filter((entry) => !expected.includes(entry))
    if (missing.length) throw new Error(`missing export paths: ${missing.join(", ")}`)
    if (extra.length) throw new Error(`unexpected export paths: ${extra.join(", ")}`)

    return `${expected.length - 1} entry points`
})

step("no export resolves outside the published surface", () => {
    const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"))

    // A wildcard would hand consumers dist/internal and every engine module
    const wildcards = Object.keys(manifest.exports).filter((entry) => entry.includes("*"))
    if (wildcards.length) throw new Error(`wildcard exports: ${wildcards.join(", ")}`)

    const shipped = new Set(entries.map((entry) => entry.replace(/^package\//, "")))
    const targets = Object.values(manifest.exports).flatMap((value) =>
        typeof value === "string" ? [value] : Object.values(value),
    )
    const dangling = targets
        .map((target) => target.replace(/^\.\//, ""))
        .filter((target) => target !== "package.json" && !shipped.has(target))
    if (dangling.length) throw new Error(`exports point at missing files: ${dangling.join(", ")}`)

    return `${targets.length} targets present in the tarball`
})

step("internal modules stay unreachable", () => {
    const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"))
    const reachable = Object.keys(manifest.exports)
    const leaked = reachable.filter((entry) =>
        /internal|engine|playground|experimental/.test(entry),
    )
    if (leaked.length) throw new Error(`internal paths exported: ${leaked.join(", ")}`)

    // dist/internal still ships because components import it; it just has no entry point
    return "shared helpers bundled but unexported"
})

if (failures.length) {
    console.error(`\n${failures.length} package check(s) failed`)
    process.exit(1)
}
console.log("\nAll package checks passed")
