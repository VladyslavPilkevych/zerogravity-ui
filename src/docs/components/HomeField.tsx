"use client"

import { Antigravity } from "@/lib"

/**
 * The hero field. Antigravity already renders square particles natively, so
 * this is its own `shape: "square"` mode with the rotation switched off — an
 * axis-aligned grid of tiny blocks that warps around the pointer.
 */
export function HomeField() {
    return (
        <Antigravity
            className="pz-field"
            count={1960}
            seed={2049}
            formation={{
                shape: "grid",
                radius: 520,
                aspect: 1.9,
                jitter: 0,
                tilt: 0,
                depth: 0.22,
            }}
            particle={{
                shape: "square",
                size: 2.9,
                sizeVariance: 0.35,
                depthScale: 0.3,
                rotation: "none",
                angle: 0,
            }}
            color={{
                palette: ["#4ee1f2", "#c6f24e", "#ff5fa2", "#9d7bff", "#eaf2ff"],
                mode: "depth",
                opacity: 0.92,
                opacityDepth: 0.4,
            }}
            deform={{ amount: 9, frequency: 2, layers: 2, speed: 0.22 }}
            drift={{ amount: 5, speed: 0.5 }}
            wave={{ enabled: true, speed: 0.18, wavelength: 520, displace: 9, opacity: 0.22 }}
            pulse={{ enabled: true, mode: "radial", speed: 0.18, size: 0.3, opacity: 0.18 }}
            repel={{ enabled: true, radius: 230, strength: 120, ease: 0.11 }}
            follow={{ enabled: false, source: "parent", smooth: 0.02, lag: 0.02 }}
            glow={{ enabled: true, radius: 520, color: "#4ee1f2", intensity: 0.09 }}
            render={{ blend: "lighter", dprCap: 2, fadeIn: 900 }}
        />
    )
}
