# Ink

A word that soaks into the paper: the ink wicks out along the fibres, feathers
at the edge, and dries to a darker tide line. Drag on the paper to write with a
nib.

```tsx
<Ink text="Ink" />
```

## How it works

A small sheet of paper is simulated on a fixed grid (at most 90 000 cells, about
1.6–2 CSS px each), allocated once per resize. Each cell holds water, suspended
dye and dried stain, and the sheet itself is seeded once: value-noise pulp and a
few thousand curved fibres.

- **Capillary flow.** Water diffuses between neighbours through a conductance
  that is higher along fibres. A dry cell only takes water once a neighbour
  holds more than its own capillary threshold, so the wet front stalls where
  the paper is sized and runs out along fibres elsewhere: the ragged, feathered
  edge.
- **Tide line.** The edge of the wet patch evaporates faster than its interior,
  which pulls water, and the dye it carries, out to the rim before it dries.
- **The stroke.** The word is set at grid resolution, softened and re-cut
  against the paper's tooth, then pressed in wet. Its heavy pigment sinks in
  where it lies; a reservoir of water keeps soaking out over `duration`.
- **Drawing.** The pointer lays dabs every half nib-radius between samples, so
  strokes are continuous; a fast flick carries less ink than a slow drag, and a
  nib held still pools (capped per cell).

Rendering maps stain to opacity through Beer–Lambert, softens by one cell and
cuts the faintest fringe, then scales the grid up in two bilinear passes and
multiplies it over the paper. The sim runs only while something is wet, pauses
offscreen, and stops for good once everything has dried.

## Props

| Prop                   | Default          | Notes                                                 |
| ---------------------- | ---------------- | ----------------------------------------------------- |
| `text`                 | —                | The word                                              |
| `color`                | `"#1b2a4a"`      | The ink                                               |
| `paper`                | `"#f4eee0"`      | The sheet under it                                    |
| `bleed`                | `0.5`            | How much water the stroke carries, so how far it runs |
| `feather`              | `0.6`            | How readily the fibres wick ink ahead of the edge     |
| `pigment`              | `0.7`            | How dark the ink is                                   |
| `rim`                  | `0.6`            | How strongly the drying edge darkens                  |
| `duration`             | `2.6`            | Seconds the stroke keeps soaking out                  |
| `repeat`               | `0`              | Soak again this many seconds after drying; `0` once   |
| `interactive`          | `true`           | Draw on the paper with the pointer                    |
| `nib`                  | `6`              | Nib radius in px                                      |
| `time`                 | —                | Hold the soak this many seconds in (stills, tests)    |
| `fontFamily`           | `Georgia, serif` | The face                                              |
| `fontWeight`           | `700`            | Heavier faces hold more ink                           |
| `seed`                 | `12`             | Fixes the paper, so the same word soaks the same way  |
| `disabled`             | `false`          | Show it soaked and hold; no drawing                   |
| `respectReducedMotion` | `true`           | Honour `prefers-reduced-motion`                       |

## Accessibility

The word is always in the DOM as real, visually hidden text, so it is read,
searched and selected. The canvas is `aria-hidden`. Under reduced motion the
soak is computed out of sight over a few frames and only its dried result is
drawn; pointer strokes dry in place without spreading. While `interactive`, the
surface sets `touch-action: none` so a finger can write instead of scrolling.

## Cost

About 0.1–0.3 ms per simulation step on a laptop, a few steps per frame, over
the five or six seconds the ink takes to dry, then nothing. Changing the size
re-lays the paper and starts the soak over.
