import type {
  TMoveToCommand,
  TLineToCommand,
  TCloseCommand,
  TCurveToCommand,
} from './types';

/**
 * moveTo command
 */
export const moveTo = (x: number, y: number): TMoveToCommand => ({
  command: 'moveTo',
  x,
  y,
});

/**
 * lineTo path command
 */
export const lineTo = (x: number, y: number): TLineToCommand => ({
  command: 'lineTo',
  x,
  y,
});

/**
 * curveTo path command
 */
export const curveTo = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
): TCurveToCommand => ({
  command: 'curveTo',
  x1,
  y1,
  x2,
  y2,
  x3,
  y3,
});

/**
 * curveWithCurvature utility command
 */
export const curveWithCurvature = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: number,
  clockwise: boolean = true,
): TCurveToCommand => {
  const isBelow = y2 > y1;
  const isRight = x2 > x1;

  let controlPointA: TCurveToCommand;
  let controlPointB: TCurveToCommand;

  // Calculate control points based on the direction
  if (isBelow) {
    if (isRight) {
      // Below and right
      controlPointA = curveTo(
        x1 + (x2 - x1) * c,
        y1,
        x2,
        y2 - (y2 - y1) * c,
        x2,
        y2,
      );
      controlPointB = curveTo(
        x1,
        y1 + (y2 - y1) * c,
        x2 - (x2 - x1) * c,
        y2,
        x2,
        y2,
      );
    } else {
      // Below and left
      controlPointA = curveTo(
        x1,
        y1 + (y2 - y1) * c,
        x2 + (x1 - x2) * c,
        y2,
        x2,
        y2,
      );
      controlPointB = curveTo(
        x1 - (x1 - x2) * c,
        y1,
        x2,
        y2 - (y2 - y1) * c,
        x2,
        y2,
      );
    }
  } else {
    if (isRight) {
      controlPointA = curveTo(
        x1,
        y1 - (y1 - y2) * c,
        x2 - (x2 - x1) * c,
        y2,
        x2,
        y2,
      );

      controlPointB = curveTo(
        x1 + (x2 - x1) * c,
        y1,
        x2,
        y2 + (y1 - y2) * c,
        x2,
        y2,
      );
    } else {
      // Above and left
      controlPointA = curveTo(
        x1 - (x1 - x2) * c,
        y1,
        x2,
        y2 + (y1 - y2) * c,
        x2,
        y2,
      );
      controlPointB = curveTo(
        x1,
        y1 - (y1 - y2) * c,
        x2 + (x1 - x2) * c,
        y2,
        x2,
        y2,
      );
    }
  }

  // Return control points based on the clockwise/counter-clockwise logic
  if (clockwise) {
    return controlPointA; // Choose the appropriate control point for clockwise
  } else {
    return controlPointB; // Choose the appropriate control point for counter-clockwise
  }
};

/**
 * close path command
 */
export const close = (): TCloseCommand => ({
  command: 'close',
});
