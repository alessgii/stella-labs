import { useMemo } from 'react';
import * as THREE from 'three';
import { Html, Line, Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import {
  APRON_1_OUTLINE,
  APRON_1_POLYGON,
  BULEVARDUL_AEROPORTULUI,
  LANDSIDE_PARKING_ZONES,
  LANDSIDE_ROAD_PATH,
  TAXIWAY_K,
  TAXIWAY_L,
} from '../data/apron';
import { FIBER_CABLES } from '../data/fiber';
import { NAVIGABLE_ZONE_LIST } from '../data/lodZones';
import { cadPolygonToShape, cadToThreeTuple } from '../lib/coords';
import { useAppStore } from '../store/useAppStore';

export function Ground() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);
  const itOtLens = useAppStore((s) => s.itOtLens);
  const aglNightMode = useAppStore((s) => s.aglNightMode);
  const trenchView = useAppStore((s) => s.trenchView);
  const selectZone = useAppStore((s) => s.selectZone);
  const enterZone = useAppStore((s) => s.enterZone);

  const isNetwork = mode === 'network' || aglNightMode;

  const apronGeo = useMemo(() => {
    const shape = cadPolygonToShape(APRON_1_POLYGON);
    return new THREE.ShapeGeometry(shape);
  }, []);

  const parkingGeos = useMemo(
    () =>
      LANDSIDE_PARKING_ZONES.map((pz) => ({
        ...pz,
        geo: new THREE.ShapeGeometry(cadPolygonToShape(pz.polygon)),
      })),
    [],
  );

  const apronPoints = useMemo(
    () => APRON_1_OUTLINE.map(([x, y]) => cadToThreeTuple(x, y, 0.02)),
    [],
  );

  const taxiwayLPoints = useMemo(
    () => TAXIWAY_L.map(([x, y]) => cadToThreeTuple(x, y, 0.03)),
    [],
  );

  const taxiwayKPoints = useMemo(
    () => TAXIWAY_K.map(([x, y]) => cadToThreeTuple(x, y, 0.03)),
    [],
  );

  const boulevardPoints = useMemo(
    () => BULEVARDUL_AEROPORTULUI.map(([x, y]) => cadToThreeTuple(x, y, 0.03)),
    [],
  );

  const roadPoints = useMemo(
    () => LANDSIDE_ROAD_PATH.map(([x, y]) => cadToThreeTuple(x, y, 0.02)),
    [],
  );

  const perimeterLinePoints = useMemo(
    () => FIBER_CABLES.DISTRIB_PERIMETRO.points_cad.map(([x, y]) => cadToThreeTuple(x, y, 0.04)),
    [],
  );

  const airsideActive =
    focusedZoneId === 'airside' ||
    selectedZoneId === 'airside';
  const perimeterActive =
    focusedZoneId === 'perimeter' ||
    selectedZoneId === 'perimeter';

  const handleAirsideDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    if (focusedZoneId !== null) return;
    e.stopPropagation();
    enterZone('airside');
  };

  return (
    <group name="campus-ground">
      {/* Main campus terrain plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[280, -0.1, 180]}
        receiveShadow={!isNetwork}
        onClick={(e) => {
          if (e.delta > 5) return;
          e.stopPropagation();
          selectZone(null);
        }}
      >
        <planeGeometry args={[4000, 4000]} />
        {isNetwork ? (
          <meshStandardMaterial
            color="#090D16"
            roughness={0.95}
            metalness={0.05}
            transparent={trenchView}
            opacity={trenchView ? 0.52 : 1}
          />
        ) : (
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
        )}
      </mesh>

      {/* Apron 1 concrete slab (double-click at campus level or use dedicated Airside pin) */}
      <mesh
        geometry={apronGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow={!isNetwork}
        onDoubleClick={handleAirsideDoubleClick}
      >
        <meshStandardMaterial
          color={
            itOtLens
              ? '#241812'
              : isNetwork
                ? airsideActive
                  ? '#1B2840'
                  : '#141C2B'
                : airsideActive
                  ? '#E3E9F2'
                  : '#ECEFF3'
          }
          roughness={0.9}
        />
      </mesh>

      {/* Apron 1 boundary line */}
      <Line
        points={apronPoints}
        color={
          airsideActive
            ? '#0EA5E9'
            : itOtLens
              ? '#F97316'
              : isNetwork
                ? '#3A4B66'
                : '#CBD2DC'
        }
        lineWidth={airsideActive ? 2.4 : 1.5}
      />

      {/* Clickable Perimeter Fence Reference Guide */}
      <Line
        points={perimeterLinePoints}
        color={
          perimeterActive
            ? '#06B6D4'
            : itOtLens
              ? '#EF4444'
              : isNetwork
                ? '#164E63'
                : '#E2E8F0'
        }
        lineWidth={perimeterActive ? 2.5 : 1.0}
        dashed
        dashSize={10}
        gapSize={6}
      />

      {/* Taxiways L & K */}
      <Line
        points={taxiwayLPoints}
        color={itOtLens ? '#F97316' : isNetwork ? '#D9A726' : '#E2B74B'}
        lineWidth={2}
        dashed
        dashSize={8}
        gapSize={6}
      />
      <Line
        points={taxiwayKPoints}
        color={itOtLens ? '#F97316' : isNetwork ? '#D9A726' : '#E2B74B'}
        lineWidth={2}
        dashed
        dashSize={8}
        gapSize={6}
      />

      {/* Bulevardul Aeroportului */}
      <Line
        points={boulevardPoints}
        color={isNetwork ? '#4F607D' : '#9AA4B2'}
        lineWidth={3}
      />
      <Text
        position={cadToThreeTuple(350, 134, 0.2)}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={6.5}
        color={isNetwork ? '#7C8EA8' : '#7A8594'}
        anchorX="center"
        anchorY="middle"
      >
        Bulevardul Aeroportului
      </Text>

      {/* Schematic Landside Parking & Access Road (Passenger context) */}
      {!isNetwork && (
        <>
          <Line points={roadPoints} color="#B8C0CC" lineWidth={5} />
          {parkingGeos.map((pz) => (
            <group key={pz.id}>
              <mesh
                geometry={pz.geo}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.03, 0]}
                receiveShadow
              >
                <meshStandardMaterial color="#E2E5EA" roughness={0.95} />
              </mesh>
              <Text
                position={cadToThreeTuple(pz.labelCad[0], pz.labelCad[1], 0.15)}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={7.5}
                fontWeight={600}
                letterSpacing={0.18}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
              >
                {pz.label[language]}
              </Text>
            </group>
          ))}
        </>
      )}
      {/* Dedicated 1-tap location pill pins for all navigable areas at Campus level */}
      {focusedZoneId === null && (
        <>
          {NAVIGABLE_ZONE_LIST.filter((z) => z.kind === 'building').map((zone) => (
            <Html
              key={zone.id}
              position={cadToThreeTuple(
                zone.center_cad[0],
                zone.center_cad[1],
                zone.id === 'tower' ? 18 : 11,
              )}
              center
              zIndexRange={[8, 0]}
            >
              <button
                type="button"
                onClick={() => enterZone(zone.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-transform hover:scale-105 cursor-pointer whitespace-nowrap ${
                  selectedZoneId === zone.id
                    ? 'bg-sky-500 text-slate-950 border-white'
                    : isNetwork
                      ? 'bg-slate-950/90 text-slate-100 border-white/25'
                      : 'bg-white/95 text-slate-900 border-slate-300'
                }`}
              >
                <span>{zone.name[language]}</span>
              </button>
            </Html>
          ))}

          <Html position={cadToThreeTuple(140, -340, 2.5)} center zIndexRange={[8, 0]}>
            <button
              type="button"
              onClick={() => enterZone('airside')}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-transform hover:scale-105 cursor-pointer whitespace-nowrap ${
                selectedZoneId === 'airside'
                  ? 'bg-sky-500 text-slate-950 border-white'
                  : isNetwork
                    ? 'bg-slate-950/90 text-sky-300 border-sky-400/50'
                    : 'bg-white/95 text-slate-900 border-slate-300'
              }`}
            >
              <span>✈</span>
              <span>{language === 'es' ? 'Airside / Pistas' : 'Airside / Apron'}</span>
            </button>
          </Html>

          <Html position={cadToThreeTuple(-65, -240, 2.5)} center zIndexRange={[8, 0]}>
            <button
              type="button"
              onClick={() => enterZone('perimeter')}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-transform hover:scale-105 cursor-pointer whitespace-nowrap ${
                selectedZoneId === 'perimeter'
                  ? 'bg-cyan-400 text-slate-950 border-white'
                  : isNetwork
                    ? 'bg-slate-950/90 text-cyan-300 border-cyan-400/50'
                    : 'bg-white/95 text-slate-900 border-slate-300'
              }`}
            >
              <span>◎</span>
              <span>{language === 'es' ? 'Perímetro DAS' : 'Perimeter DAS'}</span>
            </button>
          </Html>
        </>
      )}
    </group>
  );
}
