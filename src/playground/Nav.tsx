"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import "./playground.css"

const LINKS = [
    { href: "/", label: "Antigravity" },
    { href: "/scroll-stack", label: "ScrollStack" },
    { href: "/reel", label: "Reel" },
    { href: "/stencil", label: "Stencil" },
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
        </nav>
    )
}
