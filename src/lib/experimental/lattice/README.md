# Lattice

A mesh of threads that bulges away from the pointer, brightens where it passes,
and lets go of any strand stretched too far.

```tsx
<Lattice>
    <Hero />
</Lattice>
```

## How it works

Nodes sit on a jittered grid — the jitter is seeded, so the mesh is identical on
the server, in a test and on screen. Every frame each node eases toward its home
plus a repulsion from the pointer and a slow drift; strands are then drawn
between neighbours, brighter the closer they are to the light.

Positions live in four `Float32Array`s allocated once, so a full frame allocates
nothing. The grid is capped at 900 nodes however large the box or however tight
the gap, and the whole thing runs on the library's shared frame clock.

## Props

| Prop                   | Default     | Notes                                                       |
| ---------------------- | ----------- | ----------------------------------------------------------- |
| `children`             | —           | Content laid over the mesh                                  |
| `gap`                  | `56`        | Distance between nodes in px; the grid is capped either way |
| `strength`             | `0.6`       | How far the pointer pushes the mesh                         |
| `radius`               | `0.3`       | How far its influence reaches                               |
| `color`                | `"#7fd2ff"` | The thread                                                  |
| `speed`                | `1`         | Idle drift; `0` holds the mesh still                        |
| `seed`                 | `11`        | Fixes the jitter                                            |
| `disabled`             | `false`     | Draw the mesh once and stop                                 |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`                             |

## Performance

One canvas, one shared frame subscription, no per-frame allocation, and the loop
pauses when the mesh scrolls out of view. The canvas is DPR-capped at 2× and
re-measured through a single `ResizeObserver`.

## Accessibility

The mesh is an `aria-hidden` canvas with `pointer-events: none`. Under reduced
motion it is drawn once, still and complete, and no loop runs.
