# Experimental components

Prototypes under evaluation. They are **not** part of the published package:
`src/lib/experimental` is excluded from `tsup` and from `tsconfig.build.json`, and
nothing here is re-exported from `src/lib/index.ts`.

Import them through the experimental barrel only:

```tsx
import { Facet, Lodestone } from "@/lib/experimental"
```

The batch is Lodestone, Facet, Vellum, Kern, Overprint, Louvre, Diorama, Wash,
Tessera, Meadow, Raster, Ricochet and the pixel loaders.

Each has a playground route under `/x/<name>` and stories under
`Experimental/*`. Deleting a rejected prototype means deleting its folder, its
demo in `src/playground/experimental`, and its route in `src/app/x`.

Promoting one means moving the folder into `src/lib`, adding it to
`src/lib/index.ts`, and removing the build exclusions for it.
