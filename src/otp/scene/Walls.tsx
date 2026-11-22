import { useMemo } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import type { CadPoint } from '../lib/coords';
import { cadPolygonToShape } from '../lib/coords';

export interface DoubleWallProps {
  outer: readonly CadPoint[];
  inner?: readonly CadPoint[];
  height: number;
  elevation?: number;
  color: string;
  edgeColor: string;
  opacity?: number;
  transparent?: boolean;
  showEdges?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * Renders hollow double-walled architectural geometry by extruding a THREE.Shape
 * with an interior hole in CAD coordinates and rotating -PI/2 around X.
 */
export function DoubleWall({
  outer,
  inner,
  height,
  elevation = 0,
  color,
  edgeColor,
  opacity = 1,
  transparent = false,
  showEdges = true,
  castShadow = true,
  receiveShadow = true,
}: DoubleWallProps) {
  const geometry = useMemo(() => {
    const holes = inner ? [inner] : [];
    const shape = cadPolygonToShape(outer, holes);
    return new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
      curveSegments: 1,
    });
  }, [outer, inner, height]);

  const isTransparent = transparent || opacity < 0.99;

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, elevation, 0]}
      castShadow={castShadow && !isTransparent}
      receiveShadow={receiveShadow}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={0.05}
        transparent={isTransparent}
        opacity={opacity}
        depthWrite={!isTransparent}
      />
      {showEdges && <Edges threshold={15} color={edgeColor} />}
    </mesh>
  );
}
