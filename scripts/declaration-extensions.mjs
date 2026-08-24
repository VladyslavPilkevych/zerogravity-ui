/*
 * `tsc` copies relative specifiers into the declarations exactly as the source
 * wrote them, so `export { Reel } from "./reel"` stays extensionless. Node16
 * resolution has no directory lookup, so every one of those is a dead end for a
 * consumer — Are The Types Wrong reports it as an internal resolution error.
 *
 * This is the one job tsup's dts pass was still doing for us. Doing it here
 * costs a few milliseconds instead of the 2 GB its worker needed.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist")
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.[^"']*)\2/g
/* `import "./Reel.css"` is copied into the declaration, where it resolves to
 * nothing and fails the whole entry point. Stylesheets belong to the module,
 * not to its types. */
const STYLE_IMPORT = /^\s*import\s+["'][^"']+\.css["'];?\s*$\n?/gm

function declarations(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) return declarations(full)
        return entry.name.endsWith(".d.ts") ? [full] : []
    })
}

/** Resolve the way Node16 will: an exact file, then the directory's index. */
function resolve(fromFile, specifier) {
    if (path.extname(specifier)) return null

    const target = path.resolve(path.dirname(fromFile), specifier)
    if (exists(`${target}.d.ts`)) return `${specifier}.js`
    if (exists(path.join(target, "index.d.ts"))) return `${specifier}/index.js`
    return null
}

function exists(file) {
    try {
        return statSync(file).isFile()
    } catch {
        return false
    }
}

let rewritten = 0
let dropped = 0
let files = 0

for (const file of declarations(DIST)) {
    const before = readFileSync(file, "utf8")
    const stripped = before.replace(STYLE_IMPORT, () => {
        dropped += 1
        return ""
    })
    const after = stripped.replace(SPECIFIER, (match, lead, quote, specifier) => {
        const next = resolve(file, specifier)
        if (!next) return match
        rewritten += 1
        return `${lead}${quote}${next}${quote}`
    })

    if (after !== before) {
        writeFileSync(file, after)
        files += 1
    }
}

console.log(
    `Declarations: ${rewritten} specifiers rewritten, ${dropped} stylesheet imports dropped, ${files} files touched`,
)
