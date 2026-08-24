# Elemental

A decorative animated edge that wraps anything. One wrapper, two elements:
electricity and fire.

> Frost and water are parked while their bodies are worked out. Their specs,
> styles, stories and tests are commented in place rather than deleted, so
> bringing them back is uncommenting.

```tsx
import { Elemental } from "@/lib/experimental"
;<Elemental variant="electric">
    <Card />
</Elemental>
```

The effect lives entirely outside the content. Children keep their own markup,
their own semantics and their own interactivity — the edge never intercepts a
click.

## The four elements

| Variant      | Reads as                                                 | Particles |
| ------------ | -------------------------------------------------------- | --------- |
| `"electric"` | A bolt re-cutting its angles, with arcs running the edge | —         |
| `"fire"`     | A burning edge drifting upward                           | Embers    |
| `"frost"`    | Faceted ice forming along the border                     | Snow      |
| `"water"`    | A liquid line swelling and flowing round                 | Droplets  |

All four are the same stroked outlines on the same rounded path. What differs is
the turbulence that bends them, the colours, and the pace — which is why they
read as one family rather than four effects.

## Crossing the border

The stroke straddles the border line, so the edge is drawn once, **above** the
content. A mask holds it at full strength everywhere outside the box and lets
it a little way inside before fading out, which is why the discharge reads as
one continuous line crossing the edge instead of stopping at it — energy
outside, energy inside, no seam where they meet.

Everything drawn over your content is `pointer-events: none`, so it costs you
nothing: clicks, selection and focus all pass straight through.

## Bodies

An outline alone only ever reads as an outline, so a variant can carry a body
as well: a **sheet**, anchored to one edge and cut into shape by its own
turbulence.

**Fire** grows out of the top edge. Its field varies ten times faster
horizontally than vertically, which stretches every wobble into a tongue, and
the fill fades to nothing at the tips so the tongues thin out instead of
ending. Three layers lick at their own pace.

Sheets scale with the box: never more than half its height, so the same
component works on a hero and on a chip. A sheet can also pool _inside_ the
border rather than reach out of it — that is how the parked water and frost
bodies work, and the mechanism is still in place for them.

## Usage

```tsx
<Elemental variant="electric"><Card /></Elemental>
<Elemental variant="fire"><Panel /></Elemental>
```

It wraps cards, buttons, panels, media blocks and CTA sections. Around a button,
give it a matching radius and let it shrink to fit:

```tsx
<Elemental variant="electric" radius={999} style={{ display: "inline-block" }}>
    <button>Get started</button>
</Elemental>
```

## Radius

`radius` is the single source of truth. The stroked outlines take it as their
`rx`, the content takes it as its `border-radius`, and both are clamped to the
same measured value, so a pill is a real pill on both. The edge follows any
corner — square, rounded or pill — at any size, and stays attached while the box
is resized.

```tsx
<Elemental radius={0} />
<Elemental radius={24} />
<Elemental radius={999} />
```

Give the content `border-radius: inherit` so it matches the frame.

## Props

| Prop                   | Default      | Notes                                             |
| ---------------------- | ------------ | ------------------------------------------------- |
| `children`             | —            | What the edge wraps                               |
| `variant`              | `"electric"` | `electric`, `fire`                                |
| `color`                | variant      | Overrides the accent; the other tones follow it   |
| `intensity`            | `1`          | 0 calms the edge, 2 pushes it. Clamped to 0–2     |
| `speed`                | `1`          | Multiplier on every animation. Clamped to 0.1–4   |
| `radius`               | `16`         | Corner radius in px                               |
| `particles`            | `true`       | Sparks, for the variants that have them           |
| `cursorEffect`         | `false`      | A small variant-tinted pointer inside the wrapper |
| `disabled`             | `false`      | Freeze the edge in its static state               |
| `respectReducedMotion` | `true`       | Fall back to the static edge                      |

The defaults are the point: no variant needs tuning to look right. `intensity`
and `speed` are there to fit a component into a busier or calmer page, not to
make it presentable.

## Cursor effect

Off by default. When enabled, a small tinted pointer follows inside the wrapper
and the native cursor is hidden **on the wrapper only**:

```tsx
<Elemental variant="water" cursorEffect>
    <Card />
</Elemental>
```

Nothing global is touched — no `body` cursor, no document listeners. The native
cursor returns the instant the pointer leaves, and on unmount, because the rule
lives on the wrapper element itself. It switches itself off when the device has
no fine pointer, so touch is unaffected.

## Reduced motion

Under `prefers-reduced-motion: reduce` the edge freezes into a static state that
still shows every layer of the chosen element — the filaments, the tongues —
just standing still. Particles and the custom cursor are
not rendered at all. `disabled` produces the same state on demand, which is also
what makes the Storybook snapshots deterministic.

Pass `respectReducedMotion={false}` to opt out.

## Accessibility

The edge is decoration. Everything it draws — the SVG artwork, the particles and
the cursor — is `aria-hidden` and `pointer-events: none`.
The wrapper adds no role, no tab stop and no label, so the accessibility tree
sees exactly what your children put there.

## Performance

CSS and SVG only. No canvas, no WebGL, no animation library, no new dependency.

- **The edge is filtered once, not per side.** Drawing it above the content
  rather than as two clipped faces halves the filtered area, which is most of
  the frame budget: five live instances hold 60fps.
- **Filter regions are sized to their displacement.** A filter reaches 190% of
  its box by default — 3.6× the area, every pixel of it turbulence evaluated
  per frame. The sheets pin theirs to the geometry in pixels; the edge keeps
  relative units because the hop carries it off the box.
- **One filter per instance.** A single `feTurbulence` field, recentred and
  sharpened by an `feComponentTransfer`, drives one `feDisplacementMap`. The
  seed is fixed per variant, so the shape is stable and nothing is random at
  render time.
- **The turbulence is evaluated once.** Its attributes never change, so the
  browser can cache the field. Every variant animates by moving the strokes
  through that fixed field — a `transform`, not a filter rebuild.
- **Electric hops rather than wobbles.** Two nested groups carry equal and
  opposite offsets: the inner one drags the strokes tens of pixels across the
  field, the outer one pulls the result straight back onto the border. The shape
  is re-cut from scratch on every snap while the line never leaves the edge.
  Because the field is bent by a zigzag `table` transfer rather than quantised,
  each cut is straight diagonal runs meeting at hard reversals — a bolt, not a
  wobble and not a dashed rectangle.
- **Travelling arcs are dashes.** `pathLength="100"` normalises the perimeter,
  so a `stroke-dashoffset` animation laps exactly once per cycle whatever the
  card measures, and it runs on the compositor.
- **No animation loop.** Nothing schedules `requestAnimationFrame` unless
  `cursorEffect` is on, and that one stops as soon as the pointer settles.
- **One `ResizeObserver`** per instance, only to clamp the radius. It writes a
  number; it does no per-frame work.
- **Fixed particle pools.** A handful of elements per variant, positioned
  deterministically. Nothing is created while it runs.
- **One extra filter for the body.** A sheet's field is cached the same way the
  edge's is, and its layers move by `transform` alone. The silhouette is cut by
  displacing a solid shape and only then thinning it with a gradient — fading
  the fill first would smear the outline instead of shaping it.

A handful of these on a page is fine. They are still filtered layers, so treat
them as you would any glow effect.

## When to use it

Good for the one thing on a page that should pull the eye: a featured plan, a
primary CTA, a live or "new" state, a hero media block.

Use it sparingly. Several elements exist so different pages can pick a
personality, not so one page can show them all. An edge that is always moving
stops meaning anything once everything has one.
