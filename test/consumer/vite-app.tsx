import { createRoot } from "react-dom/client"

import { Antigravity, Reel, SplitFlap, Stencil, TrailingCursor } from "zerogravity"
import { Aperture } from "zerogravity/aperture"
import { GridTrail } from "zerogravity/grid-trail"
import { Elemental } from "zerogravity/elemental"

export function App() {
    return (
        <main>
            <div style={{ position: "relative", height: 300 }}>
                <Antigravity count={120} seed={7} paused />
            </div>
            <TrailingCursor />
            <Reel radius={20}>
                <article>One</article>
                <article>Two</article>
            </Reel>
            <SplitFlap value="VITE" />
            <Stencil text="OK" fill="zebra" />
            <GridTrail />
            <Aperture>
                <p>Framed</p>
            </Aperture>
            <Elemental variant="electric">
                <p>Charged</p>
            </Elemental>
        </main>
    )
}

const host = document.getElementById("root")
if (host) createRoot(host).render(<App />)
