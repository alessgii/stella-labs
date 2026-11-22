import { useMemo } from 'react';
import * as THREE from 'three';
import { Line, Text } from '@react-three/drei';
import { FLOORS } from '../../data/floors';
import { TENANTS } from '../../data/tenants';
import { VERTICAL_CONNECTORS } from '../../data/walkGraph';
import { FLOOR_ZONES, ZONE_PALETTE } from '../../data/zones';
import { cadPolygonToShape, cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

export function ZonesLayer() {
  const language = useAppStore((s) => s.language);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const ghostOtherFloor = useAppStore((s) => s.ghostOtherFloor);
  const activeZoneFilter = useAppStore((s) => s.activeZoneFilter);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const setFloorView = useAppStore((s) => s.setFloorView);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const enterTenant = useAppStore((s) => s.enterTenant);

  const zoneGeos = useMemo(
    () =>
      FLOOR_ZONES.map((z) => ({
        ...z,
        geo: new THREE.ShapeGeometry(cadPolygonToShape(z.polygon)),
        borderPts: [...z.polygon, z.polygon[0]].map((p) =>
          cadToThreeTuple(p[0], p[1], 0.02),
        ),
      })),
    [],
  );

  const tenantGeos = useMemo(
    () =>
      TENANTS.map((tn) => ({
        ...tn,
        geo: new THREE.ShapeGeometry(cadPolygonToShape(tn.footprint_cad)),
        borderPts: [...tn.footprint_cad, tn.footprint_cad[0]].map((p) =>
          cadToThreeTuple(p[0], p[1], 0.04),
        ),
      })),
    [],
  );

  const f1Elev =
    FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0);

  return (
    <group name="passenger-zones-layer">
      {zoneGeos.map((z) => {
        const isF1 = z.floor === 'F1';
        let visible = true;
        let floorOp = 0.92;
        if (floorView === 'GF' && isF1) {
          visible = ghostOtherFloor;
          floorOp = 0.08;
        } else if (floorView === 'F1' && !isF1) {
          visible = ghostOtherFloor;
          floorOp = 0.08;
        }
        if (!visible) return null;

        const filteredOut =
          activeZoneFilter !== null && z.category !== activeZoneFilter;
        const isOtherBuildingDimmed =
          focusedZoneId !== null &&
          focusedZoneId !== 'airside' &&
          focusedZoneId !== 'perimeter' &&
          !z.buildingId.startsWith(focusedZoneId);

        let opacity = filteredOut ? 0.14 : floorOp;
        if (isOtherBuildingDimmed) {
          opacity = Math.min(opacity, 0.14);
        }

        const token = ZONE_PALETTE[z.category];
        const y =
          (isF1 ? f1Elev : FLOORS.GF.elevation_m) + (z.elevOffset ?? 0.04);

        return (
          <group key={z.id} position={[0, y, 0]}>
            <mesh geometry={z.geo} rotation={[-Math.PI / 2, 0, 0]}>
              <meshBasicMaterial
                color={token.fill}
                transparent={opacity < 0.99}
                opacity={opacity}
                depthWrite={opacity >= 0.99}
              />
            </mesh>
            {z.category !== 'public' && opacity > 0.25 && (
              <Line
                points={z.borderPts}
                color={token.border}
                lineWidth={activeZoneFilter === z.category ? 2.4 : 1.2}
                transparent
                opacity={opacity}
              />
            )}
          </group>
        );
      })}

      {/* Architectural Floor Labels matching PNG */}
      {(floorView === 'GF' || floorView === 'BOTH') && (
        <>
          <Text
            position={cadToThreeTuple(45, -118, 0.25)}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={7.5}
            fontWeight={600}
            letterSpacing={0.22}
            color="#FFFFFF"
            outlineWidth={0.4}
            outlineColor="#9EC4E4"
          >
            {language === 'es' ? 'SALIDAS' : 'DEPARTURES'}
          </Text>
          <Text
            position={cadToThreeTuple(80, -395, 0.25)}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={7}
            fontWeight={600}
            letterSpacing={0.2}
            color="#FFFFFF"
            outlineWidth={0.4}
            outlineColor="#9EC4E4"
          >
            {language === 'es' ? 'LLEGADAS' : 'ARRIVALS'}
          </Text>
        </>
      )}

      {(floorView === 'F1' || floorView === 'BOTH') && (
        <>
          <Text
            position={cadToThreeTuple(63, -271, f1Elev + 0.25)}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            fontSize={3.4}
            fontWeight={600}
            letterSpacing={0.14}
            color="#64748B"
          >
            {language === 'es'
              ? 'CONEXIÓN ENTRE TERMINALES'
              : 'CONNECTION BETWEEN TERMINALS'}
          </Text>
          <Text
            position={cadToThreeTuple(260, -218, f1Elev + 0.25)}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={4.2}
            fontWeight={600}
            color="#15803D"
          >
            FOOD COURT
          </Text>
          <Text
            position={cadToThreeTuple(377, -182, f1Elev + 0.25)}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={3.6}
            fontWeight={600}
            color="#0284C7"
          >
            VIP LOUNGE
          </Text>
          <Text
            position={cadToThreeTuple(319, -193, f1Elev + 0.25)}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={3.3}
            fontWeight={600}
            color="#0284C7"
          >
            BUSINESS LOUNGE
          </Text>
        </>
      )}

      {/* Vertical Connectors (clickable blue dashed arrows between GF <-> F1 as in PNG) */}
      {VERTICAL_CONNECTORS.map((vc) => {
        const pBot = cadToThreeTuple(vc.pos_cad[0], vc.pos_cad[1], 0.4);
        const pTop = cadToThreeTuple(vc.pos_cad[0], vc.pos_cad[1], f1Elev + 0.4);
        return (
          <group
            key={vc.id}
            onClick={(e) => {
              e.stopPropagation();
              setFloorView(floorView === 'GF' ? 'F1' : 'GF');
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <Line
              points={[pBot, pTop]}
              color="#0EA5E9"
              lineWidth={2.2}
              dashed
              dashSize={1.2}
              gapSize={0.8}
            />
            <mesh position={pTop}>
              <coneGeometry args={[1.4, 2.2, 8]} />
              <meshBasicMaterial color="#0EA5E9" />
            </mesh>
            <mesh position={pBot} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[1.4, 2.2, 8]} />
              <meshBasicMaterial color="#0EA5E9" />
            </mesh>
          </group>
        );
      })}

      {/* Tenant unit footprints (clickable to select POI, double-click to enter Local) */}
      {tenantGeos.map((tn) => {
        const isF1 = tn.floor === 'F1';
        let visible = true;
        if (floorView === 'GF' && isF1) visible = false;
        if (floorView === 'F1' && !isF1) visible = false;
        if (!visible) return null;

        const isFocused = focusedTenantId === tn.id;
        const elev = isF1 ? f1Elev : FLOORS.GF.elevation_m;
        return (
          <group
            key={tn.id}
            position={[0, elev + 0.08, 0]}
            onClick={(e) => {
              e.stopPropagation();
              selectPoi(tn.poiId, false);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              enterTenant(tn.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <mesh geometry={tn.geo} rotation={[-Math.PI / 2, 0, 0]}>
              <meshBasicMaterial
                color={isFocused ? '#10B981' : '#0F172A'}
                transparent
                opacity={isFocused ? 0.24 : 0.06}
                depthWrite={false}
              />
            </mesh>
            <Line
              points={tn.borderPts}
              color={isFocused ? '#059669' : '#475569'}
              lineWidth={isFocused ? 2.6 : 1.1}
              dashed={!isFocused}
              dashSize={0.8}
              gapSize={0.5}
            />
          </group>
        );
      })}
    </group>
  );
}
