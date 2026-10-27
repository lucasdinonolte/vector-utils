# Vector Paths

A library for constructing, parsing, sampling, and transforming 2D vector paths — the kind of path data used in SVG `d` attributes and vector-graphics editors.

## Language

**Path**:
An immutable sequence of Path Commands describing one or more subpaths, with geometry (length, bounding box, point sampling) computed lazily on top of them.
_Avoid_: Vector path, shape, drawing

**Path Command**:
A single SVG-style drawing instruction — `moveTo`, `lineTo`, `curveTo`, or `close` — that a Path is built from.
_Avoid_: Instruction, segment, op

**Bezier Path**:
The resolved form of one subpath (everything between a `moveTo` and the next `moveTo` or `close`): the list of Anchors and the Curves connecting them.
_Avoid_: Subpath, contour

**Anchor**:
An on-curve point of a Bezier Path, optionally carrying an incoming and/or outgoing Handle that shapes the Curves meeting at it.
_Avoid_: Node, vertex, control point

**Handle**:
A control point attached to an Anchor (`handleIn` / `handleOut`) that pulls the adjoining Curve away from a straight line.
_Avoid_: Control point, tangent handle

**Curve**:
A single cubic Bezier segment between two consecutive Anchors, defined by exactly four Points: the two Anchors and their facing Handles.
_Avoid_: Segment, spline, bezier segment

**Point**:
A 2D coordinate with vector-math operations (add, subtract, dot, normalize, rotate, etc). The base value type everything else here is built from.
_Avoid_: Vector, coordinate

**Primitive**:
A factory function (`line`, `rectangle`, `roundedRectangle`, `ellipse`, `circle`) that returns a ready-made Path for a common shape.
_Avoid_: Shape, factory

**Transform**:
An affine 2D transformation — `translate`, `scale`, or `rotate` — represented as a matrix and applied to a Path's coordinates. Several Transforms combine via `mergeTransforms` into a single matrix before being applied.
_Avoid_: Operation

**t**:
A normalized position between 0 and 1 along a Curve, a Bezier Path, or a whole Path, used to sample a point, tangent, normal, or curvature. At the Path level, `t` is weighted by arc length across its Bezier Paths and Curves, not split evenly by command count.
_Avoid_: Progress, percentage, offset
