# Tide

A wavy, slowly drifting contour for any card, section or image. The box itself
gets a liquid edge; nothing is drawn on top of it.

```tsx
<Tide><Card /></Tide>
<Tide edge="bottom"><Section /></Tide>
<Tide edge="x" stroke="#fff"><img src="…" alt="…" /></Tide>
```

## How it works

Tide clips its own box with `clip-path: path(…)`. The path comes from
`contourPath(width, height, edge, amplitude, wavelength, phase)`, a pure
function that samples three detuned sines whose phases drift at different rates
and in different directions, so the edge reads as liquid rather than as one wave
sliding along.

- The size is read once on mount and again only from `onResize`; nothing reads
  layout per frame.
- The phase advances on the shared frame clock, and only while the box is on
  screen (`onVisible`) and animated. Paused, disabled, reduced-motion and
  off-screen instances hold no subscription.
- Sampling is one point every `wavelength / 16` px (3 to 16 px), capped at 160
  points per edge and 640 for the whole perimeter, however large the box.
- `stroke` adds one SVG path along the same outline. The clip trims its outer
  half, so it is drawn at twice `--tide-stroke-width` (default `2px`).

## Props

| Prop                   | Default | Notes                                                  |
| ---------------------- | ------- | ------------------------------------------------------ |
| `children`             | —       | Whatever gets the contour. It stays fully interactive. |
| `edge`                 | `"all"` | `top`, `bottom`, `left`, `right`, `x`, `y` or `all`    |
| `amplitude`            | `12`    | How deep the wavy band reaches into the box, in px     |
| `wavelength`           | `140`   | Length of the main wave, in px                         |
| `speed`                | `1`     | How fast the contour drifts, 0 to 4                    |
| `paused`               | `false` | Hold the contour where it is                           |
| `stroke`               | —       | A line along the contour, in any CSS colour            |
| `disabled`             | `false` | Hold a static wavy contour at the rest phase           |
| `respectReducedMotion` | `true`  | Hold the static contour under `prefers-reduced-motion` |

`x` is left and right together, `y` is top and bottom together.

## Layout

The wave lives inside a band `amplitude` px deep along each chosen edge, so the
outer `amplitude` px of the box can be trimmed. Tide sets `--tide-band` on its
box; pad the content on wavy sides by at least that much:

```css
.card {
    padding: calc(20px + var(--tide-band));
}
```

The wrapper is a one-cell grid, so a single child fills it. Give the child its
own background — Tide clips whatever it contains, it does not paint a surface.

## Edges and limits

- `all` runs the wave around a rounded rectangle inset by half the band, with a
  whole number of waves around the perimeter, so the outline closes without a
  seam and the corners stay soft.
- Single sides and the opposite pairs (`x`, `y`) keep the other sides perfectly
  straight. Adjacent pairs such as top and left are not offered: their corner
  would need its own blend and reads worse than `all`.
- The band shrinks on small boxes (to a third of the shorter side for `all`, a
  half or a third of the crossing side otherwise) so the outline never crosses
  itself.
- `box-shadow`, outlines and anything else outside the box are clipped. Put a
  shadow on a parent with `filter: drop-shadow(…)` if you need one.

## Accessibility

The contour is a clip, not content, and the optional stroke is `aria-hidden`.
Clipped pixels are not hit-tested, which only affects the band. A focused direct
child gets its outline pulled inside the band so the ring is not cut away.
Under reduced motion, or when disabled, the contour is drawn once at the rest
phase and held — still wavy, never blank.
