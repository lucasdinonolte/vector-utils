// Inspired by rune.js and paper.js
// which are based on bezier.js
import type { TAnchor, TCurvature, TCurve, TPoint } from './types';

import { T_VALUES, C_VALUES } from './constants';
import { createPoint } from './point';

/**
 * Creates a lookup table for a derived curve function
 */
const deriveCurve = (
  points: [TPoint, TPoint, TPoint, TPoint],
): Array<Array<TPoint>> => {
  const res = [];

  for (
    let p: Array<TPoint> = points, d = p.length, c = d - 1;
    d > 1;
    d--, c--
  ) {
    const list = [];
    for (let j = 0, dpt; j < c; j++) {
      const p1 = p[j];
      const p2 = p[j + 1];

      if (p1 == null || p2 == null) continue;

      dpt = {
        x: c * (p2.x - p1.x),
        y: c * (p2.y - p1.y),
      };
      list.push(createPoint(dpt.x, dpt.y));
    }
    res.push(list);
    p = list;
  }

  return res;
};

/**
 * Computes a point on a curve given a t value between 0 and 1.
 */
const computePointOnCurve = (t: number, points: Array<TPoint>): TPoint => {
  if (t === 0) return points[0]!;
  const degree = points.length - 1;
  if (t === 1) return points[degree]!;
  if (degree === 0) return points[0]!;

  const mt = 1 - t;
  let x,
    y = 0;

  if (degree === 1) {
    x = mt * points[0]!.x + t * points[1]!.x;
    y = mt * points[0]!.y + t * points[1]!.y;

    return createPoint(x, y);
  }

  const mt2 = mt * mt;
  const t2 = t * t;
  const a = mt2 * mt;
  const b = mt2 * t * 3;
  const c = mt * t2 * 3;
  const d = t * t2;

  x = a * points[0]!.x + b * points[1]!.x + c * points[2]!.x + d * points[3]!.x;
  y = a * points[0]!.y + b * points[1]!.y + c * points[2]!.y + d * points[3]!.y;

  return createPoint(x, y);
};

/**
 * Computes curvature and radius at Curve location
 */
const computeCurvature = (
  t: number,
  derivedPoints: Array<Array<TPoint>>,
): TCurvature => {
  const d1 = derivedPoints[0]!,
    d2 = derivedPoints[1]!,
    d = computePointOnCurve(t, d1),
    dd = computePointOnCurve(t, d2),
    qdsum = d.x * d.x + d.y * d.y,
    num = d.x + dd.y - d.y * dd.x,
    dnm = Math.pow(qdsum, 3 / 2);

  if (num === 0 || dnm === 0) return { curvature: 0, radius: 0 };
  return {
    curvature: num / dnm,
    radius: dnm / num,
  };
};

/**
 * Aligns the given points on a cubic Bezier curve defined by p1 and p2.
 * This function rotates and translates the points to align them along the x-axis
 * based on the angle formed by the line segment connecting p1 and p2.
 */
const alignCurve = (
  points: Array<TPoint>,
  p1: TPoint,
  p2: TPoint,
): Array<TPoint> => {
  const tx = p1.x,
    ty = p1.y,
    a = -Math.atan2(p2.y - ty, p2.x - tx),
    d = (v: TPoint) => {
      const x = (v.x - tx) * Math.cos(a) - (v.y - ty) * Math.sin(a),
        y = (v.x - tx) * Math.sin(a) + (v.y - ty) * Math.cos(a);
      return createPoint(x, y);
    };

  return points.map(d);
};

export const createCurve = (anchor1: TAnchor, anchor2: TAnchor): TCurve => {
  const points: [TPoint, TPoint, TPoint, TPoint] = [
    anchor1.point,
    anchor1.handleOut ?? anchor1.point,
    anchor2.handleIn ?? anchor2.point,
    anchor2.point,
  ];

  const derivedPoints = deriveCurve(points);

  return {
    type: 'curve',
    points,
    degree: 3,
    isLinear() {
      const a = alignCurve(
        this.points,
        this.points[0],
        this.points[this.degree],
      );
      for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i]?.y ?? 0) > 0.0001) {
          return false;
        }
      }
      return true;
    },
    derivative(t) {
      const mt = 1 - t,
        a = mt * mt,
        b = mt * t * 2,
        c = t * t,
        p = derivedPoints[0]!,
        x = a * p[0]!.x + b * p[1]!.x + c * p[2]!.x,
        y = a * p[0]!.y + b * p[1]!.y + c * p[2]!.y;

      return createPoint(x, y);
    },
    arcfn(t) {
      const d = this.derivative(t);
      const l = d.x * d.x + d.y * d.y;
      return Math.sqrt(l);
    },
    getPointAt(t) {
      return computePointOnCurve(t, this.points);
    },
    getTangentAt(t) {
      return this.derivative(t).normalize();
    },
    getNormalAt(t) {
      const d = this.getTangentAt(t),
        x = -d.y,
        y = d.x;

      return createPoint(x, y);
    },
    getCurvatureAt(t) {
      const kr = computeCurvature(t, derivedPoints);
      return kr.curvature;
    },
    getRadiusAt(t) {
      const kr = computeCurvature(t, derivedPoints);
      return kr.radius;
    },
    length() {
      const z = 0.5;
      let sum = 0,
        t = 0;

      for (let i = 0; i < T_VALUES.length; i++) {
        t = z * T_VALUES[i]! + z;
        sum += C_VALUES[i]! * this.arcfn(t);
      }

      return z * sum;
    },
    clearHandles() {
      return createCurve(anchor1.removeHandles(), anchor2.removeHandles());
    },
  };
};
