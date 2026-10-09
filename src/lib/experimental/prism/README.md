# Prism

A slab of glass that uses the pointer as its light source. White light enters
where the pointer is, catches a pixel sparkle, and leaves on the far side split
into a fan of spectral bands — drawn in whole square cells, the way a prism
would look on a low-resolution screen. The slab leans toward the light, and its
two edges pick up a warm and a cool fringe.

```tsx
<Prism>
    <Card />
</Prism>
```

Prism is about light passing **through** something. For a surface that is
pressed **into**, see [Vellum](../../vellum/README.md).

## Facets

- `pixel` (default) — one canvas over your content, cut into square cells
  `pixel` px wide. The beam, the spectrum, the sparkle, the edge fringes and a
  diamond facet pattern near the light are all whole cells; fades are ordered
  dithering rather than gradients, so every edge stays stepped and crisp. The
  spectrum widens the further it travels from where the light came in, and with
  `dispersion={0}` it stays a white beam.
- `smooth` — the original gradient layers: a warm and a cool edge pushed apart
  by the lean, and a soft specular band under the pointer.

Both share a hard rim and the same corner radius; the pixel rim is a two-pixel
bevel.

## How it works

The pointer never reaches React. One listener on the root reads container-local
coordinates through a cached box (measured once, invalidated on scroll and
resize), and the light follows on the shared frame clock. The loop only runs
while the light is moving and unsubscribes once it settles. The canvas is
redrawn on those frames and when the element is resized — never on its own.

The cell grid grows its cells instead of its cost on a very large slab.

## Props

| Prop                   | Default   | Notes                                                   |
| ---------------------- | --------- | ------------------------------------------------------- |
| `children`             | —         | Whatever sits inside. Stays interactive                 |
| `facets`               | `"pixel"` | `"pixel"` or `"smooth"`                                 |
| `pixel`                | `8`       | Cell edge in px for the pixel facets, 3 to 32           |
| `tilt`                 | `12`      | How far the slab leans, in degrees                      |
| `dispersion`           | `0.6`     | How far the colours separate, 0 to 1                    |
| `sheen`                | `0.7`     | How bright the sparkle and facets are, 0 to 1           |
| `radius`               | `4`       | Corner radius; every layer shares it                    |
| `pointer`              | —         | `{ x, y }`, 0 to 1: pins the light instead of following |
| `disabled`             | `false`   | Hold the slab flat and the light at rest                |
| `respectReducedMotion` | `true`    | Honour `prefers-reduced-motion`                         |

Every numeric prop is clamped before it reaches CSS or the canvas, so a bad
value cannot produce a broken rule.

`pointer` makes a frame deterministic — it is what the stories use — and is
useful for a static hero where the light should sit in one place.

## Light surfaces

The light layers blend with `screen`, which can only brighten what is beneath
them: on a dark card the beam and bands glow, on a white one the beam vanishes
and the bands turn pastel. On a pale surface set the blend to `multiply`, so
the bands darken into the card instead:

```css
.pale-card {
    --prism-blend: multiply;
}
```

## Accessibility

The canvas (or the gradient layers) and the rim are `aria-hidden` with
`pointer-events: none`. Content inside stays clickable, focusable and readable,
and nothing is added to the accessibility tree.

## Reduced motion and touch

Under `prefers-reduced-motion: reduce`, or with `disabled`, the slab is flat and
the pointer is ignored, but the glass is still drawn: the light rests in the
centre (or at `pointer`) with its spectrum, sparkle and fringes in place.
On a coarse pointer the slab does not track touches; it renders the same
resting light.

## Server rendering

Nothing touches `window` during render. The server sends the content, the rim
and an empty canvas; the light is drawn on mount.
