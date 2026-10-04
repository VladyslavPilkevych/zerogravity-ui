# Wake

A surface that answers the pointer. Ripples spread from wherever it passes and
either catch the light or bend what is underneath — a pointer effect that belongs
to the surface rather than a cursor decoration that follows it around.

```tsx
<Wake mode="highlight">
    <article>…</article>
</Wake>
```

## Modes

| Mode         | Look                                      | Built with                |
| ------------ | ----------------------------------------- | ------------------------- |
| `highlight`  | Thin crests of light trailing the pointer | Canvas, additive blending |
| `distortion` | The content itself bends as it settles    | SVG displacement filter   |

**Highlight** draws each ripple as a crest band, not a filled disc. Additive
light stacks fast: two dozen overlapping rings at full strength wash a surface
out completely, so what is drawn is the rim that would catch the light and
nothing else.

**Distortion** drives the `scale` of one `feDisplacementMap` from the field's
total energy, so the whole surface warps while the pointer is working and
relaxes to nothing when it stops. Each instance gets its own filter id, so two
on a page never collide.

Both run on the shared [wave engine](../liquid), which is also what Undertow
uses — the same wobble, the same distance-based tracing, the same fixed pool.

## Props

| Prop                   | Default       | Notes                                               |
| ---------------------- | ------------- | --------------------------------------------------- |
| `children`             | —             | Whatever the surface holds                          |
| `mode`                 | `"highlight"` | `highlight` or `distortion`                         |
| `radius`               | `0.26`        | Reach of one ripple, as a share of the shorter side |
| `strength`             | `0.6`         | How strongly the surface answers                    |
| `speed`                | `1`           | How quickly it settles                              |
| `color`                | `"#cfe8ff"`   | The light a ripple carries                          |
| `enableOnTouch`        | `true`        | Answer a finger as well as a pointer                |
| `disabled`             | `false`       | Hold the surface still                              |
| `respectReducedMotion` | `true`        | Honour `prefers-reduced-motion`                     |

## Accessibility

The light layer is an `aria-hidden` canvas with `pointer-events: none`, so
everything inside stays clickable, focusable and readable. Under
`prefers-reduced-motion: reduce` — or with `disabled` — the warp filter is not
built at all, so content is never left blurred by a filter that has stopped
updating.

## Performance

One canvas, one `requestAnimationFrame` per instance, a fixed pool of at most 24
ripples, and no React state touched by any pointer move. The loop pauses when the
surface scrolls out of view and re-measures on resize. Nothing is randomised.
