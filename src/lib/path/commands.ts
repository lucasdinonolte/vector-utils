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
 * close path command
 */
export const close = (): TCloseCommand => ({
  command: 'close',
});
