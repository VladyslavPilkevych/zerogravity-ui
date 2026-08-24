"use client"

import Link from "next/link"
import { forwardRef, type KeyboardEvent } from "react"

import { Kbd } from "@/lib/experimental"

import { groupByCategory } from "../registry"
import { searchComponents } from "../search"
import type { DocEntry } from "../types"
import { usePlatform } from "../usePlatform"
import { SearchIcon } from "./icons"

export type SidebarEntry = Pick<
    DocEntry,
    "slug" | "name" | "description" | "category" | "status" | "tags"
>

interface SearchFieldProps {
    query: string
    onQuery: (value: string) => void
    results: number
    total: number
    /** Escape on an already empty field. */
    onDismiss?: () => void
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
    { query, onQuery, results, total, onDismiss },
    ref,
) {
    const platform = usePlatform()

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Escape") return
        event.preventDefault()
        if (query !== "") {
            onQuery("")
            return
        }
        event.currentTarget.blur()
        onDismiss?.()
    }

    return (
        <>
            <div className="dz-search">
                <SearchIcon />
                <input
                    ref={ref}
                    type="search"
                    value={query}
                    aria-label="Search components"
                    placeholder="Search components"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => onQuery(event.currentTarget.value)}
                    onKeyDown={onKeyDown}
                />
                <span className="dz-search-hint">
                    <Kbd keys={["Mod", "K"]} platform={platform} />
                </span>
            </div>
            <p className="dz-search-count" aria-live="polite">
                {query === ""
                    ? `${total} components`
                    : `${results} of ${total} ${results === 1 ? "match" : "matches"}`}
            </p>
        </>
    )
})

interface ListProps {
    entries: SidebarEntry[]
    active?: string
    onNavigate?: () => void
}

export function SidebarList({ entries, active, onNavigate }: ListProps) {
    if (entries.length === 0) {
        return (
            <p className="dz-empty">
                <b>No components found</b>
                Try a name, a category or a keyword like &ldquo;scroll&rdquo;.
            </p>
        )
    }

    return (
        <>
            {groupByCategory(entries as DocEntry[]).map((group) => (
                <div className="dz-group" key={group.category}>
                    <h2 className="dz-group-title">{group.category}</h2>
                    <ul>
                        {group.items.map((entry) => (
                            <li key={entry.slug}>
                                <Link
                                    href={`/docs/${entry.slug}`}
                                    className="dz-link"
                                    aria-current={entry.slug === active ? "page" : undefined}
                                    onClick={onNavigate}
                                >
                                    {entry.name}
                                    {entry.status === "experimental" ? (
                                        <>
                                            {" "}
                                            <span className="dz-flag">exp</span>
                                        </>
                                    ) : null}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </>
    )
}

export function filterEntries(entries: SidebarEntry[], query: string): SidebarEntry[] {
    return searchComponents(entries as DocEntry[], query)
}
