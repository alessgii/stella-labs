import * as THREE from 'three';

export type CadPoint = readonly [number, number];

export const CAMPUS_BOUNDS_CAD = {
  minX: -60,
  maxX: 615,
  minY: -516,
  maxY: 150,
  width: 675,
  height: 666,
} as const;

export const CAMPUS_CENTER_CAD: CadPoint = [280, -180];

export const CAMPUS_CENTER_THREE = {
  x: 280,
  y: 0,
  z: 180,
} as const;

/**
 * Converts a 2D CAD coordinate (meters 1:1, +X East, +Y North) and elevation
 * into Three.js Y-up coordinates (+X East, +Y Up, +Z South).
 */
export function cadToThree(x_cad: number, y_cad: number, y_elev = 0): THREE.Vector3 {
  return new THREE.Vector3(x_cad, y_elev, -y_cad);
}

/**
 * Tuple variant of cadToThree for React Three Fiber props and lightweight math.
 */
export function cadToThreeTuple(
  x_cad: number,
  y_cad: number,
  y_elev = 0,
): [number, number, number] {
  return [x_cad, y_elev, -y_cad];
}

/**
 * Inverse transform from Three.js XZ ground plane back to 2D CAD coordinates.
 */
export function threeToCad(x: number, z: number): CadPoint {
  return [x, -z];
}

/**
 * Builds a THREE.Shape in 2D CAD coordinates.
 * Meshes extruded from this shape MUST be rotated by [-Math.PI / 2, 0, 0]
 * so shape.y maps to -z (matching cadToThree).
 */
export function cadPolygonToShape(
  outer: readonly CadPoint[],
  holes: readonly (readonly CadPoint[])[] = [],
): THREE.Shape {
  const shape = new THREE.Shape();
  if (outer.length === 0) return shape;

  shape.moveTo(outer[0][0], outer[0][1]);
  for (let i = 1; i < outer.length; i += 1) {
    shape.lineTo(outer[i][0], outer[i][1]);
  }
  shape.closePath();

  for (const holePts of holes) {
    if (holePts.length === 0) continue;
    const hole = new THREE.Path();
    hole.moveTo(holePts[0][0], holePts[0][1]);
    for (let i = 1; i < holePts.length; i += 1) {
      hole.lineTo(holePts[i][0], holePts[i][1]);
    }
    hole.closePath();
    shape.holes.push(hole);
  }

  return shape;
}
