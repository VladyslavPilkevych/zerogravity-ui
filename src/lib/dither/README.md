# Dither

A pixel hover layer for any element, in two variants:

- **`sweep`** (default). On hover or keyboard focus, blocks sweep out from where
  the pointer entered, a bright front settles into a dithered resting texture,
  and on exit the blocks retract toward where the pointer left.
- **`edge`**. A quick, CSS-only frame: a 1px accent line, then a ring of blocks
  with solid corner blocks, then a sparser dithered ring inside it, with a small
  glow, a 2px lift and a hard offset shadow. It steps in within about 100ms and
  steps back out ring by ring. This is the homepage card hover, packaged.

```tsx
import { Dither } from "zerogravity"

<Dither>
    <Card />
</Dither>

<Dither variant="edge" className="card">…</Dither>

<Dither as="a" href="/docs">Start here</Dither>

<Dither as={Link} href="/docs" className="card">…</Dither>
```

Dither renders one element (`div` unless `as` says otherwise) and draws on a
canvas behind its children. Every attribute you pass goes to that element, and
`ref` reaches it too.

| Prop                   | Default     | Notes                                                                    |
| ---------------------- | ----------- | ------------------------------------------------------------------------ |
| `as`                   | `"div"`     | Any tag or component, such as `"a"`, `"button"` or a router Link         |
| `variant`              | `"sweep"`   | `"sweep"` (canvas fill) or `"edge"` (CSS block frame)                    |
| `cell`                 | `8`         | Block size, px                                                           |
| `color`                | cyan        | Block colour; or set `--zg-dither-color` on any ancestor                 |
| `colors`               | —           | Several colours, assigned per cell                                       |
| `density`              | `0.3`       | Sweep: share of cells left lit once it settles (0 clears)                |
| `glow`                 | `0.5`       | Glow strength around lit blocks                                          |
| `duration`             | `420`       | Sweep: enter time, ms; the exit runs a little faster                     |
| `origin`               | `"pointer"` | Sweep: `"pointer"`, `"center"`, `"left"`, `"right"`, `"top"`, `"bottom"` |
| `layer`                | `"under"`   | `"over"` draws above children with `mix-blend-mode: screen`              |
| `active`               | `false`     | Hold it on regardless of hover or focus                                  |
| `disabled`             | `false`     | Render the element without the layer                                     |
| `respectReducedMotion` | `true`      | Show the settled state at once instead of animating                      |

**Interaction.** Mouse and pen hover start the effect, the sweep from the entry
point. Keyboard focus that is `:focus-visible`, on the element or anything
inside it, starts it too, the sweep from the centre. Touch input is ignored, so
a tap never leaves the surface stuck on. The element exposes `data-variant` and
`data-state` for styling and tests: the sweep moves through `idle`, `enter`,
`on` and `exit`; the edge variant only switches between `idle` and `on` and
leaves the stepping to CSS transitions.

**Edge styling.** The lift and offset shadow are applied with zero specificity
(`:where()`), so any `transform` or `box-shadow` of your own wins. Set
`--zg-dither-lift: 0` to keep the frame without the lift. The edge layer draws
inside the padding box, just within your border.

**Layering.** The canvas sits at `z-index: -1` inside an isolated stacking
context: above the element's own background, below its content. If a child
paints an opaque background over the whole surface, use `layer="over"`.

**Lists.** As `ul`, `ol` or `menu`, the canvas goes into a trailing,
`aria-hidden` `li` that is absolutely positioned, so the list keeps only `li`
children, the item count read to assistive technology is unchanged, and
`:first-child` / `:nth-child()` selectors still match your items. Inside a list,
the usual pattern is `<li><Dither as="a" …></li>`, which needs nothing special.

**Performance.** The canvas is sized and the grid built only when a sweep
starts. Frames come from the shared clock and only while blocks are moving;
a settled or idle Dither costs nothing per frame. The edge variant has no
canvas and no frame loop at all: one `aria-hidden` span with two pseudo-elements
and a few CSS transitions.

**Reduced motion.** The sweep's resting texture appears and disappears
instantly, and its glow is dropped. The edge frame switches on and off without
stepping, and the lift is dropped.

**Accessibility.** The canvas or edge span is `aria-hidden` and ignores the
pointer. Dither adds no role; the semantics are those of the element you render.
Pick that element for what a click does: a link (`as="a"` or a router Link) only
when the card navigates, a `button` for an action, or a `label` around a native
input for a choice, as the docs demo does.

## Pixel vocabulary

Sweep uses block reveals ordered by distance plus a Bayer threshold, stepped
alpha, stepped lighting (the resting texture thickens toward the bottom edge)
and a restrained glow. Edge uses stepped lighting in rings (line, full blocks,
every other block), solid corner blocks, `steps()` timing, press-depth style
lift with a hard offset shadow, and a restrained glow. See `src/lib/internal/PIXEL.md`.
