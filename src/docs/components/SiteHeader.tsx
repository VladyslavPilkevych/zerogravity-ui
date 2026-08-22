"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { REPOSITORY_URL } from "../registry"
import { GitHubIcon, Logo } from "./icons"

const NAV = [{ href: "/docs", label: "Docs" }]

export function SiteHeader() {
    const pathname = usePathname()

    return (
        <header className="dz-header">
            <Link href="/" className="dz-brand">
                <Logo />
                <b>ZeroGravity</b> <span>UI</span>
            </Link>

            <nav className="dz-nav" aria-label="Main">
                {NAV.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="dz-header-end">
                <a
                    className="dz-icon-link"
                    href={REPOSITORY_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="ZeroGravity UI on GitHub"
                >
                    <GitHubIcon />
                </a>
            </div>
        </header>
    )
}
