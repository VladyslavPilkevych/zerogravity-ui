# Wash

A background that changes colour by pouring the next tone outward from a single
point, like ink spreading through paper. Triggered by touch, on a timer, or both.

```tsx
<Wash mode="both" interval={6000}>
    <HeroContent />
</Wash>
```

| Prop       | Default          | Notes                                  |
| ---------- | ---------------- | -------------------------------------- |
| `colors`   | five muted tones | Palette cycled in order                |
| `mode`     | `"auto"`         | `click`, `auto`, or `both`             |
| `interval` | `6000`           | Milliseconds between automatic pours   |
| `duration` | `1400`           | Length of one pour, ms                 |
| `easing`   | soft ease-out    | Timing function for the spread         |
| `softness` | `0.35`           | How diffuse the leading edge is, 0–0.9 |
| `burst`    | `true`           | Square fragments flick out of a click  |
| `seed`     | `1`              | Fixes the fragment pattern             |
| `freezeAt` | —                | Holds pour and burst at a 0–1 progress |
| `disabled` | `false`          | Freeze on the first colour             |

**Interaction.** In click mode the pour starts at the exact pointer position,
normalised against the container, so a tap on mobile works identically to a
click. Automatic pours pick a varied but bounded origin so the effect never
looks like it is always coming from the centre.

**Pixel burst.** A click (never an automatic pour) also throws a dozen small
square fragments and a stepped square ring from the pointer, tinted from the
incoming colour. They snap to a 4px grid, fade in four steps and are gone in
well under a second. Fragments live in a fixed pool of 48 preallocated slots on
one canvas: rapid clicking recycles the oldest slots instead of growing anything.
Motion is seeded per burst, so the same `seed` and click sequence always draws
the same pattern. The canvas subscribes to the shared frame clock only while a
fragment is alive.

`freezeAt` pauses the pour animation and draws any burst at that fixed progress
without starting a loop. It exists for stories and screenshots.

**Colour selection.** The palette is cycled in order rather than sampled
randomly, so the same colour is never chosen twice in a row and the sequence is
deterministic — which also keeps visual snapshots stable. Nothing is randomised
during render.

**Interruption.** Triggering mid-pour commits the in-flight colour to the base
immediately and starts a fresh pour from the new point. There is never more than
one transition layer in the DOM and no half-finished state.

**Reduced motion.** No expanding layer, no burst canvas and no automatic timer;
the background changes with a short 220ms cross-fade instead.

**Performance.** Two elements at most: the root carries the base colour and a
single pour layer animates with `transform` and `opacity` only. The layer is
removed once the colour is committed, so nothing accumulates. The burst canvas
is the only frame work, and only while fragments are visible; between clicks
nothing runs.

**Accessibility.** The pour layer is `aria-hidden` and `pointer-events: none`, so
children stay fully interactive. The trigger listens on the root, which means
clicks on foreground buttons still reach them and also start a pour in click mode.

**Limitations.** The pour scales a radial gradient to 3.2x, which covers typical
aspect ratios; extremely wide or tall containers may want a longer `duration`.
