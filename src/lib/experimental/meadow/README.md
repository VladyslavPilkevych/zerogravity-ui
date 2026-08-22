# Meadow

A hero section that sits in a small warm landscape. A soft sun, drifting clouds,
layered hills, flowers along the ground, and a handful of characters — a
hot-air balloon, butterflies, birds and three little ghosts — that bob, glide and
flutter around whatever content you place in the middle. It can also follow the
browser's local clock and move itself through sunrise, day, sunset and night.

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

| Prop                   | Default       | Notes                                        |
| ---------------------- | ------------- | -------------------------------------------- |
| `children`             | —             | Your hero content, centred                   |
| `items`                | built-in cast | Characters and where each one sits           |
| `density`              | `"cosy"`      | `calm` 2, `cosy` 4, `lively` 7 characters    |
| `scene`                | everything on | Which built-in pieces are drawn              |
| `theme`                | `"day"`       | `sunrise`, `day`, `sunset`, `night`, `space` |
| `timeAware`            | `false`       | Follow the browser's local clock             |
| `clock`                | 5/8/18/21     | Advanced: move the hour boundaries           |
| `animated`             | `true`        | `false` freezes the whole scene              |
| `trails`               | `true`        | Soft wisp behind each mascot                 |
| `seed`                 | `5`           | Reproducible timing                          |
| `respectReducedMotion` | `true`        | Honour `prefers-reduced-motion`              |

Never more than seven characters. The scene is meant to feel alive, not busy.

## Turning pieces on and off

One `scene` object rather than ten props. Every key defaults to on, so you only
name what you want gone:

```tsx
<Meadow scene={{ balloon: false, stars: false }}>
    <HeroContent />
</Meadow>
```

| Key           | Covers                                              |
| ------------- | --------------------------------------------------- |
| `sun`         | The sun by day, the moon at night; ignored in space |
| `clouds`      | All four clouds                                     |
| `hills`       | Hill bands and the grass tufts                      |
| `flowers`     | Flowers and sprigs, near and far                    |
| `balloon`     | The hot-air balloon and its passenger               |
| `butterflies` | Both butterflies                                    |
| `birds`       | The gliding pair                                    |
| `mascots`     | Every ghost-like character                          |
| `stars`       | The twinkling star, and the star field beyond day   |
| `comets`      | Shooting stars                                      |
| `planets`     | Planets, the moonlet, the orbit and the black hole  |
| `rockets`     | The rockets crossing the frame                      |
| `ufos`        | The saucers crossing the frame                      |

Each theme sorts the keys into two lists. **Quiet** keys are off by default but a
consumer can switch them back on — night sends the birds and butterflies home, and
`scene={{ butterflies: true }}` brings them back. **Forbidden** keys never draw in
that theme at all: space refuses the sun, clouds, hills, flowers and balloon
however the scene is configured, and day and night refuse planets, rockets and
UFOs. Asking for a forbidden piece is ignored rather than honoured or erroring.

Switching a group off frees its slots, so the remaining cast fills the stage up
to `density`. Turn enough off and the scene simply gets smaller — nothing is
invented to replace it. When every piece of a layer is off, that layer is not
rendered at all.

## Asset previews

The approved artwork lives in `variants/` and is what the scene actually draws:
**Ghost 1, 5, 6**, **UFO 1, 3, 6**, **Moon 1, 3** and **Sun 1, 3, 4, 5, 6**.
Rejected variants are deleted, and Meadow has no airplanes. Ghosts and UFOs are
placed by name; the orb is picked from the approved set by `seed`, so it is
stable for SSR, tests and Chromatic. Preview them at `/x/meadow-assets` or under
`Experimental/Meadow Assets` in Storybook.

## Following the clock

`timeAware` lets the scene pick itself from the browser's local time. No
geolocation, no network — just `Date`.

```tsx
<Meadow timeAware />
```

| Scene     | Default window |
| --------- | -------------- |
| `sunrise` | 05:00 – 08:00  |
| `day`     | 08:00 – 18:00  |
| `sunset`  | 18:00 – 21:00  |
| `night`   | 21:00 – 05:00  |

The boundaries live in one place, `MEADOW_CLOCK` in `plan.ts`, and `clock` moves
them: `clock={{ sunsetStart: 19 }}`.

**Precedence**, in order:

1. an explicit `theme="space"` always wins — space is never chosen by the clock
2. otherwise, if `timeAware` is on and the local hour is known, the clock decides
3. otherwise the explicit `theme`, defaulting to `day`

So `<Meadow theme="night" timeAware />` follows the clock, while
`<Meadow theme="space" timeAware />` stays in space.

### Server rendering

The clock is never read during render. The hour comes from a `useSyncExternalStore`
whose server snapshot is `null`, so the first paint — server and client alike —
uses the explicit `theme`. A test asserts `renderToString(<Meadow timeAware />)`
is byte-identical to `renderToString(<Meadow />)`, so hydration cannot mismatch.
The scene then eases in: the orb transitions over 900ms rather than jumping.

While the page stays open the hour is re-read once a minute — enough for
boundaries hours apart and an arc that moves slowly. One shared interval serves
every mounted scene, exists only while something is subscribed, and is cleared on
unmount.

### Sun position

With `timeAware` the orb rides a stylised arc instead of sitting in a fixed
corner: low on the left at sunrise, high near midday, low on the right at sunset,
and the moon follows the same curve across the night window. It is a sine over the
clock window — no latitude, no astronomy. Position updates ride the same
one-minute tick, so nothing animates per frame.

## Themes

`theme` picks one of five scenes. Nothing is duplicated: a single table in
`plan.ts` describes each theme — which orb hangs in the sky, how many stars, how
big they get, whether mascots glow, and which scene parts are quiet by default:

```ts
space: {
    surface: "xp-meadow-space",
    orb: null,
    stars: 30,
    starSize: 3.8,
    glow: true,
    quiet: ["sun", "clouds", "hills", "flowers", "balloon", "birds", "butterflies"],
}
```

Every colour is a custom property declared on the root and re-declared under
`.xp-meadow-warm`, `.xp-meadow-night` and `.xp-meadow-space`, so the SVG art, the
layers and the consumer's copy all follow one palette.

**Sunrise and sunset share one implementation.** Both use the warm
`.xp-meadow-warm` palette — peach through soft coral, warmer hills, brighter
clouds — and a single modifier shifts a handful of tokens on top:
`.xp-meadow-dawn` leans pink and cool, `.xp-meadow-dusk` leans deeper amber with
dimmer hills. The rest of the difference is where the sun sits on its arc. A browser test asserts the daytime tokens
still resolve to their original values, so `theme="day"` is the scene it always
was.

`darkMode` is gone rather than deprecated — Meadow is experimental, excluded from
the published package, and has never shipped, so there is nothing to stay
compatible with. Use `theme="night"`.

### Night

What changes:

- the sun becomes a **moon** with soft craters, in the same slot
- the sky turns deep indigo through violet, clouds become dark silhouettes at
  lower opacity, and hills become deep blue-greens
- a field of **18 small stars** (11 on narrow screens) twinkles in the far layer,
  seeded from `seed` so it is reproducible
- two **shooting stars** cross the upper sky, visible for about a tenth of their
  17s and 26s cycles, so they read as occasional rather than constant
- flowers, grass and the sparkle shift to muted, cooler tints; the hot-air
  balloon deliberately keeps its warm colours and reads as a lantern
- **birds and butterflies go home.** Their `scene` defaults flip to off at night,
  but an explicit `scene={{ butterflies: true }}` still wins

### Space

A cosmic scene rather than a landscape: no sun, clouds, hills or flowers, and a
different cast.

- a deep indigo backdrop with three soft **nebula** blooms — plain layered radial
  gradients, no filters
- **30 stars** across a wider size and brightness range than night, so the field
  reads with depth
- **planets**: a large ringed one anchored off the bottom-left corner, a banded gas
  giant upper-right, and a small cratered moonlet. Each drifts slowly on its own
  long cycle
- one **orbit** around the gas giant — a thin ring plus a small moon rotating
  around it, two elements and one `rotate`
- a distant **black hole** high in the sky: a dark disc inside two faint accretion
  rings, held at 55% opacity so it stays a background note
- two **rockets** and two **UFOs** crossing the frame on the same glide route the
  glide route, two in each direction. A character travelling right to left
  mirrors its whole lane rather than only its artwork, so it faces the way it is
  going
- the mascots come along, glowing, joined by a small **astronaut** and a boxy
  **robot** with an antenna and a visor
- no sun, clouds, hills, flowers or balloon: space is space only

Planets and the black hole are scenery, so like clouds and hills they can pass
behind the copy — they sit in the far layer with the content two layers above
them.

### Mascot glow

In night and space, each mascot gains one extra `div` behind it holding a soft
radial gradient in moonlight blue. It sits inside the character's track, so it moves with them for
free. There is deliberately **no `filter`, `blur` or `box-shadow`** — a gradient
is a single cheap paint, while a blurred filter on a permanently animated element
is one of the most expensive things a scene like this can do.

### Reduced motion at night and in space

The star twinkle, both shooting stars, the planet drift and the orbit all stop;
the shooting stars rest at `opacity: 0`, so they disappear rather than freezing
mid-streak. The moon, planets, star field, glow and the whole composition stay
exactly where they are.

Shooting stars are the one part of the scene whose appearance depends on when you
look. The animated stories are already excluded from Chromatic; the snapshotted
`NightReducedMotion` story has them switched off, so visual baselines stay stable.

## Mascots

Five characters, each a different silhouette so a scene with two or three of them
never looks duplicated: a round blob, a scalloped ghost, a wide sleepy one with
closed eyes, a taller winking ghost, and a small sprite. They float and hover with
different amplitudes and rhythms, and space swaps in an astronaut and a robot
alongside them.

They share one face recipe so they read as a family: large rounded eyes with a
small white glint, a soft rounded mouth rather than a thin stroke, and rosy
cheeks. A smaller ghost also rides in the hot-air balloon's basket.

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

Measured across 1440, 1100, 820 and 390px in all three themes, no character,
shooting star or foreground plant overlaps the heading, paragraph, badge or
buttons. Gliding characters are additionally held to the top or bottom sixth of
the section, since they cross the full width — a test enforces that for both
casts, and a browser test seeks each glide animation to prove the mirrored ones
really travel right to left rather than flying backwards. Every horizontal
excursion — the butterfly's wander, the floating sway — is signed _away_ from
the centre so a character can never drift into the copy, the same rule the
vertical excursions already followed.

At 340px, narrower than any common device, a mascot can graze the lower edge of a
wrapped button row, and in space this happens occasionally at 390px too. Mascots
render two layers below the content, so they are occluded rather than covering.

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

Around 200 DOM nodes for the full daytime scene, about 220 at night once the star
field and shooting stars are added, and about 190 in space, which trades the
landscape for planets — all static after mount.
Motion is CSS animations on `transform` and `opacity` only; the repeat pause for
gliding characters is baked into the keyframes rather than scheduled. There is
one 1px blur on the two distant clouds and no other filters — no `backdrop-filter`,
no canvas, no shadows on moving elements.

`will-change` is deliberately unset: browsers already promote elements running a
transform animation, and pinning layers for characters that spend part of their
cycle off-frame costs more than it saves.
