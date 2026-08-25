# Perseid

A meteor shower for a section background. Bright heads with tapered trails cross
the frame at different depths, speeds and colours, and the sky never fills up.

```tsx
<Perseid count={18}>
    <h1>Perseid</h1>
</Perseid>
```

## How it works

Every meteor carries a depth from 0 to 1, and that one number drives everything
else: how large the head is, how bright it burns, how long the trail is, how
thick the stroke is, and how long the crossing takes. Distant meteors are small,
dim, slow and thin; near ones are quick and bright. That is what gives the sky
its parallax without any layers.

Travel distance is fixed — just far enough to leave the frame — so a meteor
spends its whole life on screen rather than most of it below the fold. What
varies is the time it takes. Trails are a linear gradient stroke, heads are a
radial bloom, and everything is composited with `lighter`, so crossing trails add
rather than paint over each other.

## Props

| Prop                   | Default          | Notes                                                  |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| `children`             | —                | Content laid over the sky                              |
| `count`                | `18`             | Meteors in the sky at once, clamped to `PERSEID_LIMIT` |
| `speed`                | `1`              | How fast they fall                                     |
| `colors`               | `PERSEID_COLORS` | The palette they are drawn from                        |
| `angle`                | `24`             | Fall angle in degrees; 0 is straight down              |
| `parallax`             | `false`          | The field leans a little with the pointer              |
| `seed`                 | —                | Fix the sky, so the same seed gives the same meteors   |
| `disabled`             | `false`          | Hold a still sky                                       |
| `respectReducedMotion` | `true`           | Honour `prefers-reduced-motion`                        |

`PERSEID_LIMIT` is 60. The pool is allocated once at that size and never grows:
`count` decides how many of those slots are drawn, so raising and lowering it
costs nothing and a spent meteor's slot is reused rather than replaced.

Without a `seed` the sky is different on every mount, which is what a background
usually wants. With one it is identical every time — useful for tests, snapshots
and anything that has to agree with a previous render.

## Accessibility

The sky is an `aria-hidden` canvas with `pointer-events: none`. Any `children`
sit above it in normal flow and are untouched. The component adds nothing to the
accessibility tree.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, the meteors are
painted once, held mid-streak at deterministic positions. It still reads as a
meteor shower; nothing moves and no frame loop runs.

## Performance

One canvas, one `requestAnimationFrame`, a fixed pool, no allocation per frame
and no React state per pointer move. The loop pauses when the section scrolls out
of view. The canvas is DPR-aware and re-measures on resize.
