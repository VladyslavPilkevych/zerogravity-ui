# Diorama

Distant content seen past blurred foreground layers. Moving the pointer shifts
the viewing angle, and because near layers move further than far ones, you can
look around the obstruction to see the background more clearly.

```tsx
<Diorama
    background={<Artwork />}
    planes={[
        { content: <MidLeaves />, depth: 0.45 },
        { content: <NearLeaves />, depth: 1 },
    ]}
/>
```

| Prop          | Default | Notes                                      |
| ------------- | ------- | ------------------------------------------ |
| `background`  | —       | The distant subject; stays mostly sharp    |
| `planes`      | `[]`    | Foreground layers, ordered far to near     |
| `parallax`    | `46`    | Displacement budget at full deflection, px |
| `blur`        | `7`     | Blur applied to the nearest plane, px      |
| `perspective` | `1200`  | 3D depth, px                               |
| `tilt`        | `0`     | Degrees the scene turns toward the pointer |
| `ease`        | `0.11`  | Camera follow rate                         |

Each plane takes `{ content, depth, blur?, opacity? }`. `depth` runs 0 (far) to 1
(near) and defaults to an even spread across the list. A negative `depth` moves
a plane against the pointer, like the background, which suits counter-moving
layers behind the subject. Displacement scales
linearly with depth and blur scales with **depth squared**, so the nearest layer
is clearly out of focus while mid layers stay only slightly soft. The background
moves slightly against the pointer, which strengthens the separation.

**Interaction.** Pointer position is normalised around the component centre and
clamped to ±0.5, then interpolated toward. Two custom properties per frame drive
every layer; nothing chases the pointer literally.

**Touch.** Non-mouse pointers are ignored, so touch devices get a stable, correct
composition rather than a jumpy one. No device-orientation APIs are used. The
background is never hidden behind foreground layers to the point of being
unreadable, so no essential content requires pointer movement.

**Sharp planes.** A plane whose blur works out to zero — `blur: 0` on the plane,
`blur={0}` on the component, or a depth of 0 — gets no `filter` at all rather
than `blur(0px)`, so a crisp composition costs no filter pass.

**Tilt.** `tilt` rotates every layer a few degrees toward the pointer, which is
when `perspective` becomes visible. At the default `0` the composition stays
flat, exactly as before.

**Reduced motion.** A static composition with depth and blur intact but no
pointer tracking.

**Performance.** `filter: blur()` on large planes is the dominant cost. Keep
`blur` modest for full-bleed content, and prefer two or three planes over many.
Foreground planes are `pointer-events: none` so they never block the background.

**Limitations.** Planes are absolutely positioned over the background, so the
background defines the height. Very large blur radii on full-viewport layers can
stress the compositor on low-end mobile.
