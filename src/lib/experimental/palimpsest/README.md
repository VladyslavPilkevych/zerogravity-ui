# Palimpsest

A word that comes apart into the drafts written underneath it. Ghost layers
drift out from behind the real one, each in its own tint, and settle back.

```tsx
<Palimpsest text="Palimpsest" as="h2" />
```

## How it works

The word is rendered once as real text, and once per ghost layer inside an
`aria-hidden` stack behind it. Each ghost's direction and rotation come from the
seed, so the decomposition is identical on every render but never mechanical.

One custom property, `--pa-open`, drives all of them; it is damped on the shared
frame clock and nothing re-renders while it moves.

## Props

| Prop                   | Default             | Notes                                         |
| ---------------------- | ------------------- | --------------------------------------------- |
| `text`                 | —                   | The word                                      |
| `layers`               | `4`                 | Ghosts behind it, clamped to 8                |
| `spread`               | `26`                | How far they drift, in px                     |
| `colors`               | `PALIMPSEST_COLORS` | The tints they are drawn in                   |
| `trigger`              | `"pointer"`         | `pointer` opens on hover, `always` stays open |
| `rotation`             | `4`                 | How far they turn, in degrees                 |
| `as`                   | `"span"`            | The tag the real text is rendered as          |
| `seed`                 | `6`                 | Fixes the layout                              |
| `disabled`             | `false`             | Hold a fixed offset                           |
| `respectReducedMotion` | `true`              | Honour `prefers-reduced-motion`               |

## Accessibility

The word is announced once. The ghost stack is `aria-hidden`, so a screen reader
meets one heading, not five copies of it. Use `as` to give it the right level.

Under reduced motion the layers hold a fixed, gentle offset rather than
snapping shut — the composition is still there, it simply does not move.
