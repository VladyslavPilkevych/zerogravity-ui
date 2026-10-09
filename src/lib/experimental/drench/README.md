# Drench

Words that are not drawn until the rain finds them. Rain streaks down a dark
pane of glass; where it hits a letter the water stays, runs down inside the
stroke, gathers in beads along the underside and every so often lets go, leaving
a short runoff trail on the glass. When the rain stops the letters slowly dry
and disappear again.

```tsx
<Drench text="RAIN" as="h1" />
```

## How it works

The word is rendered once (per resize or font load) into an offscreen glyph
mask, and read back once at a coarse grid (2 CSS px per cell) to give the water
model its cells. Everything else is a simulation in `sim.ts`, free of the DOM:

- **Rain**: a fixed pool of 240 drops in typed arrays, in three populations —
  a faint fast far curtain, a middle layer, and heavy near drops. `rain` decides
  how many slots are active, never how many exist. `wind` slants them all.
- **Landing**: heavy and some middle drops meet the pane at a seeded height and
  splat water onto the grid; only cells inside a letter keep it. A fine mist of
  tiny droplets wets the strokes all over.
- **Flow**: cells are processed bottom row first; anything above a thin film
  moves one cell down, or diagonally when the stroke slants. Undersides (no
  stroke below) collect water; neighbouring underside cells pull towards the
  wetter one, so water breaks into separate beads.
- **Drips**: a bead past its (seeded) limit leaves the letter — it hangs and
  swells, then slides down, shedding mass every cell until it stalls. A pool of
  40 drips and a ring of 56 runoff trails keep this bounded.
- **Evaporation** dries everything slowly; trails go a little sooner.

Rendering: the water grid is blurred and shaded (depth gives tone, its slope
gives a specular highlight) into a small `ImageData`, scaled up, masked by the
crisp glyph, and given a precomputed sheen — a light upper rim, a meniscus along
lower edges and a seeded scatter of micro-beads — with `source-atop`, so that
sheen shows only where there is water. Beads, drips and trail residue are one
pre-rendered droplet sprite. All compositing is cropped to the word's box.

## Props

| Prop                   | Default                   | Notes                                           |
| ---------------------- | ------------------------- | ----------------------------------------------- |
| `text`                 | —                         | The words the rain finds                        |
| `as`                   | `"p"`                     | Element for the real text (`h1`, `h2`, …)       |
| `rain`                 | `0.6`                     | How hard it rains, 0 to 1                       |
| `wind`                 | `0.12`                    | Slant, -1 to 1                                  |
| `fall`                 | `1`                       | Fall speed                                      |
| `wetness`              | `0.6`                     | How much water a hit leaves                     |
| `evaporation`          | `0.3`                     | How quickly the letters dry                     |
| `color`                | `"#9fd8ff"`               | Tint of the water                               |
| `fontFamily`           | `"system-ui, sans-serif"` | Face of the letters                             |
| `fontWeight`           | `800`                     | Heavy faces hold more water                     |
| `seed`                 | `1`                       | Fixes every drop, bead and drip                 |
| `freezeAt`             | —                         | Simulate N frames at 60 fps, draw once and hold |
| `disabled`             | `false`                   | Still, soaked state with no falling rain        |
| `respectReducedMotion` | `true`                    | Honour `prefers-reduced-motion`                 |

The pane itself (dark glass with soft reflections) is the root's CSS
background; override it with `style` or `className`.

## Accessibility

The text is real DOM text in the element given by `as`, laid exactly over the
letters with transparent colour: screen readers read it, in-page search finds
it, and selecting it highlights the wet letters. The canvas is `aria-hidden`.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, the component
simulates a seeded shower once and shows the soaked word with its beads and
runoff, without any falling rain. No frame loop runs.

## Performance

One shared frame subscription (`wakeLoop`) that sleeps offscreen and once the
rain is at 0 and everything has dried. No per-frame allocation: all pools and
fields are typed arrays sized on resize. DPR is capped at 2. The mask is
re-measured on resize and when a web font changes the word's width.
