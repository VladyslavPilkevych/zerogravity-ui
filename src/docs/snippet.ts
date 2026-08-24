import { propLines } from "@/playground/panel/codegen"

import type { DocEntry } from "./types"

const PACKAGE = "zerogravity"

/**
 * The single generated example. It reads the same defaults and the same live
 * config the preview does, so the two can never disagree.
 */
export function snippetFor(entry: DocEntry, config: Record<string, unknown>): string {
    const tag = entry.tag ?? entry.name
    const lines = propLines(entry.defaults, config, entry.omit)

    const open =
        lines.length === 0
            ? entry.children
                ? `<${tag}>`
                : `<${tag} />`
            : entry.children
              ? `<${tag}\n${lines.join("\n")}\n>`
              : `<${tag}\n${lines.join("\n")}\n/>`

    const element = entry.children ? `${open}\n    ${entry.children}\n</${tag}>` : open

    if (entry.status !== "stable") return element
    return `import { ${tag} } from "${PACKAGE}"\n\n${element}`
}
