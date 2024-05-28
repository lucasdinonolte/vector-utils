import type { TPath } from './types';
import { KAPPA } from './constants';
import { moveTo, lineTo, curveTo, close } from './commands';
import { createPath } from './path';

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

export const circle = ({
  cx,
  cy,
  r,
}: {
  cx: number;
  cy: number;
  r: number;
}): TPath => ellipse({ cx, cy, rx: r, ry: r });
