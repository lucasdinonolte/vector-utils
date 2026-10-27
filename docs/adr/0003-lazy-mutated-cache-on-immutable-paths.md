# Paths are immutable values with a lazily mutated internal cache

Every `TPath` is treated as immutable (every transform returns a new `TPath`), but internally `computePathCurvesAndMutate` and `computeBoundingBoxAndMutate` (`src/lib/path/path.ts`) mutate a path's own `__cache`/`__internal` fields in place the first time its curves, length, or bounding box are requested. This trades strict purity — a `Path` instance does change on first read — for skipping anchor/curve computation on paths that are only ever translated or serialized to SVG and never sampled.
