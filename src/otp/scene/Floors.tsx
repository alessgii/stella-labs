import { useMemo } from 'react';
import * as THREE from 'three';
import { FLOORS, FLOOR_SLABS } from '../data/floors';
import { resolveNavigableZoneId } from '../data/lodZones';
import { cadPolygonToShape } from '../lib/coords';
import { useAppStore } from '../store/useAppStore';

export function Floors() {
  const mode = useAppStore((s) => s.mode);
  const floorView = useAppStore((s) => s.floorView);
  const ghostOtherFloor = useAppStore((s) => s.ghostOtherFloor);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const xrayOpacity = useAppStore((s) => s.xrayOpacity);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);

  const isNetwork = mode === 'network';

  const slabGeometries = useMemo(
    () =>
      FLOOR_SLABS.map((slab) => ({
        ...slab,
        geometry: new THREE.ShapeGeometry(cadPolygonToShape(slab.polygon)),
      })),
    [],
  );

  return (
    <group name="campus-floors">
      {slabGeometries.map((slab) => {
        const isF1 = slab.floor === 'F1';
        const slabZone = resolveNavigableZoneId(slab.buildingId);
        const isDimmedNeighbor =
          focusedZoneId !== null &&
          focusedZoneId !== 'airside' &&
          focusedZoneId !== 'perimeter' &&
          slabZone !== focusedZoneId;

        let visible = true;
        let opacity = 1;

        if (!isNetwork) {
          if (floorView === 'GF' && isF1) {
            visible = ghostOtherFloor;
            opacity = 0.14;
          } else if (floorView === 'F1' && !isF1) {
            visible = ghostOtherFloor;
            opacity = 0.14;
          }
          if (isDimmedNeighbor) {
            opacity = Math.min(opacity, 0.18);
          }
        } else {
          opacity = isF1 ? Math.max(0.12, xrayOpacity * 0.6) : 0.35;
          if (isDimmedNeighbor) {
            opacity = Math.min(opacity, 0.08);
          }
        }

        if (!visible) return null;

        const yPos =
          FLOORS[slab.floor].elevation_m +
          (isF1 && floorView === 'BOTH' ? explodedOffset : 0) +
          (isF1 ? 0 : 0.01);

        const isGhosted = opacity < 0.99;

        return (
          <mesh
            key={slab.id}
            geometry={slab.geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, yPos, 0]}
            receiveShadow={!isNetwork && !isGhosted}
          >
            <meshStandardMaterial
              color={
                isNetwork
                  ? isF1
                    ? '#1E293B'
                    : '#151E2E'
                  : isF1
                    ? '#F4F6F9'
                    : '#F9FAFB'
              }
              roughness={0.85}
              transparent={isGhosted}
              opacity={opacity}
              depthWrite={!isGhosted}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
