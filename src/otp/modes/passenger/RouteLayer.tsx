import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { FLOORS } from '../../data/floors';
import { POIS } from '../../data/poi';
import { findWalkRoute } from '../../lib/pathfinding';
import { useAppStore } from '../../store/useAppStore';

export function RouteLayer() {
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const routeOriginId = useAppStore((s) => s.routeOriginId);
  const routeTargetId = useAppStore((s) => s.routeTargetId);
  const accessibleRoute = useAppStore((s) => s.accessibleRoute);

  const walkerRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  const f1Elev =
    FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0);

  const route = useMemo(() => {
    if (!routeTargetId) return null;
    const orig = POIS.find((p) => p.id === routeOriginId);
    const dest = POIS.find((p) => p.id === routeTargetId);
    if (!orig?.walkNodeId || !dest?.walkNodeId) return null;
    return findWalkRoute(orig.walkNodeId, dest.walkNodeId, accessibleRoute);
  }, [routeOriginId, routeTargetId, accessibleRoute]);

  const points3D = useMemo(() => {
    if (!route || !route.found) return [];
    return route.points.map((pt) => {
      const y = (pt.floor === 'F1' ? f1Elev : FLOORS.GF.elevation_m) + 0.65;
      return new THREE.Vector3(pt.pos_cad[0], y, -pt.pos_cad[1]);
    });
  }, [route, f1Elev]);

  const lineTuples = useMemo(
    () => points3D.map((v) => [v.x, v.y, v.z] as [number, number, number]),
    [points3D],
  );

  useFrame(({ invalidate }, delta) => {
    if (!walkerRef.current || points3D.length < 2) return;
    progressRef.current = (progressRef.current + delta * 0.14) % 1;
    const totalSegs = points3D.length - 1;
    const scaled = progressRef.current * totalSegs;
    const idx = Math.min(totalSegs - 1, Math.floor(scaled));
    const localT = scaled - idx;
    walkerRef.current.position.lerpVectors(points3D[idx], points3D[idx + 1], localT);
    invalidate();
  });

  if (!route || !route.found || lineTuples.length < 2) return null;

  const startPos = lineTuples[0];
  const endPos = lineTuples[lineTuples.length - 1];

  return (
    <group name="passenger-route-layer">
      <Line points={lineTuples} color="#005AFF" lineWidth={4.2} />
      {/* Origin pin */}
      <mesh position={startPos}>
        <sphereGeometry args={[2.2, 14, 14]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
      {/* Destination pin */}
      <mesh position={endPos}>
        <sphereGeometry args={[2.5, 14, 14]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Animated walker sphere */}
      <mesh ref={walkerRef} position={startPos}>
        <sphereGeometry args={[2.0, 14, 14]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#005AFF"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
