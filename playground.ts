import { close, createPath, moveTo, curveWithCurvature } from './src/index';

const CURVATURE = 0.65; // KAPPA constant for cubic Bezier curves
const X_HEIGHT = 500;
const width = 400;

const shape = createPath([
  moveTo(width / 2, 0),
  curveWithCurvature(width / 2, 0, width, X_HEIGHT / 2, CURVATURE, true),
  curveWithCurvature(width, X_HEIGHT / 2, width / 2, X_HEIGHT, CURVATURE, true),
  curveWithCurvature(width / 2, X_HEIGHT, 0, X_HEIGHT / 2, CURVATURE, true),
  curveWithCurvature(0, X_HEIGHT / 2, width / 2, 0, CURVATURE, true),
  close(),
]);

console.log(shape.toSVG());
