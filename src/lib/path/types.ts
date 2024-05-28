export type TPoint = Readonly<{
  type: 'point';
  x: number;
  y: number;
  add: (other: TPoint) => TPoint;
  subtract: (other: TPoint) => TPoint;
  multiply: (scalar: number) => TPoint;
  dot: (other: TPoint) => number;
  divide: (scalar: number) => TPoint;
  distance: (other: TPoint) => number;
  length: () => number;
  normalize: () => TPoint;
  limit: (max: number) => TPoint;
  rotation: () => number;
  angle: (other: TPoint) => number;
  rotate: (_angle: number) => TPoint;
  copy: () => TPoint;
  isZero: () => boolean;
  toString: () => string;
}>;

export type TAnchor = Readonly<{
  type: 'anchor';
  point: TPoint;
  handleIn: TPoint | null;
  handleOut: TPoint | null;
  hasHandles: () => boolean;
  removeHandles: () => TAnchor;
}>;

export type TCurve = Readonly<{
  type: 'curve';
  degree: 3;
  points: [TPoint, TPoint, TPoint, TPoint];
  isLinear: () => boolean;
  derivative: (t: number) => TPoint;
  arcfn: (t: number) => number;
  getPointAt: (t: number) => TPoint;
  getTangentAt: (t: number) => TPoint;
  getNormalAt: (t: number) => TPoint;
  getCurvatureAt: (t: number) => number;
  getRadiusAt: (t: number) => number;
  length: () => number;
  clearHandles: () => TCurve;
}>;

export type TBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type TBezierPath = Readonly<{
  anchors: Array<TAnchor>;
  closed: boolean;
  curves: Array<TCurve>;
  length: number;
}>;

export type TBezierLocation = Readonly<{
  bezierPath: TBezierPath;
  t: number;
}>;

export type TCurveLocation = Readonly<{
  curve: TCurve;
  location: number;
  t: number;
}>;

export type TCurvature = Readonly<{
  curvature: number;
  radius: number;
}>;

export type TMoveToCommand = Readonly<{
  command: 'moveTo';
  x: number;
  y: number;
}>;

export type TLineToCommand = Readonly<{
  command: 'lineTo';
  x: number;
  y: number;
}>;

export type TCurveToCommand = Readonly<{
  command: 'curveTo';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}>;

export type TCloseCommand = Readonly<{
  command: 'close';
}>;

export type TTransformMatrix = Readonly<{
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}>;

export type TPathCommand =
  | TMoveToCommand
  | TLineToCommand
  | TCurveToCommand
  | TCloseCommand;

export type TPath = {
  type: 'path';
  __internal: {
    hasCommands: boolean;
    hasBoundingBox: boolean;
    hasComputed: boolean;
  };
  __cache: {
    bezierPaths: Array<TBezierPath> | null;
    boundingBox: TBoundingBox | null;
    length: number | null;
  };
  commands: Array<TPathCommand>;
  getPointAt: (t: number) => TPoint;
  getTangentAt: (t: number) => TPoint;
  getNormalAt: (t: number) => TPoint;
  getCurvatureAt: (t: number) => number;
  getRadiusAt: (t: number) => number;
  getLength: () => number;
  getBoundingBox: () => TBoundingBox;
  translate: (x: number, y: number) => TPath;
  scale: (sx: number, sy: number) => TPath;
  rotate: (angle: number) => TPath;
  transform: (...matrices: Array<TTransformMatrix>) => TPath;
  toInstructions: () => Array<TPathCommand>;
  toSVG: () => string;
};
