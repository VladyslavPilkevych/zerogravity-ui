import { Bitmap } from "@/lib/bitmap"

const BRAND = ["var(--pz-cyan)", "var(--pz-lime)"]

export function Wordmark({ className }: { className?: string }) {
    return <Bitmap text="ZeroGravity" colors={BRAND} dim={0.82} gap={0.12} className={className} />
}
