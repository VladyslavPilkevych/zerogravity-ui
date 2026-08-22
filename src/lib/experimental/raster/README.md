# Raster

One picture, four stylised abstractions. Raster shows an image through a chosen
rendering mode — softened, warped, spelled out in glyphs, or broken into a
mosaic — while keeping a real, accessible `<img>` underneath.

```tsx
<Raster src="/poster.jpg" alt="Sunset over layered hills" mode="pixel" />
```

## Modes

| Mode    | Look                                            | Built with              |
| ------- | ----------------------------------------------- | ----------------------- |
| `blur`  | Sharp in the middle, softening toward the edges | CSS filters + masks     |
| `glass` | Wavy fluted glass with an optional slow shimmer | SVG displacement filter |
| `glyph` | Coloured glyph mosaic that follows the tones    | Canvas                  |
| `pixel` | Rounded, colour-averaged block mosaic           | Canvas                  |

**Blur** is not a flat `filter: blur()`. Two masked copies sit over the sharp
image with radial masks, so the blur builds up toward the frame edge and the
centre of interest stays legible. `blurStrength` sets the outer limit.

**Glass** is a liquid-glass lens. A smooth low-frequency turbulence field warps
the slab, and two masked rings of the same picture — one magnified, one pulled in
— sit in a band around all four edges, because liquid glass refracts hardest at
its border. A specular rim and corner sheen finish it. The seed is fixed, so the
warp is identical on every render. `distortion` scales it; `animated` slides a
soft highlight across the surface.

**Glyph** samples the picture down to a grid and draws one glyph per cell, tinted
with that cell's own colour on a dark board. Brighter cells take denser glyphs,
and a gradient pass nudges contour cells one step denser, which is what makes
edges legible instead of mush. The grid follows the font's advance ratio, so
glyphs fill their cells without being stretched. `glyphSet` takes a built-in name
(`blocks`, `ascii`, `dots`, `ink`) or any string ordered sparse to dense;
`cellSize` and `contrast` tune it.

**Pixel** averages each block and draws it with a small gap, which reads as a
designed mosaic rather than `image-rendering: pixelated`. `rounded` is the corner
amount: `0` gives hard squares, `0.28` the default soft-square, and `1` turns the
grid into circles. `pixelSize` and `gridGap` tune the rest.

## Props

| Prop                   | Default     | Notes                                    |
| ---------------------- | ----------- | ---------------------------------------- |
| `src`                  | —           | Any image URL or local asset             |
| `alt`                  | —           | Empty string if the image is decorative  |
| `mode`                 | `"blur"`    | `blur`, `glass`, `glyph`, `pixel`        |
| `aspectRatio`          | `"16 / 10"` | String or number; the box is fluid width |
| `animated`             | `true`      | Only the glass shimmer uses it           |
| `interactive`          | `false`     | Hover or focus fades the effect away     |
| `disabled`             | `false`     | Show the picture untouched               |
| `blurStrength`         | `22`        | Outer blur radius in px                  |
| `distortion`           | `18`        | Glass displacement scale                 |
| `glyphSet`             | `"dots"`    | Named set or a custom string             |
| `cellSize`             | `12`        | Glyph cell height in px                  |
| `contrast`             | `1.15`      | Glyph tonal spread                       |
| `pixelSize`            | `18`        | Mosaic block size in px                  |
| `gridGap`              | `2`         | Gap between blocks                       |
| `rounded`              | `true`      | Round the mosaic blocks                  |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`          |

## Sizing

The root is `width: 100%` with an `aspect-ratio`, so it fills whatever column it
is dropped into — cards, heroes, galleries — and the image is `object-fit: cover`.
Give it a width from the parent and an `aspectRatio` for the shape. Canvas modes
re-paint on resize through a single `ResizeObserver`.

## Accessibility

A real `<img>` with your `alt` is always in the DOM and always in the
accessibility tree. In glass, glyph and pixel modes it is visually transparent and
the effect layer sits on top, but the semantics are unchanged — a screen reader
still meets one image with one description.

Every effect layer is `aria-hidden` with `pointer-events: none`, contains no
focusable elements, and the glass mode's second `<img>` copy carries `alt=""`.
For a purely decorative picture pass `alt=""`, which makes the whole component
decorative.

`interactive` is progressive: it also responds to `:focus-within`, and the
component never depends on hover to look finished.

## Performance

Cheapest to heaviest:

1. **blur** — two extra composited layers, no JavaScript, no repaint after load.
2. **pixel** — one downscale, one small `getImageData`, then a few hundred to a
   few thousand `fill` calls. Painted once per load or resize.
3. **glyph** — the same sampling plus one `fillText` per non-blank cell, so a
   fine `cellSize` costs the most. `cellSize={8}` on a wide hero is roughly ten
   thousand glyphs.
4. **glass** — one SVG displacement filter. Cheap to rasterise once, but it is a
   filter over the whole element, so avoid many large glass instances on one
   screen.

There is no animation loop anywhere. Canvas work is coalesced into a single
`requestAnimationFrame` per change, and the cell count is capped so an extreme
`cellSize` cannot lock the main thread. Nothing is randomised, so SSR, tests and
Chromatic all agree.

## Reduced motion

Only the glass shimmer animates. Under `prefers-reduced-motion: reduce`, or with
`animated={false}`, it is not rendered at all — the warp, ribs and every other
mode are static by design, so nothing is lost.

## Limitations

- **Cross-origin images.** Glyph and pixel modes read pixels back, which a
  tainted canvas forbids. If the source is cross-origin without CORS headers the
  read fails, the canvas is marked `data-blocked` and left empty, and the plate
  image shows through instead of the effect. Same-origin files, data URIs and
  CORS-enabled hosts all work.
- **SVG sources** need intrinsic `width`/`height` to be drawn to a canvas.
- Glass leans on `feDisplacementMap`; it renders everywhere current but is the
  one mode whose cost grows with element size rather than cell count.
