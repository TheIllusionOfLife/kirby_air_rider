import { Vector2 } from '../types';

export const add = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const sub = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x - v2.x, y: v1.y - v2.y });
export const scale = (v: Vector2, s: number): Vector2 => ({ x: v.x * s, y: v.y * s });
export const mag = (v: Vector2): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const normalize = (v: Vector2): Vector2 => {
  const m = mag(v);
  return m === 0 ? { x: 0, y: 0 } : scale(v, 1 / m);
};
export const dist = (v1: Vector2, v2: Vector2): number => mag(sub(v1, v2));
export const dot = (v1: Vector2, v2: Vector2): number => v1.x * v2.x + v1.y * v2.y;

export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

export const checkCollision = (p1: Vector2, r1: number, p2: Vector2, r2: number): boolean => {
  return dist(p1, p2) < (r1 + r2);
};
