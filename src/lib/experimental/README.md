# Experimental components

Prototypes under evaluation. They are **not** part of the published package:
`src/lib/experimental` is excluded from `tsup` and from `tsconfig.build.json`, and
nothing here is re-exported from `src/lib/index.ts`.

Import them through the experimental barrel only:

```tsx
import { Facet, Lodestone } from "@/lib/experimental"
```

What is left is Facet, Louvre, Raster, Wash and the pixel loaders, plus `Kbd`,
which exists for the documentation site's search hint and is not a component in
its own right.

The `0.2.0` batch under evaluation is Undertow, Wake, Drench, Perseid, Gaze and
Eclipse. Undertow and Wake share one wave engine in [`liquid`](./liquid), which
is a module rather than a component and is not exported from this barrel. Gaze is
the only thing here with a third-party dependency: `three`, loaded with a dynamic
`import()` and held as a devDependency, because nothing in this folder ships. If
Gaze is ever promoted, `three` has to become a peer dependency at the same time.

Lodestone, Vellum, Diorama, Elemental, Kern, Overprint, Meadow, Tessera and
Ricochet graduated in `0.1.0` and now live directly under `src/lib`.

Each has a documentation page under `/docs/<name>` and stories under
`Experimental/*`. Deleting a rejected prototype means deleting its folder and its
preview in `src/playground/previews`.

Promoting one means moving the folder into `src/lib`, adding it to
`src/lib/index.ts`, and removing the build exclusions for it.

Deleting a rejected prototype also means removing its entry from
`src/docs/registry.ts` and its preview from `src/docs/previews.tsx`.
