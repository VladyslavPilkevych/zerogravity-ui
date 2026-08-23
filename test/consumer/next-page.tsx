import {
    ANTIGRAVITY_PRESETS,
    Antigravity,
    GridTrail,
    Reel,
    ScrollStack,
    SplitFlap,
    Stencil,
    TrailingCursor,
    resolveAntigravityConfig,
} from "zerogravity-ui"
import { Aperture } from "zerogravity-ui/aperture"

export default function Page() {
    const config = resolveAntigravityConfig(ANTIGRAVITY_PRESETS[0].options)

    return (
        <main>
            <h1>Server page with {config.count} particles configured</h1>
            <div style={{ position: "relative", height: 320 }}>
                <Antigravity count={200} seed={11} paused />
            </div>
            <GridTrail />
            <TrailingCursor />
            <ScrollStack height="60vh">
                <section>Panel one</section>
                <section>Panel two</section>
            </ScrollStack>
            <Reel radius={18}>
                <article>One</article>
                <article>Two</article>
            </Reel>
            <SplitFlap value="NEXT" />
            <Stencil text="RSC" fill="stripes" />
            <Aperture>
                <p>Framed by a subpath import</p>
            </Aperture>
        </main>
    )
}
