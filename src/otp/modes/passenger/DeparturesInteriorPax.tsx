import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { FLOORS } from '../../data/floors';
import { cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

/**
 * Lazy interior props for Departures (Salidas) in Passenger Lens:
 * Check-in desks, security lanes, shops, cafes, and domestic gate podiums.
 * Instanced only while focused inside Salidas.
 */
export function DeparturesInteriorPax() {
  const language = useAppStore((s) => s.language);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const desksRef = useRef<THREE.InstancedMesh>(null);
  const securityRef = useRef<THREE.InstancedMesh>(null);

  const showGF = floorView === 'GF' || floorView === 'BOTH';
  const showF1 = floorView === 'F1' || floorView === 'BOTH';
  const f1Elev =
    FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0);

  // 20 check-in desk modules (10 per island)
  useLayoutEffect(() => {
    const mesh = desksRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (const y of [-27.5, -47.5]) {
      for (let i = 0; i < 10; i += 1) {
        const x = 18 + i * 5.8;
        dummy.position.set(x, 0.7, -y);
        dummy.scale.set(2.4, 1.3, 3.6);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [showGF]);

  // 6 security screening arch/table lanes
  useLayoutEffect(() => {
    const mesh = securityRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 6; i += 1) {
      const y = -80 - i * 10;
      dummy.position.set(74, 0.9, -y);
      dummy.scale.set(8.0, 1.8, 2.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [showGF]);

  return (
    <group name="departures-interior-pax">
      {showGF && (
        <>
          <instancedMesh ref={desksRef} args={[undefined, undefined, 20]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FDE68A" roughness={0.6} />
          </instancedMesh>

          <instancedMesh ref={securityRef} args={[undefined, undefined, 6]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#60A5FA" roughness={0.5} />
          </instancedMesh>

          {/* Assistance & Information kiosks */}
          <mesh position={cadToThreeTuple(66, -186, 0.8)} castShadow>
            <boxGeometry args={[6, 1.6, 4]} />
            <meshStandardMaterial color="#38BDF8" />
          </mesh>
          <mesh position={cadToThreeTuple(58, -162, 0.9)} castShadow>
            <cylinderGeometry args={[2.2, 2.2, 1.8, 16]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>

          {/* Domestic gate podiums 50-57 */}
          {[16, 34, 52, 70].map((gx, i) => (
            <group key={`dom-podium-${gx}`} position={cadToThreeTuple(gx, -5, 0.8)}>
              <mesh>
                <boxGeometry args={[4.2, 1.6, 2.0]} />
                <meshStandardMaterial color="#FFF212" />
              </mesh>
              <Text
                position={[0, 1.8, 0]}
                fontSize={2.2}
                fontWeight={600}
                color="#1E293B"
              >
                {`${50 + i * 2}/${51 + i * 2}`}
              </Text>
            </group>
          ))}

          {/* Cafe & Shop counters */}
          <mesh position={cadToThreeTuple(9, -88, 0.7)}>
            <boxGeometry args={[5, 1.4, 8]} />
            <meshStandardMaterial color="#64C67C" />
          </mesh>
          <mesh position={cadToThreeTuple(26, -9, 0.7)}>
            <boxGeometry args={[12, 1.4, 3]} />
            <meshStandardMaterial color="#F37B7E" />
          </mesh>
        </>
      )}

      {showF1 && (
        <group position={[0, f1Elev, 0]}>
          {/* F1 Panoramic Restaurant tables & transfer counter */}
          <mesh position={cadToThreeTuple(62, -104, 0.7)}>
            <boxGeometry args={[16, 1.4, 8]} />
            <meshStandardMaterial color="#64C67C" />
          </mesh>
          <mesh position={cadToThreeTuple(47, -138, 0.7)}>
            <boxGeometry args={[8, 1.4, 5]} />
            <meshStandardMaterial color="#FDE68A" />
          </mesh>
          <Text
            position={cadToThreeTuple(62, -104, 2.2)}
            fontSize={2.6}
            fontWeight={600}
            color="#15803D"
          >
            {language === 'es' ? 'Restaurante P1' : 'F1 Restaurant'}
          </Text>
        </group>
      )}
    </group>
  );
}
