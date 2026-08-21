"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import "./playground.css"

const LINKS = [
    { href: "/", label: "Antigravity" },
    { href: "/scroll-stack", label: "ScrollStack" },
    { href: "/reel", label: "Reel" },
    { href: "/stencil", label: "Stencil" },
    { href: "/grid-trail", label: "GridTrail" },
    { href: "/trailing-cursor", label: "TrailingCursor" },
    { href: "/split-flap", label: "SplitFlap" },
    { href: "/aperture", label: "Aperture" },
]

const EXPERIMENTS = [
    { href: "/x/louvre", label: "Louvre" },
    { href: "/x/lodestone", label: "Lodestone" },
    { href: "/x/facet", label: "Facet" },
    { href: "/x/vellum", label: "Vellum" },
    { href: "/x/kern", label: "Kern" },
    { href: "/x/overprint", label: "Overprint" },
    { href: "/x/diorama", label: "Diorama" },
    { href: "/x/wash", label: "Wash" },
    { href: "/x/tessera", label: "Tessera" },
    { href: "/x/meadow", label: "Meadow" },
    { href: "/x/meadow-assets", label: "Meadow assets" },
    { href: "/x/raster", label: "Raster" },
    { href: "/x/loaders", label: "Loaders" },
]

export function Nav() {
    const pathname = usePathname()

    return (
        <nav className="pg-nav">
            <span className="pg-nav-brand">ui-library</span>
            {LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={pathname === link.href ? "pg-nav-link pg-nav-active" : "pg-nav-link"}
                >
                    {link.label}
                </Link>
            ))}
            <span className="pg-nav-divider" aria-hidden="true" />
            {EXPERIMENTS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={
                        pathname === link.href
                            ? "pg-nav-link pg-nav-x pg-nav-active"
                            : "pg-nav-link pg-nav-x"
                    }
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    )
}
