# Zero runtime dependencies; algorithms are ported in, not imported

This library ships with no runtime dependencies. SVG path parsing (`src/lib/path/svg.ts`) is ported from `path-data-parser`, and the curve math (`src/lib/path/curve.ts`) is adapted from `bezier.js`/`paper.js`/`rune.js`, rather than depending on those packages directly. This keeps the published bundle dependency-free and avoids taking on the API surface and update cadence of several small packages, at the cost of manually tracking upstream fixes in the vendored code.
