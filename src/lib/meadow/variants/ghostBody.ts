export interface GhostShape {
    width: number
    height: number
    /** top of the dome */
    top: number
    /** where the dome meets the straight sides */
    shoulder: number
    /** baseline the scalloped hem hangs from */
    hem: number
    scallops: number
    /** how far each scallop droops below the hem */
    droop: number
    /** 0 keeps the dome round, higher values make it taller and narrower */
    lift?: number
}

/**
 * Builds a ghost silhouette: a rounded dome, straight sides and a scalloped hem.
 * Keeping it parametric means every variant lands on a clean shape rather than a
 * hand-tuned path. Copy this helper along with a ghost when promoting one.
 */
export function ghostBody(shape: GhostShape): string {
    const { width, top, shoulder, hem, scallops, droop, lift = 0.55 } = shape
    const left = 2
    const right = width - 2
    const cx = width / 2
    const pull = (cx - left) * lift

    const parts = [
        `M${cx} ${top}`,
        `C${cx + pull} ${top} ${right} ${top + (shoulder - top) * 0.42} ${right} ${shoulder}`,
        `L${right} ${hem}`,
    ]

    const step = (right - left) / scallops
    for (let index = 0; index < scallops; index += 1) {
        const to = right - step * (index + 1)
        const belly = to + step / 2
        parts.push(`Q${belly} ${hem + droop} ${to} ${hem}`)
    }

    parts.push(
        `L${left} ${shoulder}`,
        `C${left} ${top + (shoulder - top) * 0.42} ${cx - pull} ${top} ${cx} ${top}`,
        "Z",
    )

    return parts.join(" ")
}
