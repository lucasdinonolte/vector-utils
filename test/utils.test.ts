import { describe, expect, it } from 'vitest';
import { degreesToRadians, radiansToDegrees } from '../src/lib/path/utils';

describe('utils', () => {
  describe('degreesToRadians', () => {
    it('should convert degrees to radians', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(180)).toBe(Math.PI);
      expect(degreesToRadians(360)).toBe(Math.PI * 2);
    });
  });

  describe('radiansToDegrees', () => {
    it('should convert radians to degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI)).toBe(180);
      expect(radiansToDegrees(2 * Math.PI)).toBe(360);
    });
  });
});
