import { TAnchor, TPoint } from './types';

export const createAnchor = (
  point: TPoint,
  handleIn: TPoint | null = null,
  handleOut: TPoint | null = null,
): TAnchor => ({
  type: 'anchor',
  point,
  handleIn,
  handleOut,
  hasHandles() {
    return this.handleIn !== null || this.handleOut !== null;
  },
  removeHandles() {
    return createAnchor(this.point, null, null);
  },
});
