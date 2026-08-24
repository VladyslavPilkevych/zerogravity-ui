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

Lodestone, Vellum, Diorama, Elemental, Kern, Overprint, Meadow, Tessera and
Ricochet graduated in `0.1.0` and now live directly under `src/lib`.

Each has a documentation page under `/docs/<name>` and stories under
`Experimental/*`. Deleting a rejected prototype means deleting its folder and its
preview in `src/playground/previews`.

Promoting one means moving the folder into `src/lib`, adding it to
`src/lib/index.ts`, and removing the build exclusions for it.

Deleting a rejected prototype also means removing its entry from
`src/docs/registry.ts` and its preview from `src/docs/previews.tsx`.
