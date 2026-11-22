import { FLOORS } from '../data/floors';
import {
  WALK_EDGES,
  WALK_NODES,
  type WalkConnectorType,
  type WalkNode,
} from '../data/walkGraph';
import type { CadPoint } from './coords';

export const WALK_SPEED_MPS = 1.3;

export interface RouteStep {
  fromNodeId: string;
  toNodeId: string;
  connector: WalkConnectorType;
  distance_m: number;
  duration_s: number;
  floorFrom: 'GF' | 'F1';
  floorTo: 'GF' | 'F1';
  instruction: { es: string; en: string };
}

export interface WalkRouteResult {
  found: boolean;
  accessibleOnly: boolean;
  nodeIds: string[];
  points: { pos_cad: CadPoint; floor: 'GF' | 'F1' }[];
  steps: RouteStep[];
  totalDistance_m: number;
  totalDuration_s: number;
}

const NODE_MAP = new Map<string, WalkNode>(WALK_NODES.map((n) => [n.id, n]));

function edgeCostSeconds(
  a: WalkNode,
  b: WalkNode,
  connector: WalkConnectorType,
  extraSeconds = 0,
): { distance_m: number; duration_s: number } {
  const dz = FLOORS[b.floor].elevation_m - FLOORS[a.floor].elevation_m;
  const dist2d = Math.hypot(b.pos_cad[0] - a.pos_cad[0], b.pos_cad[1] - a.pos_cad[1]);
  const distance_m = Math.hypot(dist2d, dz);
  const walkTime = distance_m / WALK_SPEED_MPS;
  const connectorPenalty =
    extraSeconds ||
    (connector === 'escalator' ? 20 : connector === 'elevator' ? 40 : connector === 'stairs' ? 25 : 0);
  return {
    distance_m,
    duration_s: walkTime + connectorPenalty,
  };
}

function buildInstruction(
  _from: WalkNode,
  to: WalkNode,
  connector: WalkConnectorType,
  dist_m: number,
): { es: string; en: string } {
  const rounded = Math.max(1, Math.round(dist_m));
  if (connector === 'elevator') {
    const dirEs = to.floor === 'F1' ? 'Sube' : 'Baja';
    const dirEn = to.floor === 'F1' ? 'Take the elevator up' : 'Take the elevator down';
    const floorEs = to.floor === 'F1' ? 'al Primer Piso' : 'a Planta Baja';
    const floorEn = to.floor === 'F1' ? 'to First Floor' : 'to Ground Floor';
    return {
      es: `${dirEs} por el elevador ${floorEs}`,
      en: `${dirEn} ${floorEn}`,
    };
  }
  if (connector === 'escalator') {
    const dirEs = to.floor === 'F1' ? 'Sube' : 'Baja';
    const dirEn = to.floor === 'F1' ? 'Take the escalator up' : 'Take the escalator down';
    const floorEs = to.floor === 'F1' ? 'al Primer Piso' : 'a Planta Baja';
    const floorEn = to.floor === 'F1' ? 'to First Floor' : 'to Ground Floor';
    return {
      es: `${dirEs} por la escalera eléctrica ${floorEs}`,
      en: `${dirEn} ${floorEn}`,
    };
  }
  if (connector === 'stairs') {
    const dirEs = to.floor === 'F1' ? 'Sube' : 'Baja';
    const dirEn = to.floor === 'F1' ? 'Take the stairs up' : 'Take the stairs down';
    return {
      es: `${dirEs} por las escaleras hacia ${to.label.es}`,
      en: `${dirEn} to ${to.label.en}`,
    };
  }
  return {
    es: `Camina ${rounded} m hacia ${to.label.es}`,
    en: `Walk ${rounded} m toward ${to.label.en}`,
  };
}

export function findClosestWalkNode(pos_cad: CadPoint, floor: 'GF' | 'F1'): WalkNode {
  let best: WalkNode = WALK_NODES[0];
  let bestDist = Infinity;
  for (const n of WALK_NODES) {
    const floorPenalty = n.floor === floor ? 0 : 1000;
    const d = Math.hypot(n.pos_cad[0] - pos_cad[0], n.pos_cad[1] - pos_cad[1]) + floorPenalty;
    if (d < bestDist) {
      bestDist = d;
      best = n;
    }
  }
  return best;
}

/**
 * A* shortest-time pedestrian pathfinding across GF & F1.
 * When accessibleOnly = true, avoids stairs and escalators (uses elevators/ramps).
 */
export function findWalkRoute(
  startNodeId: string,
  goalNodeId: string,
  accessibleOnly = false,
): WalkRouteResult {
  const empty: WalkRouteResult = {
    found: false,
    accessibleOnly,
    nodeIds: [],
    points: [],
    steps: [],
    totalDistance_m: 0,
    totalDuration_s: 0,
  };

  const startNode = NODE_MAP.get(startNodeId);
  const goalNode = NODE_MAP.get(goalNodeId);
  if (!startNode || !goalNode) return empty;

  if (startNodeId === goalNodeId) {
    return {
      found: true,
      accessibleOnly,
      nodeIds: [startNodeId],
      points: [{ pos_cad: startNode.pos_cad, floor: startNode.floor }],
      steps: [],
      totalDistance_m: 0,
      totalDuration_s: 0,
    };
  }

  // Build bidirectional adjacency list filtered by accessibility
  const adj = new Map<
    string,
    { to: string; connector: WalkConnectorType; extraSeconds?: number }[]
  >();
  for (const e of WALK_EDGES) {
    if (accessibleOnly && !e.accessible) continue;
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from)!.push({ to: e.to, connector: e.connector, extraSeconds: e.extraSeconds });
    adj.get(e.to)!.push({ to: e.from, connector: e.connector, extraSeconds: e.extraSeconds });
  }

  const heuristic = (id: string) => {
    const n = NODE_MAP.get(id)!;
    const d = Math.hypot(
      n.pos_cad[0] - goalNode.pos_cad[0],
      n.pos_cad[1] - goalNode.pos_cad[1],
    );
    return d / WALK_SPEED_MPS;
  };

  const open = new Set<string>([startNodeId]);
  const cameFrom = new Map<string, { prev: string; connector: WalkConnectorType; distance_m: number; duration_s: number }>();
  const gScore = new Map<string, number>([[startNodeId, 0]]);
  const fScore = new Map<string, number>([[startNodeId, heuristic(startNodeId)]]);

  while (open.size > 0) {
    let current = '';
    let bestF = Infinity;
    for (const id of open) {
      const f = fScore.get(id) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        current = id;
      }
    }

    if (current === goalNodeId) {
      const nodeIds: string[] = [current];
      const steps: RouteStep[] = [];
      let totalDistance_m = 0;
      let totalDuration_s = 0;

      let curr = current;
      while (cameFrom.has(curr)) {
        const edge = cameFrom.get(curr)!;
        const fromNode = NODE_MAP.get(edge.prev)!;
        const toNode = NODE_MAP.get(curr)!;
        steps.unshift({
          fromNodeId: edge.prev,
          toNodeId: curr,
          connector: edge.connector,
          distance_m: edge.distance_m,
          duration_s: edge.duration_s,
          floorFrom: fromNode.floor,
          floorTo: toNode.floor,
          instruction: buildInstruction(fromNode, toNode, edge.connector, edge.distance_m),
        });
        totalDistance_m += edge.distance_m;
        totalDuration_s += edge.duration_s;
        nodeIds.unshift(edge.prev);
        curr = edge.prev;
      }

      const points = nodeIds.map((id) => {
        const n = NODE_MAP.get(id)!;
        return { pos_cad: n.pos_cad, floor: n.floor };
      });

      return {
        found: true,
        accessibleOnly,
        nodeIds,
        points,
        steps,
        totalDistance_m,
        totalDuration_s,
      };
    }

    open.delete(current);
    const currNode = NODE_MAP.get(current)!;
    const neighbors = adj.get(current) ?? [];

    for (const nb of neighbors) {
      const nbNode = NODE_MAP.get(nb.to);
      if (!nbNode) continue;
      const { distance_m, duration_s } = edgeCostSeconds(
        currNode,
        nbNode,
        nb.connector,
        nb.extraSeconds,
      );
      const tentativeG = (gScore.get(current) ?? Infinity) + duration_s;
      if (tentativeG < (gScore.get(nb.to) ?? Infinity)) {
        cameFrom.set(nb.to, {
          prev: current,
          connector: nb.connector,
          distance_m,
          duration_s,
        });
        gScore.set(nb.to, tentativeG);
        fScore.set(nb.to, tentativeG + heuristic(nb.to));
        open.add(nb.to);
      }
    }
  }

  return empty;
}
