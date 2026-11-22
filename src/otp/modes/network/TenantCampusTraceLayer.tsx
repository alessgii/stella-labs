import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { CORE_NODES } from '../../data/nodes';
import { DISTRIBUTION_RACKS } from '../../data/racks';
import { cadToThreeTuple } from '../../lib/coords';
import { getInspectableSpace } from '../../lib/inspectableSpace';
import { useAppStore } from '../../store/useAppStore';

export function TenantCampusTraceLayer() {
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const tenantCampusTraceActive = useAppStore((s) => s.tenantCampusTraceActive);
  const language = useAppStore((s) => s.language);

  const pulseRef = useRef<THREE.Mesh>(null);
  const space = getInspectableSpace(focusedTenantId);

  const routeData = useMemo(() => {
    if (!space || !tenantCampusTraceActive) return null;

    const center = space.tenant?.center_cad ?? space.room?.center_cad ?? [0, 0];
    const elev = space.floor === 'F1' ? 6.2 : 0.6;
    const tenantPos = cadToThreeTuple(center[0], center[1], elev);
    const idf = DISTRIBUTION_RACKS.find((r) => r.id === space.idf);
    const coreId =
      space.coreNodeId ??
      (space.buildingId === 'ssei'
        ? 'N6'
        : space.buildingId === 'cargo'
          ? 'N4'
          : space.idf === 'R4_T' || space.idf === 'R5_T' || space.idf === 'R6_T'
            ? 'N5'
            : 'N1');
    const core = CORE_NODES.find((n) => n.id === coreId) ?? CORE_NODES[0];
    const corePos = cadToThreeTuple(core.pos_cad[0], core.pos_cad[1], 3.2);
    const idfPos = idf
      ? cadToThreeTuple(idf.x_cad, idf.y_cad, 2.8)
      : corePos;
    const ispPos =
      coreId === 'N1'
        ? cadToThreeTuple(core.pos_cad[0] - 42, core.pos_cad[1] - 28, 2.5)
        : cadToThreeTuple(core.pos_cad[0] + 45, core.pos_cad[1] - 25, 2.5);

    const points = [tenantPos, idfPos, corePos, ispPos];
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      false,
      'catmullrom',
      0.08,
    );

    return {
      tenantPos,
      idfPos,
      corePos,
      ispPos,
      coreId,
      points,
      curve,
      usesFiber: space.usesFiber,
    };
  }, [space, tenantCampusTraceActive]);

  useFrame(({ clock }) => {
    if (!routeData || !pulseRef.current) return;
    const t = (clock.getElapsedTime() * 0.32) % 1;
    pulseRef.current.position.copy(routeData.curve.getPointAt(t));
  });

  if (!space || !routeData) return null;

  return (
    <group name="tenant-campus-trace-layer">
      <Line
        points={[routeData.tenantPos, routeData.idfPos]}
        color={routeData.usesFiber ? '#F59E0B' : '#0EA5E9'}
        lineWidth={4}
      />
      <Line
        points={[routeData.idfPos, routeData.corePos, routeData.ispPos]}
        color="#10B981"
        lineWidth={4.5}
      />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[2.2, 14, 12]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
      <Html position={routeData.tenantPos} center>
        <div className="whitespace-nowrap rounded-full bg-slate-950/90 border border-sky-400/50 px-2.5 py-0.5 text-[12px] font-medium text-white">
          {space.name[language]}
        </div>
      </Html>
      <Html position={routeData.idfPos} center>
        <div className="whitespace-nowrap rounded-full bg-slate-950/90 border border-emerald-400/50 px-2.5 py-0.5 text-[12px] font-medium text-emerald-300">
          IDF {space.idf}
        </div>
      </Html>
      <Html position={routeData.corePos} center>
        <div className="whitespace-nowrap rounded-full bg-slate-950/90 border border-amber-400/50 px-2.5 py-0.5 text-[12px] font-medium text-amber-300">
          {routeData.coreId} ({space.vrf})
        </div>
      </Html>
      <Html position={routeData.ispPos} center>
        <div className="whitespace-nowrap rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[12px] font-semibold text-slate-950">
          {routeData.coreId === 'N1' ? 'ISP Operador A' : 'ISP Operador B'}
        </div>
      </Html>
    </group>
  );
}
