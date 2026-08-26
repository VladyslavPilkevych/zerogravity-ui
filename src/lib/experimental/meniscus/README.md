# Meniscus

A vessel that fills with liquid, and keeps sloshing while it waits.

```tsx
<Meniscus value={0.62} label="Upload progress" />
<Meniscus label="Working" />
```

## How it works

One SVG path, rebuilt each frame from two summed sines at the current level. The
level itself is damped toward the target, so a jump from 20% to 80% pours rather
than snaps. With no `value` the vessel holds around half and drifts, which reads
as working rather than as stuck.

## Props

| Prop                   | Default     | Notes                                  |
| ---------------------- | ----------- | -------------------------------------- |
| `value`                | —           | 0 to 1; leave it out for indeterminate |
| `label`                | `"Loading"` | What the progress bar announces        |
| `color`                | `"#2f8bff"` | The liquid                             |
| `colorTo`              | —           | A second colour makes it a gradient    |
| `swell`                | `0.5`       | How tall the surface waves are         |
| `speed`                | `1`         | How fast they travel                   |
| `shape`                | `"circle"`  | `circle`, `pill` or `square`           |
| `size`                 | `128`       | In px                                  |
| `showValue`            | `true`      | Show the percentage inside the vessel  |
| `children`             | —           | Replaces the number                    |
| `disabled`             | `false`     | Hold a flat surface                    |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`        |

## Accessibility

It is a `progressbar` with a name. A known value reports `aria-valuenow` on a 0
to 100 range; an unknown one reports `aria-busy` and no value, which is the
correct way to say "working, length unknown". The vessel, the glass and the
number are all decoration.

Under reduced motion the surface is flat and still, and the level is shown
exactly — a progress indicator that stops animating must still indicate
progress.
