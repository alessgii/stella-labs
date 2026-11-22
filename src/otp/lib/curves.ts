import * as THREE from 'three';
import { cadToThree, type CadPoint } from './coords';
import { pointInsideAnyBuilding } from './geometry';

export interface FiberElevations {
  indoor: number;
  outdoor: number;
}

export const DEFAULT_FIBER_ELEVATIONS: FiberElevations = {
  indoor: 3.2,
  outdoor: 0.4,
};

export const TRENCH_FIBER_ELEVATIONS: FiberElevations = {
  indoor: 3.2,
  outdoor: -0.8,
};

export interface Fiber3DSegment {
  index: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  length: number;
  isRiser: boolean;
  isIndoor: boolean;
}

function findBoundaryCrossing(
  a: CadPoint,
  b: CadPoint,
  inA: boolean,
): CadPoint {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i += 1) {
    const mid = (lo + hi) / 2;
    const mx = a[0] + (b[0] - a[0]) * mid;
    const my = a[1] + (b[1] - a[1]) * mid;
    const inMid = pointInsideAnyBuilding([mx, my]) !== null;
    if (inMid === inA) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const t = (lo + hi) / 2;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/**
 * Converts a 2D CAD polyline into 3D points with vertical risers wherever
 * the route enters or exits a building polygon.
 */
export function buildElevatedFiberPoints(
  points_cad: readonly CadPoint[],
  closed: boolean,
  elevations: FiberElevations = DEFAULT_FIBER_ELEVATIONS,
): THREE.Vector3[] {
  if (points_cad.length < 2) return [];
  const result: THREE.Vector3[] = [];
  const segCount = closed ? points_cad.length : points_cad.length - 1;

  const first = points_cad[0];
  let currentIn = pointInsideAnyBuilding(first) !== null;
  result.push(
    cadToThree(
      first[0],
      first[1],
      currentIn ? elevations.indoor : elevations.outdoor,
    ),
  );

  for (let i = 0; i < segCount; i += 1) {
    const a = points_cad[i];
    const b = points_cad[(i + 1) % points_cad.length];
    const segLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(segLen / 4));

    let prevPt: CadPoint = a;
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      const nextPt: CadPoint = [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
      ];
      const nextIn = pointInsideAnyBuilding(nextPt) !== null;

      if (nextIn !== currentIn) {
        const cross = findBoundaryCrossing(prevPt, nextPt, currentIn);
        const oldY = currentIn ? elevations.indoor : elevations.outdoor;
        const newY = nextIn ? elevations.indoor : elevations.outdoor;
        result.push(cadToThree(cross[0], cross[1], oldY));
        result.push(cadToThree(cross[0], cross[1], newY));
        currentIn = nextIn;
      }
      prevPt = nextPt;
    }

    const endY = currentIn ? elevations.indoor : elevations.outdoor;
    result.push(cadToThree(b[0], b[1], endY));
  }

  return result;
}

export function buildFiberSegments(points3D: readonly THREE.Vector3[]): Fiber3DSegment[] {
  const segments: Fiber3DSegment[] = [];
  for (let i = 0; i < points3D.length - 1; i += 1) {
    const start = points3D[i];
    const end = points3D[i + 1];
    const length = start.distanceTo(end);
    if (length < 1e-4) continue;
    const horiz = Math.hypot(end.x - start.x, end.z - start.z);
    const isRiser = horiz < 0.25 && Math.abs(end.y - start.y) > 0.5;
    const midY = (start.y + end.y) / 2;
    segments.push({
      index: segments.length,
      start,
      end,
      length,
      isRiser,
      isIndoor: midY > 1.8,
    });
  }
  return segments;
}
