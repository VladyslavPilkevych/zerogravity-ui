/**
 * A short sequence built from inline SVG, so the docs need no binary assets and
 * nothing is fetched to see the component scrub.
 */
function frame(index: number, total: number): string {
    const turn = (index / total) * 360
    const sky = `hsl(${210 + turn * 0.35} 62% ${16 + index * 3}%)`
    const sun = `hsl(${40 + turn * 0.2} 92% ${58 + index * 2}%)`
    const lift = 150 - index * 12

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320">
<rect width="480" height="320" fill="${sky}"/>
<circle cx="${70 + index * 34}" cy="${lift}" r="34" fill="${sun}"/>
<path d="M0 250 Q120 ${210 - index * 6} 240 245 T480 235 V320 H0Z" fill="rgba(10,24,20,0.85)"/>
<path d="M0 285 Q140 ${260 - index * 4} 280 280 T480 275 V320 H0Z" fill="rgba(6,16,14,0.9)"/>
<text x="24" y="42" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="18">${String(index + 1).padStart(2, "0")}</text>
</svg>`

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const CONTACT_DEMO_FRAMES: readonly string[] = Array.from({ length: 8 }, (_, index) =>
    frame(index, 8),
)

export const CONTACT_DEMO_LABELS: readonly string[] = CONTACT_DEMO_FRAMES.map(
    (_, index) => `Sunrise, exposure ${index + 1}`,
)
