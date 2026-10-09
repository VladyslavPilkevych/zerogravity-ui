# Wake

Water over a floor. The pointer pushes the surface, waves run outward, cross,
interfere and bounce off the edges, and whatever lies underneath bends through
them and catches the light on every crest. When the pointer stops, the water
keeps moving for a moment and then settles flat.

```tsx
<Wake surface="tiles">
    <article>…</article>
</Wake>

<Wake src="/pool-floor.jpg" refraction={1.4} />
```

## How it works

[`waterField.ts`](./waterField.ts) is a pure module with no DOM:

- **Simulation.** A height field on a coarse grid (one cell is 2.5 CSS px or
  more, capped at 120k cells) stepped with the classic two-buffer wave equation,
  `next = (n + s + e + w) / 2 - prev`, then damped. Two `Float32Array`s are
  allocated per size and swapped every step; nothing is allocated per frame.
- **Input.** Each pointer move stamps a smooth cosine bump along the segment
  from the previous sample to the current one, never more than half a radius
  apart, so a fast stroke leaves a continuous wake. How hard it pushes follows
  pointer speed: a resting pointer does nothing. `pointerdown` drops a stronger
  single stamp.
- **Rendering.** Per cell, the slope from the neighbours offsets a bilinear
  sample of the floor texture (refraction) and adds light where the slope faces
  the upper left. The result goes into one `ImageData` at grid size and the
  canvas is stretched to the box, smooth unless `pixelated` is set.
- **Floor.** `surface` paints tiles, a grid or a checker straight into the
  texture at grid size. `src` replaces it with a cover-fitted image; if the image
  fails or is cross-origin without CORS, the pattern stays.

The component runs a fixed number of steps per second on the shared frame clock,
whatever the display rate, with at most six steps per frame. It subscribes only
while there is energy in the water: once the largest height drops below a
threshold it clears the field, paints the clean floor once and unsubscribes. The
next pointer move starts it again. It also lets go while the surface is out of
view.

## Props

| Prop                   | Default   | Notes                                                        |
| ---------------------- | --------- | ------------------------------------------------------------ |
| `children`             | —         | Content above the water. Stays crisp and interactive         |
| `surface`              | `"tiles"` | Built-in floor: `tiles`, `grid` or `checker`                 |
| `src`                  | —         | An image floor, cover-fitted. Falls back to `surface`        |
| `strength`             | `0.6`     | How hard the pointer pushes the water, 0 to 1                |
| `radius`               | `14`      | Size of the disturbance, in CSS pixels                       |
| `decay`                | `2.4`     | Roughly how long a wave lives, in seconds                    |
| `refraction`           | `1`       | How far a slope bends the floor, 0 to 4                      |
| `light`                | `1`       | How much a slope facing the light brightens, 0 to 4          |
| `pixelated`            | `false`   | Hard pixel edges instead of a smooth upscale                 |
| `enableOnTouch`        | `true`    | Answer a finger as well as a pointer                         |
| `disabled`             | `false`   | Holds one still, refracted frame                             |
| `respectReducedMotion` | `true`    | Under `prefers-reduced-motion`, show the still frame instead |

The built-in floors take their colours from three custom properties, read once
on mount and on resize:

```css
.my-wake {
    --wake-deep: #0a2a42; /* gradient start */
    --wake-shallow: #1b7a8c; /* gradient end */
    --wake-line: #a8e8f0; /* grout, lines, checker squares */
}
```

## Accessibility

The water is an `aria-hidden` canvas behind the content with
`pointer-events: none`; the root listens for pointer events, so everything in
`children` stays clickable, focusable and readable. No `touch-action` is set, so
a finger can still scroll the page across it. Under `prefers-reduced-motion:
reduce`, or with `disabled`, a fixed set of drops is run through a fixed number of
steps and painted once: the surface still reads as water, but nothing moves and
no frame loop starts.

## Performance

On a ~860×400 preview the grid is 343×160. One frame of simulation and shading
measures about 1.4 ms (median) in Chromium on a laptop, at roughly 2.3 steps
per frame. Pointer moves read no layout: coordinates come from the shared
`pointerBox`, which measures once and is invalidated on scroll and resize.
Without a 2D context (jsdom, a locked-down browser) the surface renders its
content and nothing else.
