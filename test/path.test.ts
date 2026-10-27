import { describe, expect, it } from 'vitest';

import { createPath } from '../src/lib/path/path.js';

describe('path', () => {
  describe('open paths (no close command)', () => {
    const d =
      'M0.5 902.5V120.5C0.5 54.2258 54.2258 0.5 120.5 0.5H342.5C408.774 0.5 462.5 54.2258 462.5 120.5V782.5C462.5 848.774 516.226 902.5 582.5 902.5H916.5';

    it('should sample points without throwing', () => {
      const path = createPath(d);
      expect(() => path.getPointAt(0.5)).not.toThrow();
    });

    it('should sample tangents, normals, curvature and radius without throwing', () => {
      const path = createPath(d);
      expect(() => path.getTangentAt(0.5)).not.toThrow();
      expect(() => path.getNormalAt(0.5)).not.toThrow();
      expect(() => path.getCurvatureAt(0.5)).not.toThrow();
      expect(() => path.getRadiusAt(0.5)).not.toThrow();
    });

    it('should report a non-zero length', () => {
      const path = createPath(d);
      expect(path.getLength()).toBeGreaterThan(0);
    });

    it('should compute a correct bounding box', () => {
      const path = createPath(d);
      const box = path.getBoundingBox();

      expect(box.x).toBeGreaterThan(-Infinity);
      expect(box.y).toBeGreaterThan(-Infinity);
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    });

    it('should return the start point at t=0 and the end point at t=1', () => {
      const path = createPath(d);

      const start = path.getPointAt(0);
      expect(start.x).toBeCloseTo(0.5);
      expect(start.y).toBeCloseTo(902.5);

      const end = path.getPointAt(1);
      expect(end.x).toBeCloseTo(916.5);
      expect(end.y).toBeCloseTo(902.5);
    });
  });
});
