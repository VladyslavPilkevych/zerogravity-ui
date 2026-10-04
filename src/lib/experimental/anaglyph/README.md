# Anaglyph

A picture split into two eyes. In `converge` they sit apart and pull together
under the pointer; in `parallax` the split stays and the layers slide past each
other.

```tsx
<Anaglyph src="/hillside.jpg" alt="A hillside at dusk" />
```

## How it works

Two copies of the image, each run through an SVG `feColorMatrix` that keeps
exactly one channel or exactly the other two, composited with `screen` over
black. That is what an anaglyph is — one channel from here, two from there — and
it is why this uses colour matrices rather than a chain of `hue-rotate` filters,
which only wash the picture out.

The plate underneath carries the `alt` text and holds the layout; it is not what
you look at.

## Props

| Prop                   | Default      | Notes                                 |
| ---------------------- | ------------ | ------------------------------------- |
| `src`                  | —            | Any image URL or local asset          |
| `alt`                  | —            | Describes the picture once            |
| `mode`                 | `"converge"` | `converge` or `parallax`              |
| `separation`           | `14`         | How far the channels separate, in px  |
| `depth`                | `0.4`        | How far the picture scales into depth |
| `aspect`               | `"3 / 2"`    | Locks the frame to a ratio            |
| `objectFit`            | `"cover"`    | `cover` or `contain`                  |
| `objectPosition`       | `"50% 50%"`  | Where the picture sits when cropped   |
| `radius`               | `14`         | Corner radius                         |
| `disabled`             | `false`      | Hold the split where it is            |
| `respectReducedMotion` | `true`       | Honour `prefers-reduced-motion`       |

## Accessibility

The described plate is the only thing in the accessibility tree; both eyes are
`aria-hidden` with `pointer-events: none`. If the source fails, both eyes are
dropped and the plain picture is shown instead.
