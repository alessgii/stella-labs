import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Billboard, Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ARRIVALS_DEVICES } from '../../data/devices';
import { cadToThreeTuple, type CadPoint } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

const DEPARTURES_SORTER_LOOP: readonly CadPoint[] = [
  [20, -56],
  [70, -56],
  [70, -62],
  [20, -62],
  [20, -56],
];

const ARRIVALS_LOOPS: readonly (readonly CadPoint[])[] = [
  [
    [55, -360],
    [72, -360],
    [72, -366],
    [55, -366],
    [55, -360],
  ],
  [
    [55, -385],
    [72, -385],
    [72, -391],
    [55, -391],
    [55, -385],
  ],
  [
    [55, -410],
    [72, -410],
    [72, -416],
    [55, -416],
    [55, -410],
  ],
];

export function BhsLayer() {
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const quality = useAppStore((s) => s.quality);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);
  const selectDevice = useAppStore((s) => s.selectDevice);

  const bagsMeshRef = useRef<THREE.InstancedMesh>(null);
  const tRef = useRef(0);

  const activeLoops = useMemo(() => {
    if (focusedZoneId === 'departures') return [DEPARTURES_SORTER_LOOP];
    if (focusedZoneId === 'arrivals') return ARRIVALS_LOOPS;
    return [];
  }, [focusedZoneId]);

  const plcDevices = useMemo(
    () =>
      ARRIVALS_DEVICES.filter(
        (d) =>
          d.subsystemId === 'bhs' &&
          (focusedZoneId === 'departures'
            ? d.buildingId === 'departures'
            : focusedZoneId === 'arrivals'
              ? d.buildingId === 'arrivals'
              : false),
      ),
    [focusedZoneId],
  );

  const bagCount = activeLoops.length * 8;

  useFrame(({ invalidate }, delta) => {
    const mesh = bagsMeshRef.current;
    if (!mesh || activeLoops.length === 0 || quality === 'low') return;
    tRef.current = (tRef.current + delta * 0.12) % 1;
    const dummy = new THREE.Object3D();
    let idx = 0;

    activeLoops.forEach((loop) => {
      const segs = loop.length - 1;
      for (let b = 0; b < 8; b += 1) {
        const u = ((tRef.current + b / 8) % 1) * segs;
        const sIdx = Math.min(segs - 1, Math.floor(u));
        const lt = u - sIdx;
        const p1 = loop[sIdx];
        const p2 = loop[sIdx + 1];
        const x = p1[0] + (p2[0] - p1[0]) * lt;
        const y = p1[1] + (p2[1] - p1[1]) * lt;
        dummy.position.set(x, 1.25, -y);
        dummy.scale.set(1.1, 0.7, 0.8);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  });

  if (activeLoops.length === 0) return null;

  return (
    <group name="bhs-baggage-layer">
      {/* Conveyor tracks */}
      {activeLoops.map((loop, idx) => (
        <Line
          key={`bhs-loop-${idx}`}
          points={loop.map((p) => cadToThreeTuple(p[0], p[1], 1.05))}
          color="#F59E0B"
          lineWidth={3.2}
        />
      ))}

      {/* Animated Luggage Instances */}
      {quality !== 'low' && (
        <instancedMesh ref={bagsMeshRef} args={[undefined, undefined, bagCount]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#D97706" roughness={0.5} />
        </instancedMesh>
      )}

      {/* Industrial PLC Cabinets & PROFINET Fiber Uplinks */}
      {plcDevices.map((plc) => {
        const selected = selectedDeviceId === plc.id;
        const pos = cadToThreeTuple(plc.pos_cad[0], plc.pos_cad[1], plc.elev_m);
        return (
          <group
            key={plc.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              selectDevice(plc.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <mesh>
              <boxGeometry args={[2.2, 2.2, 1.6]} />
              <meshStandardMaterial
                color={selected ? '#005AFF' : '#F59E0B'}
                emissive={selected ? '#005AFF' : '#F59E0B'}
                emissiveIntensity={selected ? 0.9 : 0.55}
              />
            </mesh>
            <Billboard position={[0, 2.6, 0]}>
              <Text
                fontSize={1.7}
                fontWeight={600}
                color="#FEF3C7"
                outlineWidth={0.3}
                outlineColor="#090D16"
              >
                {plc.id}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
