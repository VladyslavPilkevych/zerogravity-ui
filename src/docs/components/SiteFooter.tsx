"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { COMPONENTS, REPOSITORY_URL } from "../registry"
import { Wordmark } from "./Wordmark"

const PACKAGE_URL = "https://www.npmjs.com/package/zerogravity"

export function SiteFooter() {
    const pathname = usePathname()
    const stable = COMPONENTS.filter((entry) => entry.status === "stable").length

    // the signature closes the marketing page; inside the docs it would just be
    // a screen of scrolling between you and the next component
    const signed = pathname === "/"

    return (
        <footer className="pz-footer" data-signed={signed ? "true" : undefined}>
            {signed ? (
                <div className="pz-signature">
                    <Wordmark />
                </div>
            ) : null}

            <div className="pz-footer-bar">
                <p className="pz-footer-note">
                    {stable} stable components · {COMPONENTS.length - stable} in the lab · zero
                    runtime dependencies
                </p>

                <nav className="pz-footer-nav" aria-label="Footer">
                    <Link href="/docs">Docs</Link>
                    <a href={PACKAGE_URL} target="_blank" rel="noreferrer noopener">
                        npm
                    </a>
                    <a href={REPOSITORY_URL} target="_blank" rel="noreferrer noopener">
                        GitHub
                    </a>
                </nav>
            </div>
        </footer>
    )
}
