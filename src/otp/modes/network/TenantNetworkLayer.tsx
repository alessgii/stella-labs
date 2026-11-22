import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Line, Text } from '@react-three/drei';
import { FLOORS } from '../../data/floors';
import { CORE_NODES } from '../../data/nodes';
import { DISTRIBUTION_RACKS } from '../../data/racks';
import { getTenantById, TENANT_TIER_SPECS } from '../../data/tenants';
import { cadToThree, cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

export function TenantNetworkLayer() {
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const language = useAppStore((s) => s.language);
  const tenantIsolationTestTick = useAppStore((s) => s.tenantIsolationTestTick);

  const tenant = focusedTenantId ? getTenantById(focusedTenantId) : undefined;
  const pulseRef = useRef<THREE.Mesh>(null);
  const [isoAnimProgress, setIsoAnimProgress] = useState<number | null>(null);
  const prevIsoTick = useRef(tenantIsolationTestTick);

  useEffect(() => {
    if (tenantIsolationTestTick > prevIsoTick.current) {
      prevIsoTick.current = tenantIsolationTestTick;
      setIsoAnimProgress(0);
    }
  }, [tenantIsolationTestTick]);

  const geometryData = useMemo(() => {
    if (!tenant) return null;

    const isF1 = tenant.floor === 'F1';
    const baseElev = isF1
      ? FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0)
      : FLOORS.GF.elevation_m;

    const xs = tenant.footprint_cad.map((p) => p[0]);
    const ys = tenant.footprint_cad.map((p) => p[1]);
    const width = Math.max(4, Math.max(...xs) - Math.min(...xs));
    const depth = Math.max(4, Math.max(...ys) - Math.min(...ys));

    const centerThree = cadToThree(tenant.center_cad[0], tenant.center_cad[1], baseElev + 0.15);
    const demarcLocal: [number, number, number] = [width * 0.34, 1.35, -depth * 0.36];
    const switchLocal: [number, number, number] = [width * 0.18, 1.35, -depth * 0.36];

    const endpoints: { id: string; label: string; pos: [number, number, number]; color: string }[] = [
      { id: 'POS', label: 'POS', pos: [width * 0.2, 1.05, 0.1], color: '#10B981' },
      { id: 'AP', label: 'Wi-Fi AP', pos: [0, 2.5, 0], color: '#38BDF8' },
      { id: 'CAM', label: 'CCTV', pos: [-width * 0.36, 2.4, -depth * 0.36], color: '#F43F5E' },
      { id: 'DISP', label: 'Display', pos: [0, 1.65, -depth * 0.4], color: '#A855F7' },
    ];
    if (
      tenant.template === 'sala-vip' ||
      tenant.template === 'mostrador-aerolinea' ||
      tenant.template === 'cambio'
    ) {
      endpoints.push({
        id: 'PC',
        label: 'PC / Impresora',
        pos: [-width * 0.24, 1.05, depth * 0.16],
        color: '#FBBF24',
      });
    }

    const demarcWorld: [number, number, number] = [
      centerThree.x + demarcLocal[0],
      centerThree.y + demarcLocal[1],
      centerThree.z + demarcLocal[2],
    ];

    const idfRack = DISTRIBUTION_RACKS.find((r) => r.id === tenant.idf);
    const idfWorld = idfRack
      ? cadToThreeTuple(idfRack.x_cad, idfRack.y_cad, 2.8)
      : ([demarcWorld[0], 2.8, demarcWorld[2]] as [number, number, number]);

    // Orthogonal cable-tray path from tenant demarc -> IDF
    const trayY = baseElev + 3.2;
    const trayPath: [number, number, number][] = [
      demarcWorld,
      [demarcWorld[0], trayY, demarcWorld[2]],
      [idfWorld[0], trayY, demarcWorld[2]],
      [idfWorld[0], trayY, idfWorld[2]],
      idfWorld,
    ];

    // Core exit node (N1 for Salidas / R1_T..R3_T, N5 for Pier/Arrivals / R4_T..R6_T)
    const coreId =
      tenant.idf === 'R4_T' || tenant.idf === 'R5_T' || tenant.idf === 'R6_T' ? 'N5' : 'N1';
    const coreNode = CORE_NODES.find((n) => n.id === coreId) ?? CORE_NODES[0];
    const coreWorld = cadToThreeTuple(coreNode.pos_cad[0], coreNode.pos_cad[1], 3.0);

    // ISP exit point outside building
    const ispWorld: [number, number, number] =
      coreId === 'N1'
        ? cadToThreeTuple(coreNode.pos_cad[0] - 26, coreNode.pos_cad[1] - 18, 2.5)
        : cadToThreeTuple(coreNode.pos_cad[0] + 28, coreNode.pos_cad[1] - 16, 2.5);

    const uplinkToIspPath: [number, number, number][] = [idfWorld, coreWorld, ispWorld];

    // Blocked isolation path: POS -> Demarc -> IDF -> Core (blocked here against VRF-AGL)
    const posWorld: [number, number, number] = [
      centerThree.x + width * 0.2,
      centerThree.y + 1.05,
      centerThree.z + 0.1,
    ];
    const isoPoints = [posWorld, demarcWorld, idfWorld, coreWorld].map(
      (p) => new THREE.Vector3(p[0], p[1], p[2]),
    );
    const isoCurve = new THREE.CatmullRomCurve3(isoPoints, false, 'catmullrom', 0.05);

    const tierSpec = TENANT_TIER_SPECS[tenant.tier];
    const usesFiber = tierSpec.dedicatedFiber || tenant.trayDistance_m > 90;

    return {
      centerThree,
      width,
      depth,
      demarcLocal,
      switchLocal,
      endpoints,
      trayPath,
      uplinkToIspPath,
      coreWorld,
      coreId,
      ispWorld,
      isoCurve,
      usesFiber,
      footprintPts: [...tenant.footprint_cad, tenant.footprint_cad[0]].map((p) =>
        cadToThreeTuple(p[0], p[1], baseElev + 0.18),
      ),
    };
  }, [tenant, floorView, explodedOffset]);

  useFrame((_, delta) => {
    if (isoAnimProgress === null || !geometryData || !pulseRef.current) return;
    const next = Math.min(1, isoAnimProgress + delta * 0.55);
    setIsoAnimProgress(next);
    const pt = geometryData.isoCurve.getPointAt(next);
    pulseRef.current.position.copy(pt);
  });

  if (!tenant || !geometryData) return null;

  const {
    centerThree,
    demarcLocal,
    switchLocal,
    endpoints,
    trayPath,
    uplinkToIspPath,
    coreWorld,
    coreId,
    ispWorld,
    usesFiber,
    footprintPts,
  } = geometryData;

  const lastMileColor = usesFiber ? '#F59E0B' : '#0EA5E9';

  return (
    <group name="tenant-network-layer">
      {/* Highlighted tenant footprint outline */}
      <Line points={footprintPts} color="#10B981" lineWidth={2.5} />

      {/* Local interior network equipment */}
      <group position={[centerThree.x, centerThree.y, centerThree.z]}>
        {/* Demarcation box */}
        <mesh position={demarcLocal}>
          <boxGeometry args={[0.42, 0.52, 0.24]} />
          <meshStandardMaterial
            color={usesFiber ? '#F59E0B' : '#0EA5E9'}
            emissive={usesFiber ? '#D97706' : '#0284C7'}
            emissiveIntensity={0.45}
          />
        </mesh>
        <Billboard position={[demarcLocal[0], demarcLocal[1] + 0.55, demarcLocal[2]]}>
          <Text fontSize={0.28} color="#E2E8F0" outlineWidth={0.03} outlineColor="#090D16">
            {usesFiber ? 'Demarc + Conv. OS2' : 'Demarc RJ45'}
          </Text>
        </Billboard>

        {/* Local PoE Switch */}
        <mesh position={switchLocal}>
          <boxGeometry args={[0.46, 0.22, 0.32]} />
          <meshStandardMaterial color="#10B981" emissive="#059669" emissiveIntensity={0.35} />
        </mesh>
        <Line points={[demarcLocal, switchLocal]} color={lastMileColor} lineWidth={2.2} />

        {/* Endpoints & internal Cat6A copper runs */}
        {endpoints.map((ep) => (
          <group key={ep.id}>
            <mesh position={ep.pos}>
              <sphereGeometry args={[0.2, 12, 10]} />
              <meshBasicMaterial color={ep.color} />
            </mesh>
            <Billboard position={[ep.pos[0], ep.pos[1] + 0.38, ep.pos[2]]}>
              <Text fontSize={0.24} color="#F8FAFC" outlineWidth={0.025} outlineColor="#090D16">
                {ep.label}
              </Text>
            </Billboard>
            <Line
              points={[
                switchLocal,
                [switchLocal[0], 2.35, switchLocal[2]],
                [ep.pos[0], 2.35, ep.pos[2]],
                ep.pos,
              ]}
              color="#38BDF8"
              lineWidth={1.6}
            />
          </group>
        ))}
      </group>

      {/* Cable-tray uplink from Demarc -> assigned Terminal IDF */}
      <Line points={trayPath} color={lastMileColor} lineWidth={3.2} />

      {/* IDF -> Core -> External ISP exit */}
      <Line points={uplinkToIspPath} color="#10B981" lineWidth={2.8} dashed dashSize={2} gapSize={1} />
      <mesh position={ispWorld}>
        <octahedronGeometry args={[1.6, 0]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
      <Billboard position={[ispWorld[0], ispWorld[1] + 3.2, ispWorld[2]]}>
        <Text fontSize={2.4} color="#34D399" outlineWidth={0.18} outlineColor="#090D16">
          {coreId === 'N1'
            ? language === 'es'
              ? 'Salida ISP A (N1)'
              : 'ISP Exit A (N1)'
            : language === 'es'
              ? 'Salida ISP B (N5)'
              : 'ISP Exit B (N5)'}
        </Text>
      </Billboard>

      {/* Animated "Probar aislamiento" blocked pulse */}
      {isoAnimProgress !== null && (
        <group>
          <mesh ref={pulseRef}>
            <sphereGeometry args={[0.9, 14, 12]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          {isoAnimProgress >= 0.92 && (
            <group position={coreWorld}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.5, 0.35, 10, 24]} />
                <meshBasicMaterial color="#EF4444" />
              </mesh>
              <Billboard position={[0, 5.2, 0]}>
                <Text fontSize={2.2} color="#FCA5A5" outlineWidth={0.16} outlineColor="#450A0A">
                  {language === 'es'
                    ? 'BLOQUEADO EN BORDE VRF (ACL DENY → VRF-AGL)'
                    : 'BLOCKED AT VRF EDGE (ACL DENY → VRF-AGL)'}
                </Text>
              </Billboard>
            </group>
          )}
        </group>
      )}
    </group>
  );
}
