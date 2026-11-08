import { execFileSync } from "node:child_process"
import { createServer } from "node:http"
import { createRequire } from "node:module"
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
import { URL, pathToFileURL } from "node:url"

import { packLibrary, REPO_ROOT } from "./pack.mjs"

const FIXTURES = path.join(REPO_ROOT, "test", "consumer")
const PKG = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).name

const failures = []
const notes = []

function run(command, args, cwd) {
    return execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
}

async function stepAsync(name, fn) {
    try {
        const detail = await fn()
        console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`)
    } catch (error) {
        failures.push(name)
        const output = error.stdout || error.stderr || error.message
        console.log(`  FAIL  ${name}\n${String(output).split("\n").slice(-25).join("\n")}`)
    }
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

/**
 * Strings that survive minification, one per component: if one shows up in a
 * bundle that never imported that component, tree shaking failed.
 */
const MARKERS = {
    Antigravity: "antigravity",
    GridTrail: "grid-trail",
    ScrollStack: "scroll-stack",
    TrailingCursor: "trailing-cursor-dot",
    Aperture: "aperture-",
    Reel: "reel-viewport",
    Meadow: "xp-meadow",
    Ricochet: "xp-ricochet",
    Elemental: "xp-el-",
    Diorama: "xp-diorama",
    Ascender: "zg-ascender",
    Detent: "zg-detent",
    Folio: "zg-folio",
    Frost: "zg-frost",
    Halo: "zg-halo",
    Sash: "zg-sash",
    Tether: "zg-tether",
    Tag: "zg-tag",
    SplitFlap: "split-flap",
}

const SHAKE_SCENARIOS = [
    { label: "root barrel", entry: PKG, name: "SplitFlap", jsx: '<SplitFlap value="HI" />' },
    {
        label: "subpath",
        entry: `${PKG}/split-flap`,
        name: "SplitFlap",
        jsx: '<SplitFlap value="HI" />',
    },
    { label: "root Tag", entry: PKG, name: "Tag", jsx: '<Tag status="success">Ready</Tag>' },
    {
        label: "subpath Folio",
        entry: `${PKG}/folio`,
        name: "Folio",
        imports: "Folio, FolioPanel",
        jsx: '<Folio label="Work"><FolioPanel label="One" /><FolioPanel label="Two" /></Folio>',
    },
    { label: "subpath Frost", entry: `${PKG}/frost`, name: "Frost", jsx: "<Frost>Glass</Frost>" },
    {
        label: "subpath Ascender",
        entry: `${PKG}/ascender`,
        name: "Ascender",
        jsx: '<Ascender text="Rise" />',
    },
]

/**
 * One install, a React-only baseline, then each import style built alone, so
 * every number is that import's real cost and every bundle is checked for the
 * components it should not contain.
 */
function treeShakingConsumer(tarball) {
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
    install(dir, ["react@^19", "react-dom@^19", "vite", "@vitejs/plugin-react"], tarball)

    const assets = (extension) =>
        readdirSync(path.join(dir, "dist", "assets"))
            .filter((file) => file.endsWith(extension))
            .map((file) => readFileSync(path.join(dir, "dist", "assets", file), "utf8"))
            .join("")

    let baseline = 0
    step("tree shaking: measures against a React-only baseline", () => {
        write(
            dir,
            "src/main.tsx",
            `import { createRoot } from "react-dom/client"\ncreateRoot(document.getElementById("root")!).render(<span>HI</span>)\n`,
        )
        run("npx", ["vite", "build"], dir)
        baseline = bundleBytes(dir, ".js")
        return `${(baseline / 1024).toFixed(1)} kB of React alone`
    })

    for (const scenario of SHAKE_SCENARIOS) {
        step(`tree shaking (${scenario.label}): excludes every other component`, () => {
            write(
                dir,
                "src/main.tsx",
                `import { createRoot } from "react-dom/client"\nimport { ${scenario.imports ?? scenario.name} } from "${scenario.entry}"\ncreateRoot(document.getElementById("root")!).render(${scenario.jsx})\n`,
            )
            run("npx", ["vite", "build"], dir)
            const js = assets(".js")
            const css = assets(".css")

            if (!(js + css).includes(MARKERS[scenario.name])) {
                throw new Error(`${scenario.name} itself is missing from the bundle`)
            }
            const leaked = Object.entries(MARKERS)
                .filter(([name]) => name !== scenario.name)
                .filter(([, marker]) => js.includes(marker) || css.includes(marker))
                .map(([name]) => name)
            if (leaked.length) throw new Error(`unused components pulled in: ${leaked.join(", ")}`)
            if (/\bnext\b\/dist|react-server-dom/.test(js))
                throw new Error("Next.js reached the bundle")

            const added = bundleBytes(dir, ".js") - baseline
            const styles = bundleBytes(dir, ".css")
            notes.push(
                `Tree-shaken via ${scenario.label} (${scenario.name} only): ` +
                    `${(added / 1024).toFixed(1)} kB JS on top of React, ${(styles / 1024).toFixed(1)} kB CSS`,
            )
            return `${(added / 1024).toFixed(1)} kB JS, ${(styles / 1024).toFixed(1)} kB CSS`
        })
    }

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

/**
 * React 18 is inside the peer range, so one consumer runs on it, importing
 * TrailingCursor, Ascender, Detent, Sash and Folio from the tarball. The page is
 * rendered on the server, hydrated with development React so its warnings are
 * live, and driven with a real pointer and keyboard; any React warning fails.
 */
async function react18Consumer(tarball) {
    const dir = mkdtempSync(path.join(tmpdir(), "zg-react18-"))

    write(dir, "package.json", JSON.stringify({ name: "r18", private: true, type: "module" }))
    write(
        dir,
        "vite.config.ts",
        `import react from "@vitejs/plugin-react"\nimport { defineConfig } from "vite"\nexport default defineConfig({ base: "./", plugins: [react()], ssr: { noExternal: ["zerogravity"] } })\n`,
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
            include: ["types.ts"],
        }),
    )
    write(
        dir,
        "index.html",
        `<div id="root"><!--app--></div><script type="module" src="/src/main.tsx"></script>`,
    )
    cpSync(path.join(FIXTURES, "react18-app.tsx"), path.join(dir, "src", "App.tsx"))
    cpSync(path.join(FIXTURES, "react18-main.tsx"), path.join(dir, "src", "main.tsx"))
    cpSync(path.join(FIXTURES, "react18-ssr.tsx"), path.join(dir, "src", "ssr.tsx"))
    cpSync(path.join(FIXTURES, "types.ts"), path.join(dir, "types.ts"))

    install(
        dir,
        [
            "react@^18",
            "react-dom@^18",
            "@types/react@^18",
            "@types/react-dom@^18",
            "vite",
            "@vitejs/plugin-react",
            "typescript@^5.9",
        ],
        tarball,
    )

    step("react 18: public types resolve against @types/react 18", () => {
        run("npx", ["tsc", "-p", "tsconfig.json"], dir)
        const installed = JSON.parse(
            readFileSync(path.join(dir, "node_modules", "react", "package.json"), "utf8"),
        ).version
        if (!installed.startsWith("18.")) throw new Error(`installed react ${installed}`)
        return `react ${installed}`
    })

    step("react 18: development client and server builds succeed", () => {
        // development React, so the warnings that catch React 19-only props are live
        const env = { ...process.env, NODE_ENV: "development" }
        const build = (args) =>
            execFileSync("npx", ["vite", "build", ...args], { cwd: dir, env, stdio: "pipe" })
        build(["--mode", "development"])
        build(["--mode", "development", "--ssr", "src/ssr.tsx", "--outDir", "dist-ssr"])

        const client = readdirSync(path.join(dir, "dist", "assets"))
            .filter((file) => file.endsWith(".js"))
            .map((file) => readFileSync(path.join(dir, "dist", "assets", file), "utf8"))
            .join("")
        if (!client.includes("for a non-boolean attribute")) {
            throw new Error("the client bundle is not development React")
        }
        return "dist and dist-ssr, development React"
    })

    let html = ""
    await stepAsync("react 18: the page renders on the server", async () => {
        const { render } = await import(pathToFileURL(path.join(dir, "dist-ssr", "ssr.js")).href)
        html = render()
        if (!html.includes('data-react="18.')) throw new Error("server render did not use React 18")
        if (!html.includes('role="radiogroup"')) throw new Error("Detent missing from the markup")
        const page = readFileSync(path.join(dir, "dist", "index.html"), "utf8")
        writeFileSync(path.join(dir, "dist", "index.html"), page.replace("<!--app-->", html))
        return `${html.length} characters of markup`
    })

    const server = createServer((request, response) => {
        const file = path.join(
            dir,
            "dist",
            decodeURIComponent(new URL(request.url, "http://x").pathname),
        )
        try {
            const body = readFileSync(
                file.endsWith(path.sep) ? path.join(file, "index.html") : file,
            )
            const type = file.endsWith(".js")
                ? "text/javascript"
                : file.endsWith(".css")
                  ? "text/css"
                  : "text/html"
            response.writeHead(200, { "content-type": type }).end(body)
        } catch {
            response.writeHead(404).end()
        }
    })
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
    const base = `http://127.0.0.1:${server.address().port}/`

    const { chromium } = createRequire(path.join(REPO_ROOT, "package.json"))("playwright")
    const browser = await chromium.launch()
    try {
        const page = await browser.newPage()
        const messages = []
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning")
                messages.push(message.text())
        })
        page.on("pageerror", (error) => messages.push(error.message))

        await stepAsync("react 18: hydration is clean, with no React warnings", async () => {
            await page.goto(base)
            await page.waitForFunction(() =>
                document
                    .querySelector("[data-react]")
                    ?.getAttribute("data-react")
                    ?.startsWith("18."),
            )
            await page.mouse.move(200, 200)
            await page.waitForTimeout(400)
            if (messages.length) throw new Error(messages.join("\n"))
            return "no console errors or warnings"
        })

        await stepAsync(
            "react 18: Sash copies are inert and hidden from assistive tech",
            async () => {
                const copies = await page.$$eval(".zg-sash-run[data-copy]", (nodes) =>
                    nodes.map(
                        (node) =>
                            node.hasAttribute("inert") &&
                            node.getAttribute("aria-hidden") === "true",
                    ),
                )
                if (copies.length === 0 || copies.includes(false))
                    throw new Error(`copies: ${JSON.stringify(copies)}`)
                return `${copies.length} inert copies`
            },
        )

        await stepAsync("react 18: Detent moves the selection from the keyboard", async () => {
            await page.focus("input[value='grid']")
            await page.keyboard.press("ArrowRight")
            const view = await page.textContent("#view")
            if (view !== "list") throw new Error(`selected ${view}`)
            return "ArrowRight selected the next option"
        })

        await stepAsync(
            "react 18: Ascender reveals and TrailingCursor tracks the pointer",
            async () => {
                await page.waitForSelector(".zg-ascender[data-state='shown']")
                await page.mouse.move(320, 260, { steps: 4 })
                await page.waitForFunction(() => {
                    const dot = document.querySelector(".trailing-cursor-dot")
                    return dot?.style.translate === "320px 260px"
                })
                return "revealed; dot settled on the pointer"
            },
        )

        await stepAsync(
            "react 18: Folio opens the hovered panel from one open position",
            async () => {
                await page
                    .locator(".zg-folio-panel")
                    .nth(2)
                    .hover({ position: { x: 20, y: 60 } })
                await page.waitForSelector(".zg-folio-panel:nth-child(3)[data-open]")
                const at = await page.$eval(".zg-folio", (node) =>
                    node.style.getPropertyValue("--zg-folio-at"),
                )
                if (at !== "2") throw new Error(`open position ${at}`)
                return "third panel open"
            },
        )
    } finally {
        await browser.close()
        server.close()
        rmSync(dir, { recursive: true, force: true })
    }
}

const tarball = packLibrary()
console.log(`Consumer tests against ${path.basename(tarball)}\n`)

viteConsumer(tarball)
treeShakingConsumer(tarball)
nextConsumer(tarball)
await react18Consumer(tarball)

if (notes.length) {
    console.log("\nMeasurements")
    notes.forEach((note) => console.log(`  ${note}`))
}

if (failures.length) {
    console.error(`\n${failures.length} consumer check(s) failed`)
    process.exit(1)
}
console.log("\nAll consumer checks passed")
