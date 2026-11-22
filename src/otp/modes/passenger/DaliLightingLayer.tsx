import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FLOORS } from '../../data/floors';
import type { CadPoint } from '../../lib/coords';
import { useAppStore, type DaliSceneMode } from '../../store/useAppStore';

const DALI_SCENE_STYLE: Record<
  DaliSceneMode,
  { color: string; intensity: number; scale: number }
> = {
  day: { color: '#F8FAFC', intensity: 0.75, scale: 1.0 },
  night: { color: '#FDE68A', intensity: 0.45, scale: 0.9 },
  cleaning: { color: '#FFFFFF', intensity: 1.2, scale: 1.15 },
  emergency: { color: '#F59E0B', intensity: 0.95, scale: 0.85 },
};

export function DaliLightingLayer() {
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const daliScene = useAppStore((s) => s.daliScene);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const fixtures = useMemo(() => {
    const list: { pos: CadPoint; floor: 'GF' | 'F1'; emergency: boolean }[] = [];
    if (focusedZoneId === 'departures') {
      for (let x = 12; x <= 78; x += 16) {
        for (let y = -16; y >= -196; y -= 22) {
          list.push({ pos: [x, y], floor: 'GF', emergency: (x + y) % 3 === 0 });
        }
      }
      for (let x = 44; x <= 82; x += 18) {
        for (let y = -95; y >= -195; y -= 25) {
          list.push({ pos: [x, y], floor: 'F1', emergency: x === 44 });
        }
      }
    } else if (focusedZoneId === 'pier') {
      for (let x = 128; x <= 400; x += 22) {
        for (const y of [-196, -205, -214]) {
          list.push({ pos: [x, y], floor: 'F1', emergency: y === -205 });
        }
      }
    } else if (focusedZoneId === 'arrivals') {
      for (let x = 48; x <= 110; x += 16) {
        for (let y = -345; y >= -420; y -= 18) {
          list.push({ pos: [x, y], floor: 'GF', emergency: x === 48 });
          list.push({ pos: [x, y], floor: 'F1', emergency: x === 48 });
        }
      }
    }
    return list;
  }, [focusedZoneId]);

  const activeFixtures = useMemo(
    () =>
      fixtures.filter((f) => {
        if (floorView !== 'BOTH' && f.floor !== floorView) return false;
        if (daliScene === 'emergency' && !f.emergency) return false;
        return true;
      }),
    [fixtures, floorView, daliScene],
  );

  const style = DALI_SCENE_STYLE[daliScene];
  const f1Elev =
    FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    activeFixtures.forEach((f, idx) => {
      const y = (f.floor === 'F1' ? f1Elev : FLOORS.GF.elevation_m) + 3.1;
      dummy.position.set(f.pos[0], y, -f.pos[1]);
      dummy.scale.set(style.scale * 2.2, 0.15, style.scale * 0.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [activeFixtures, f1Elev, style.scale]);

  if (activeFixtures.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, activeFixtures.length]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={style.color}
        emissive={style.color}
        emissiveIntensity={style.intensity}
      />
    </instancedMesh>
  );
}
