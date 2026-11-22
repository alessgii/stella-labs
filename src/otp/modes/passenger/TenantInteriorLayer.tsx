import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { FLOORS } from '../../data/floors';
import { getTenantById, type TenantTemplate } from '../../data/tenants';
import { cadToThree } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

const FLOOR_COLORS: Record<TenantTemplate, string> = {
  cafe: '#F3E8D9',
  tienda: '#F1F5F9',
  restaurante: '#EFE4D6',
  farmacia: '#ECFDF5',
  cambio: '#EFF6FF',
  'duty-free': '#FAF5FF',
  'sala-vip': '#E8EEF5',
  'mostrador-aerolinea': '#F8FAFC',
};

const ACCENT_COLORS: Record<TenantTemplate, string> = {
  cafe: '#78350F',
  tienda: '#334155',
  restaurante: '#9A3412',
  farmacia: '#059669',
  cambio: '#1D4ED8',
  'duty-free': '#7E22CE',
  'sala-vip': '#0F172A',
  'mostrador-aerolinea': '#B45309',
};

function PosTerminal({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.32, 0.16, 0.24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.22, -0.04]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.28, 0.18, 0.03]} />
        <meshStandardMaterial color="#0EA5E9" emissive="#0284C7" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function VisibleTechFixtures({ width, depth }: { width: number; depth: number }) {
  return (
    <group>
      {/* Ceiling Access Point */}
      <group position={[0, 2.55, 0]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.08, 14]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 10]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      </group>
      {/* Dome CCTV Camera */}
      <group position={[-width * 0.42, 2.48, -depth * 0.42]}>
        <mesh>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export function TenantInteriorLayer() {
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const language = useAppStore((s) => s.language);

  const tenant = focusedTenantId ? getTenantById(focusedTenantId) : undefined;

  const dims = useMemo(() => {
    if (!tenant) return { width: 6, depth: 8 };
    const xs = tenant.footprint_cad.map((p) => p[0]);
    const ys = tenant.footprint_cad.map((p) => p[1]);
    return {
      width: Math.max(4, Math.max(...xs) - Math.min(...xs)),
      depth: Math.max(4, Math.max(...ys) - Math.min(...ys)),
    };
  }, [tenant]);

  if (!tenant) return null;

  const isF1 = tenant.floor === 'F1';
  const baseElev = isF1
    ? FLOORS.F1.elevation_m + (floorView === 'BOTH' ? explodedOffset : 0)
    : FLOORS.GF.elevation_m;

  const centerThree = cadToThree(tenant.center_cad[0], tenant.center_cad[1], baseElev + 0.1);
  const { width, depth } = dims;
  const accent = ACCENT_COLORS[tenant.template];
  const floorColor = FLOOR_COLORS[tenant.template];
  const wallH = 2.4;

  return (
    <group
      name="tenant-interior-pax"
      position={[centerThree.x, centerThree.y, centerThree.z]}
    >
      {/* Store interior floor pad */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[width - 0.12, 0.08, depth - 0.12]} />
        <meshStandardMaterial color={floorColor} roughness={0.75} />
      </mesh>

      {/* Low perimeter partition walls (open front +Z for clear camera sightline) */}
      <mesh position={[0, wallH / 2, -depth / 2 + 0.08]} castShadow>
        <boxGeometry args={[width, wallH, 0.14]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      <mesh position={[-width / 2 + 0.08, wallH / 2, 0]} castShadow>
        <boxGeometry args={[0.14, wallH, depth]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      <mesh position={[width / 2 - 0.08, wallH / 2, 0]} castShadow>
        <boxGeometry args={[0.14, wallH, depth]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* Back wall sign */}
      <Text
        position={[0, 2.02, -depth / 2 + 0.2]}
        fontSize={0.34}
        fontWeight={600}
        color={accent}
        maxWidth={width - 0.8}
        anchorX="center"
        anchorY="middle"
      >
        {tenant.name[language]}
      </Text>

      <VisibleTechFixtures width={width} depth={depth} />

      {/* Template-specific furniture */}
      {tenant.template === 'cafe' && (
        <group>
          {/* Service counter */}
          <mesh position={[0, 0.52, -depth * 0.26]} castShadow>
            <boxGeometry args={[width * 0.7, 1.04, 0.85]} />
            <meshStandardMaterial color="#78350F" roughness={0.65} />
          </mesh>
          {/* Espresso machine */}
          <mesh position={[-width * 0.18, 1.24, -depth * 0.28]}>
            <boxGeometry args={[0.75, 0.42, 0.48]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.5} roughness={0.35} />
          </mesh>
          {/* Digital menu board */}
          <mesh position={[0, 1.62, -depth / 2 + 0.18]}>
            <boxGeometry args={[width * 0.52, 0.52, 0.06]} />
            <meshStandardMaterial color="#0F172A" emissive="#1E293B" emissiveIntensity={0.4} />
          </mesh>
          <PosTerminal position={[width * 0.18, 1.04, -depth * 0.26]} />
          {/* Cafe tables */}
          {[-width * 0.24, width * 0.24].map((tx, idx) => (
            <group key={idx} position={[tx, 0, depth * 0.18]}>
              <mesh position={[0, 0.72, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 0.06, 14]} />
                <meshStandardMaterial color="#D97706" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.36, 0]}>
                <cylinderGeometry args={[0.06, 0.18, 0.72, 10]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {tenant.template === 'tienda' && (
        <group>
          {[-width * 0.26, 0, width * 0.26].map((rx, idx) => (
            <mesh key={idx} position={[rx, 0.72, -depth * 0.12]} castShadow>
              <boxGeometry args={[0.55, 1.44, depth * 0.44]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[width * 0.22, 0.5, depth * 0.26]} castShadow>
            <boxGeometry args={[width * 0.38, 1.0, 0.75]} />
            <meshStandardMaterial color={accent} roughness={0.55} />
          </mesh>
          <PosTerminal position={[width * 0.22, 1.0, depth * 0.26]} />
        </group>
      )}

      {tenant.template === 'restaurante' && (
        <group>
          <mesh position={[0, 0.54, -depth * 0.3]} castShadow>
            <boxGeometry args={[width * 0.82, 1.08, 0.9]} />
            <meshStandardMaterial color={accent} roughness={0.65} />
          </mesh>
          <mesh position={[0, 1.62, -depth / 2 + 0.18]}>
            <boxGeometry args={[width * 0.65, 0.52, 0.06]} />
            <meshStandardMaterial color="#0F172A" emissive="#0369A1" emissiveIntensity={0.35} />
          </mesh>
          <PosTerminal position={[width * 0.24, 1.08, -depth * 0.3]} />
          {[
            [-width * 0.24, depth * 0.08],
            [width * 0.24, depth * 0.08],
            [-width * 0.24, depth * 0.3],
            [width * 0.24, depth * 0.3],
          ].map(([tx, tz], idx) => (
            <mesh key={idx} position={[tx, 0.74, tz]} castShadow>
              <boxGeometry args={[1.15, 0.08, 0.8]} />
              <meshStandardMaterial color="#B45309" roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {tenant.template === 'farmacia' && (
        <group>
          <mesh position={[0, 0.52, depth * 0.12]} castShadow>
            <boxGeometry args={[width * 0.7, 1.04, 0.72]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.95, -depth * 0.36]} castShadow>
            <boxGeometry args={[width * 0.82, 1.9, 0.45]} />
            <meshStandardMaterial color="#D1FAE5" roughness={0.5} />
          </mesh>
          {/* Green pharmacy cross */}
          <mesh position={[-width * 0.34, 1.65, -depth / 2 + 0.18]}>
            <boxGeometry args={[0.55, 0.18, 0.06]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <mesh position={[-width * 0.34, 1.65, -depth / 2 + 0.18]}>
            <boxGeometry args={[0.18, 0.55, 0.06]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <PosTerminal position={[0.2, 1.04, depth * 0.12]} />
        </group>
      )}

      {tenant.template === 'cambio' && (
        <group>
          <mesh position={[0, 0.54, 0]} castShadow>
            <boxGeometry args={[width * 0.74, 1.08, 0.82]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.5} />
          </mesh>
          {/* Glass teller divider */}
          <mesh position={[0, 1.48, 0.26]}>
            <boxGeometry args={[width * 0.72, 0.8, 0.04]} />
            <meshStandardMaterial color="#BAE6FD" transparent opacity={0.42} />
          </mesh>
          {/* Exchange rate board */}
          <mesh position={[0, 1.58, -depth / 2 + 0.18]}>
            <boxGeometry args={[width * 0.62, 0.58, 0.06]} />
            <meshStandardMaterial color="#0F172A" emissive="#0284C7" emissiveIntensity={0.4} />
          </mesh>
          <PosTerminal position={[-0.4, 1.08, -0.05]} />
        </group>
      )}

      {tenant.template === 'duty-free' && (
        <group>
          {/* Island display gondolas */}
          {[-width * 0.22, width * 0.22].map((gx, idx) => (
            <mesh key={idx} position={[gx, 0.65, -depth * 0.08]} castShadow>
              <boxGeometry args={[1.4, 1.3, depth * 0.42]} />
              <meshStandardMaterial color="#F3E8FF" roughness={0.4} />
            </mesh>
          ))}
          {/* Dual checkout desk */}
          <mesh position={[0, 0.52, depth * 0.28]} castShadow>
            <boxGeometry args={[width * 0.68, 1.04, 0.8]} />
            <meshStandardMaterial color="#581C87" roughness={0.45} />
          </mesh>
          <PosTerminal position={[-width * 0.18, 1.04, depth * 0.28]} />
          <PosTerminal position={[width * 0.18, 1.04, depth * 0.28]} />
        </group>
      )}

      {tenant.template === 'sala-vip' && (
        <group>
          {/* Reception desk */}
          <mesh position={[-width * 0.22, 0.52, depth * 0.28]} castShadow>
            <boxGeometry args={[width * 0.36, 1.04, 0.72]} />
            <meshStandardMaterial color="#0F172A" roughness={0.45} />
          </mesh>
          <PosTerminal position={[-width * 0.22, 1.04, depth * 0.28]} />
          {/* Buffet counter */}
          <mesh position={[width * 0.18, 0.52, -depth * 0.3]} castShadow>
            <boxGeometry args={[width * 0.5, 1.04, 0.75]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          {/* Flight screen */}
          <mesh position={[-width * 0.25, 1.56, -depth / 2 + 0.18]}>
            <boxGeometry args={[width * 0.38, 0.5, 0.06]} />
            <meshStandardMaterial color="#0F172A" emissive="#0EA5E9" emissiveIntensity={0.4} />
          </mesh>
          {/* Lounge armchairs */}
          {[
            [-width * 0.24, -depth * 0.02],
            [width * 0.24, -depth * 0.02],
            [width * 0.24, depth * 0.22],
          ].map(([ax, az], idx) => (
            <mesh key={idx} position={[ax, 0.38, az]} castShadow>
              <boxGeometry args={[0.92, 0.76, 0.92]} />
              <meshStandardMaterial color="#1E40AF" roughness={0.75} />
            </mesh>
          ))}
        </group>
      )}

      {tenant.template === 'mostrador-aerolinea' && (
        <group>
          {[-width * 0.28, 0, width * 0.28].map((dx, idx) => (
            <group key={idx} position={[dx, 0, 0]}>
              <mesh position={[0, 0.52, 0]} castShadow>
                <boxGeometry args={[width * 0.22, 1.04, 0.85]} />
                <meshStandardMaterial color="#B45309" roughness={0.5} />
              </mesh>
              <PosTerminal position={[0, 1.04, 0]} />
              {/* Baggage scale stub */}
              <mesh position={[0, 0.12, 0.68]}>
                <boxGeometry args={[0.9, 0.24, 0.55]} />
                <meshStandardMaterial color="#475569" roughness={0.6} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 1.62, -depth / 2 + 0.18]}>
            <boxGeometry args={[width * 0.72, 0.48, 0.06]} />
            <meshStandardMaterial color="#0F172A" emissive="#0EA5E9" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}
