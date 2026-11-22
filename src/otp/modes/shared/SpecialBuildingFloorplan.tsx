import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { getRoomsForBuilding } from '../../data/previews';
import { cadPolygonToShape, cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

export function SpecialBuildingFloorplan() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const selectedSpecialRoomId = useAppStore((s) => s.selectedSpecialRoomId);
  const activeBuildingSystemFilter = useAppStore((s) => s.activeBuildingSystemFilter);
  const selectSpecialRoom = useAppStore((s) => s.selectSpecialRoom);

  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const buildingId =
    focusedZoneId === 'ssei' || focusedZoneId === 'cargo' ? focusedZoneId : null;

  const roomGeos = useMemo(() => {
    if (!buildingId) return [];
    return getRoomsForBuilding(buildingId).map((room) => ({
      room,
      geo: new THREE.ShapeGeometry(cadPolygonToShape(room.footprint_cad)),
      borderPts: [...room.footprint_cad, room.footprint_cad[0]].map((p) =>
        cadToThreeTuple(p[0], p[1], 0.14),
      ),
      labelPos: cadToThreeTuple(room.center_cad[0], room.center_cad[1], 1.2),
    }));
  }, [buildingId]);

  if (!buildingId) return null;

  const isNetwork = mode === 'network';

  return (
    <group name="special-building-floorplan">
      {roomGeos.map(({ room, geo, borderPts, labelPos }) => {
        const isSelected = selectedSpecialRoomId === room.id;
        const isHovered = hoveredRoomId === room.id;
        const matchesFilter =
          !activeBuildingSystemFilter ||
          room.systems.includes(activeBuildingSystemFilter);

        const baseColor =
          room.subZone === 'substation'
            ? '#F59E0B'
            : room.access === 'public'
              ? '#10B981'
              : room.coreNodeId
                ? '#005AFF'
                : room.subZone === 'ssei'
                  ? '#EF4444'
                  : '#06B6D4';

        const opacity = !matchesFilter
          ? 0.12
          : isSelected
            ? 0.45
            : isHovered
              ? 0.36
              : 0.24;

        return (
          <group key={room.id}>
            <mesh
              geometry={geo}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.12, 0]}
              onClick={(e) => {
                if (e.delta > 5) return;
                e.stopPropagation();
                selectSpecialRoom(room.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredRoomId(room.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredRoomId(null);
                document.body.style.cursor = 'auto';
              }}
            >
              <meshBasicMaterial
                color={baseColor}
                transparent
                opacity={opacity}
                depthWrite={false}
              />
            </mesh>
            <Line
              points={borderPts}
              color={isSelected ? '#FACC15' : baseColor}
              lineWidth={isSelected ? 3 : 1.6}
            />

            <Html position={labelPos} center zIndexRange={[10, 0]}>
              <button
                type="button"
                onClick={() => selectSpecialRoom(room.id)}
                title={room.name[language]}
                className={`pointer-events-auto whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shadow-sm transition-transform cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-white scale-105'
                    : !matchesFilter
                      ? 'opacity-40 bg-slate-900/70 text-slate-300 border-white/10'
                      : isNetwork
                        ? 'bg-slate-950/90 text-slate-100 border-white/25 hover:scale-105'
                        : 'bg-white/95 text-slate-900 border-slate-300 hover:scale-105'
                }`}
              >
                {room.shortLabel[language]}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
