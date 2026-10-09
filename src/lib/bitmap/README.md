# Bitmap

Pixel text set on a 5×7 grid and drawn as SVG blocks. A palette can sit still
across the word or move through it as a sweep, a wave or a colour cycle — all in
CSS, with no JavaScript running per frame.

```tsx
import { Bitmap } from "zerogravity"

;<Bitmap text="ZeroGravity" as="h1" colors={["#4ee1f2", "#c6f432"]} />
```

| Prop                   | Default          | Notes                                                             |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| `text`                 | —                | The text to set. Also rendered as real, visually hidden text      |
| `as`                   | `"span"`         | `span`, `div`, `p`, `strong` or `h1`–`h6`; carries the semantics  |
| `pixelSize`            | `0`              | Px per cell. `0` makes the word fill its container's width        |
| `gap`                  | `0.1`            | Inset between pixels as a fraction of a cell, `0` to `0.5`        |
| `tracking`             | `1`              | Blank columns between characters                                  |
| `color`                | `"currentColor"` | Single colour, used when `colors` is empty                        |
| `colors`               | —                | Palette. Any CSS colour, including `var(--token)`                 |
| `effect`               | `"sweep"`        | `"sweep"`, `"wave"` or `"cycle"`                                  |
| `animated`             | `true`           | `false` renders the static palette                                |
| `speed`                | `1`              | Multiplier on the effect's tempo. `0` or less is static           |
| `dim`                  | `0.6`            | Opacity of resting pixels in `sweep`, and of the trough in `wave` |
| `paused`               | `false`          | Freezes the animation on its current frame                        |
| `respectReducedMotion` | `true`           | Stop animating when the reader prefers reduced motion             |

Any other HTML attribute (`id`, `className`, `style`, `aria-*`) goes to the root
element.

**Glyphs.** `A`–`Z`, `0`–`9`, space and `. , : ; ! ? - _ ' " / + = * ( ) [ ] & # @ % ·`.
Lowercase is set in capitals and accented letters drop their accent (`é` → `E`).
Anything else draws a hollow box, so a missing glyph is visible rather than
silently skipped. `BITMAP_CHARACTERS` lists the supported set. Punctuation sits
on narrower slots than letters. There is no line wrapping; use one `Bitmap` per
line.

**Effects.** Every effect is a function of the cell's diagonal position
(`x + y`), so the light travels across the word instead of flickering, and the
same text always renders the same frame.

- `sweep` — a band in the second colour crosses the word; the rest rests in the
  first colour at `dim` opacity. Static: the first colour.
- `wave` — an opacity wave travels along the diagonal over the palette spread.
  Static: the palette spread from first to last colour.
- `cycle` — each cell moves through the palette, offset by position, so the
  colours roll across the word. Uses up to six colours and needs at least two.
  Static: the palette spread.

**Sizing.** With `pixelSize={0}` the SVG takes the container's width and keeps
its aspect ratio through the `viewBox`. With a positive integer `pixelSize` the
word has a fixed size and edges render crisp.

**Performance.** Cells are grouped into at most 96 phase buckets, and each bucket
is one `<g>` with one CSS animation; the cells inside inherit its fill. A
40-character line is around 800 rects but under 100 animations, and no
`requestAnimationFrame` loop exists at all. The component has no hooks and no
effects, so it renders on the server and works in React Server Components.

**Reduced motion.** A `prefers-reduced-motion: reduce` media query removes the
animations before hydration. Every group always carries its static fill, so the
word is never blank and still shows the palette.

**Accessibility.** The text is rendered once as real text inside the `as`
element and hidden visually; the SVG is `aria-hidden`. A heading stays a
heading, and page search finds the word.
