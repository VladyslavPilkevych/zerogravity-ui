import type { Metadata } from "next"
import Link from "next/link"

import { COMPONENTS, groupByCategory } from "@/docs/registry"

export const metadata: Metadata = {
    title: "Docs",
    description: "Browse every ZeroGravity UI component, preview it and copy the usage code.",
}

export default function DocsOverview() {
    const groups = groupByCategory(COMPONENTS)
    const stable = COMPONENTS.filter((entry) => entry.status === "stable").length

    return (
        <div className="dz-page dz-page-wide">
            <header className="dz-head">
                <p className="dz-eyebrow">Documentation</p>
                <h1>Components</h1>
                <p>
                    Every component ships with a live preview, controls that rewrite the snippet as
                    you turn them, a full props table and its dependency count. Search the sidebar,
                    or start below.
                </p>
            </header>

            <div className="dz-stats">
                <div className="dz-stat">
                    <b>{COMPONENTS.length}</b>
                    <span>components</span>
                </div>
                <div className="dz-stat">
                    <b>{stable}</b>
                    <span>stable</span>
                </div>
                <div className="dz-stat">
                    <b>{COMPONENTS.length - stable}</b>
                    <span>experimental</span>
                </div>
                <div className="dz-stat">
                    <b>0</b>
                    <span>runtime dependencies</span>
                </div>
            </div>

            {groups.map((group) => (
                <section
                    className="dz-section"
                    key={group.category}
                    id={group.category.toLowerCase()}
                >
                    <h2>{group.category}</h2>
                    <div className="dz-grid">
                        {group.items.map((entry) => (
                            <Link className="dz-tile" href={`/docs/${entry.slug}`} key={entry.slug}>
                                <strong>
                                    {entry.name}
                                    {entry.status === "experimental" ? (
                                        <span className="dz-flag">exp</span>
                                    ) : null}
                                </strong>
                                <p>{entry.description}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
