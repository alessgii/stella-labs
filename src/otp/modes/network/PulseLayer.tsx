import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FIBER_CABLES, type FiberCableSpec } from '../../data/fiber';
import {
  DEFAULT_FIBER_ELEVATIONS,
  TRENCH_FIBER_ELEVATIONS,
  buildElevatedFiberPoints,
} from '../../lib/curves';
import { useAppStore } from '../../store/useAppStore';

const PULSES_PER_ROUTE = 8;

interface RouteArcTable {
  cable: FiberCableSpec;
  points: THREE.Vector3[];
  cumLengths: number[];
  totalLength: number;
}

function buildArcTable(points: THREE.Vector3[], cable: FiberCableSpec): RouteArcTable {
  const cumLengths: number[] = [0];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += points[i].distanceTo(points[i - 1]);
    cumLengths.push(total);
  }
  return { cable, points, cumLengths, totalLength: Math.max(1, total) };
}

function sampleArcPoint(
  table: RouteArcTable,
  u: number,
  out: THREE.Vector3,
): void {
  const target = ((u % 1) + 1) % 1 * table.totalLength;
  const { cumLengths, points } = table;
  let lo = 0;
  let hi = cumLengths.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cumLengths[mid] <= target) lo = mid;
    else hi = mid;
  }
  const segStart = cumLengths[lo];
  const segLen = Math.max(1e-4, cumLengths[lo + 1] - segStart);
  const t = (target - segStart) / segLen;
  out.lerpVectors(points[lo], points[lo + 1], t);
}

export function PulseLayer() {
  const showPulses = useAppStore((s) => s.showPulses);
  const pulsesRunning = useAppStore((s) => s.pulsesRunning);
  const pulseSpeed = useAppStore((s) => s.pulseSpeed);
  const networkLayers = useAppStore((s) => s.networkLayers);
  const trenchView = useAppStore((s) => s.trenchView);
  const threeLayerView = useAppStore((s) => s.threeLayerView);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const activeFailureId = useAppStore((s) => s.activeFailureId);

  const meshRefs = useRef<Record<string, THREE.InstancedMesh | null>>({});
  const phaseRef = useRef(0);

  const routeTables = useMemo(() => {
    const baseElev = trenchView ? TRENCH_FIBER_ELEVATIONS : DEFAULT_FIBER_ELEVATIONS;
    return Object.values(FIBER_CABLES).map((cable) => {
      const layerY = threeLayerView
        ? cable.layer === 'core'
          ? { indoor: 26, outdoor: 26 }
          : { indoor: 13, outdoor: 13 }
        : baseElev;
      const pts = buildElevatedFiberPoints(cable.points_cad, cable.closed, layerY);
      return buildArcTable(pts, cable);
    });
  }, [trenchView, threeLayerView]);

  useFrame(({ invalidate }, delta) => {
    if (!showPulses) return;
    if (pulsesRunning) {
      phaseRef.current = (phaseRef.current + delta * 0.08 * pulseSpeed) % 100;
      invalidate();
    }

    const dummy = new THREE.Object3D();
    const tmpPos = new THREE.Vector3();

    routeTables.forEach((table) => {
      const mesh = meshRefs.current[table.cable.id];
      if (!mesh) return;

      const visible =
        networkLayers.cables[table.cable.id] &&
        !(focusedZoneId === 'pier' && table.cable.id !== 'DISTRIB_TERMINAL') &&
        !(activeFailureId === 'F3' && table.cable.id === 'NUCLEO_ANILLO1_RUTA_A');

      // Ring 1 = Clockwise (+1), Ring 2 = Counter-Clockwise (-1)
      // F1/F2 reverses ring direction via ERPS
      let dir = table.cable.id === 'NUCLEO_ANILLO2_RUTA_B' ? -1 : 1;
      if (
        (activeFailureId === 'F1' || activeFailureId === 'F2') &&
        table.cable.id === 'NUCLEO_ANILLO1_RUTA_A'
      ) {
        dir = -1;
      }
      if (activeFailureId === 'F2' && table.cable.id === 'NUCLEO_ANILLO2_RUTA_B') {
        dir = 1;
      }

      for (let i = 0; i < PULSES_PER_ROUTE; i += 1) {
        if (!visible) {
          dummy.position.set(0, -500, 0);
          dummy.scale.setScalar(0.01);
        } else {
          const offset = i / PULSES_PER_ROUTE;
          const u = phaseRef.current * dir + offset;
          sampleArcPoint(table, u, tmpPos);
          dummy.position.copy(tmpPos);
          dummy.scale.setScalar(table.cable.layer === 'core' ? 1.55 : 1.15);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  if (!showPulses) return null;

  return (
    <group name="network-optical-pulses">
      {routeTables.map(({ cable }) => (
        <instancedMesh
          key={`pulse-${cable.id}`}
          ref={(el) => {
            meshRefs.current[cable.id] = el;
          }}
          args={[undefined, undefined, PULSES_PER_ROUTE]}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={cable.color}
            emissiveIntensity={1.6}
          />
        </instancedMesh>
      ))}
    </group>
  );
}
