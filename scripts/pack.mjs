import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export function packLibrary() {
    const destination = mkdtempSync(path.join(tmpdir(), "zg-pack-"))

    execFileSync("pnpm", ["pack", "--pack-destination", destination], {
        cwd: REPO_ROOT,
        stdio: ["ignore", "pipe", "pipe"],
    })

    const tarball = readdirSync(destination).find((file) => file.endsWith(".tgz"))
    if (!tarball) throw new Error("pnpm pack produced no tarball")

    return path.join(destination, tarball)
}
