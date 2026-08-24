import type { Metadata, Viewport } from "next"

import { SiteHeader } from "@/docs/components/SiteHeader"
import "@/docs/docs.css"
import "./globals.css"

export const metadata: Metadata = {
    title: {
        default: "ZeroGravity UI",
        template: "%s · ZeroGravity UI",
    },
    description:
        "React components for motion, pointer effects and playful scenes. Zero runtime dependencies.",
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
            </body>
        </html>
    )
}
