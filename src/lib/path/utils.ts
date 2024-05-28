/**
 * Transforms radians to degrees.
 */
export const radiansToDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

/**
 * Transforms degrees to radians.
 */
export const degreesToRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180;
