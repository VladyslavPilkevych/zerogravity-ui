# Stencil

Display type where the letters are a cutout and a pattern shows through them —
zebra, leopard, stripes, a photo, anything CSS can paint. Each letter is its own
element, so hovering one reacts without touching the others.

```tsx
import { Stencil } from "@/lib/stencil"

export function Title() {
    return <Stencil text="LEOPARD" fill="leopard" size={180} hover="pop" />
}
```

## Props

| Prop                 | Type         | Default     |                                                |
| -------------------- | ------------ | ----------- | ---------------------------------------------- |
| `text`               | string       |             | The word. Spaces are preserved                 |
| `fill`               | StencilFill  | `"zebra"`   | Pattern, see below                             |
| `colors`             | string[]     | per pattern | Pattern colours, meaning depends on the fill   |
| `image`              | string       |             | URL or data URI for `fill="image"`             |
| `background`         | string       |             | Raw CSS `background-image` for `fill="custom"` |
| `scale`              | number       | `64`        | Pattern tile size, px                          |
| `angle`              | number       | `68`        | Pattern angle, °                               |
| `size`               | number       | `140`       | Font size, px                                  |
| `weight`             | number       | `800`       | Font weight                                    |
| `tracking`           | number       | `-0.02`     | Letter spacing, em                             |
| `font`               | string       |             | Font family; inherits when omitted             |
| `hover`              | StencilHover | `"lift"`    | Effect under the cursor                        |
| `strength`           | number       | `1`         | Multiplier for the hover effect                |
| `animate`            | number       | `0`         | Seconds per pattern loop, `0` = static         |
| `continuous`         | boolean      | `true`      | Pattern flows across the whole word            |
| `outline`            | number       | `0`         | Stroke width, px                               |
| `outlineColor`       | string       | `"#ffffff"` | Stroke colour                                  |
| `className`, `style` |              |             | Applied to the root                            |

### Fills

| `fill`     | `colors`             |                                             |
| ---------- | -------------------- | ------------------------------------------- |
| `zebra`    | `[light, dark]`      | Irregular bands at unequal widths           |
| `leopard`  | `[coat, ring, core]` | Rosettes: a dark ring around a lighter core |
| `stripes`  | `[a, b]`             | Even diagonal stripes                       |
| `checker`  | `[a, b]`             | Checkerboard                                |
| `dots`     | `[a, b]`             | Polka dots                                  |
| `grid`     | `[background, line]` | Thin grid lines                             |
| `gradient` | `[a, b, c]`          | Three-stop linear gradient                  |
| `rainbow`  | —                    | Full spectrum                               |
| `image`    | —                    | `image` prop, any URL or data URI           |
| `custom`   | —                    | `background` prop, verbatim CSS             |

`FILL_DEFAULT_COLORS` exports a sensible palette for each fill.

### Hover effects

`none` · `lift` (rises) · `pop` (scales) · `tilt` (rotates and skews) ·
`glow` (drop shadow and brightness) · `shift` (the pattern slides inside the
letter) · `wave` (the letter under the cursor rises and drags its neighbours
with a falloff).

Every effect except `wave` is pure CSS `:hover`. `wave` needs to know the
distance from the pointer to each letter, so it runs a pointer listener that
writes one custom property per letter, coalesced into a single animation frame.

## Continuous patterns

By default each letter carries the same background, and the component measures
the letters once and offsets every background by the letter's own left edge. The
result is one continuous pattern flowing across the whole word rather than the
tile restarting inside each glyph. Set `continuous={false}` to restart the
pattern per letter.

Measurement happens in a layout effect and again on resize through a
`ResizeObserver` — never while scrolling, and never on a raw pointer event.
`ResizeObserver` is feature-detected, so a missing implementation costs the
resize update rather than throwing.

Each measurement pass reads every letter box and its computed font first, then
writes, so the two never interleave into a layout–write–layout cycle. Letter
centres are cached during that pass; `wave` resolves the hovered letter from the
cache inside one animation frame instead of measuring each letter on every
pointer event. `expand` is the one mode that re-measures per frame, because
hovering changes the letter widths.

## Images and video

Images go through the letter background and are clipped with
`background-clip: text`, which is exact: the glyph outline is the clip path.

Video cannot be used as a background, so it renders in a separate layer clipped
by an SVG `mask-image` containing the same character. The component copies
`font-family`, `font-size`, `font-weight`, `font-style`, `font-stretch`,
`letter-spacing` and `font-variation-settings` from the computed style onto the
SVG text, measures the glyph with a canvas to place the baseline, and sizes the
mask to the glyph advance rather than the span width — negative `letter-spacing`
can make the advance wider than the box, which previously clipped the mask.

This alignment is very close but not guaranteed to be pixel-exact. The SVG text
is rendered by the browser's SVG text engine while the visible letter is laid out
by the CSS text engine, and the two can disagree on subpixel positioning,
hinting, and the resolution of a `font-family` list. If a video mask looks
slightly off, name a single concrete family in `font` instead of relying on an
inherited stack.

Masks are recomputed once `document.fonts` reports loading is done, so a web font
that arrives after first paint does not leave the mask measured against the
fallback.

Rebuilding a mask means measuring the glyph on a canvas and serialising an SVG
data URI, so each letter keeps a signature of the inputs that affect it — glyph,
box size, and the resolved font properties. A measurement pass that produces the
same signature reuses the existing mask instead of regenerating it, which keeps
resize and font-load passes free of redundant string work.

## Animation

`animate` sets how many seconds one pattern tile takes to travel. It is a CSS
keyframe animation on `background-position`, so it runs off the main thread. The
per-letter offset from `continuous` is preserved because both the keyframes and
the static position are expressed against the same custom property.

## Accessibility

The root carries `role="img"` and `aria-label={text}`, and every letter span is
`aria-hidden`, so assistive tech reads the word once rather than spelling it
out. Under `prefers-reduced-motion: reduce` the pattern animation, the hover
transitions and the wave effect are all disabled. `wave` also stops attaching its
pointer listener in that case, so it costs nothing rather than driving a custom
property no rule reads.

Only `wave` promotes the letters to their own compositing layers, because it is
the one mode that transforms every letter at once. The single-letter hover modes
leave promotion to the browser rather than holding a layer per character for the
lifetime of the headline.

Video mask layers are decorative: they are `aria-hidden`, carry `tabIndex={-1}`
so they never take focus, and render without controls. The word stays readable to
assistive tech whether the fill is a colour, an image or a video.

## Notes

- `background-clip: text` needs a transparent colour, which the component sets.
  Anything you put in `className` should not override `color`.
- Very large `scale` values with `leopard` or `dots` will show a single spot per
  letter; the pattern is a tile, not a fitted texture.
