import { notFound } from "next/navigation"

import { StressBoard } from "@/playground/stress/StressBoard"

/**
 * A development-only board for holding several expensive components on one
 * screen at once. It exists to be profiled, not to be read: it is not in the
 * docs navigation and it is not built in production.
 */
export default function StressPage() {
    if (process.env.NODE_ENV === "production") notFound()

    return <StressBoard />
}
