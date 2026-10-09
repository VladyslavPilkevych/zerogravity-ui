# Experimental components

Prototypes under evaluation. They are **not** part of the published package:
`src/lib/experimental` is excluded from `tsup` and from `tsconfig.build.json`, and
nothing here is re-exported from `src/lib/index.ts`.

Import them through the experimental barrel only:

```tsx
import { Facet, Prism } from "@/lib/experimental"
```

Still under evaluation: Anaglyph, Concertina, Contact, Drench, Emulsion, Facet,
Gaze, Ink, Meniscus, Nimbus, Perseid, Prism, Quartz, Quiver, Raster, Undertow
and the pixel loaders, plus `Kbd`, which exists for the documentation site's
search hint and is not a component in its own right. They run on the shared
internals in `src/lib/internal` — one frame clock, one seeded generator, one
pointer box, one canvas fitter — rather than on machinery of their own.

Undertow runs on the ripple engine in [`liquid`](./liquid), which is a module
rather than a component and is not exported from this barrel. Gaze is the only
thing here with a third-party dependency: `three`, loaded with a dynamic
`import()` and held as a devDependency, because nothing in this folder ships. If
Gaze is ever promoted, `three` has to become a peer dependency at the same time.

Graduated and now living directly under `src/lib`: Lodestone, Vellum, Diorama,
Elemental, Kern, Overprint, Meadow, Tessera and Ricochet in `0.1.0`; Louvre,
Eclipse, Lattice, Sonar, Palimpsest and Phosphor after the first review; and
Wake, Gnomon, Chroma, Wash, Peel, Gantry, Tide and Lenticular after the second.

Each has a documentation page under `/docs/<name>` and stories under
`Experimental/*`. Deleting a rejected prototype means deleting its folder and its
preview in `src/playground/previews`.

Promoting one means moving the folder into `src/lib`, adding it to
`src/lib/index.ts` and to the `package.json` export map, and setting its
registry status to `stable`; `pnpm check:package` fails until all three agree.

Deleting a rejected prototype also means removing its entry from
`src/docs/registry.ts` and its preview from `src/docs/previews.tsx`.
