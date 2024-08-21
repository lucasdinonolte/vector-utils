import { describe, expect, it } from 'vitest';
import { line } from '../src/lib/path/primitives';

describe('line', () => {
  it('should create a line path', () => {
    const res = line({ x1: 0, y1: 0, x2: 50, y2: 0 });
    expect(res.commands.length).toBe(2);
    expect(res.commands[0]).toStrictEqual({ command: 'moveTo', x: 0, y: 0 });
    expect(res.commands[1]).toStrictEqual({ command: 'lineTo', x: 50, y: 0 });
  });

  it('should throw an error if divisions is less than 1', () => {
    expect(() => line({ x1: 0, y1: 0, x2: 50, y2: 0, divisions: 0 })).toThrow();
  });

  it('should create a line path with divisions', () => {
    const res = line({ x1: 0, y1: 0, x2: 50, y2: 50, divisions: 5 });
    expect(res.commands.length).toBe(6);
    expect(res.commands[0]).toStrictEqual({ command: 'moveTo', x: 0, y: 0 });
    expect(res.commands[1]).toStrictEqual({ command: 'lineTo', x: 10, y: 10 });
    expect(res.commands[2]).toStrictEqual({ command: 'lineTo', x: 20, y: 20 });
    expect(res.commands[3]).toStrictEqual({ command: 'lineTo', x: 30, y: 30 });
    expect(res.commands[4]).toStrictEqual({ command: 'lineTo', x: 40, y: 40 });
    expect(res.commands[5]).toStrictEqual({ command: 'lineTo', x: 50, y: 50 });
  });
});
