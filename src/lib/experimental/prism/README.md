# Prism

A slab of glass that uses the pointer as its light source. Whatever sits inside
splits into red, green and blue along the light's path, a spectrum fans out
from where the light enters, the glass shows a rainbow edge as it leans toward
the light, and a blurred spectrum falls on the surface behind it — the picture
of a prism on a desk.

```tsx
<Prism strength={1}>
    <Card />
</Prism>
```

Prism is about light passing **through** something. For a surface that is
pressed **into**, see [Vellum](../../vellum/README.md).

## Strength

`strength` is the one knob that makes it louder or quieter. It runs from `0` to
`2`; anything else is clamped, and `NaN` falls back to the default `0.6`.

| Strength | Reads as                                                          |
| -------- | ----------------------------------------------------------------- |
| `0`      | Clear glass: tilt and sheen only, no colour split at all          |
| `0.2`    | A hairline of colour on the edges; for a card that must stay calm |
| `0.6`    | The default: a clear split, still easy to read                    |
| `1`      | Obviously a prism                                                 |
| `2`      | Dramatic: about 9px of channel offset, solid beam, bright caustic |

Strength scales every optical layer together. `dispersion` (0 to 1) still
controls how far the colours separate relative to that, and `tilt` and `depth`
control the 3D pose independently.

## How it works

Four layers, all driven by one light point:

1. **Channel split.** The content gets an SVG filter that pulls it apart into
   its red, green and blue channels (`feColorMatrix`), moves red away from the
   light and blue toward it (`feOffset`), and screens them back together. Where
   the channels still line up the content is unchanged; at every edge they
   fringe, which is what dispersion through a wedge of glass looks like. The
   offset is in whole pixels and only written when it changes, so a sweep
   invalidates the filter a handful of times instead of every frame, and the
   filter graph itself is never rebuilt. At `strength={0}` there is no filter.
2. **Beam.** The `pixel` facets draw the entering light, its sparkle and the
   spectrum it fans into on one canvas of square cells. The `smooth` facets
   draw a warm and a cool edge and a spectral band as gradients instead.
3. **Glass depth.** The slab leans toward the light (`tilt`) with real
   perspective. Behind it sits a stack of tinted outlines spread over `depth`
   px, which fans out into a rainbow edge on the side the light leaves through.
   A glare plane floats in front of the content and slides against it.
4. **Caustic.** A blurred spectrum behind the slab, laid across the light's
   direction and pushed away from it, as a prism throws on the wall.

The direction of every layer comes from one vector: from the light to the
slab's centre. The further off-centre the light, the stronger the split.

The pointer never reaches React. One listener on the root reads container-local
coordinates through a cached box (measured once, invalidated on scroll and
resize), and the light follows on the shared frame clock. The loop only runs
while the light is moving, sleeps once it settles, and does not run while the
slab is off screen. CSS variables are written only when their value changes.

## Props

| Prop                   | Default   | Notes                                                      |
| ---------------------- | --------- | ---------------------------------------------------------- |
| `children`             | —         | Whatever sits inside. Stays interactive                    |
| `strength`             | `0.6`     | Overall optical intensity, 0 to 2                          |
| `facets`               | `"pixel"` | `"pixel"` or `"smooth"`                                    |
| `pixel`                | `8`       | Cell edge in px for the pixel facets, 3 to 32              |
| `tilt`                 | `12`      | How far the slab leans toward the light, 0 to 30 degrees   |
| `depth`                | `14`      | Glass thickness in px, 0 to 48: the edge and the caustic   |
| `dispersion`           | `0.6`     | How far the colours separate, 0 to 1                       |
| `sheen`                | `0.7`     | How bright the sparkle, glare and facets are, 0 to 1       |
| `radius`               | `4`       | Corner radius; every layer shares it                       |
| `pointer`              | —         | `{ x, y }`, 0 to 1: pins the light instead of following it |
| `disabled`             | `false`   | Hold the light at rest and ignore the pointer              |
| `respectReducedMotion` | `true`    | Honour `prefers-reduced-motion`                            |

Every numeric prop is clamped before it reaches CSS, the filter or the canvas.

`pointer` makes a frame deterministic — it is what the stories use — and is
useful for a static hero where the light should sit in one place.

The perspective defaults to `900px`; set `--prism-perspective` on a parent or
on the root to flatten or deepen it.

## Light surfaces

The beam layers blend with `screen`, which can only brighten what is beneath
them: on a dark card the beam and bands glow, on a white one the beam vanishes
and the bands turn pastel. On a pale surface set the blend to `multiply`, so
the bands darken into the card instead:

```css
.pale-card {
    --prism-blend: multiply;
}
```

The channel split needs no change: it reassembles the content's own colours,
so it fringes a dark-on-light card just as well.

## Accessibility

Every decorative layer is `aria-hidden` with `pointer-events: none`. The filter
changes how the content is painted, never its hit area: it stays clickable,
focusable, selectable and readable by assistive technology. Keep `strength` at
or below `1` over body text that people need to read; past that the split is
meant for display type.

## Reduced motion and touch

Under `prefers-reduced-motion: reduce`, or with `disabled`, the pointer is
ignored and nothing animates, but the glass stays fully prismatic: the light
rests in the top left corner (or at `pointer`), the slab holds its lean, and
the split, beam, edge and caustic are all drawn.

On touch, a tap places the light and a horizontal drag moves it; the light
stays where the finger lifted. Vertical drags still scroll the page.

## Server rendering

Nothing touches `window` during render. The server sends the content, the rim,
the edge layers and an empty canvas; the filter is attached and the light drawn
on mount, so the server and the client never have to agree on a filter id.
