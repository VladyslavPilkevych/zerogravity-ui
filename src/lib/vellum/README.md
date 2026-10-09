# Vellum

A flexible sheet. It tilts toward the pointer and dents where the pointer rests,
with an optional highlight that shades the dent. The highlight is either smooth
gradients or, with `surface="pixel"`, a grid of square cells lit in hard steps.

```tsx
<Vellum highlight={false}>
    <article>Just the tilt</article>
</Vellum>
```

Vellum is about a surface being pressed **into**. For light passing **through**
glass, see Prism (experimental).

| Prop          | Default    | Notes                                                |
| ------------- | ---------- | ---------------------------------------------------- |
| `tilt`        | `9`        | Maximum rotation, degrees; `0` disables the geometry |
| `highlight`   | `true`     | `false`, or an object to configure it                |
| `surface`     | `"smooth"` | `"smooth"` or `"pixel"`: how the highlight is drawn  |
| `pixel`       | `12`       | Cell edge in px for the pixel surface, 4 to 48       |
| `pointer`     | —          | `{ x, y }`, 0 to 1: presses at a fixed point instead |
| `radius`      | `22`       | Sheet corner radius, px                              |
| `ease`        | `0.14`     | Follow rate                                          |
| `perspective` | `900`      | 3D depth, px                                         |

`highlight` accepts `{ dent, sheen, color, sheenColor }`. Setting it to `false`
removes the overlay elements entirely rather than making them transparent, so
nothing is painted — on either surface:

```tsx
<Vellum highlight={{ dent: 0.15, sheen: 1, sheenColor: "#ffd166" }}>…</Vellum>
```

The tilt and the highlight are independent — either can be used without the other.

## Pixel surface

```tsx
<Vellum surface="pixel" radius={6}>
    …
</Vellum>
```

The sheet is cut into square tiles with a one-pixel seam. Pressing it sinks a
round dent under the pointer: tiles inside are pulled toward the centre, so the
grid visibly pinches, and each tile is lit by how its slope faces a light from
the top left — in three hard steps of shadow (`color`) and three of light
(`sheenColor`), with the brightest step drawn as solid highlight fragments. The
floor of the dent is ordered-dithered rather than blurred, so every edge stays
on the grid. `dent` scales the shadow and the pinch, `sheen` the light. CSS
custom properties are resolved against the element, so `var(--token)` colours
work here too.

Away from the pointer the tiles rest flat as a faint surface grid.

**Interaction.** Pointer coordinates are container-local, from a box measured
once and invalidated on scroll and resize. Easing runs on the shared frame
clock only while the sheet is moving and stops once it settles; the canvas is
redrawn on those frames and on resize.

**Reduced motion.** No tilt and no response to the pointer. The smooth
highlight is hidden; the pixel surface stays drawn as a still grid (or a still
dent at `pointer`).

**Touch.** Without a fine pointer the sheet is still unless `enableOnTouch` is
set.

**Performance.** One transformed element plus either two gradient overlays or
one canvas; the canvas grows its cells instead of its cost on a very large
sheet.

**Accessibility.** Children keep their semantics; every overlay is `aria-hidden`
and non-interactive.

**Limitations.** `overflow: hidden` clips anything a child renders outside the
rounded rectangle.
