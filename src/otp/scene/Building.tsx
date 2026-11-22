import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Edges, Line, Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import {
  BAGGAGE_CAROUSEL_FOOTPRINTS,
  BUILDINGS,
  CARGO_DOCKS,
  CONTROL_TOWER,
  DEPARTURES_CHECKIN_ISLANDS,
  DEPARTURES_DIVIDERS,
  DEPARTURES_PILLARS,
  GALLERY_CORRIDOR_LINES,
  NECK_CORRIDOR_LINES,
  PIER_CORRIDOR_LINES,
  PIER_FINGERS,
  SSEI_BAYS,
  TECH_ROOMS,
  rectToPolygon,
  type RectCad,
} from '../data/buildings';
import { FLOORS } from '../data/floors';
import { NAVIGABLE_ZONES, resolveNavigableZoneId } from '../data/lodZones';
import { cadToThreeTuple } from '../lib/coords';
import { useAppStore } from '../store/useAppStore';
import { DoubleWall } from './Walls';

const CUTAWAY_WALL_HEIGHT = 1.6;
const IT_COLOR = '#6366F1';
const OT_COLOR = '#F97316';

interface InstancedBoxesProps {
  rects: readonly RectCad[];
  height: number;
  elevation: number;
  color: string;
  opacity?: number;
  transparent?: boolean;
  castShadow?: boolean;
}

function InstancedRectBoxes({
  rects,
  height,
  elevation,
  color,
  opacity = 1,
  transparent = false,
  castShadow = true,
}: InstancedBoxesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    rects.forEach((r, i) => {
      const w = r.maxX - r.minX;
      const d = r.maxY - r.minY;
      const cx = (r.minX + r.maxX) / 2;
      const cy = (r.minY + r.maxY) / 2;
      dummy.position.set(cx, elevation + height / 2, -cy);
      dummy.scale.set(w, height, d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [rects, height, elevation]);

  const isTransparent = transparent || opacity < 0.99;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, rects.length]}
      castShadow={castShadow && !isTransparent}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        transparent={isTransparent}
        opacity={opacity}
        depthWrite={!isTransparent}
      />
    </instancedMesh>
  );
}

function ControlTowerModel({
  isNetwork,
  xrayOpacity,
  language,
  itOtLens,
  isSelected,
  isFocused,
  isDimmed,
  onSelect,
  onEnter,
  onHover,
}: {
  isNetwork: boolean;
  xrayOpacity: number;
  language: 'es' | 'en';
  itOtLens: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isDimmed: boolean;
  onSelect: () => void;
  onEnter: () => void;
  onHover: (hover: boolean) => void;
}) {
  const [tx, ty] = CONTROL_TOWER.center_cad;
  const posXZ = cadToThreeTuple(tx, ty, 0);

  const outerRingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, CONTROL_TOWER.outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, CONTROL_TOWER.outerInnerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, {
      depth: CONTROL_TOWER.shaftHeight_m,
      bevelEnabled: false,
      curveSegments: 32,
    });
  }, []);

  const coreRingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, CONTROL_TOWER.coreOuterRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, CONTROL_TOWER.coreInnerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, {
      depth: CONTROL_TOWER.shaftHeight_m,
      bevelEnabled: false,
      curveSegments: 24,
    });
  }, []);

  const ribSegments = useMemo(() => {
    return CONTROL_TOWER.ribAnglesDeg.map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const p1 = cadToThreeTuple(
        tx + Math.cos(rad) * CONTROL_TOWER.coreOuterRadius,
        ty + Math.sin(rad) * CONTROL_TOWER.coreOuterRadius,
        0.15,
      );
      const p2 = cadToThreeTuple(
        tx + Math.cos(rad) * CONTROL_TOWER.outerInnerRadius,
        ty + Math.sin(rad) * CONTROL_TOWER.outerInnerRadius,
        0.15,
      );
      return [p1, p2] as const;
    });
  }, [tx, ty]);

  const wallColor = itOtLens
    ? OT_COLOR
    : isNetwork
      ? '#1E293B'
      : isSelected
        ? '#EFF6FF'
        : '#FFFFFF';
  const edgeColor = isSelected
    ? '#005AFF'
    : itOtLens
      ? '#FB923C'
      : isNetwork
        ? '#38BDF8'
        : '#CBD5E1';
  const baseOpacity = isNetwork ? xrayOpacity : 1;
  const wallOpacity = isDimmed ? Math.min(baseOpacity, 0.16) : baseOpacity;
  const isTransparent = wallOpacity < 0.99;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5 || isDimmed) return;
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    if (isDimmed) return;
    e.stopPropagation();
    onEnter();
  };

  return (
    <group
      name="building-tower"
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Outer ring shaft */}
      <mesh
        geometry={outerRingGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={posXZ}
        castShadow={!isNetwork && !isDimmed}
      >
        <meshStandardMaterial
          color={wallColor}
          transparent={isTransparent}
          opacity={wallOpacity}
          depthWrite={!isTransparent}
        />
        <Edges threshold={20} color={edgeColor} />
      </mesh>

      {/* Inner elevator/cable shaft */}
      <mesh
        geometry={coreRingGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={posXZ}
      >
        <meshStandardMaterial
          color={isNetwork ? '#334155' : '#E2E8F0'}
          transparent={isTransparent}
          opacity={Math.min(1, wallOpacity + 0.15)}
          depthWrite={!isTransparent}
        />
        <Edges threshold={20} color={edgeColor} />
      </mesh>

      {/* Glass ATC cab (hidden when focused inside tower in network cutaway) */}
      {!isFocused && (
        <mesh
          position={[
            posXZ[0],
            CONTROL_TOWER.shaftHeight_m + CONTROL_TOWER.cabHeight_m / 2,
            posXZ[2],
          ]}
          castShadow={!isNetwork && !isDimmed}
        >
          <cylinderGeometry
            args={[
              CONTROL_TOWER.outerRadius + 1.2,
              CONTROL_TOWER.outerRadius * 0.85,
              CONTROL_TOWER.cabHeight_m,
              24,
            ]}
          />
          <meshStandardMaterial
            color={itOtLens ? OT_COLOR : isNetwork ? '#0EA5E9' : '#BAE6FD'}
            transparent
            opacity={isDimmed ? 0.14 : isNetwork ? Math.max(0.25, xrayOpacity) : 0.72}
            roughness={0.2}
            metalness={0.15}
          />
          <Edges threshold={18} color={isNetwork ? '#7DD3FC' : '#64748B'} />
        </mesh>
      )}

      {/* 8 Radial ribs at base */}
      {ribSegments.map((seg, i) => (
        <Line
          key={i}
          points={[seg[0], seg[1]]}
          color={isNetwork ? '#475569' : '#CBD5E1'}
          lineWidth={1.2}
        />
      ))}

      {/* Label */}
      <Text
        position={[posXZ[0], CONTROL_TOWER.totalHeight_m + 4, posXZ[2]]}
        fontSize={6.5}
        fontWeight={500}
        color={isNetwork ? '#94A3B8' : '#475569'}
        anchorX="center"
        anchorY="bottom"
      >
        {CONTROL_TOWER.name[language]}
      </Text>
    </group>
  );
}

export function CampusBuildings() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const floorView = useAppStore((s) => s.floorView);
  const ghostOtherFloor = useAppStore((s) => s.ghostOtherFloor);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const xrayOpacity = useAppStore((s) => s.xrayOpacity);
  const itOtLens = useAppStore((s) => s.itOtLens);
  const showBuildingsInNet = useAppStore((s) => s.networkLayers.buildings);

  const hoveredZoneId = useAppStore((s) => s.hoveredZoneId);
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const setHoveredZoneId = useAppStore((s) => s.setHoveredZoneId);
  const selectZone = useAppStore((s) => s.selectZone);
  const enterZone = useAppStore((s) => s.enterZone);

  const isNetwork = mode === 'network';

  const f1Elevation =
    FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0);

  const showGF = isNetwork || floorView === 'GF' || floorView === 'BOTH' || ghostOtherFloor;
  const showF1 = isNetwork || floorView === 'F1' || floorView === 'BOTH' || ghostOtherFloor;
  const gfOpacity = isNetwork ? xrayOpacity : floorView === 'F1' ? 0.14 : 1;
  const f1Opacity = isNetwork ? xrayOpacity : floorView === 'GF' ? 0.14 : 1;

  const fingerArms = useMemo(() => PIER_FINGERS.map((f) => f.arm), []);
  const fingerHeads = useMemo(() => PIER_FINGERS.map((f) => f.head), []);

  const departuresF1WallsOuter = useMemo(
    () =>
      [
        [35.0, -85.0],
        [90.0, -85.0],
        [90.0, -207.16],
        [35.0, -207.16],
      ] as const,
    [],
  );
  const departuresF1WallsInner = useMemo(
    () =>
      [
        [35.7, -85.7],
        [89.3, -85.7],
        [89.3, -206.46],
        [35.7, -206.46],
      ] as const,
    [],
  );

  const isBuildingDimmed = (buildingId: string): boolean => {
    if (!focusedZoneId) return false;
    if (focusedZoneId === 'airside' || focusedZoneId === 'perimeter') return false;
    return resolveNavigableZoneId(buildingId) !== focusedZoneId;
  };

  if (mode === 'network' && !showBuildingsInNet) return null;

  return (
    <group name="campus-buildings">
      {/* Main building envelopes */}
      {BUILDINGS.map((b) => {
        const zoneId = resolveNavigableZoneId(b.id);
        const isHovered = zoneId !== null && hoveredZoneId === zoneId;
        const isSelected = zoneId !== null && selectedZoneId === zoneId;
        const isFocused = zoneId !== null && focusedZoneId === zoneId;
        const dimmed = isBuildingDimmed(b.id);

        const zoneDomain = zoneId ? NAVIGABLE_ZONES[zoneId].dominantDomain : 'IT';
        const domainColor = zoneDomain === 'OT' ? OT_COLOR : IT_COLOR;

        const wallColor = itOtLens
          ? domainColor
          : isNetwork
            ? '#1E293B'
            : isSelected || isHovered
              ? '#EFF6FF'
              : b.navigable
                ? '#FFFFFF'
                : '#EEF1F5';
        const edgeColor = isSelected
          ? '#005AFF'
          : isHovered
            ? '#38BDF8'
            : itOtLens
              ? domainColor
              : isNetwork
                ? '#38BDF8'
                : '#CBD5E1';

        const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
          if (!zoneId) return;
          e.stopPropagation();
          setHoveredZoneId(zoneId);
          document.body.style.cursor = 'pointer';
        };

        const handlePointerOut = () => {
          if (!zoneId) return;
          setHoveredZoneId(null);
          document.body.style.cursor = 'auto';
        };

        const handleClick = (e: ThreeEvent<MouseEvent>) => {
          if (!zoneId || e.delta > 5 || dimmed) return;
          e.stopPropagation();
          selectZone(zoneId);
        };

        const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
          if (!zoneId || dimmed) return;
          e.stopPropagation();
          enterZone(zoneId);
        };

        if (isNetwork) {
          const op = dimmed ? Math.min(xrayOpacity, 0.08) : xrayOpacity;
          const wallHeight = isFocused ? CUTAWAY_WALL_HEIGHT * 1.4 : b.height_m;
          return (
            <group
              key={b.id}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            >
              <DoubleWall
                outer={b.outer}
                inner={b.inner}
                height={wallHeight}
                elevation={0}
                color={wallColor}
                edgeColor={edgeColor}
                opacity={op}
                transparent
                castShadow={false}
              />
              {/* Roof removed when focused inside the building */}
              {!isFocused && (
                <DoubleWall
                  outer={b.outer}
                  height={0.25}
                  elevation={b.height_m}
                  color="#0F172A"
                  edgeColor={edgeColor}
                  opacity={dimmed ? 0.04 : Math.max(0.08, xrayOpacity * 0.45)}
                  transparent
                  castShadow={false}
                />
              )}
            </group>
          );
        }

        const localGfOp = dimmed ? Math.min(gfOpacity, 0.16) : gfOpacity;
        const localF1Op = dimmed ? Math.min(f1Opacity, 0.16) : f1Opacity;

        return (
          <group
            key={b.id}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          >
            {showGF && (
              <DoubleWall
                outer={b.outer}
                inner={b.inner}
                height={b.navigable || isFocused ? CUTAWAY_WALL_HEIGHT : Math.min(b.height_m, 7.5)}
                elevation={0}
                color={wallColor}
                edgeColor={edgeColor}
                opacity={localGfOp}
                transparent={localGfOp < 0.99}
              />
            )}
            {b.hasF1 && showF1 && b.id !== 'departures' && (
              <DoubleWall
                outer={b.outer}
                inner={b.inner}
                height={CUTAWAY_WALL_HEIGHT}
                elevation={f1Elevation}
                color={wallColor}
                edgeColor={edgeColor}
                opacity={localF1Op}
                transparent={localF1Op < 0.99}
              />
            )}
            {b.id === 'departures' && showF1 && (
              <DoubleWall
                outer={departuresF1WallsOuter}
                inner={departuresF1WallsInner}
                height={CUTAWAY_WALL_HEIGHT}
                elevation={f1Elevation}
                color={wallColor}
                edgeColor={edgeColor}
                opacity={localF1Op}
                transparent={localF1Op < 0.99}
              />
            )}
            {!b.navigable && !dimmed && (
              <Text
                position={cadToThreeTuple(b.labelCad[0], b.labelCad[1], 8.5)}
                fontSize={6.5}
                fontWeight={500}
                color="#64748B"
                anchorX="center"
                anchorY="middle"
              >
                {b.name[language]}
              </Text>
            )}
          </group>
        );
      })}

      {/* Technical Rooms (MDF-A, N2, N4, MDF-B, N6) */}
      {TECH_ROOMS.map((room) => (
        <DoubleWall
          key={room.id}
          outer={rectToPolygon(room.outer)}
          inner={rectToPolygon(room.inner)}
          height={isNetwork ? room.height_m : CUTAWAY_WALL_HEIGHT}
          elevation={0}
          color={itOtLens ? OT_COLOR : isNetwork ? '#1E3A5F' : '#E2E8F0'}
          edgeColor={isNetwork ? '#60A5FA' : '#94A3B8'}
          opacity={isNetwork ? Math.min(0.85, xrayOpacity + 0.35) : gfOpacity}
          transparent={isNetwork || gfOpacity < 0.99}
          castShadow={false}
        />
      ))}

      {/* 18 Departures Pillars (InstancedMesh) */}
      <InstancedRectBoxes
        rects={DEPARTURES_PILLARS}
        height={isNetwork ? 14.0 : 4.2}
        elevation={0}
        color={isNetwork ? '#475569' : '#CBD5E1'}
        opacity={
          isBuildingDimmed('departures')
            ? 0.14
            : isNetwork
              ? Math.min(1, xrayOpacity + 0.25)
              : gfOpacity
        }
        transparent={isNetwork || gfOpacity < 0.99 || isBuildingDimmed('departures')}
      />

      {/* Departures Interior Dividers & Check-In Islands (GF) */}
      {showGF && (
        <>
          <InstancedRectBoxes
            rects={DEPARTURES_DIVIDERS}
            height={isNetwork ? 4.0 : 1.4}
            elevation={0}
            color={isNetwork ? '#334155' : '#E2E8F0'}
            opacity={
              isBuildingDimmed('departures')
                ? 0.14
                : isNetwork
                  ? Math.min(1, xrayOpacity + 0.15)
                  : gfOpacity
            }
            transparent={isNetwork || gfOpacity < 0.99 || isBuildingDimmed('departures')}
          />
          <InstancedRectBoxes
            rects={DEPARTURES_CHECKIN_ISLANDS}
            height={1.2}
            elevation={0}
            color={itOtLens ? IT_COLOR : isNetwork ? '#334155' : '#FFF4B8'}
            opacity={
              isBuildingDimmed('departures')
                ? 0.14
                : isNetwork
                  ? Math.min(1, xrayOpacity + 0.2)
                  : gfOpacity
            }
            transparent={isNetwork || gfOpacity < 0.99 || isBuildingDimmed('departures')}
          />
          <InstancedRectBoxes
            rects={BAGGAGE_CAROUSEL_FOOTPRINTS}
            height={1.0}
            elevation={0}
            color={itOtLens ? OT_COLOR : isNetwork ? '#334155' : '#91D8F7'}
            opacity={
              isBuildingDimmed('arrivals')
                ? 0.14
                : isNetwork
                  ? Math.min(1, xrayOpacity + 0.2)
                  : gfOpacity
            }
            transparent={isNetwork || gfOpacity < 0.99 || isBuildingDimmed('arrivals')}
          />
        </>
      )}

      {/* Arrivals Baggage Carousels F1 */}
      {showF1 && (
        <InstancedRectBoxes
          rects={BAGGAGE_CAROUSEL_FOOTPRINTS}
          height={1.0}
          elevation={f1Elevation}
          color={itOtLens ? OT_COLOR : isNetwork ? '#334155' : '#D5DCE6'}
          opacity={
            isBuildingDimmed('arrivals')
              ? 0.14
              : isNetwork
                ? Math.min(1, xrayOpacity + 0.2)
                : f1Opacity
          }
          transparent={isNetwork || f1Opacity < 0.99 || isBuildingDimmed('arrivals')}
        />
      )}

      {/* 14 Pier Fingers at F1 */}
      {showF1 && (
        <>
          <InstancedRectBoxes
            rects={fingerArms}
            height={2.2}
            elevation={f1Elevation - 1.0}
            color={itOtLens ? OT_COLOR : isNetwork ? '#334155' : '#E2E8F0'}
            opacity={
              isBuildingDimmed('pier')
                ? 0.14
                : isNetwork
                  ? Math.min(1, xrayOpacity + 0.2)
                  : f1Opacity
            }
            transparent={isNetwork || f1Opacity < 0.99 || isBuildingDimmed('pier')}
          />
          <InstancedRectBoxes
            rects={fingerHeads}
            height={2.4}
            elevation={f1Elevation - 1.0}
            color={itOtLens ? OT_COLOR : isNetwork ? '#475569' : '#CBD5E1'}
            opacity={
              isBuildingDimmed('pier')
                ? 0.14
                : isNetwork
                  ? Math.min(1, xrayOpacity + 0.25)
                  : f1Opacity
            }
            transparent={isNetwork || f1Opacity < 0.99 || isBuildingDimmed('pier')}
          />
        </>
      )}

      {/* 10 Cargo Docks & 7 SSEI Bays */}
      <InstancedRectBoxes
        rects={CARGO_DOCKS}
        height={1.4}
        elevation={0}
        color={isNetwork ? '#334155' : '#E2E8F0'}
        opacity={isBuildingDimmed('cargo') ? 0.15 : isNetwork ? Math.min(1, xrayOpacity + 0.2) : 1}
        transparent={isNetwork || isBuildingDimmed('cargo')}
      />
      <InstancedRectBoxes
        rects={SSEI_BAYS}
        height={1.4}
        elevation={0}
        color={isNetwork ? '#334155' : '#E2E8F0'}
        opacity={isBuildingDimmed('ssei') ? 0.15 : isNetwork ? Math.min(1, xrayOpacity + 0.2) : 1}
        transparent={isNetwork || isBuildingDimmed('ssei')}
      />

      {/* Interior corridor guide lines */}
      {[...GALLERY_CORRIDOR_LINES, ...NECK_CORRIDOR_LINES, ...PIER_CORRIDOR_LINES].map(
        (seg, idx) => (
          <Line
            key={`corr-${idx}`}
            points={[
              cadToThreeTuple(seg[0][0], seg[0][1], isNetwork ? 0.15 : f1Elevation + 0.08),
              cadToThreeTuple(seg[1][0], seg[1][1], isNetwork ? 0.15 : f1Elevation + 0.08),
            ]}
            color={isNetwork ? '#475569' : '#CBD5E1'}
            lineWidth={1}
          />
        ),
      )}

      {/* Control Tower */}
      <ControlTowerModel
        isNetwork={isNetwork}
        xrayOpacity={xrayOpacity}
        language={language}
        itOtLens={itOtLens}
        isSelected={selectedZoneId === 'tower'}
        isFocused={focusedZoneId === 'tower'}
        isDimmed={isBuildingDimmed('tower')}
        onSelect={() => selectZone('tower')}
        onEnter={() => enterZone('tower')}
        onHover={(hover) => setHoveredZoneId(hover ? 'tower' : null)}
      />
    </group>
  );
}
