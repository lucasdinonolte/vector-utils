import type { TPoint } from './types';
import { radiansToDegrees, degreesToRadians } from './utils';

export const createPoint = (x: number, y: number): TPoint => ({
  type: 'point',
  x,
  y,
  add({ x, y }) {
    return createPoint(this.x + x, this.y + y);
  },
  subtract({ x, y }) {
    return createPoint(this.x - x, this.y - y);
  },
  multiply(scalar) {
    return createPoint(this.x * scalar, this.y * scalar);
  },
  dot({ x, y }) {
    return this.x * x + this.y * y;
  },
  divide(scalar) {
    return createPoint(this.x / scalar, this.y / scalar);
  },
  distance({ x, y }) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  length() {
    const lenSq = this.x * this.x + this.y * this.y;
    return Math.sqrt(lenSq);
  },
  normalize() {
    const len = this.length();
    return this.divide(len);
  },
  limit(max) {
    const lenSq = this.x * this.x + this.y * this.y;
    if (lenSq > max * max) {
      return this.divide(Math.sqrt(lenSq)).multiply(max);
    }
    return this.copy();
  },
  rotation() {
    return radiansToDegrees(Math.atan2(this.y, this.x));
  },
  angle(point) {
    const div = this.length() * point.length();
    const a = this.dot(point) / div;
    return radiansToDegrees(Math.acos(a < -1 ? -1 : a > 1 ? 1 : a));
  },
  rotate(_angle = 0) {
    const angle = degreesToRadians(_angle);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.y * sin - this.y * cos;
    return createPoint(x, y);
  },
  isZero() {
    return this.x === 0 && this.y === 0;
  },
  copy() {
    return createPoint(this.x, this.y);
  },
  toString() {
    return `(${this.x}, ${this.y})`;
  },
});
