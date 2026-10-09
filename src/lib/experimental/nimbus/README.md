# Nimbus

A living section background: fog at three depths, a slow camera, dust, light
sweeps and colour moods that crossfade, built to sit behind real content.

```tsx
<Nimbus preset="cinematic" scrim={0.4}>
    <Hero />
</Nimbus>
```

## Presets

| Preset      | What it is                                                           |
| ----------- | -------------------------------------------------------------------- |
| `calm`      | The default. One mood, a slow camera, a little dust, no light.       |
| `drift`     | Three moods crossfading, deeper parallax, faint rays.                |
| `cinematic` | Warm and cold scenes, rays and sweeps, grain, a wide-frame vignette. |
| `pixel`     | Low-res fog through an ordered dither, crisp motes, 12 paints a sec. |

Every knob below overrides the preset's value; the rest stays.

## How it works

The field is drawn into a buffer of one pixel per 4 CSS pixels (8 for `pixel`),
capped at 420 on its longest side, and stretched back up: the browser's own
smoothing is the blur. Fog banks are pre-tinted sprites scaled into place, so a
paint is a few dozen `drawImage` calls and allocates nothing; `pixel` adds one
read-back for the dither.

Everything is a pure function of time and the seed, nothing is integrated:
`time` freezes any moment exactly, and a long-lived page never clumps. The dust
is a fixed typed-array pool of 120 motes, `density` picks how many draw.

It paints at 30 a second (12 for `pixel`) on the shared frame clock, leaves the
clock while offscreen, and holds one composed frame under reduced motion.
Pointer parallax listens only on a fine pointer; touch gets the camera drift.

## Props

| Prop                   | Default         | Notes                                           |
| ---------------------- | --------------- | ----------------------------------------------- |
| `children`             | —               | Content laid over every layer                   |
| `preset`               | `"calm"`        | `calm`, `drift`, `cinematic`, `pixel`           |
| `colors`               | from the preset | One fog palette, replacing the preset's moods   |
| `scenes`               | from the preset | `{ fog, sky?, light? }[]`, crossfading slowly   |
| `accent`               | from the scene  | Dust, rays and sweeps in every scene            |
| `motion`               | preset          | 0–1, camera pan and zoom, layer drift           |
| `parallax`             | preset          | 0–1, how far layers follow a fine pointer       |
| `density`              | preset          | 0–1, how many dust motes                        |
| `lighting`             | preset          | 0–1, horizon glow, rays and sweeps              |
| `grain`                | preset          | 0–1, film grain tile                            |
| `scrim`                | preset          | 0–1, a dark wash under the content for contrast |
| `intensity`            | preset          | 0–1, how strongly the fog reads                 |
| `speed`                | `1`             | 0.1–3, tempo of everything                      |
| `seed`                 | `9`             | Fixes the layout of banks and dust              |
| `time`                 | —               | Hold this many seconds in, for stills           |
| `disabled`             | `false`         | Paint once and hold                             |
| `respectReducedMotion` | `true`          | Honour `prefers-reduced-motion`                 |

## Accessibility

The canvas, scrim and grain are `aria-hidden` with `pointer-events: none`;
children sit above them in normal flow. Use `scrim` when the copy needs more
contrast than the preset gives. Under reduced motion the field is painted once
and the grain stops.
