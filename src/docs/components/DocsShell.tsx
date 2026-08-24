"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { filterEntries, SearchField, SidebarList, type SidebarEntry } from "./DocsSidebar"
import { CloseIcon, MenuIcon } from "./icons"

interface DocsShellProps {
    index: SidebarEntry[]
    children: ReactNode
}

function isTyping(target: EventTarget | null): boolean {
    const node = target as HTMLElement | null
    if (!node?.tagName) return false
    return /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName) || node.isContentEditable
}

export function DocsShell({ index, children }: DocsShellProps) {
    const pathname = usePathname()
    const [query, setQuery] = useState("")
    const [drawer, setDrawer] = useState(false)

    const railInput = useRef<HTMLInputElement>(null)
    const drawerInput = useRef<HTMLInputElement>(null)
    const menuButton = useRef<HTMLButtonElement>(null)

    const active = pathname.startsWith("/docs/") ? pathname.slice("/docs/".length) : undefined
    const results = useMemo(() => filterEntries(index, query), [index, query])

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const shortcut = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)
            const slash = event.key === "/" && !isTyping(event.target)
            if (!shortcut && !slash) return

            event.preventDefault()

            const rail = railInput.current
            if (rail && rail.offsetParent !== null) {
                rail.focus()
                rail.select()
                return
            }
            setDrawer(true)
        }

        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    useEffect(() => {
        if (!drawer) return

        drawerInput.current?.focus()

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isTyping(event.target)) setDrawer(false)
        }

        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [drawer])

    const closeDrawer = () => {
        setDrawer(false)
        menuButton.current?.focus()
    }

    return (
        <div className="dz-shell">
            <nav className="dz-side" aria-label="Components">
                <div className="dz-side-top">
                    <SearchField
                        ref={railInput}
                        query={query}
                        onQuery={setQuery}
                        results={results.length}
                        total={index.length}
                    />
                </div>
                <div className="dz-side-scroll">
                    <SidebarList entries={results} active={active} />
                </div>
            </nav>

            <main className="dz-main">
                <button
                    type="button"
                    ref={menuButton}
                    className="dz-menu-button"
                    aria-expanded={drawer}
                    onClick={() => setDrawer(true)}
                >
                    <MenuIcon />
                    Components
                </button>

                {children}
            </main>

            {drawer ? (
                <div className="dz-drawer" role="dialog" aria-modal="true" aria-label="Components">
                    <nav className="dz-drawer-panel">
                        <div className="dz-drawer-head">
                            Components
                            <button
                                type="button"
                                className="dz-icon-link"
                                aria-label="Close component list"
                                onClick={closeDrawer}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="dz-side-top">
                            <SearchField
                                ref={drawerInput}
                                query={query}
                                onQuery={setQuery}
                                results={results.length}
                                total={index.length}
                                onDismiss={closeDrawer}
                            />
                        </div>
                        <div className="dz-side-scroll">
                            <SidebarList
                                entries={results}
                                active={active}
                                onNavigate={() => setDrawer(false)}
                            />
                        </div>
                    </nav>
                    <button
                        type="button"
                        className="dz-drawer-veil"
                        aria-label="Close component list"
                        onClick={closeDrawer}
                    />
                </div>
            ) : null}
        </div>
    )
}
