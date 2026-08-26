# Tide

A liquid separator between two sections that never sits still.

```tsx
<section style={{ background: "#101a33" }}>…</section>
<Tide color="#1d5cff" colorTo="#12d0b4" />
<section>…</section>
```

## How it works

One SVG path, rebuilt each frame from two summed sine waves at 48 points across
a fixed `0 0 1200 120` box and stretched to whatever width it is given. A second
path behind it moves slower and in the other direction, which is what stops the
band reading as a single sliding shape.

There is no canvas, no filter and no image: one path attribute per frame.

## Props

| Prop                   | Default     | Notes                                     |
| ---------------------- | ----------- | ----------------------------------------- |
| `color`                | `"#1d5cff"` | The water                                 |
| `colorTo`              | —           | A second colour makes the fill a gradient |
| `height`               | `120`       | How tall the band is, in px               |
| `amplitude`            | `0.45`      | How tall the waves are                    |
| `crests`               | `2`         | How many fit across the band              |
| `speed`                | `1`         | How fast it travels                       |
| `flip`                 | `false`     | Point the water at the section above      |
| `layers`               | `2`         | A second, slower wave behind the first    |
| `disabled`             | `false`     | Hold a still wave                         |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`           |

## Where it works

The band is transparent above the crest, so give it the background colour of the
section the water is flowing out of.

## Accessibility

The whole band is `aria-hidden` with `pointer-events: none`. Under reduced
motion the wave is drawn flat and held — still a separator, just not a moving
one.
