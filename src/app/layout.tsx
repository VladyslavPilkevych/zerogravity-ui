import type { Metadata, Viewport } from "next"

import { SiteFooter } from "@/docs/components/SiteFooter"
import { SiteHeader } from "@/docs/components/SiteHeader"
import "@/docs/docs.css"
import "@/docs/home.css"
import "./globals.css"

export const metadata: Metadata = {
    title: {
        default: "ZeroGravity UI",
        template: "%s · ZeroGravity UI",
    },
    description:
        "A React library for scroll, pointer and display effects \u2014 drawn with canvas, SVG and plain CSS, with zero runtime dependencies.",
}

export const viewport: Viewport = {
    themeColor: "#050507",
    width: "device-width",
    initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <SiteHeader />
                {children}
                <SiteFooter />
            </body>
        </html>
    )
}
