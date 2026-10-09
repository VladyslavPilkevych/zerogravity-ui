# Dither

A pixel hover layer for any element. On hover or keyboard focus, blocks sweep
out from where the pointer entered, a bright front settles into a dithered
resting texture, and on exit the blocks retract toward where the pointer left.

```tsx
import { Dither } from "zerogravity"

<Dither>
    <Card />
</Dither>

<Dither as="a" href="/docs">Start here</Dither>

<Dither as={Link} href="/docs" className="card">…</Dither>
```

Dither renders one element (`div` unless `as` says otherwise) and draws on a
canvas behind its children. Every attribute you pass goes to that element, and
`ref` reaches it too.

| Prop                   | Default     | Notes                                                             |
| ---------------------- | ----------- | ----------------------------------------------------------------- |
| `as`                   | `"div"`     | Any tag or component, such as `"a"`, `"button"` or a router Link  |
| `cell`                 | `8`         | Block size, px                                                    |
| `color`                | cyan        | Block colour; or set `--zg-dither-color` on any ancestor          |
| `colors`               | —           | Several colours, assigned per cell                                |
| `density`              | `0.3`       | Share of cells left lit once the sweep settles (0 clears)         |
| `glow`                 | `0.5`       | Glow strength around lit blocks                                   |
| `duration`             | `420`       | Enter time, ms; the exit runs a little faster                     |
| `origin`               | `"pointer"` | `"pointer"`, `"center"`, `"left"`, `"right"`, `"top"`, `"bottom"` |
| `layer`                | `"under"`   | `"over"` draws above children with `mix-blend-mode: screen`       |
| `active`               | `false`     | Hold it on regardless of hover or focus                           |
| `disabled`             | `false`     | Render the element without the layer                              |
| `respectReducedMotion` | `true`      | Show the settled texture at once instead of sweeping              |

**Interaction.** Mouse and pen hover start the sweep from the entry point.
Keyboard focus that is `:focus-visible`, on the element or anything inside it,
starts it from the centre. Touch input is ignored, so a tap never leaves the
surface stuck on. The element exposes `data-state` (`idle`, `enter`, `on`,
`exit`) for styling and tests.

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
a settled or idle Dither costs nothing per frame.

**Reduced motion.** The resting texture appears and disappears instantly, and
the glow is dropped.

**Accessibility.** The canvas is `aria-hidden` and ignores the pointer. Dither
adds no role; the semantics are those of the element you render.

## Pixel vocabulary

Uses block reveals ordered by distance plus a Bayer threshold, stepped alpha,
stepped lighting (the resting texture thickens toward the bottom edge) and a
restrained glow. See `src/lib/internal/PIXEL.md`.
