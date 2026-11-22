import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { FIBER_CABLES, type FiberCableSpec } from '../../data/fiber';
import {
  DEFAULT_FIBER_ELEVATIONS,
  TRENCH_FIBER_ELEVATIONS,
  buildElevatedFiberPoints,
  buildFiberSegments,
  type FiberElevations,
} from '../../lib/curves';
import { useAppStore } from '../../store/useAppStore';

const UP_AXIS = new THREE.Vector3(0, 1, 0);

function getCableDisplayColor(cable: FiberCableSpec, itOtLens: boolean): string {
  if (!itOtLens) return cable.color;
  if (cable.id === 'NUCLEO_ANILLO1_RUTA_A') return '#EF4444';
  if (cable.id === 'NUCLEO_ANILLO2_RUTA_B') return '#6366F1';
  if (cable.id === 'DISTRIB_TERMINAL') return '#6366F1';
  return '#F97316';
}

function CoreTubeCable({
  cable,
  displayColor,
  elevations,
  onInspect,
}: {
  cable: FiberCableSpec;
  displayColor: string;
  elevations: FiberElevations;
  onInspect: () => void;
}) {
  const { points3D, segments } = useMemo(() => {
    const pts = buildElevatedFiberPoints(cable.points_cad, cable.closed, elevations);
    return {
      points3D: pts,
      segments: buildFiberSegments(pts),
    };
  }, [cable, elevations]);

  const radius = 0.65;

  const segmentTransforms = useMemo(() => {
    const dir = new THREE.Vector3();
    return segments.map((seg) => {
      dir.subVectors(seg.end, seg.start).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(UP_AXIS, dir);
      const mid = new THREE.Vector3()
        .addVectors(seg.start, seg.end)
        .multiplyScalar(0.5);
      return {
        ...seg,
        mid: [mid.x, mid.y, mid.z] as [number, number, number],
        quat,
      };
    });
  }, [segments]);

  return (
    <group
      name={`cable-${cable.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onInspect();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {segmentTransforms.map((seg) => (
        <mesh
          key={`${cable.id}-seg-${seg.index}`}
          position={seg.mid}
          quaternion={seg.quat}
        >
          <cylinderGeometry args={[radius, radius, seg.length, 10]} />
          <meshStandardMaterial
            color={displayColor}
            emissive={displayColor}
            emissiveIntensity={0.65}
            roughness={0.35}
          />
        </mesh>
      ))}
      {points3D.map((pt, idx) => (
        <mesh key={`${cable.id}-joint-${idx}`} position={[pt.x, pt.y, pt.z]}>
          <sphereGeometry args={[radius * 1.15, 10, 10]} />
          <meshStandardMaterial
            color={displayColor}
            emissive={displayColor}
            emissiveIntensity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function DistributionDashedCable({
  cable,
  displayColor,
  elevations,
  onInspect,
}: {
  cable: FiberCableSpec;
  displayColor: string;
  elevations: FiberElevations;
  onInspect: () => void;
}) {
  const linePoints = useMemo(() => {
    const pts = buildElevatedFiberPoints(cable.points_cad, cable.closed, elevations);
    return pts.map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [cable, elevations]);

  return (
    <Line
      points={linePoints}
      color={displayColor}
      lineWidth={2.5}
      dashed
      dashSize={6}
      gapSize={3.5}
      onClick={(e) => {
        e.stopPropagation();
        onInspect();
      }}
    />
  );
}

export function FiberLayer() {
  const itOtLens = useAppStore((s) => s.itOtLens);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const networkLayers = useAppStore((s) => s.networkLayers);
  const trenchView = useAppStore((s) => s.trenchView);
  const threeLayerView = useAppStore((s) => s.threeLayerView);
  const setInspectedElement = useAppStore((s) => s.setInspectedElement);

  const cables = useMemo(() => Object.values(FIBER_CABLES), []);

  return (
    <group name="network-fiber-layer">
      {cables.map((cable) => {
        if (!networkLayers.cables[cable.id]) return null;
        // When inspecting the Passenger Pier, hide core rings, perimeter, cargo, and airside cables; keep only Terminal ring
        if (focusedZoneId === 'pier' && cable.id !== 'DISTRIB_TERMINAL') return null;
        const displayColor = getCableDisplayColor(cable, itOtLens);
        const elevations: FiberElevations = threeLayerView
          ? cable.layer === 'core'
            ? { indoor: 26, outdoor: 26 }
            : { indoor: 13, outdoor: 13 }
          : trenchView
            ? TRENCH_FIBER_ELEVATIONS
            : DEFAULT_FIBER_ELEVATIONS;

        const onInspect = () =>
          setInspectedElement({ kind: 'cable', id: cable.id });

        return cable.layer === 'core' ? (
          <CoreTubeCable
            key={cable.id}
            cable={cable}
            displayColor={displayColor}
            elevations={elevations}
            onInspect={onInspect}
          />
        ) : (
          <DistributionDashedCable
            key={cable.id}
            cable={cable}
            displayColor={displayColor}
            elevations={elevations}
            onInspect={onInspect}
          />
        );
      })}
    </group>
  );
}
