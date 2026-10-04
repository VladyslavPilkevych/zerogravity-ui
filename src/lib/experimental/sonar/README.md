# Sonar

A field of dots that a shockwave crosses whenever the surface is pressed. Dots
are shoved outward as the crest reaches them, brighten, and settle back.

```tsx
<Sonar>
    <Hero />
</Sonar>
```

## How it works

Six wave slots, allocated once and reused oldest-first, each holding an origin
and an age. Every frame each dot sums the crests currently passing it — a
cosine band, faded by how far the wave has already travelled — and is drawn at
its own position plus that displacement.

The dot grid is capped at 2400 whatever the gap or the box, and the loop only
paints while a wave is actually running: an untouched field costs nothing.

## Props

| Prop                   | Default     | Notes                                 |
| ---------------------- | ----------- | ------------------------------------- |
| `children`             | —           | Content laid over the field           |
| `gap`                  | `26`        | Distance between dots in px           |
| `amplitude`            | `16`        | How far a wave shoves a dot, in px    |
| `speed`                | `620`       | How fast a wave crosses, in px/second |
| `band`                 | `90`        | How wide the crest is, in px          |
| `color`                | `"#8ab4ff"` | The dots                              |
| `onHover`              | `false`     | Fire on entry as well as on press     |
| `disabled`             | `false`     | Hold a still field                    |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`       |

## Accessibility

The field is an `aria-hidden` canvas with `pointer-events: none`. It answers
`pointerdown`, which a touch screen sends too, so a tap works exactly like a
click. Under reduced motion the field is painted once, evenly, and no waves run.
