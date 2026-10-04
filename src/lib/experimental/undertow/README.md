# Undertow

Two pictures, one surface. The pointer parts the top image where it passes and
the one underneath shows through — not through a circular window, but along a
wobbling boundary that trails, spreads and closes again like something disturbed
in water.

```tsx
<Undertow
    frontSrc="/noon.jpg"
    backSrc="/night.jpg"
    alt="A meadow at noon, and the same meadow at night"
/>
```

## How it works

One visible canvas and one offscreen layer. The back image is drawn to the
canvas; the front image is drawn to the layer; every live ripple then punches a
hole in that layer with `destination-out`, and the layer is composited on top.
Both images are placed with the same [`coverBox`](../liquid) arithmetic, so
whatever the box does to one it does to the other, exactly.

The holes are not circles. Their outline comes from the shared
[wave engine](../liquid), so the boundary is ragged where the disturbance is
fresh and settles as it spends itself. The centre of a hole is a full hole —
alpha reaching 1 — because anything less reads as a smudge through gauze rather
than an opening in a membrane.

The opening is not redrawn from the live ripples each frame — it accumulates on
a layer of its own that heals evenly a little every frame. That is what makes a
trail stay where it was drawn instead of chasing the pointer and vanishing
behind it, and because the decay is even, the oldest stretch of a trail is
always the faintest. `linger` sets how long it takes to close.

There is no `clip-path`, no filter, no shader and no second `<img>`: two
`drawImage` calls and a handful of gradient fills per frame.

## Props

| Prop                   | Default     | Notes                                                    |
| ---------------------- | ----------- | -------------------------------------------------------- |
| `frontSrc`             | —           | The image on top, the one the pointer parts              |
| `backSrc`              | —           | The image revealed underneath                            |
| `alt`                  | —           | Describes the pair; both render into one canvas          |
| `radius`               | `0.3`       | Reach of one disturbance, as a share of the shorter side |
| `strength`             | `0.55`      | How far the boundary strays from a circle                |
| `softness`             | `0.38`      | How soft the edge is, 0 to 1                             |
| `speed`                | `1`         | How quickly the surface settles                          |
| `objectPosition`       | `"50% 50%"` | Where both images sit when the box crops them            |
| `aspect`               | —           | Lock the box to a ratio, e.g. `16 / 9`                   |
| `interactive`          | `true`      | Answer the pointer at all                                |
| `disabled`             | `false`     | Hold the still, composed state                           |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`                          |

## Touch

A tap is a single strong strike, so a finger gets the effect rather than nothing.
A drag traces as a pointer does.

## Accessibility

One `role="img"` with your `alt`, and one `aria-hidden` canvas. A screen reader
meets one image with one description — never two images, and never the machinery.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, one centred
disturbance is struck, aged to its midpoint and painted once. The pair is still
shown for what it is; it simply does not move, and no frame loop runs.

## Limitations

Cross-origin sources need CORS headers: the front image is composited through a
canvas, and a tainted canvas cannot be drawn back. Same-origin files, data URIs
and CORS-enabled hosts all work. The bundled demo pair is a pair of inline SVG
data URIs, so nothing is downloaded and nothing is committed as a binary.
