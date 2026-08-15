import { createRoot } from "react-dom/client"

import { Antigravity, Reel, SplitFlap, Stencil, TrailingCursor } from "zerogravity-ui"

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
        </main>
    )
}

const host = document.getElementById("root")
if (host) createRoot(host).render(<App />)
