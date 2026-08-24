import { execFileSync } from "node:child_process"
import {
    cpSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
    mkdirSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { packLibrary, REPO_ROOT } from "./pack.mjs"

const FIXTURES = path.join(REPO_ROOT, "test", "consumer")
const PKG = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).name

const failures = []
const notes = []

function run(command, args, cwd) {
    return execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
}

function step(name, fn) {
    try {
        const detail = fn()
        console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`)
    } catch (error) {
        failures.push(name)
        const output = error.stdout || error.stderr || error.message
        console.log(`  FAIL  ${name}\n${String(output).split("\n").slice(-25).join("\n")}`)
    }
}

function write(dir, name, content) {
    mkdirSync(path.dirname(path.join(dir, name)), { recursive: true })
    writeFileSync(path.join(dir, name), content)
}

function install(dir, deps, tarball) {
    run("npm", ["install", "--silent", "--no-fund", "--no-audit", ...deps], dir)
    run("npm", ["install", "--silent", "--no-fund", "--no-audit", tarball], dir)
}

function bundleBytes(dir, extension) {
    const assets = path.join(dir, "dist", "assets")
    return readdirSync(assets)
        .filter((file) => file.endsWith(extension))
        .reduce((total, file) => total + readFileSync(path.join(assets, file)).length, 0)
}

function viteConsumer(tarball) {
    const dir = mkdtempSync(path.join(tmpdir(), "zg-vite-"))

    write(dir, "package.json", JSON.stringify({ name: "c", private: true, type: "module" }))
    write(
        dir,
        "vite.config.ts",
        `import react from "@vitejs/plugin-react"\nimport { defineConfig } from "vite"\nexport default defineConfig({ plugins: [react()] })\n`,
    )
    write(
        dir,
        "tsconfig.json",
        JSON.stringify({
            compilerOptions: {
                target: "ES2022",
                lib: ["DOM", "ES2022"],
                jsx: "react-jsx",
                module: "ESNext",
                moduleResolution: "bundler",
                strict: true,
                noEmit: true,
                skipLibCheck: true,
            },
            include: ["src", "types.ts"],
        }),
    )
    write(
        dir,
        "index.html",
        `<div id="root"></div><script type="module" src="/src/main.tsx"></script>`,
    )
    cpSync(path.join(FIXTURES, "vite-app.tsx"), path.join(dir, "src", "main.tsx"))
    cpSync(path.join(FIXTURES, "types.ts"), path.join(dir, "types.ts"))

    install(
        dir,
        [
            "react@^19",
            "react-dom@^19",
            "@types/react@^19",
            "@types/react-dom@^19",
            "vite",
            "@vitejs/plugin-react",
            "typescript@^5.9",
        ],
        tarball,
    )

    step("vite: public types resolve and invalid usage is rejected", () => {
        run("npx", ["tsc", "--noEmit"], dir)
        return "positive and @ts-expect-error cases"
    })

    step("vite: production build succeeds", () => {
        run("npx", ["vite", "build"], dir)
        const js = bundleBytes(dir, ".js")
        const css = bundleBytes(dir, ".css")
        notes.push(
            `Vite consumer bundle: ${(js / 1024).toFixed(1)} kB JS, ${(css / 1024).toFixed(1)} kB CSS`,
        )
        return `${(js / 1024).toFixed(1)} kB JS, ${(css / 1024).toFixed(1)} kB CSS`
    })

    step("vite: subpath entry points resolve and ship their styles", () => {
        // the fixture imports these two through subpaths only, and an
        // unresolvable subpath would already have failed the build above
        const css = readdirSync(path.join(dir, "dist", "assets"))
            .filter((file) => file.endsWith(".css"))
            .map((file) => readFileSync(path.join(dir, "dist", "assets", file), "utf8"))
            .join("")
        const missing = [".aperture", ".grid-trail"].filter((rule) => !css.includes(rule))
        if (missing.length) throw new Error(`subpath styles missing: ${missing.join(", ")}`)
        return "zerogravity/aperture and /grid-trail"
    })

    step("vite: styles reach the consumer bundle", () => {
        const css = readdirSync(path.join(dir, "dist", "assets"))
            .filter((file) => file.endsWith(".css"))
            .map((file) => readFileSync(path.join(dir, "dist", "assets", file), "utf8"))
            .join("")
        if (!css.includes("reel-item")) throw new Error("Reel styles missing from consumer CSS")
        if (!css.includes("stencil-letter")) throw new Error("Stencil styles missing")
        return "component CSS present"
    })

    step("vite: exactly one React copy is installed", () => {
        const found = run(
            "find",
            [path.join(dir, "node_modules"), "-type", "f", "-path", "*/react/package.json"],
            dir,
        )
            .split("\n")
            .filter(Boolean)
            .filter((file) => JSON.parse(readFileSync(file, "utf8")).name === "react")

        if (found.length !== 1) throw new Error(`expected 1 react copy, found ${found.length}`)
        return "1 copy"
    })

    rmSync(dir, { recursive: true, force: true })
}

const HEAVY = [
    "Antigravity",
    "GridTrail",
    "ScrollStack",
    "TrailingCursor",
    "Aperture",
    "Reel",
    "Meadow",
    "Ricochet",
    "Elemental",
    "Diorama",
]

/**
 * `entry` picks the import style, so the same assertions cover the root barrel
 * and a per-component entry point.
 */
function treeShakingConsumer(tarball, label, entry) {
    const dir = mkdtempSync(path.join(tmpdir(), "zg-shake-"))

    write(dir, "package.json", JSON.stringify({ name: "s", private: true, type: "module" }))
    write(
        dir,
        "vite.config.ts",
        `import react from "@vitejs/plugin-react"\nimport { defineConfig } from "vite"\nexport default defineConfig({ plugins: [react()] })\n`,
    )
    write(
        dir,
        "index.html",
        `<div id="root"></div><script type="module" src="/src/main.tsx"></script>`,
    )
    write(
        dir,
        "src/main.tsx",
        `import { createRoot } from "react-dom/client"\nimport { SplitFlap } from "${entry}"\ncreateRoot(document.getElementById("root")!).render(<SplitFlap value="HI" />)\n`,
    )

    install(dir, ["react@^19", "react-dom@^19", "vite", "@vitejs/plugin-react"], tarball)

    // The same app built twice through the same entry: React alone, then React
    // plus the one component. The delta is the library's actual cost.
    const REACT_ONLY = `import { createRoot } from "react-dom/client"\ncreateRoot(document.getElementById("root")!).render(<span>HI</span>)\n`
    const WITH_COMPONENT = readFileSync(path.join(dir, "src", "main.tsx"), "utf8")

    let baseline = 0
    step(`tree shaking (${label}): measures against a React-only baseline`, () => {
        write(dir, "src/main.tsx", REACT_ONLY)
        run("npx", ["vite", "build"], dir)
        baseline = bundleBytes(dir, ".js")
        write(dir, "src/main.tsx", WITH_COMPONENT)
        return `${(baseline / 1024).toFixed(1)} kB of React alone`
    })

    step(`tree shaking (${label}): one light import excludes every other component`, () => {
        run("npx", ["vite", "build"], dir)
        const js = readdirSync(path.join(dir, "dist", "assets"))
            .filter((file) => file.endsWith(".js"))
            .map((file) => readFileSync(path.join(dir, "dist", "assets", file), "utf8"))
            .join("")
        const leaked = HEAVY.filter((name) => js.includes(name))
        if (leaked.length) throw new Error(`unused components pulled in: ${leaked.join(", ")}`)
        if (/\bnext\b\/dist|react-server-dom/.test(js))
            throw new Error("Next.js reached the bundle")

        const css = readdirSync(path.join(dir, "dist", "assets"))
            .filter((file) => file.endsWith(".css"))
            .map((file) => readFileSync(path.join(dir, "dist", "assets", file), "utf8"))
            .join("")
        if (css.includes("antigravity") || css.includes("reel-item") || css.includes("meadow")) {
            throw new Error("unused component CSS pulled in")
        }

        const bytes = bundleBytes(dir, ".js")
        const added = bytes - baseline
        notes.push(
            `Tree-shaken via ${label} (SplitFlap only): ${(bytes / 1024).toFixed(1)} kB JS total, ` +
                `${(added / 1024).toFixed(1)} kB of it the library, ` +
                `${(bundleBytes(dir, ".css") / 1024).toFixed(1)} kB CSS`,
        )
        return `${(added / 1024).toFixed(1)} kB on top of React`
    })

    rmSync(dir, { recursive: true, force: true })
}

function nextConsumer(tarball) {
    const dir = mkdtempSync(path.join(tmpdir(), "zg-next-"))

    write(dir, "package.json", JSON.stringify({ name: "n", private: true }))
    write(dir, "next.config.mjs", "export default {}\n")
    write(
        dir,
        "tsconfig.json",
        JSON.stringify({
            compilerOptions: {
                target: "ES2022",
                lib: ["DOM", "ES2022"],
                jsx: "preserve",
                module: "ESNext",
                moduleResolution: "bundler",
                strict: true,
                noEmit: true,
                skipLibCheck: true,
                allowJs: true,
                incremental: true,
                plugins: [{ name: "next" }],
            },
            include: ["next-env.d.ts", "app/**/*.ts", "app/**/*.tsx", ".next/types/**/*.ts"],
        }),
    )
    write(
        dir,
        "app/layout.tsx",
        `export const metadata = { title: "consumer" }\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n    return (\n        <html lang="en">\n            <body>{children}</body>\n        </html>\n    )\n}\n`,
    )
    cpSync(path.join(FIXTURES, "next-page.tsx"), path.join(dir, "app", "page.tsx"))

    install(
        dir,
        [
            "next@^15",
            "react@^19",
            "react-dom@^19",
            "@types/react@^19",
            "@types/node",
            "typescript@^5.9",
        ],
        tarball,
    )

    step("next: server component imports the package and the build prerenders", () => {
        const output = run("npx", ["next", "build"], dir)
        if (!/Compiled successfully/.test(output)) throw new Error(output)
        if (/Error occurred prerendering/.test(output)) throw new Error(output)
        return "static prerender clean"
    })

    step('next: "use client" boundaries survive in the published package', () => {
        const reel = readFileSync(
            path.join(dir, "node_modules", PKG, "dist", "reel", "Reel.js"),
            "utf8",
        )
        if (!reel.startsWith('"use client"')) throw new Error("Reel.js lost its directive")
        const entry = readFileSync(path.join(dir, "node_modules", PKG, "dist", "index.js"), "utf8")
        if (entry.startsWith('"use client"')) throw new Error("entry point became a client module")

        // a subpath entry must stay a plain re-export too, or the whole module
        // graph below it turns into a client boundary
        const aperture = readFileSync(
            path.join(dir, "node_modules", PKG, "dist", "aperture", "index.js"),
            "utf8",
        )
        if (aperture.startsWith('"use client"')) throw new Error("subpath entry became client")
        return "per-module directives intact"
    })

    step("next: nothing outside the declared entry points is reachable", () => {
        const manifest = JSON.parse(
            readFileSync(path.join(dir, "node_modules", PKG, "package.json"), "utf8"),
        )
        for (const blocked of ["./internal", "./reel/engine", "./dist/index.js", "./raster"]) {
            if (manifest.exports[blocked]) throw new Error(`${blocked} is exported`)
        }
        return "internal, engine and prototype paths blocked"
    })

    rmSync(dir, { recursive: true, force: true })
}

const tarball = packLibrary()
console.log(`Consumer tests against ${path.basename(tarball)}\n`)

viteConsumer(tarball)
treeShakingConsumer(tarball, "root barrel", PKG)
treeShakingConsumer(tarball, "subpath", `${PKG}/split-flap`)
nextConsumer(tarball)

if (notes.length) {
    console.log("\nMeasurements")
    notes.forEach((note) => console.log(`  ${note}`))
}

if (failures.length) {
    console.error(`\n${failures.length} consumer check(s) failed`)
    process.exit(1)
}
console.log("\nAll consumer checks passed")
