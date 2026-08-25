# Gaze

A 3D model that notices you. The eyes follow the pointer and the head turns after
them, a beat later, which is the difference between a creature looking at you and
a rig snapping to a target.

```tsx
<Gaze src="/robot.glb" tracking={{ head: "Head", leftEye: "Eye_L", rightEye: "Eye_R" }} />
```

With no `src` it builds a small original head from primitives, so the component
is already something on its own and the repository commits no binary asset.

## Tracking

`tracking` names nodes in your model. Each one is optional and each is resolved
by `getObjectByName`:

| Name       | Turns                           |
| ---------- | ------------------------------- |
| `head`     | Follows the pointer slowly      |
| `leftEye`  | Leads, at 1.5× the head's angle |
| `rightEye` | Leads, at 1.5× the head's angle |

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
| `maxYaw`               | `26`            | How far it may turn horizontally, in degrees             |
| `maxPitch`             | `16`            | And vertically                                           |
| `damping`              | `0.12`          | How quickly it catches up; smaller is heavier            |
| `headDelay`            | `0.45`          | How much slower the head is than the eyes                |
| `background`           | `"transparent"` | Behind the model                                         |
| `label`                | —               | Describes the model to anything that cannot see it       |
| `decorative`           | `false`         | Purely decorative, so no label is announced              |
| `disabled`             | `false`         | Hold the neutral pose                                    |
| `respectReducedMotion` | `true`          | Honour `prefers-reduced-motion`                          |

Turn angles are clamped on both axes, so the pointer can never send a head
somewhere anatomy would not.

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

On unmount the loop is cancelled, both pointer listeners are removed, the resize
and intersection observers are disconnected, every geometry and material in the
scene is disposed, the renderer is disposed and its canvas is removed. Unmounting
mid-load is safe: the load resolves into a disposed guard and does nothing.
