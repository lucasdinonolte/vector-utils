import type {
  TPath,
  TPathCommand,
  TAnchor,
  TCurve,
  TBezierPath,
  TCurveLocation,
  TBezierLocation,
  TTransformMatrix,
} from './types';

import { createAnchor } from './anchor';
import { lineTo, moveTo, curveTo, close } from './commands';
import { createCurve } from './curve';
import { createPoint } from './point';
import { parsePath, absolutize, normalize, toCommands } from './svg';
import {
  applyMatrixToCoordinates,
  mergeTransforms,
  rotate,
  scale,
  translate,
} from './transformation';

/**
 * Computes curves for a path.
 */
const computeCurves = (
  anchors: Array<TAnchor>,
  closed: boolean,
): Array<TCurve> => {
  const res = [];

  for (let i = 0; i < anchors.length - 1; i++) {
    const a1 = anchors[i]!,
      a2 = anchors[i + 1]!;

    res.push(createCurve(a1, a2));
  }

  // For a closed path connect the last and first anchor
  // with a curve.
  if (closed) {
    res.push(createCurve(anchors[anchors.length - 1]!, anchors[0]!));
  }

  return res;
};

/**
 * Computes anchors and curves for a path,
 * mutating the input path in place. The result
 * of this computation is stored on the path.
 *
 * As paths are immutable, there is no need
 * to ever recalculate this.
 */
const computePathCurvesAndMutate = (path: TPath) => {
  let lastIdx = 0;
  const subpaths: Array<Array<TPathCommand>> = [];

  path.commands.forEach((command, i) => {
    if (command.command === 'close') {
      subpaths.push(path.commands.slice(lastIdx, i + 1));
      lastIdx = i + 1;
    }
  });

  const bezierPaths: Array<TBezierPath> = subpaths.map((commands) => {
    let closed = false;

    const anchors = commands.reduce(
      (acc: Array<TAnchor>, command: TPathCommand) => {
        let item;
        switch (command.command) {
          case 'moveTo': {
            const point = createPoint(command.x, command.y);
            item = createAnchor(point, null, null);
            return [...acc, item];
          }
          case 'lineTo': {
            const point = createPoint(command.x, command.y);
            item = createAnchor(point, null, null);
            return [...acc, item];
          }
          case 'curveTo': {
            const { x1, y1, x2, y2, x3, y3 } = command;
            const point = createPoint(x3, y3),
              handleOut = createPoint(x1, y1),
              handleIn = createPoint(x2, y2);

            const lastAnchor = acc[acc.length - 1]!;

            acc[acc.length - 1] = createAnchor(
              lastAnchor.point,
              lastAnchor.handleIn,
              handleOut,
            );
            item = createAnchor(point, handleIn, null);

            return [...acc, item];
          }
          case 'close': {
            closed = true;
            return [...acc];
          }
        }
      },
      [],
    );

    const curves = computeCurves(anchors, closed);

    return {
      anchors,
      closed,
      curves,
      length: curves.reduce(
        (acc: number, curve: TCurve) => acc + curve.length(),
        0,
      ),
    };
  });

  path.__cache.bezierPaths = bezierPaths;
  path.__cache.length = bezierPaths.reduce((acc, path) => acc + path.length, 0);
  path.__internal.hasComputed = true;
};

/**
 * Ensures a path has its curves and anchor points computed.
 * Bezier information is lazily computed, to avoid unnecessary
 * calculations for paths that just might not need it.
 */
const ensurePathIsComputed = (path: TPath) => {
  if (!path.__internal.hasComputed) computePathCurvesAndMutate(path);
};

const computeBoundingBoxAndMutate = (path: TPath) => {
  ensurePathIsComputed(path);

  const anchors = path.__cache
    .bezierPaths!.map((bezier) => bezier.anchors)
    .flat();

  let minX = Infinity,
    minY = Infinity,
    maxX = 0,
    maxY = 0;

  for (let i = 0; i < anchors.length; i++) {
    const p = anchors[i]!.point;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  path.__internal.hasBoundingBox = true;
  path.__cache.boundingBox = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const ensureBoundingBox = (path: TPath) => {
  if (!path.__internal.hasBoundingBox) computeBoundingBoxAndMutate(path);
};

const applyTransformationToPath = (
  matrix: TTransformMatrix,
  path: TPath,
): TPath => {
  const commands = path.commands
    .map((command) => {
      switch (command.command) {
        case 'moveTo': {
          const { x, y } = applyMatrixToCoordinates(
            matrix,
            command.x,
            command.y,
          );
          return moveTo(x, y);
        }
        case 'lineTo': {
          const { x, y } = applyMatrixToCoordinates(
            matrix,
            command.x,
            command.y,
          );
          return lineTo(x, y);
        }
        case 'curveTo': {
          const p1 = applyMatrixToCoordinates(matrix, command.x1, command.y1);
          const p2 = applyMatrixToCoordinates(matrix, command.x2, command.y2);
          const p3 = applyMatrixToCoordinates(matrix, command.x3, command.y3);
          return curveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }
        case 'close': {
          return close();
        }
      }
    })
    .filter(Boolean) as Array<TPathCommand>;

  return createPath(commands);
};

/**
 * Looks through all beziers of a path, to figure out which
 * bezier path is at a given t value. This bezier path can
 * then be used to compute on-curve points.
 */
const bezierPathAt = (t: number, path: TPath): TBezierLocation => {
  ensurePathIsComputed(path);

  const offset = (path.__cache.length ?? 0) * t;

  let c = path.__cache.bezierPaths!,
    l = 0;

  for (let i = 0; i < c.length; i++) {
    const start = l,
      bezierPath = c[i]!,
      cl = bezierPath.length;
    l += cl;

    if (l > offset) {
      return {
        bezierPath,
        t: (offset - start) / cl,
      };
    }
  }

  return {
    bezierPath: c[c.length - 1]!,
    t: 1,
  };
};

const locationAt = (_t: number, path: TPath): TCurveLocation => {
  const { bezierPath, t }: TBezierLocation = bezierPathAt(_t, path);

  let offset = bezierPath.length * t,
    c = bezierPath.curves,
    l = 0;

  for (let i = 0; i < c.length; i++) {
    const start = l,
      curve = c[i]!,
      cl = curve.length();

    l += cl;
    if (l > offset) {
      return {
        curve,
        location: offset - start,
        t: (offset - start) / cl,
      };
    }
  }

  return {
    curve: c[c.length - 1]!,
    location: c[c.length - 1]!.length(),
    t: 1,
  };
};

export const parseSVGPath = (d: string): Array<TPathCommand> => {
  const parsed = parsePath(d);
  const absolutePath = absolutize(parsed);
  const normalized = normalize(absolutePath);
  return toCommands(normalized);
};

/**
 * Creates a path from commands
 */
const pathFromCommands = ({
  commands,
}: {
  commands: Array<TPathCommand>;
}): TPath => {
  return {
    __internal: {
      hasBoundingBox: false,
      hasCommands: true,
      hasComputed: false,
    },
    __cache: {
      bezierPaths: null,
      boundingBox: null,
      length: null,
    },
    type: 'path',
    commands,
    getPointAt(t) {
      const cl = locationAt(t, this);
      return cl.curve.getPointAt(cl.t);
    },
    getTangentAt(t) {
      const cl = locationAt(t, this);
      return cl.curve.getTangentAt(cl.t);
    },
    getNormalAt(t) {
      const cl = locationAt(t, this);
      return cl.curve.getNormalAt(cl.t);
    },
    getCurvatureAt(t) {
      const cl = locationAt(t, this);
      return cl.curve.getCurvatureAt(cl.t);
    },
    getRadiusAt(t) {
      const cl = locationAt(t, this);
      return cl.curve.getRadiusAt(cl.t);
    },
    getLength() {
      ensurePathIsComputed(this);
      return this.__cache.length!;
    },
    getBoundingBox() {
      ensureBoundingBox(this);
      return this.__cache.boundingBox!;
    },
    translate(x, y) {
      const matrix = translate({ x, y });
      return applyTransformationToPath(matrix, this);
    },
    scale(sx, sy) {
      ensureBoundingBox(this);
      const matrix = scale({
        sx,
        sy,
        origin: {
          x: this.__cache.boundingBox!.x + this.__cache.boundingBox!.width / 2,
          y: this.__cache.boundingBox!.y + this.__cache.boundingBox!.height / 2,
        },
      });
      return applyTransformationToPath(matrix, this);
    },
    rotate(angle) {
      ensureBoundingBox(this);
      const matrix = rotate({
        angle,
        origin: {
          x: this.__cache.boundingBox!.x + this.__cache.boundingBox!.width / 2,
          y: this.__cache.boundingBox!.y + this.__cache.boundingBox!.height / 2,
        },
      });
      return applyTransformationToPath(matrix, this);
    },
    transform(...matrices) {
      return applyTransformationToPath(mergeTransforms(...matrices), this);
    },
    toInstructions() {
      return this.commands;
    },
    toSVG() {
      return this.toInstructions()
        .map((instr) => {
          switch (instr.command) {
            case 'moveTo': {
              return `M ${instr.x} ${instr.y}`;
            }
            case 'lineTo': {
              return `L ${instr.x} ${instr.y}`;
            }
            case 'curveTo': {
              const { x1, y1, x2, y2, x3, y3 } = instr;
              return `C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
            }
            case 'close': {
              return `Z`;
            }
          }
        })
        .join(' ');
    },
  };
};

/**
 * Creates a path from either an SVG style path command string
 * or from an array of path commands constructed using the
 * moveTo, lineTo, curveTo and close utility functions.
 */
export const createPath = (input: string | Array<TPathCommand>): TPath => {
  const commands = typeof input === 'string' ? parseSVGPath(input) : input;
  return pathFromCommands({ commands });
};
