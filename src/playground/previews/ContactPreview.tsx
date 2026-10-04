"use client"

import { Contact, CONTACT_DEMO_FRAMES, CONTACT_DEMO_LABELS } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function ContactPreview({ config }: PreviewApi) {
    const c = config as unknown as { defaultFrame: number; strip: boolean; radius: number }

    return (
        <div className="xpg-contact-stage">
            <Contact
                frames={CONTACT_DEMO_FRAMES}
                labels={CONTACT_DEMO_LABELS}
                alt="A sunrise sequence, scrubbed frame by frame"
                defaultFrame={c.defaultFrame}
                strip={c.strip}
                radius={c.radius}
                aspect="16 / 10"
            />
            <Hint>Scrub across, or use the arrow keys</Hint>
        </div>
    )
}
