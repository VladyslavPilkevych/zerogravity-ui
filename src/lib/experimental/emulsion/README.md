# Emulsion

A photographic treatment for an ordinary `<img>`: halation around the
highlights, film grain, a light leak across one corner, and shadows lifted the
way a print lifts them.

```tsx
<Emulsion src="/hillside.jpg" alt="A hillside at dusk" />
```

## How it works

Five layers, all CSS. The bloom is a second copy of the same picture, blurred
and blown out and screened back over the first — which is what halation is:
highlight bleeding into the emulsion around it. The tone layer casts the stock
warm or cool and lifts the blacks; the leak is one radial gradient; the grain is
a seeded tile, painted once and repeated.

No canvas is read back, so this works with cross-origin images.

## Props

| Prop             | Default     | Notes                                     |
| ---------------- | ----------- | ----------------------------------------- |
| `src`            | —           | Any image URL or local asset              |
| `alt`            | —           | Empty string if the picture is decorative |
| `halation`       | `0.45`      | How far the highlights bloom              |
| `grain`          | `0.3`       | Film grain                                |
| `warmth`         | `0.25`      | -1 cool to 1 warm                         |
| `leak`           | `0.3`       | A light leak across one corner            |
| `fade`           | `0.18`      | How far the shadows lift                  |
| `aspect`         | `"3 / 2"`   | Locks the frame to a ratio                |
| `objectFit`      | `"cover"`   | `cover` or `contain`                      |
| `objectPosition` | `"50% 50%"` | Where the picture sits when cropped       |
| `radius`         | `14`        | Corner radius; every layer shares it      |
| `seed`           | `4`         | Fixes the grain                           |

## Accessibility

One described picture; the bloom copy is `alt=""` and `aria-hidden`, and every
other layer is decoration. A failed source drops all five layers and shows a
plain placeholder rather than a broken composite, and a new `src` gets a fresh
attempt. Under reduced motion the grain stops shifting.
