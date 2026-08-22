"use client"

import { useMemo, useState } from "react"

import { Control } from "@/playground/panel/Control"
import { getPath } from "@/playground/panel/path"

import "@/playground/playground.css"
import "@/playground/experimental/experimental.css"

import { PREVIEWS } from "../previews"
import { propsFor } from "../props"
import { snippetFor } from "../snippet"
import type { DocEntry } from "../types"
import { useDocsConfig } from "../useDocsConfig"
import { CodeBlock } from "./CodeBlock"
import { Dependencies } from "./Dependencies"
import { PropsTable } from "./PropsTable"

type Tab = "preview" | "code"

/** A nested scroll port needs a fixed height; page scroll needs none at all. */
function frameSize(preview: DocEntry["preview"]) {
    if (!preview) return { minHeight: 380 }
    if (preview.pageScroll) return undefined
    if (preview.scroll) return { height: preview.minHeight ?? 480 }
    return { minHeight: preview.minHeight ?? 380 }
}

export function ComponentDocs({ entry }: { entry: DocEntry }) {
    const state = useDocsConfig(entry)
    const [tab, setTab] = useState<Tab>("preview")

    const rows = useMemo(() => propsFor(entry), [entry])
    const code = useMemo(() => snippetFor(entry, state.config), [entry, state.config])

    const Preview = PREVIEWS[entry.slug]
    const preview = entry.preview ?? {}
    const hasControls = entry.controls.some((group) => group.controls.length > 0)

    return (
        <article className={preview.wide ? "dz-page dz-page-wide" : "dz-page"}>
            <header className="dz-head">
                <p className="dz-eyebrow">
                    <span>{entry.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.status}</span>
                </p>
                <h1>{entry.name}</h1>
                <p>{entry.description}</p>
            </header>

            <section className="dz-section" aria-label="Preview">
                <div className="dz-tabs" role="tablist" aria-label="Preview or code">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "preview"}
                        onClick={() => setTab("preview")}
                    >
                        Preview
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "code"}
                        onClick={() => setTab("code")}
                    >
                        Code
                    </button>
                </div>

                {tab === "preview" ? (
                    <div
                        className="dz-preview"
                        data-bleed={preview.bleed ? "true" : undefined}
                        data-scroll={preview.scroll ? "true" : undefined}
                        data-page-scroll={preview.pageScroll ? "true" : undefined}
                        data-contain={preview.containFixed ? "true" : undefined}
                    >
                        <div className="dz-preview-body" style={frameSize(preview)}>
                            {Preview ? <Preview {...state} /> : null}
                        </div>
                        {preview.scroll ? (
                            <span className="dz-preview-tag">scrolls inside this frame</span>
                        ) : null}
                    </div>
                ) : (
                    <CodeBlock code={code} />
                )}

                {preview.note ? <p className="dz-section-note">{preview.note}</p> : null}
            </section>

            {hasControls ? (
                <section className="dz-section" aria-labelledby="dz-customize">
                    <h2 id="dz-customize">Customize</h2>

                    <div className="dz-bar">
                        {entry.presets?.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                className="dz-chip"
                                title={preset.hint}
                                aria-pressed={preset.id === state.presetId}
                                onClick={() => state.setPreset(preset.id)}
                            >
                                {preset.label}
                            </button>
                        ))}
                        <span className="dz-bar-end">
                            <button type="button" className="dz-chip" onClick={state.reset}>
                                {state.editCount > 0 ? `Reset ${state.editCount}` : "Reset"}
                            </button>
                        </span>
                    </div>

                    <div className="dz-controls">
                        {entry.controls.map((group) => (
                            <details className="dz-card" key={group.id} open={group.open}>
                                <summary>
                                    {group.title}
                                    <em>{group.hint}</em>
                                </summary>
                                <div className="dz-card-body">
                                    {group.controls.map((def) => (
                                        <Control
                                            key={def.path}
                                            def={def}
                                            value={getPath(state.config, def.path)}
                                            onChange={state.set}
                                        />
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            ) : null}

            {rows.length > 0 ? (
                <>
                    <section className="dz-section" aria-labelledby="dz-usage">
                        <h2 id="dz-usage">Usage</h2>
                        <CodeBlock code={code} />
                        <p className="dz-section-note">
                            Generated from the controls above. Only props that differ from their
                            defaults are shown.
                        </p>
                    </section>

                    <section className="dz-section" aria-labelledby="dz-props">
                        <h2 id="dz-props">Props</h2>
                        <PropsTable rows={rows} name={entry.tag ?? entry.name} />
                    </section>
                </>
            ) : null}

            <section className="dz-section" aria-labelledby="dz-deps">
                <h2 id="dz-deps">Dependencies</h2>
                <Dependencies packages={entry.dependencies} />
                {entry.status === "experimental" ? (
                    <p className="dz-section-note">
                        Experimental: still under evaluation and not part of the published package
                        yet.
                    </p>
                ) : null}
            </section>
        </article>
    )
}
