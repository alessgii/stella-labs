import { useMemo } from 'react';
import { Billboard, Line, Text } from '@react-three/drei';
import {
  ALL_TERMINAL_DEVICES,
  SALIDAS_DUCT_ENTRIES,
  SALIDAS_RISERS,
  SALIDAS_TRAY_SEGMENTS,
  type TerminalIdfId,
} from '../../data/devices';
import { DISTRIBUTION_RACKS } from '../../data/racks';
import { getSubsystemById } from '../../data/subsystems';
import { cadToThreeTuple } from '../../lib/coords';
import { COPPER_MAX_DISTANCE_M, evaluateLastMile } from '../../lib/lastMile';
import { useAppStore } from '../../store/useAppStore';

const BUILDING_IDFS: Record<string, readonly TerminalIdfId[]> = {
  departures: ['R1_T', 'R2_T', 'R3_T'],
  pier: ['R4_T', 'R5_T'],
  arrivals: ['R6_T'],
};

export function SalidasInteriorNet() {
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const floorView = useAppStore((s) => s.floorView);
  const itOtLens = useAppStore((s) => s.itOtLens);
  const activeBuildingSubsystems = useAppStore((s) => s.activeBuildingSubsystems);
  const show90mCircles = useAppStore((s) => s.show90mCircles);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);
  const selectedIdfId = useAppStore((s) => s.selectedIdfId);
  const selectDevice = useAppStore((s) => s.selectDevice);
  const selectIdf = useAppStore((s) => s.selectIdf);

  const visibleDevices = useMemo(() => {
    if (!focusedZoneId) return [];
    const activeSet = new Set(activeBuildingSubsystems);
    return ALL_TERMINAL_DEVICES.filter((d) => {
      if (d.buildingId !== focusedZoneId) return false;
      if (!activeSet.has(d.subsystemId) && d.id !== selectedDeviceId) return false;
      if (floorView !== 'BOTH' && d.floor !== floorView && d.id !== selectedDeviceId) {
        return false;
      }
      return true;
    }).map((dev) => ({
      device: dev,
      lastMile: evaluateLastMile(dev),
      subsystem: getSubsystemById(dev.subsystemId),
    }));
  }, [focusedZoneId, activeBuildingSubsystems, floorView, selectedDeviceId]);

  const idfRacks = useMemo(() => {
    const ids = (focusedZoneId && BUILDING_IDFS[focusedZoneId]) || [];
    return DISTRIBUTION_RACKS.filter((r) =>
      (ids as readonly string[]).includes(r.id),
    );
  }, [focusedZoneId]);

  return (
    <group name="salidas-interior-network">
      {/* MDF-A / N1 Internal Equipment (ODF, 2 Core Switches, UPS, FIDS Server) */}
      <group position={cadToThreeTuple(45.0, -103.58, 0)}>
        <mesh position={[-4.5, 1.3, -2]}>
          <boxGeometry args={[1.6, 2.4, 1.4]} />
          <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[-2.0, 1.3, -2]}>
          <boxGeometry args={[1.6, 2.4, 1.4]} />
          <meshStandardMaterial color="#005AFF" emissive="#005AFF" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.5, 1.3, -2]}>
          <boxGeometry args={[1.6, 2.4, 1.4]} />
          <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[3.5, 1.2, -2]}>
          <boxGeometry args={[1.8, 2.0, 1.4]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 1.3, 2.5]}>
          <boxGeometry args={[2.2, 2.4, 1.4]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.45} />
        </mesh>
        <Billboard position={[0, 4.4, -3]}>
          <Text fontSize={1.8} fontWeight={600} color="#E0F2FE" outlineWidth={0.3} outlineColor="#090D16">
            ODF-N1 · SW-R1/R2 · UPS · SRV-FIDS
          </Text>
        </Billboard>
      </group>

      {/* Dual Opposite Duct Entries into MDF-A */}
      {SALIDAS_DUCT_ENTRIES.map((duct) => (
        <group key={duct.id}>
          <Line
            points={duct.points_cad.map((p) => cadToThreeTuple(p[0], p[1], 1.1))}
            color={duct.route === 'A' ? '#005AFF' : '#FF8C00'}
            lineWidth={3}
          />
          <Billboard position={cadToThreeTuple(duct.points_cad[1][0], duct.points_cad[1][1], 2.5)}>
            <Text fontSize={1.6} color={duct.route === 'A' ? '#93C5FD' : '#FDBA74'} outlineWidth={0.25} outlineColor="#090D16">
              {duct.route === 'A' ? 'Ducto Ruta A (X=65)' : 'Ducto Ruta B (X=55)'}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* Overhead Cable Trays (Escalerillas at y = 3.2 m GF & 9.2 m F1) */}
      {SALIDAS_TRAY_SEGMENTS.map((seg) => {
        if (floorView !== 'BOTH' && seg.floor !== floorView) return null;
        return (
          <Line
            key={seg.id}
            points={[
              cadToThreeTuple(seg.start_cad[0], seg.start_cad[1], seg.elev_m),
              cadToThreeTuple(seg.end_cad[0], seg.end_cad[1], seg.elev_m),
            ]}
            color="#64748B"
            lineWidth={3.5}
          />
        );
      })}

      {/* Vertical Risers (GF <-> F1) */}
      {SALIDAS_RISERS.map((riser) => {
        const p1 = cadToThreeTuple(riser.pos_cad[0], riser.pos_cad[1], riser.fromElev_m);
        const p2 = cadToThreeTuple(riser.pos_cad[0], riser.pos_cad[1], riser.toElev_m);
        const midY = (riser.fromElev_m + riser.toElev_m) / 2;
        return (
          <group key={riser.id}>
            <mesh position={[p1[0], midY, p1[2]]}>
              <cylinderGeometry args={[0.55, 0.55, riser.toElev_m - riser.fromElev_m, 10]} />
              <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.6} />
            </mesh>
            <Billboard position={[p2[0], riser.toElev_m + 1.6, p2[2]]}>
              <Text fontSize={1.6} color="#7DD3FC" outlineWidth={0.25} outlineColor="#090D16">
                {riser.label}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Salidas / Terminal IDF Racks + 90m Copper Coverage Circles */}
      {idfRacks.map((idf) => {
        const idfTyped = idf.id as TerminalIdfId;
        const isSelected = selectedIdfId === idfTyped;
        const pos = cadToThreeTuple(idf.x_cad, idf.y_cad, 0.2);

        return (
          <group key={idf.id}>
            {/* Clickable IDF internal cabinet cluster */}
            <group
              position={pos}
              onClick={(e) => {
                e.stopPropagation();
                selectIdf(idfTyped);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[2.8, 2.4, 2.2]} />
                <meshStandardMaterial
                  color={isSelected ? '#38BDF8' : '#00FF00'}
                  emissive={isSelected ? '#38BDF8' : '#00FF00'}
                  emissiveIntensity={isSelected ? 0.85 : 0.45}
                />
              </mesh>
              <Billboard position={[0, 4.0, 0]}>
                <Text fontSize={1.8} fontWeight={600} color="#86EFAC" outlineWidth={0.3} outlineColor="#090D16">
                  {`ODF + SW-${idf.id} + UPS`}
                </Text>
              </Billboard>
            </group>

            {/* 90 m Copper Coverage Circle on floor */}
            {show90mCircles && (
              <mesh position={[pos[0], 0.15, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[COPPER_MAX_DISTANCE_M - 0.6, COPPER_MAX_DISTANCE_M, 64]} />
                <meshBasicMaterial
                  color={isSelected ? '#38BDF8' : '#22C55E'}
                  transparent
                  opacity={isSelected ? 0.7 : 0.35}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Active Devices & Last-Mile Orthogonal Drops (Copper <= 90m vs Fiber > 90m/EMI) */}
      {visibleDevices.map(({ device, lastMile, subsystem }) => {
        const isSelected = selectedDeviceId === device.id;
        const baseColor = itOtLens
          ? subsystem.domain === 'OT'
            ? '#F97316'
            : '#6366F1'
          : subsystem.color;
        const dropColor = lastMile.media === 'fibra' ? '#EF4444' : baseColor;
        const devPos = cadToThreeTuple(device.pos_cad[0], device.pos_cad[1], device.elev_m);

        return (
          <group key={device.id}>
            {/* Orthogonal last-mile drop */}
            <Line
              points={lastMile.path3D}
              color={isSelected ? '#FFFFFF' : dropColor}
              lineWidth={lastMile.media === 'fibra' ? 2.2 : 1.0}
              dashed={lastMile.media === 'cobre-poe'}
              dashSize={2.0}
              gapSize={1.2}
              transparent
              opacity={isSelected ? 1 : lastMile.media === 'fibra' ? 0.92 : 0.55}
            />

            {/* Endpoint marker */}
            <mesh
              position={devPos}
              onClick={(e) => {
                e.stopPropagation();
                selectDevice(device.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <boxGeometry
                args={
                  isSelected
                    ? [1.8, 1.8, 1.8]
                    : lastMile.media === 'fibra'
                      ? [1.3, 1.3, 1.3]
                      : [0.9, 0.9, 0.9]
                }
              />
              <meshStandardMaterial
                color={lastMile.exceeds90m ? '#EF4444' : baseColor}
                emissive={lastMile.exceeds90m ? '#EF4444' : baseColor}
                emissiveIntensity={isSelected ? 1.0 : 0.6}
              />
            </mesh>

            {/* Media converter / industrial switch box when fiber reaches the endpoint */}
            {lastMile.hasMediaConverter && (
              <mesh position={[devPos[0] + 0.9, devPos[1] + 0.6, devPos[2]]}>
                <boxGeometry args={[0.7, 0.7, 0.7]} />
                <meshStandardMaterial
                  color="#38BDF8"
                  emissive="#38BDF8"
                  emissiveIntensity={0.85}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
