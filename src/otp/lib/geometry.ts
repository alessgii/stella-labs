import {
  BUILDINGS,
  CONTROL_TOWER,
  TECH_ROOMS,
  rectToPolygon,
} from '../data/buildings';
import { FIBER_CABLES, type FiberCableId } from '../data/fiber';
import { CORE_NODES } from '../data/nodes';
import { DISTRIBUTION_RACKS } from '../data/racks';
import { CAMPUS_BOUNDS_CAD, type CadPoint } from './coords';

/**
 * Ray-casting point-in-polygon check in 2D CAD coordinates.
 * Boundary points count as inside via small epsilon check on segments.
 */
export function pointInPolygon(point: CadPoint, polygon: readonly CadPoint[]): boolean {
  const [px, py] = point;
  if (polygon.length < 3) return false;

  // Segment boundary tolerance check
  const eps = 1e-6;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [x1, y1] = polygon[j];
    const [x2, y2] = polygon[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq > 0) {
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
      const dist = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
      if (dist <= eps) return true;
    }
  }

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function pointInCircle(
  point: CadPoint,
  center: CadPoint,
  radius: number,
): boolean {
  return Math.hypot(point[0] - center[0], point[1] - center[1]) <= radius + 1e-6;
}

export function pointInsideAnyBuilding(point: CadPoint): string | null {
  for (const b of BUILDINGS) {
    if (pointInPolygon(point, b.outer)) return b.id;
  }
  if (
    pointInCircle(
      point,
      CONTROL_TOWER.center_cad,
      CONTROL_TOWER.outerRadius,
    )
  ) {
    return CONTROL_TOWER.id;
  }
  return null;
}

export function polylineLength2D(
  points: readonly CadPoint[],
  closed = false,
): number {
  if (points.length < 2) return 0;
  let total = 0;
  const count = closed ? points.length : points.length - 1;
  for (let i = 0; i < count; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  return total;
}

export interface CoreNodeCheckResult {
  nodeId: string;
  techRoomId: string;
  passed: boolean;
}

export interface FiberLengthCheckResult {
  cableId: FiberCableId;
  calculated_m: number;
  spec_m: number;
  diffPercent: number;
  passed: boolean;
}

export interface RackLocationCheckResult {
  rackId: string;
  buildingId: string | null;
  zoneType: 'indoor' | 'exterior_campus' | 'out_of_bounds';
  passed: boolean;
}

export interface DebugVerificationSummary {
  coreNodes: CoreNodeCheckResult[];
  fiberLengths: FiberLengthCheckResult[];
  racks: RackLocationCheckResult[];
  allPassed: boolean;
}

/**
 * Runs the 3 architectural/network verification checks required by ?debug=1.
 */
export function runDebugChecks(): DebugVerificationSummary {
  const coreNodes: CoreNodeCheckResult[] = CORE_NODES.map((node) => {
    if (node.id === 'N3') {
      const insideTower = pointInCircle(
        node.pos_cad,
        CONTROL_TOWER.center_cad,
        CONTROL_TOWER.coreOuterRadius,
      );
      return {
        nodeId: node.id,
        techRoomId: CONTROL_TOWER.id,
        passed: insideTower,
      };
    }
    const room = TECH_ROOMS.find((r) => r.nodeId === node.id);
    const passed = room
      ? pointInPolygon(node.pos_cad, rectToPolygon(room.inner))
      : false;
    return {
      nodeId: node.id,
      techRoomId: room?.id ?? 'missing',
      passed,
    };
  });

  const fiberLengths: FiberLengthCheckResult[] = (
    Object.values(FIBER_CABLES)
  ).map((cable) => {
    const calculated_m = polylineLength2D(cable.points_cad, cable.closed);
    const diffPercent =
      (Math.abs(calculated_m - cable.length_m) / cable.length_m) * 100;
    return {
      cableId: cable.id,
      calculated_m,
      spec_m: cable.length_m,
      diffPercent,
      passed: diffPercent <= 0.5,
    };
  });

  const racks: RackLocationCheckResult[] = DISTRIBUTION_RACKS.map((rack) => {
    const pt: CadPoint = [rack.x_cad, rack.y_cad];
    const buildingId = pointInsideAnyBuilding(pt);
    if (buildingId) {
      return {
        rackId: rack.id,
        buildingId,
        zoneType: 'indoor',
        passed: true,
      };
    }
    const inCampus =
      pt[0] >= CAMPUS_BOUNDS_CAD.minX - 5 &&
      pt[0] <= CAMPUS_BOUNDS_CAD.maxX + 5 &&
      pt[1] >= CAMPUS_BOUNDS_CAD.minY - 5 &&
      pt[1] <= CAMPUS_BOUNDS_CAD.maxY + 5;
    return {
      rackId: rack.id,
      buildingId: null,
      zoneType: inCampus ? 'exterior_campus' : 'out_of_bounds',
      passed: inCampus,
    };
  });

  const allPassed =
    coreNodes.every((c) => c.passed) &&
    fiberLengths.every((f) => f.passed) &&
    racks.every((r) => r.passed);

  return { coreNodes, fiberLengths, racks, allPassed };
}
