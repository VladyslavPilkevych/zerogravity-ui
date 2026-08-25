# Facet

A faceted surface built to sit behind real content — a hero, a section, or a
full-viewport background. Facets catch light from the pointer, and an optional
ambient mode drifts the palette slowly on its own.

```tsx
<Facet ambient>
    <HeroContent />
</Facet>
```

| Prop              | Default          | Notes                                                           |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `cell`            | `120`            | Target facet size in px; the grid is derived from the container |
| `palette`         | five muted tones | Colours the surface moves between                               |
| `ground`          | `#05060b`        | Colour each facet is mixed down toward                          |
| `variation`       | `14`             | Tone spread between neighbouring facets                         |
| `intensity`       | `0.7`            | Strength of the pointer highlight                               |
| `seed`            | `7`              | Deterministic facet variation                                   |
| `ambient`         | `false`          | Enable slow automatic colour flow                               |
| `ambientInterval` | `7000`           | How often the next palette colour is chosen, ms                 |
| `ambientDuration` | `5200`           | How long the surface takes to reach it, ms                      |

**Layout.** The grid is measured from the container through a `ResizeObserver`,
so the component fills whatever box it is given — including `min-height: 100vh`.
Facet count is capped at 900 cells, so very large viewports get bigger facets
rather than thousands of nodes.

**Interaction.** The pointer moves a light position. Regardless of facet count
the component writes exactly **two** custom properties per frame; each facet
derives its own shading in CSS from its stored centre.

Each triangle also carries a normal, so how brightly it answers depends on
whether it faces the light as well as how close it is. Neighbouring triangles
face opposite ways, which is what breaks the surface into facets as the pointer
crosses it instead of sliding one soft blob around. The light lives on its own
layer with no transition, so it tracks the pointer on the frame; only the
ambient tone crossfades.

**Ambient flow.** `ambientInterval` decides _when_ the next palette colour is
picked; `ambientDuration` decides _how long_ the surface takes to get there. The
two are independent, so a long duration with a short interval produces
continuously overlapping transitions rather than snapping.

The surface never changes uniformly. Each facet mixes its own colour with
`color-mix()`, and three things stagger the change:

- a **sweep direction** that rotates between transitions, turning the change into
  a wave that crosses the surface via per-facet `transition-delay`;
- a per-facet **pace** multiplier, so neighbouring facets take slightly different
  times to arrive;
- the existing per-facet tone offset, so they land on slightly different shades.

The result is a colour migration rather than a crossfade. When ambient is on, a
large blurred bloom also drifts slowly behind the facets on a pure CSS keyframe.

Colours only ever come from `palette` — nothing is generated — and the walk is a
deterministic cycle, so it never repeats a colour back-to-back and stays stable
for visual snapshots. The timer skips work while the tab is hidden and is cleared
on unmount.

**Reduced motion.** No pointer listener, no ambient timer, no facet transition
and no drifting bloom. The surface settles on the first palette entry.

**Accessibility.** The surface is `aria-hidden`; children render in a normal
stacking context above it. Default lightness stays low enough for light text.

**Limitations.** Paint cost scales with facet count — below about `cell={60}` on
a full viewport the surface gets expensive. It is a background: children are not
positioned for you.
