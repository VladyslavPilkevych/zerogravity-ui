# Nimbus

Slow coloured fog for a section background.

```tsx
<Nimbus>
    <Hero />
</Nimbus>
```

## How it works

A handful of radial bodies drift across a buffer rendered at a quarter size and
stretched back up. The browser's own smoothing does the blurring, which is why
there is no `filter: blur()` anywhere here: the same softness for a sixteenth of
the pixels and no filter pass at all.

Every body's position, drift, size and pulse come from the seed, so the same
seed gives the same sky on the server, in a test and on screen.

## Props

| Prop                   | Default         | Notes                           |
| ---------------------- | --------------- | ------------------------------- |
| `children`             | —               | Content laid over the fog       |
| `colors`               | `NIMBUS_COLORS` | The clouds it is built from     |
| `count`                | `6`             | How many drift, clamped to 12   |
| `speed`                | `1`             | How fast they move              |
| `intensity`            | `0.75`          | How strongly they read          |
| `seed`                 | `9`             | Fixes the sky                   |
| `disabled`             | `false`         | Paint once and hold             |
| `respectReducedMotion` | `true`          | Honour `prefers-reduced-motion` |

## Accessibility

The sky is an `aria-hidden` canvas with `pointer-events: none`; children sit
above it in normal flow. Under reduced motion the fog is painted once and holds,
which still reads as fog.
