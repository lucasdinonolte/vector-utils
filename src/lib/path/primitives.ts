import type { TPath } from './types';
import { KAPPA } from './constants';
import { moveTo, lineTo, curveTo, close } from './commands';
import { createPath } from './path';

/**
 * Creates a rectangular path starting from the specified coordinates with the given width and height.
 *
 * @example
 * // Example of how to use the rectangle function:
 * const myRectanglePath = rectangle({ x: 10, y: 10, width: 50, height: 30 });
 */
export const rectangle = ({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}): TPath => {
  return createPath([
    moveTo(x, y),
    lineTo(x + width, y),
    lineTo(x + width, y + height),
    lineTo(x, y + height),
    close(),
  ]);
};

/**
 * Creates a rounded rectangular path starting from the specified coordinates with the given width, height, and corner radius.
 *
 * @example
 * // Example of how to use the roundedRectangle function:
 * const myRoundedRectanglePath = roundedRectangle({ x: 20, y: 20, width: 80, height: 50, radius: 10 });
 *
 * // Radius can also be specified per corner, following the
 * // order used by CSS border-radius (top left, top right, bottom right, bottom left)
 * const myRoundedRectanglePath = roundedRectangle({ x: 20, y: 20, width: 80, height: 50, radius: [0, 10, 10, 0] });
 */
export const roundedRectangle = ({
  x,
  y,
  width,
  height,
  radius,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number | [number, number, number, number];
}): TPath => {
  const [tlr, trr, brr, blr] =
    typeof radius === 'number' ? [radius, radius, radius, radius] : radius;

  return createPath([
    moveTo(x, y + tlr),
    curveTo(x, y + tlr * (1 - KAPPA), x + tlr * (1 - KAPPA), y, x + tlr, y),
    lineTo(x + width - trr, y),
    curveTo(
      x + width - trr * (1 - KAPPA),
      y,
      x + width,
      y + trr * (1 - KAPPA),
      x + width,
      y + trr,
    ),
    lineTo(x + width, y + height - brr),
    curveTo(
      x + width,
      y + height - brr * (1 - KAPPA),
      x + width - brr * (1 - KAPPA),
      y + height,
      x + width - brr,
      y + height,
    ),
    lineTo(x + blr, y + height),
    curveTo(
      x + blr * (1 - KAPPA),
      y + height,
      x,
      y + height - blr * (1 - KAPPA),
      x,
      y + height - blr,
    ),
    close(),
  ]);
};

/**
 * Creates an elliptical path with the specified center coordinates, radii, and curvature.
 *
 * @example
 * // Example of how to use the ellipse function:
 * const myEllipsePath = ellipse({ cx: 50, cy: 50, rx: 30, ry: 20 });
 */
export const ellipse = ({
  cx,
  cy,
  rx,
  ry,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}): TPath => {
  return createPath([
    moveTo(cx + rx, cy),
    curveTo(cx + rx, cy - ry * KAPPA, cx + rx * KAPPA, cy - ry, cx, cy - ry),
    curveTo(cx - rx * KAPPA, cy - ry, cx - rx, cy - ry * KAPPA, cx - rx, cy),
    curveTo(cx - rx, cy + ry * KAPPA, cx - rx * KAPPA, cy + ry, cx, cy + ry),
    curveTo(cx + rx * KAPPA, cy + ry, cx + rx, cy + ry * KAPPA, cx + rx, cy),
    close(),
  ]);
};

/**
 * Creates a circular path with the specified center coordinates and radius.
 *
 * @example
 * // Example of how to use the circle function:
 * const myCirclePath = circle({ cx: 50, cy: 50, r: 30 });
 */
export const circle = ({
  cx,
  cy,
  r,
}: {
  cx: number;
  cy: number;
  r: number;
}): TPath => ellipse({ cx, cy, rx: r, ry: r });
