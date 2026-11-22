import { Billboard, Text } from '@react-three/drei';
import { FLOORS } from '../../data/floors';
import { POIS, type PoiCategory } from '../../data/poi';
import { cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

const POI_BADGE_COLORS: Record<PoiCategory, { bg: string; fg: string }> = {
  gate: { bg: '#FFF212', fg: '#1E293B' },
  food: { bg: '#64C67C', fg: '#FFFFFF' },
  commercial: { bg: '#F37B7E', fg: '#FFFFFF' },
  facility: { bg: '#0284C7', fg: '#FFFFFF' },
  airline: { bg: '#EAB308', fg: '#1E293B' },
  transport: { bg: '#0F172A', fg: '#FFFFFF' },
  public: { bg: '#000000', fg: '#FFFFFF' },
  service: { bg: '#475569', fg: '#FFFFFF' },
};

export function PoiLayer() {
  const language = useAppStore((s) => s.language);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const selectedPoiId = useAppStore((s) => s.selectedPoiId);
  const activeZoneFilter = useAppStore((s) => s.activeZoneFilter);
  const selectPoi = useAppStore((s) => s.selectPoi);

  const f1Elev =
    FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0);

  // Filter POIs to prevent campus-scale clutter:
  // - At campus level, show priority 1 landmarks + representative gates (or selected POI)
  // - Inside a building, show all POIs in that building on active floor(s)
  const visiblePois = POIS.filter((p) => {
    if (floorView !== 'BOTH' && p.floor !== floorView) return false;
    if (p.id === selectedPoiId) return true;
    if (focusedZoneId) {
      return p.building === focusedZoneId || (p.priority ?? 2) === 1;
    }
    return (p.priority ?? 2) <= 2;
  });

  return (
    <group name="passenger-poi-layer">
      {visiblePois.map((poi) => {
        const y = (poi.floor === 'F1' ? f1Elev : FLOORS.GF.elevation_m) + 1.8;
        const pos = cadToThreeTuple(poi.pos_cad[0], poi.pos_cad[1], y);
        const selected = poi.id === selectedPoiId;
        const colors = POI_BADGE_COLORS[poi.category];
        const dimmed =
          activeZoneFilter !== null &&
          ['public', 'facility', 'commercial', 'food', 'airline'].includes(poi.category) &&
          poi.category !== activeZoneFilter &&
          !selected;

        const shortLabel =
          poi.category === 'gate'
            ? poi.id.replace('gate-', '')
            : poi.name[language];

        return (
          <group
            key={poi.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              selectPoi(poi.id, false);
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
              <sphereGeometry args={[selected ? 2.4 : poi.category === 'gate' ? 1.5 : 1.9, 12, 12]} />
              <meshStandardMaterial
                color={selected ? '#000000' : colors.bg}
                transparent={dimmed}
                opacity={dimmed ? 0.25 : 1}
              />
            </mesh>

            {(selected || focusedZoneId === poi.building || (poi.priority ?? 2) === 1) && (
              <Billboard position={[0, selected ? 5.2 : 3.8, 0]}>
                <Text
                  fontSize={selected ? 4.4 : poi.category === 'gate' ? 3.2 : 3.5}
                  fontWeight={600}
                  color={selected ? '#000000' : '#0F172A'}
                  outlineWidth={0.7}
                  outlineColor={poi.category === 'gate' ? '#FFF212' : '#FFFFFF'}
                  anchorX="center"
                  anchorY="middle"
                >
                  {shortLabel}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
}
