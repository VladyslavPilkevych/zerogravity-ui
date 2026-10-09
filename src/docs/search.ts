import type { DocEntry } from "./types"

type Searchable = Pick<
    DocEntry,
    "slug" | "name" | "label" | "description" | "category" | "status"
> &
    Pick<Partial<DocEntry>, "tags">

function scoreTerm(entry: Searchable, term: string): number {
    const name = entry.name.toLowerCase()
    const slug = entry.slug.toLowerCase()
    const label = entry.label.toLowerCase()

    if (name === term || slug === term) return 100
    if (name.startsWith(term) || slug.startsWith(term)) return 70
    if (label === term) return 60
    if (name.includes(term) || slug.includes(term)) return 50
    if (entry.tags?.some((tag) => tag.toLowerCase() === term)) return 40
    if (label.split(/\W+/).includes(term)) return 40
    if (entry.tags?.some((tag) => tag.toLowerCase().includes(term))) return 30
    if (label.includes(term)) return 30
    if (entry.category.toLowerCase().includes(term)) return 20
    if (entry.description.toLowerCase().includes(term)) return 10
    if (entry.status.startsWith(term)) return 5

    return 0
}

/**
 * A weighted substring match over the registry. The component count does not
 * come close to justifying a search library. Every word has to match
 * something, so "water ripple" narrows rather than widens.
 */
export function scoreEntry(entry: Searchable, query: string): number {
    const phrase = query.trim().toLowerCase()
    if (phrase === "") return 1

    const whole = scoreTerm(entry, phrase)
    const words = phrase.split(/\s+/)
    if (words.length === 1) return whole

    let total = 0
    for (const word of words) {
        const score = scoreTerm(entry, word)
        if (score === 0) return whole
        total += score
    }
    return Math.max(whole, total / words.length)
}

export function searchComponents<T extends Searchable>(entries: T[], query: string): T[] {
    if (query.trim() === "") return entries

    return entries
        .map((entry, index) => ({ entry, index, score: scoreEntry(entry, query) }))
        .filter((hit) => hit.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((hit) => hit.entry)
}
