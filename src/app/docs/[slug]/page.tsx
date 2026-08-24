import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComponentDocs } from "@/docs/components/ComponentDocs"
import { COMPONENTS, findComponent } from "@/docs/registry"

export function generateStaticParams() {
    return COMPONENTS.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const entry = findComponent((await params).slug)
    if (!entry) return {}

    return { title: entry.name, description: entry.description }
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
    const entry = findComponent((await params).slug)
    if (!entry) notFound()

    return <ComponentDocs entry={entry} />
}
