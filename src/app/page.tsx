import Link from "next/link"

import { CodeBlock } from "@/docs/components/CodeBlock"
import { COMPONENTS, REPOSITORY_URL } from "@/docs/registry"

const FEATURED = ["antigravity", "scroll-stack", "reel", "meadow", "raster", "ricochet"]

const EXAMPLE = `import { ScrollStack } from "zerogravity-ui"

<ScrollStack top={72} peek={18}>
    <article>Sticky, not scripted</article>
    <article>Scale and fade</article>
</ScrollStack>`

export default function Home() {
    const featured = FEATURED.map((slug) => COMPONENTS.find((entry) => entry.slug === slug)).filter(
        (entry) => entry !== undefined,
    )

    return (
        <div className="dz-home">
            <h1>React components that move.</h1>
            <p className="dz-home-lede">
                Scroll effects, pointer fields, display type and playful scenes — built on plain
                DOM, canvas and CSS. No animation runtime, no physics engine, no external packages
                at all.
            </p>

            <div className="dz-cta-row">
                <Link className="dz-cta" href="/docs">
                    Browse components
                </Link>
                <a
                    className="dz-cta dz-cta-ghost"
                    href={REPOSITORY_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    View on GitHub
                </a>
            </div>

            <div className="dz-home-code">
                <CodeBlock code={EXAMPLE} />
            </div>

            <h2>Featured</h2>
            <div className="dz-grid">
                {featured.map((entry) => (
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
        </div>
    )
}
