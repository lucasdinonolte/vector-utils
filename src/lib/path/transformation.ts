import type { TPoint, TTransformMatrix } from './types';

import { createPoint } from './point';
import { degreesToRadians } from './utils';

/**
 * Turns the transforms into an affine 2d transformation matrix
 * and returns a function that will apply this matrix to a given
 * point around a center point.
 *
 * Such a coordinate transformation can be represented by a 3 row by 3
 * column matrix with an implied last row of `[ 0 0 1 ]`. This matrix
 * transforms source coordinates `(x, y)` into destination coordinates `(x',y')`
 * by considering them to be a column vector and multiplying the coordinate
 * vector by the matrix according to the following process:
 *
 *     [ x ]   [ a  c  tx ] [ x ]   [ a * x + c * y + tx ]
 *     [ y ] = [ b  d  ty ] [ y ] = [ b * x + d * y + ty ]
 *     [ 1 ]   [ 0  0  1  ] [ 1 ]   [         1          ]
 *
 * The following matrix math code is an adapation of both paper.js and
 * transformation-matrix-js
 *
 * https://github.com/paperjs/paper.js/blob/develop/src/basic/Matrix.js#L286
 * https://github.com/deoxxa/transformation-matrix-js/blob/master/src/matrix.js#L516
 */
const identityMatrix: TTransformMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  tx: 0,
  ty: 0,
};

export const translate = ({
  x = 0,
  y = 0,
}: {
  x: number;
  y: number;
}): TTransformMatrix => {
  const matrix = { ...identityMatrix };
  matrix.tx += x * matrix.a + y * matrix.c;
  matrix.ty += x * matrix.b + y * matrix.d;
  return matrix;
};

export const scale = ({
  sx = 1,
  sy = 1,
  origin = { x: 0, y: 0 },
}: {
  sx: number;
  sy: number;
  origin: { x: number; y: number };
}): TTransformMatrix => {
  const matrix = { ...identityMatrix };
  matrix.tx += origin.x * matrix.a + origin.y * matrix.c;
  matrix.ty += origin.x * matrix.b + origin.y * matrix.d;
  matrix.a *= sx;
  matrix.b *= sx;
  matrix.c *= sy;
  matrix.d *= sy;
  matrix.tx += -1 * origin.x * matrix.a + -1 * origin.y * matrix.c;
  matrix.ty += -1 * origin.x * matrix.b + -1 * origin.y * matrix.d;

  return matrix;
};

export const rotate = ({
  angle = 0,
  origin = { x: 0, y: 0 },
}: {
  angle: number;
  origin: { x: number; y: number };
}): TTransformMatrix => {
  const matrix = { ...identityMatrix };
  const radians = degreesToRadians(angle);
  const { x, y } = origin;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const tx = x - x * cos + y * sin;
  const ty = y - x * sin - y * cos;
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;

  matrix.a = cos * a + sin * c;
  matrix.b = cos * b + sin * d;
  matrix.c = -sin * a + cos * c;
  matrix.d = -sin * b + cos * d;
  matrix.tx += tx * a + ty * c;
  matrix.ty += tx * b + ty * d;

  return matrix;
};

const appendMatrix = (
  matrix: TTransformMatrix,
  transforms: TTransformMatrix,
): TTransformMatrix => {
  const a1 = matrix.a;
  const b1 = matrix.b;
  const c1 = matrix.c;
  const d1 = matrix.d;
  const tx1 = matrix.tx;
  const ty1 = matrix.ty;

  const a2 = transforms.a;
  const b2 = transforms.b;
  const c2 = transforms.c;
  const d2 = transforms.d;
  const tx2 = transforms.tx;
  const ty2 = transforms.ty;

  return {
    a: a2 * a1 + c2 * c1,
    b: b2 * a1 + d2 * c1,
    c: a2 * b1 + c2 * d1,
    d: b2 * b1 + d2 * d1,
    tx: tx1 + (tx2 * a1 + ty2 * c1),
    ty: ty1 + (tx2 * b1 + ty2 * d1),
  };
};

export const mergeTransforms = (
  ...matrices: Array<TTransformMatrix>
): TTransformMatrix => {
  return matrices.reduce((acc, cur) => appendMatrix(acc, cur), identityMatrix);
};

export const applyMatrixToCoordinates = (
  matrix: TTransformMatrix,
  x: number,
  y: number,
): { x: number; y: number } => {
  const newX = matrix.a * x + matrix.c * y + matrix.tx;
  const newY = matrix.b * x + matrix.d * y + matrix.ty;

  return {
    x: newX,
    y: newY,
  };
};

export const applyMatrixToPoint = (
  matrix: TTransformMatrix,
  point: TPoint,
): TPoint => {
  const { x, y } = applyMatrixToCoordinates(matrix, point.x, point.y);
  return createPoint(x, y);
};
