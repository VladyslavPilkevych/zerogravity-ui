import Link from "next/link"

import { CodeBlock } from "@/docs/components/CodeBlock"
import { HomeField } from "@/docs/components/HomeField"
import { PixelWord } from "@/docs/components/PixelWord"
import { COMPONENTS, REPOSITORY_URL, groupByCategory } from "@/docs/registry"

const FEATURED = ["antigravity", "scroll-stack", "reel", "meadow", "ricochet", "elemental"]

const EXAMPLE = `import { ScrollStack } from "zerogravity"

<ScrollStack top={72} peek={18}>
    <article>Sticky, not scripted</article>
    <article>Scale and fade</article>
</ScrollStack>`

const TRAITS = [
    {
        key: "0",
        label: "runtime dependencies",
        body: "Canvas, SVG and CSS. Nothing follows the import into your bundle.",
    },
    {
        key: "48",
        label: "components",
        body: "Scroll transitions, pointer fields, display type, media effects and scenes.",
    },
    {
        key: "1",
        label: "frame loop",
        body: "Every animated component shares one clock that stops when nothing is on screen.",
    },
    {
        key: "A11y",
        label: "by default",
        body: "Semantic text, hidden decoration, and a still state that still looks designed.",
    },
]

export default function Home() {
    const featured = FEATURED.map((slug) => COMPONENTS.find((entry) => entry.slug === slug)).filter(
        (entry) => entry !== undefined,
    )
    const groups = groupByCategory(COMPONENTS)

    return (
        <div className="pz-home">
            <section className="pz-hero">
                <div className="pz-hero-field" aria-hidden="true">
                    <HomeField />
                </div>
                <div className="pz-hero-scrim" aria-hidden="true" />

                <div className="pz-hero-inner">
                    <p className="pz-badge">
                        <span className="pz-badge-dot" aria-hidden="true" />
                        React · v0.1.3 · MIT
                    </p>

                    <h1 className="pz-hero-title">
                        <PixelWord
                            text="ZEROGRAVITY"
                            label="ZeroGravity"
                            glow
                            className="pz-hero-mark"
                        />
                        <span className="pz-hero-claim">Motion you can import.</span>
                    </h1>

                    <p className="pz-hero-lede">
                        A React library for scroll, pointer and display effects — drawn with canvas,
                        SVG and plain CSS, with zero runtime dependencies.
                    </p>

                    <div className="pz-cta-row">
                        <Link className="pz-btn pz-btn-solid" href="/docs">
                            Browse components
                        </Link>
                        <a
                            className="pz-btn"
                            href={REPOSITORY_URL}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            View on GitHub
                        </a>
                    </div>

                    <p className="pz-install">
                        <span className="pz-install-prompt" aria-hidden="true">
                            $
                        </span>
                        <code>npm i zerogravity</code>
                    </p>
                </div>
            </section>

            <section className="pz-section" aria-labelledby="pz-featured">
                <header className="pz-section-head">
                    <h2 id="pz-featured">
                        <span className="pz-section-tick" aria-hidden="true" />
                        Start here
                    </h2>
                    <p>Six that show the range. Every one has a live, editable preview.</p>
                </header>

                <div className="pz-cards">
                    {featured.map((entry) => (
                        <Link className="pz-card" href={`/docs/${entry.slug}`} key={entry.slug}>
                            <span className="pz-card-top">
                                <strong>{entry.name}</strong>
                                <span className="pz-tag">{entry.category}</span>
                            </span>
                            <span className="pz-card-body">{entry.description}</span>
                            <span className="pz-card-go" aria-hidden="true">
                                OPEN
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="pz-section" aria-labelledby="pz-why">
                <header className="pz-section-head">
                    <h2 id="pz-why">
                        <span className="pz-section-tick" aria-hidden="true" />
                        Why ZeroGravity
                    </h2>
                    <p>Built the hard way so your bundle stays the easy way.</p>
                </header>

                <ul className="pz-traits">
                    {TRAITS.map((trait) => (
                        <li className="pz-trait" key={trait.label}>
                            <b>{trait.key}</b>
                            <span className="pz-trait-label">{trait.label}</span>
                            <p>{trait.body}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="pz-section" aria-labelledby="pz-browse">
                <header className="pz-section-head">
                    <h2 id="pz-browse">
                        <span className="pz-section-tick" aria-hidden="true" />
                        Browse the collection
                    </h2>
                    <p>Pick a category, or search the whole index from the docs.</p>
                </header>

                <div className="pz-cats">
                    {groups.map((group) => (
                        <Link
                            className="pz-cat"
                            href={`/docs#${group.category.toLowerCase()}`}
                            key={group.category}
                        >
                            <b>{group.category}</b>
                            <span>{group.items.length}</span>
                        </Link>
                    ))}
                </div>

                <div className="pz-snippet">
                    <CodeBlock code={EXAMPLE} />
                </div>
            </section>
        </div>
    )
}
