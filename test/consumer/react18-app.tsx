import { useState, version } from "react"
import { Ascender } from "zerogravity/ascender"
import { Detent } from "zerogravity/detent"
import { Folio, FolioPanel } from "zerogravity/folio"
import { Sash } from "zerogravity/sash"
import { TrailingCursor } from "zerogravity/trailing-cursor"

const VIEWS = [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
    { value: "board", label: "Board" },
]

export function App() {
    const [view, setView] = useState("grid")

    return (
        <main data-react={version} style={{ padding: 24 }}>
            <TrailingCursor variant="dot-only" dotEase={0.3} dotHoverScale={2} />
            <Ascender as="h1" text="Still reads on React eighteen" duration={200} stagger={10} />
            <Detent label="View" options={VIEWS} value={view} onChange={setView} />
            <output id="view">{view}</output>
            <Sash label="Topics" speed={80}>
                <a href="#alpha">Alpha</a>
                <span>Beta</span>
                <span>Gamma</span>
            </Sash>
            <Folio label="Work" height={240}>
                <FolioPanel label="One" media={<div style={{ background: "#246" }} />} />
                <FolioPanel label="Two" media={<div style={{ background: "#642" }} />} />
                <FolioPanel label="Three" media={<div style={{ background: "#264" }} />} />
            </Folio>
            <label>
                Name <input id="name" />
            </label>
        </main>
    )
}
