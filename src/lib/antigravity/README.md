# Antigravity

A canvas particle cloud that trails the cursor: it pulses, breathes, shimmers
through a palette and occasionally fires shockwaves. Eighteen formations, from a
plain ring to a real 3-D planet, a DNA helix and a black hole accretion disc.

Everything is a prop. The only dependency is React.

```tsx
import { Antigravity } from "@/lib/antigravity"

export function Hero() {
    return (
        <section className="antigravity-stage">
            <Antigravity count={1200} formation={{ shape: "planet" }} />

            <div className="antigravity-content">
                <h1>Headline over the dots</h1>
            </div>
        </section>
    )
}
```

The canvas parent must be `position: relative` with a non-zero size — the
component measures `canvas.parentElement` and maps the pointer into it. The
`.antigravity-stage` class in `Antigravity.css` is a ready-made wrapper, but it
is optional.

## Files

| File              | Contents                                          |
| ----------------- | ------------------------------------------------- |
| `Antigravity.tsx` | React wrapper (`"use client"`), ~80 lines         |
| `engine.ts`       | rAF loop, simulation, batched renderer            |
| `types.ts`        | Full config, defaults, `resolveAntigravityConfig` |
| `formations.ts`   | Geometry of the cloud                             |
| `shapes.ts`       | Geometry of a single particle                     |
| `math.ts`         | LUT trigonometry, hashes, waveforms               |
| `color.ts`        | Colour parsing and palette ramp                   |
| `presets.ts`      | Twelve ready-made looks                           |

The engine knows nothing about React: the component mounts a canvas and pushes
plain config objects into it. The engine class itself is internal and not part
of the public API.

## Props

Every prop is optional and merges over the defaults. Nested objects merge one
level deep, so `pulse={{ size: 0.6 }}` does not reset the rest of `pulse`.

### Root

| Prop                 | Type    | Default |                                                    |
| -------------------- | ------- | ------- | -------------------------------------------------- |
| `count`              | number  | `900`   | Particle count (hard cap 30 000)                   |
| `seed`               | number  | `1337`  | Reshuffles every random per-particle value         |
| `paused`             | boolean | `false` | Stops the loop                                     |
| `className`, `style` |         |         | Forwarded to the `<canvas>`                        |
| `onStats`            | fn      |         | Twice a second: `{ fps, drawn, batches, frameMs }` |

### `formation` — the shape the cloud forms

| Field        | Default  |                                                                        |
| ------------ | -------- | ---------------------------------------------------------------------- |
| `shape`      | `"ring"` | See the table below                                                    |
| `radius`     | `580`    | Outer radius, px                                                       |
| `innerRatio` | `0.31`   | Hole in the middle, 0..0.98                                            |
| `sides`      | `5`      | Polygon sides / star spikes / galaxy arms / spokes / wave lobes        |
| `depth`      | `0.5`    | Star spike depth                                                       |
| `turns`      | `3`      | Spiral, galaxy-arm and DNA turns                                       |
| `jitter`     | `0`      | Random scatter                                                         |
| `angle`      | `0`      | Static rotation, °                                                     |
| `aspect`     | `1`      | Horizontal stretch — this is what flattens a disc into an ellipse      |
| `spin`       | `0`      | Continuous rotation, °/s. On the 3-D shapes this spins the actual body |
| `tilt`       | `18`     | 3-D shapes only: tilt of the axis, °                                   |

| `shape`     |                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `ring`      | Band with a hole, the default                                                                          |
| `disc`      | Area-uniform filled circle                                                                             |
| `star`      | `sides` spikes, depth from `depth`                                                                     |
| `polygon`   | Regular n-gon                                                                                          |
| `heart`     | Parametric heart curve                                                                                 |
| `spiral`    | Single spiral of `turns`                                                                               |
| `grid`      | Square lattice                                                                                         |
| `wave`      | Horizontal sine band                                                                                   |
| `lissajous` | Closed Lissajous curve                                                                                 |
| `blackhole` | Accretion disc, density biased hard toward the event horizon; pair with `aspect` 2-3                   |
| `planet`    | **3-D**: Fibonacci sphere, spins on its axis                                                           |
| `torus`     | **3-D**: ring with a tube of `innerRatio`, tilted by `tilt`                                            |
| `sunflower` | Phyllotaxis spiral, one dot per seed                                                                   |
| `arms`      | Multi-arm galaxy, `sides` arms                                                                         |
| `rays`      | Radial spokes                                                                                          |
| `dna`       | **3-D**: double helix with rungs, runs top to bottom, `turns` sets the twist                           |
| `atom`      | **3-D**: nucleus plus three splayed electron orbits                                                    |
| `tree`      | Trunk that branches recursively; `depth` widens the fork angle, `innerRatio` how fast branches shorten |

### The four 3-D shapes

`planet`, `torus`, `dna` and `atom` are not projections faked in 2-D: every particle keeps real
`x, y, z`, gets rotated around the Y axis by `spin` each frame, tilted by
`tilt`, and its depth drives size and opacity through `particle.depthScale` and
`color.opacityDepth`. Dots on the far side are smaller and dimmer, which is what
makes the body read as solid.

Two consequences worth knowing: `deform` is ignored for these shapes (the blob
distortion is a 2-D polar effect), and `color.mode: "depth"` colours the body
front-to-back rather than by a random value.

### `deform` — living distortion of the outline (the blob)

`amount` `35` px · `frequency` `3` · `layers` `4` harmonics · `speed` `0.4`.
`amount: 0` turns it off, as does any 3-D shape.

### `particle` — what a single dot looks like

| Field          | Default  |                                                                 |
| -------------- | -------- | --------------------------------------------------------------- |
| `shape`        | `"dot"`  | `dot · square · diamond · bar · triangle · ring · cross · star` |
| `size`         | `2.75`   | Average radius, px                                              |
| `sizeVariance` | `0`      | Random size spread, 0..1                                        |
| `depthScale`   | `0.45`   | How much depth scales size                                      |
| `length`       | `4`      | Bar length, in sizes                                            |
| `thickness`    | `0.35`   | Thickness of `bar` / `ring` / `cross`                           |
| `points`       | `5`      | Points of the `star` shape                                      |
| `depth`        | `0.5`    | Spike depth of the `star` shape                                 |
| `rotation`     | `"none"` | `none · radial · tangential · velocity · spin`                  |
| `spin`         | `90`     | Speed for `rotation: "spin"`, °/s                               |
| `angle`        | `0`      | Base angle, °                                                   |

### `color`

| Field          | Default    |                                              |
| -------------- | ---------- | -------------------------------------------- |
| `palette`      | 5 pastels  | `#hex`, `rgb()`, `hsl()` or `"r, g, b"`      |
| `mode`         | `"random"` | `random · radial · angular · linear · depth` |
| `cycle`        | `0`        | Palette scroll, loops per second             |
| `opacity`      | `0.85`     |                                              |
| `opacityDepth` | `0.59`     | How much depth scales opacity                |

### `pulse` — the continuous per-particle pulse

| Field      | Default     |                                                                                      |
| ---------- | ----------- | ------------------------------------------------------------------------------------ |
| `enabled`  | `true`      |                                                                                      |
| `waveform` | `"sine"`    | **Pulse shape:** `sine · triangle · sawtooth · square · heartbeat · decay · organic` |
| `mode`     | `"scatter"` | Phase spread: `sync` · `scatter` · `radial` · `angular`                              |
| `speed`    | `0.29`      | Hz                                                                                   |
| `size`     | `0.3`       | Size amount                                                                          |
| `opacity`  | `0`         | Opacity amount                                                                       |
| `spread`   | `1`         | Spatial spread for `radial` / `angular`                                              |

### `wave` — the travelling breathing wave

`enabled` `true` · `waveform` `"sine"` · `speed` `0.24` Hz ·
`wavelength` `524` px · `displace` `25` px radial · `opacity` `0.15` · `size` `0`.

### `burst` — random shockwaves

`enabled` `false` · `origin` `"center" | "random"` · `waveform` `"sine"` ·
`minInterval` `3` / `maxInterval` `8` s · `strength` `0.8` ·
`speed` `700` px/s · `width` `320` px.

### `colorWave` — the recolouring wave

`enabled` `true` · `origin` `"random"` · `minInterval` `1` / `maxInterval` `4` s ·
`duration` `8` s · `speed` `200` px/s · `width` `1000` px · `strength` `1` ·
`palette` `[]` (empty picks a random hue) · `saturation` `85` · `lightness` `62`.

### `repel` — push particles away from the cursor

| Field      | Default    |                                                                                          |
| ---------- | ---------- | ---------------------------------------------------------------------------------------- |
| `enabled`  | `false`    |                                                                                          |
| `radius`   | `220`      | Influence radius in px; nothing outside it moves                                         |
| `strength` | `90`       | Peak displacement in px. **Negative values pull particles in instead**                   |
| `falloff`  | `"smooth"` | `linear` · `smooth` (eased, the softest) · `sharp` (concentrated right under the cursor) |
| `ease`     | `0.12`     | How fast a particle reacts while it is being pushed                                      |

This is the counterpart to following: leave `follow.enabled: false` so the cloud
stays put in its box, switch on `repel`, and the particles scatter out of the
cursor's way and drift back once it moves on. Both can be on at once — then the
cloud follows the pointer and opens a hole around it.

The scatter and the return use different speeds on purpose. `repel.ease` applies
in proportion to how hard a particle is currently being pushed, so it darts out
of the way; once the cursor leaves, the push falls to zero and the particle
returns at its normal `follow.lag`, which reads as a slow settle rather than a
snap. Raise `repel.ease` for a twitchier field, lower it for something viscous.

The `repel` preset is a static grid set up this way.

### `follow`, `drift`, `glow`, `render`

| Field                         | Default    |                                                  |
| ----------------------------- | ---------- | ------------------------------------------------ |
| `follow.enabled`              | `true`     | `false` parks the cloud in the middle of its box |
| `follow.returnToCenter`       | `true`     | Recentre when the pointer leaves the box         |
| `follow.source`               | `"parent"` | `window` reacts outside the parent too           |
| `follow.smooth`               | `0.012`    | Centre smoothing                                 |
| `follow.lag`                  | `0.015`    | Per-particle catch-up                            |
| `follow.lagSpread`            | `0.025`    | Catch-up spread across depth                     |
| `drift.amount`                | `20`       | Idle wander radius, px                           |
| `drift.speed`                 | `1`        |                                                  |
| `glow.enabled`                | `true`     | Halo under the cursor                            |
| `glow.radius`                 | `400`      | px                                               |
| `glow.color`                  | `#c8dcff`  |                                                  |
| `glow.intensity`              | `0.08`     |                                                  |
| `render.blend`                | `"normal"` | `lighter` for additive blending                  |
| `render.trail`                | `0`        | Motion trail, 0..0.98                            |
| `render.background`           | `null`     | `null` keeps the canvas transparent              |
| `render.fadeIn`               | `2000`     | ms                                               |
| `render.dprCap`               | `2`        | devicePixelRatio ceiling                         |
| `render.respectReducedMotion` | `true`     |                                                  |

## Turning cursor following off

`follow.enabled: false` parks the cloud in the centre of its own box and stops
moving it with the pointer. The pointer is still tracked while `repel` is on, so
a static cloud can still react to the cursor. Leaving following on but moving the pointer outside the
parent has the same visual result while `follow.returnToCenter` is `true` — the
cloud eases back to the middle. Pointer capture is also dropped when the cursor
leaves the window or the tab loses focus, so the cloud never sticks to a stale
position.

## Imperative API

```tsx
const field = useRef<AntigravityHandle>(null)

<Antigravity ref={field} />
<button onClick={() => field.current?.burst()}>Shockwave</button>
<button onClick={() => field.current?.colorBurst()}>Recolour</button>
```

## Presets

```tsx
import { Antigravity, getAntigravityPreset } from "@/lib/antigravity"

;<Antigravity {...getAntigravityPreset("blackhole")!.options} />
```

`nebula` (default) · `neon` · `heartbeat` · `matrix` · `starfield` · `galaxy` ·
`ripples` · `blackhole` · `planet` · `rings` · `sunflower` · `nova` · `repel` ·
`minimal`.

## Performance

Measured in headless Chromium on a MacBook, 1440×900 window, everything on:

| Scene                             | Frame   |
| --------------------------------- | ------- |
| 900 dots (default)                | 0.56 ms |
| 4000 dots, 3-D sphere             | 2.02 ms |
| 3200 dots, black hole with trails | 1.19 ms |
| 8000 dots                         | 2.17 ms |
| 8000 stars (10 vertices each)     | 3.64 ms |
| 8000 spinning bars                | 2.88 ms |

The frame budget at 60 fps is 16.7 ms, so even the worst case uses about 22%.

How it gets there:

- **Structure of arrays.** Particle state lives in `Float32Array`s rather than
  an array of objects: no pointer chasing, contiguous memory, nothing for the
  GC to trace.
- **Zero allocations per frame.** No arrays, objects or closures inside the
  loop. Even the batch lists are intrusive linked lists over an `Int32Array`.
- **Colour batching.** Each colour is quantised to 4 bits per channel plus 5
  bits of alpha and bucketed. A frame costs one `fillStyle` assignment and one
  `fill()` per colour that is actually on screen, not per particle.
- **LUT trigonometry.** 16 384 sine samples; the error is about 0.2 px at a
  580 px radius. The 3-D rotation reuses the same table — two lookups per frame
  for the whole cloud, not per particle.
- **No `atan2`, no `ctx.rotate`.** Particle rotation travels as a ready-made
  `(cos, sin)` pair.
- **Pre-rendered glow.** The cursor gradient is painted once into an offscreen
  canvas and then blitted with `drawImage`.
- **Off-screen culling** plus skipping particles with zero alpha or size.
- **Pausing** when the element leaves the viewport (`IntersectionObserver`) and
  when the tab is hidden (`visibilitychange`).
- **Frame-rate independence.** Everything is driven by `dt`, so a 120 Hz display
  does not run the animation twice as fast; time jumps are clamped to 1/15 s.
- **Config diffing.** Changing a prop never restarts the animation: per-particle
  tables are rebuilt only when something structural changed. That is why the
  playground sliders are free, and why switching formation is a smooth morph —
  each particle keeps its identity through a deterministic hash of `seed` and
  index.

One caveat about batching: translucent particles of the same colour that overlap
blend once instead of accumulating brightness. On dots this is invisible, but if
you want accumulation, switch on `render.blend: "lighter"`.

## Accessibility

Under `prefers-reduced-motion: reduce` the component paints a single static
frame and never starts rAF; prop edits still repaint. Opt out with
`render.respectReducedMotion: false`. The canvas is marked `aria-hidden`.
