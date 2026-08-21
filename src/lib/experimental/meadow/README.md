# Meadow

A hero section that sits in a small warm landscape. A soft sun, drifting clouds,
layered hills, flowers along the ground, and a handful of characters — a
hot-air balloon, butterflies, paper planes, birds and five little mascots — that
bob, glide and flutter around whatever content you place in the middle.

```tsx
<Meadow>
    <HeroContent />
</Meadow>
```

Everything except your children is decorative: hidden from assistive
technology, incapable of taking a click, and removable with `animated={false}`
or `prefers-reduced-motion`.

## Layers

Six of them, stacked so depth reads correctly and the copy is never fought over:

```text
sky wash → sun and clouds → hills and flowers → characters → your content → foreground grass
```

Only the content layer takes pointer events. The decorative layers are absolutely
positioned with `overflow: hidden` and inherit the wrapper's `border-radius`, so
a rounded section clips cleanly. The root is a grid that vertically centres the
content, and it is not given `overflow: hidden`, which keeps sticky and
overflowing children working.

**Nothing escapes the section.** The parallax drift runs on an inner wrapper
rather than on the clipping layer itself — a clipped layer that is also
translated carries its clipped edge outside the frame, which is how decoration
leaked past the section and widened the page. A browser test asserts every
layer's box stays inside the section box and that the document never gains
horizontal scroll.

The foreground grass sits in front of the content on purpose, but only along the
very bottom edge, where centred copy never reaches.

## Motion

There is no JavaScript in the animation path at all — no
`requestAnimationFrame`, no timers, no observers, no state that changes while the
scene runs. React writes a few custom properties per element and CSS does the
rest.

Six motion styles, deliberately different from each other:

| Motion    | Feel                                                    |
| --------- | ------------------------------------------------------- |
| `bob`     | Slow rise and fall with a wide swing — the balloon      |
| `float`   | Gentler version, for mascots that hang in the air       |
| `hover`   | Small, quick idle wobble for a character on the ground  |
| `glide`   | Crosses the frame, leaves completely, waits, comes back |
| `flit`    | A four-point wander, for butterflies                    |
| `twinkle` | Fades and swells in place                               |

Each character carries two layered animations — the track runs its route, the
body adds a slower tilt or flutter on top — so nothing traces a mechanical line.
Every duration is different, and a negative `animation-delay` starts each one
partway through its cycle, so the scene is already in motion on first paint and
nothing moves in lockstep.

Depth comes from three background layers drifting at different amplitudes and
speeds (38s, 26s, 19s), which reads as parallax without any scroll or pointer
coupling. Butterfly wings flutter by scaling around the body, clouds drift
laterally, flowers sway from their stems, the sun's rays turn once every 90
seconds and its glow breathes.

## API

```tsx
<Meadow density="cosy" seed={5}>
    <div>
        <h1>A little world that grows with them</h1>
        <p>Ten warm minutes a day.</p>
        <button>Start the journey</button>
    </div>
</Meadow>
```

| Prop                   | Default       | Notes                                     |
| ---------------------- | ------------- | ----------------------------------------- |
| `children`             | —             | Your hero content, centred                |
| `items`                | built-in cast | Characters and where each one sits        |
| `density`              | `"cosy"`      | `calm` 2, `cosy` 4, `lively` 7 characters |
| `scene`                | everything on | Which built-in pieces are drawn           |
| `animated`             | `true`        | `false` freezes the whole scene           |
| `trails`               | `true`        | Soft wisp behind each mascot              |
| `seed`                 | `5`           | Reproducible timing                       |
| `respectReducedMotion` | `true`        | Honour `prefers-reduced-motion`           |

Never more than seven characters. The scene is meant to feel alive, not busy.

## Turning pieces on and off

One `scene` object rather than ten props. Every key defaults to on, so you only
name what you want gone:

```tsx
<Meadow scene={{ balloon: false, stars: false }}>
    <HeroContent />
</Meadow>
```

| Key           | Covers                           |
| ------------- | -------------------------------- |
| `sun`         | Disc, rays and glow              |
| `clouds`      | All four clouds                  |
| `hills`       | Hill bands and the grass tufts   |
| `flowers`     | Flowers and sprigs, near and far |
| `balloon`     | The hot-air balloon              |
| `plane`       | The paper plane                  |
| `butterflies` | Both butterflies                 |
| `birds`       | The gliding pair                 |
| `mascots`     | All five ghost-like characters   |
| `stars`       | The twinkling star               |

Switching a group off frees its slots, so the remaining cast fills the stage up
to `density`. Turn enough off and the scene simply gets smaller — nothing is
invented to replace it. When every piece of a layer is off, that layer is not
rendered at all.

## Mascots

Five characters, each a different silhouette and face so a scene with two or
three of them never looks duplicated: a round blob, a scalloped ghost, a wide
sleepy one with closed eyes, a taller winking ghost, and a small sprite with a
round mouth. They float and hover with different amplitudes and rhythms.

Each mascot carries a **trail**: two soft warm wisps running the same route as
the character on a delay of 13% and 27% of its cycle, fading and spreading as
they fall behind. Because they share the character's keyframes they follow the
real path exactly, at a cost of two `div`s per mascot and no JavaScript. There is
no growth over time — the node count is fixed at mount, which a test asserts.
`trails={false}` removes them, and a stilled scene hides them, since a frozen
trail would only stack up under its owner.

## Custom characters

Pass your own cast. Anything React renders works:

```tsx
<Meadow
    items={[
        { content: <Kite />, motion: "bob", x: 14, y: 26, size: 90, depth: 0.8 },
        { content: <Whale />, motion: "float", x: 86, y: 48, size: 70, depth: 0.7 },
    ]}
>
    <HeroContent />
</Meadow>
```

`x` and `y` are percentages of the section, `size` a base width in px, and
`depth` (0 far, 1 near) scales and fades the character. `compact` optionally
gives it a second position for narrow screens. `MEADOW_CAST` is exported so you
can start from the built-in cast and swap pieces out.

## Determinism

The composition is art-directed, not generated: positions are fixed so the scene
is balanced at every density. `seed` varies only the timing — durations,
phases, swing amplitudes — so the scene reads differently over time without ever
rearranging itself.

Nothing is randomised during render and `Math.random` is never called, so SSR,
Storybook and Chromatic all agree. Because each character is seeded by its own
index, raising the density adds characters without retiming the ones already
there.

## Responsiveness

Two independent thresholds, because they solve different problems:

- **Below 1080px** the cast switches to a second art-directed arrangement that
  hugs the corners. The copy has a fixed maximum width, so as the frame narrows
  the gap between the edge and the text closes — percentage positions alone
  cannot stay clear of it. The foreground grass also shrinks.
- **Below 700px** the scene itself thins: at most three characters, three
  clouds, fewer flowers, a smaller sun and a shorter section.

Measured across 1440, 1100, 1000, 820 and 390px, no character or foreground
plant overlaps the heading, paragraph, badge or buttons. Every horizontal
excursion — the butterfly's wander, the floating sway — is signed _away_ from
the centre so a character can never drift into the copy, the same rule the
vertical excursions already followed.

At 340px, narrower than any common device, a mascot can graze the lower edge of a
wrapped button row. It renders behind the content, so it is occluded rather than
covering.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `animated={false}`, every
animation is removed rather than paused — the layers, clouds, plants, characters
and wings all stop being animated at all, so there is no work left running. The
full scene stays on screen at its resting positions, so it still looks composed
rather than stripped.

Detection is JavaScript-only, so `respectReducedMotion={false}` genuinely
restores the motion instead of being overridden by a stylesheet.

## Accessibility

Every decorative layer is `aria-hidden` with `pointer-events: none`, and all
scene SVG carries `focusable="false"` and `role="presentation"`, so the section
adds nothing to the accessibility tree, holds no focus targets, and cannot
intercept a click. A browser test hit-tests the CTA and the layer corners to
confirm it. The wrapper does not change the semantics or reading order of its
children.

Anything passed as an item is hidden along with the layer, so decorative content
only — never information.

## Performance

Around 200 DOM nodes for the full default scene, all of them static after mount.
Motion is CSS animations on `transform` and `opacity` only; the repeat pause for
gliding characters is baked into the keyframes rather than scheduled. There is
one 1px blur on the two distant clouds and no other filters — no `backdrop-filter`,
no canvas, no shadows on moving elements.

`will-change` is deliberately unset: browsers already promote elements running a
transform animation, and pinning layers for characters that spend part of their
cycle off-frame costs more than it saves.
