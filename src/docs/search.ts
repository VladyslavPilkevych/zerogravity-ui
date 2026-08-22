import type { DocEntry } from "./types"

/**
 * A weighted substring match over the registry. The component count does not
 * come close to justifying a search library.
 */
export function scoreEntry(entry: DocEntry, query: string): number {
    const term = query.trim().toLowerCase()
    if (term === "") return 1

    const name = entry.name.toLowerCase()
    const slug = entry.slug.toLowerCase()

    if (name === term || slug === term) return 100
    if (name.startsWith(term) || slug.startsWith(term)) return 70
    if (name.includes(term) || slug.includes(term)) return 50
    if (entry.tags?.some((tag) => tag.toLowerCase() === term)) return 40
    if (entry.tags?.some((tag) => tag.toLowerCase().includes(term))) return 30
    if (entry.category.toLowerCase().includes(term)) return 20
    if (entry.description.toLowerCase().includes(term)) return 10
    if (entry.status.startsWith(term)) return 5

    return 0
}

export function searchComponents(entries: DocEntry[], query: string): DocEntry[] {
    if (query.trim() === "") return entries

    return entries
        .map((entry, index) => ({ entry, index, score: scoreEntry(entry, query) }))
        .filter((hit) => hit.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((hit) => hit.entry)
}
