import type { ReactNode } from "react"

import { DocsShell } from "@/docs/components/DocsShell"
import { sidebarIndex } from "@/docs/registry"

export default function DocsLayout({ children }: { children: ReactNode }) {
    return <DocsShell index={sidebarIndex()}>{children}</DocsShell>
}
