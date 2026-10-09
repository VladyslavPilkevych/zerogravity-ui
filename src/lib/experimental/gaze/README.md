# Gaze

A 3D model that notices you. The eyes follow the pointer and the head turns after
them, a beat later, which is the difference between a creature looking at you and
a rig snapping to a target.

```tsx
<Gaze src="/robot.glb" tracking={{ head: "Head", leftEye: "Eye_L", rightEye: "Eye_R" }} />
```

With no `src` it builds a small low-poly owl from primitives, so the component is
already something on its own and the repository commits no binary asset.

## The demo owl

The owl is original: built in code from three.js primitives in `standIn.ts`, and
covered by this repository's MIT licence like everything else. There is no
third-party asset, no download and no attribution to carry.

That was a deliberate choice. The CC0 and CC-BY candidates checked (Khronos'
Fox, Quaternius' Green Blob, Mushnub, Frog, Squidle and Alien via Poly Pizza)
are cleanly licensed, but every one has its eyes baked into a single skinned
mesh. With no separate eye nodes the eyes cannot lead, which is the whole point
of the component, so none of them demonstrates it honestly.

Its nodes are `head` (pivoting at the neck), `leftEye` and `rightEye`; the
`body` never turns, so the head turning on it is unmistakable. The highlight in
each eye belongs to the head, so the pupil slides under it. It blinks every few
seconds, which only the stand-in does — a loaded model has no lids to close.

## Tracking

`tracking` names nodes in your model. Each one is optional and each is resolved
by `getObjectByName`:

| Name       | Turns                                      |
| ---------- | ------------------------------------------ |
| `head`     | Follows the pointer slowly                 |
| `leftEye`  | Leads, then settles just ahead of the head |
| `rightEye` | Leads, then settles just ahead of the head |

The eyes aim at the target in the world, so their angle inside the head is the
target less wherever the head has got to: they swing out first and drift back as
the head arrives. They are capped at 30° inside the socket, so the pupil never
rolls out of sight. Eye nodes should rotate about their own centre.

If a name is missing, or nothing in the model matches any of them, the whole
model turns instead of nothing happening — an unfamiliar rig still does something
sensible. Each node's authored rotation is remembered at load and every turn is
applied as an offset from it, so a model that is not built facing the camera is
not wrenched around.

Whatever is loaded is centred and scaled uniformly to a fixed frame, so any model
lands the same way regardless of its authored units.

## Props

| Prop                   | Default         | Notes                                                    |
| ---------------------- | --------------- | -------------------------------------------------------- |
| `src`                  | —               | A `.glb` or `.gltf` URL; omit for the stand-in           |
| `tracking`             | —               | Node names; ignored by the stand-in, which names its own |
| `sensitivity`          | `1`             | How far the pointer has to travel for a full turn        |
| `maxYaw`               | `34`            | How far it may turn horizontally, in degrees             |
| `maxPitch`             | `18`            | And vertically                                           |
| `damping`              | `0.1`           | How quickly it catches up; smaller is heavier            |
| `headDelay`            | `0.6`           | How much slower the head is than the eyes                |
| `background`           | `"transparent"` | Behind the model                                         |
| `label`                | —               | Describes the model to anything that cannot see it       |
| `decorative`           | `false`         | Purely decorative, so no label is announced              |
| `disabled`             | `false`         | Hold the neutral pose                                    |
| `respectReducedMotion` | `true`          | Honour `prefers-reduced-motion`                          |

Turn angles are clamped on both axes, so the pointer can never send a head
somewhere anatomy would not. `damping` keeps its per-frame meaning at 60 Hz but
is applied per second, so the motion is the same at 120 Hz.

## Pointer and touch

Leaving the model returns it to neutral. A tap or a horizontal drag sets the
target too; because a finger lifts the moment it taps, a touch look is held for
a beat before it relaxes. `touch-action: pan-y` keeps vertical scrolling.

## Frames

It rides the library's shared frame loop and lets go of it once everything has
settled, so a model at rest costs nothing per frame. It also sleeps offscreen.

## The dependency

`three` is loaded with a dynamic `import()` inside the effect, so it is fetched
only when a `Gaze` actually mounts. Nothing else in the library — and no page
that never shows one — pays for it. The type-only import is erased at build.

Experimental components are not published, so `three` is a devDependency here and
never reaches a consumer of the package. If Gaze is ever promoted, `three` has to
become a peer dependency at the same time.

## States

`data-phase` is `loading`, `ready` or `error`. A model that fails to load, and a
machine with no WebGL at all, both land in `error` with an announced message
rather than an empty box or a thrown effect.

## Accessibility

By default the host is `role="img"` with your `label`. With `decorative` it is
`aria-hidden` and carries no label — use that when the model is scenery. The
error message is a `role="status"`, so a failure is announced rather than silent.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, the model is rendered
once in its neutral pose and the pointer is ignored. No frame loop runs.

## Cleanup

On unmount the loop is released, the pointer listeners and timers are removed, the resize
and intersection observers are disconnected, every geometry and material in the
scene is disposed, the renderer is disposed and its canvas is removed. Unmounting
mid-load is safe: the load resolves into a disposed guard and does nothing.
