import type { Metadata, Viewport } from "next"

import { Nav } from "@/playground/Nav"
import "./globals.css"

export const metadata: Metadata = {
    title: "ui-library",
    description: "React / Next component library with a live props playground",
}

export const viewport: Viewport = {
    themeColor: "#050505",
    width: "device-width",
    initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Nav />
                {children}
            </body>
        </html>
    )
}
