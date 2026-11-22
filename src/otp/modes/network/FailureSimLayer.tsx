import { useMemo } from 'react';
import { Billboard, Line, Text } from '@react-three/drei';
import { FAILURE_SCENARIOS } from '../../data/failures';
import { DIMENSION_COTAS, FIBER_CABLES } from '../../data/fiber';
import { CORE_NODES } from '../../data/nodes';
import { DISTRIBUTION_RACKS } from '../../data/racks';
import { cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

export function FailureSimLayer() {
  const language = useAppStore((s) => s.language);
  const activeFailureId = useAppStore((s) => s.activeFailureId);
  const networkLayers = useAppStore((s) => s.networkLayers);
  const threeLayerView = useAppStore((s) => s.threeLayerView);

  const activeScenario = useMemo(
    () => FAILURE_SCENARIOS.find((f) => f.id === activeFailureId) ?? null,
    [activeFailureId],
  );

  // Dual-homing vertical lines for 3-Layer Logical View (Core y=26 <-> Dist y=13 <-> Access y=1.5)
  const dualHomingLines = useMemo(() => {
    if (!threeLayerView) return [];
    const lines: { pts: [[number, number, number], [number, number, number]]; color: string }[] = [];
    for (const c of Object.values(FIBER_CABLES)) {
      if (c.layer !== 'distribution' || !c.uplinkNodes) continue;
      for (const nodeId of c.uplinkNodes) {
        const node = CORE_NODES.find((n) => n.id === nodeId);
        if (node) {
          lines.push({
            pts: [
              cadToThreeTuple(node.pos_cad[0], node.pos_cad[1], 13),
              cadToThreeTuple(node.pos_cad[0], node.pos_cad[1], 26),
            ],
            color: c.color,
          });
        }
      }
    }
    return lines;
  }, [threeLayerView]);

  // Illustrative Access Stars on R1_T and R2_T for 3-Layer Logical View
  const accessStarSpokes = useMemo(() => {
    if (!threeLayerView) return [];
    const targetRacks = DISTRIBUTION_RACKS.filter(
      (r) => r.id === 'R1_T' || r.id === 'R2_T',
    );
    return targetRacks.flatMap((r) => {
      const center = cadToThreeTuple(r.x_cad, r.y_cad, 13);
      return [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const end = cadToThreeTuple(
          r.x_cad + Math.cos(rad) * 26,
          r.y_cad + Math.sin(rad) * 26,
          1.2,
        );
        return { center, end };
      });
    });
  }, [threeLayerView]);

  const ispADown = activeFailureId === 'F8' || activeFailureId === 'F4';

  return (
    <group name="network-failure-and-overlays">
      {/* External ISP Operator A (at N1) & Operator B (at N5) arrows */}
      <group>
        <Line
          points={[
            cadToThreeTuple(45.0, -103.58, 3.2),
            cadToThreeTuple(-45.0, -103.58, 3.2),
          ]}
          color={ispADown ? '#EF4444' : '#38BDF8'}
          lineWidth={3}
          dashed={ispADown}
          dashSize={3}
          gapSize={2}
        />
        <Billboard position={cadToThreeTuple(-48.0, -103.58, 9.0)}>
          <Text
            fontSize={4.8}
            fontWeight={600}
            color={ispADown ? '#FCA5A5' : '#7DD3FC'}
            outlineWidth={0.7}
            outlineColor="#090D16"
          >
            {ispADown ? 'ISP Operador A (CAÍDO)' : 'ISP Operador A (N1)'}
          </Text>
        </Billboard>

        <Line
          points={[
            cadToThreeTuple(405.0, -213.46, 3.2),
            cadToThreeTuple(465.0, -213.46, 3.2),
          ]}
          color="#22C55E"
          lineWidth={ispADown ? 4.2 : 3}
        />
        <Billboard position={cadToThreeTuple(472.0, -213.46, 9.0)}>
          <Text
            fontSize={4.8}
            fontWeight={600}
            color="#86EFAC"
            outlineWidth={0.7}
            outlineColor="#090D16"
          >
            {ispADown ? 'ISP Operador B (ACTIVO 100%)' : 'ISP Operador B (N5)'}
          </Text>
        </Billboard>
      </group>

      {/* Active Failure Cut Markers */}
      {activeScenario?.cutPoints_cad.map((pt, idx) => {
        const pos = cadToThreeTuple(pt[0], pt[1], threeLayerView ? 26 : 4.5);
        return (
          <group key={`cut-${idx}`} position={pos}>
            <mesh>
              <octahedronGeometry args={[5.2, 0]} />
              <meshStandardMaterial
                color="#EF4444"
                emissive="#EF4444"
                emissiveIntensity={1.5}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
              <ringGeometry args={[8, 11, 24]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
            <Billboard position={[0, 11, 0]}>
              <Text
                fontSize={6.5}
                fontWeight={600}
                color="#FECACA"
                outlineWidth={0.9}
                outlineColor="#450A0A"
              >
                {`CORTE ${activeScenario.id}`}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* F6 Emergency Radio Backup Link (200 m hypotenuse between N5 and N3, Cota 11) */}
      {activeScenario?.showRadioBackupLink && (
        <group>
          <Line
            points={[
              cadToThreeTuple(405.0, -213.46, 12.0),
              cadToThreeTuple(505.0, -386.67, 34.0),
            ]}
            color="#FDE047"
            lineWidth={4}
            dashed
            dashSize={6}
            gapSize={4}
          />
          <Billboard position={cadToThreeTuple(455.0, -300.0, 26.0)}>
            <Text
              fontSize={5.8}
              fontWeight={600}
              color="#FDE047"
              outlineWidth={0.85}
              outlineColor="#090D16"
            >
              {language === 'es'
                ? 'ENLACE RADIO RESPALDO · 200.00 m (MODO DEGRADADO)'
                : 'BACKUP RADIO LINK · 200.00 m (DEGRADED MODE)'}
            </Text>
          </Billboard>
        </group>
      )}

      {/* 16 Official CAD Dimension Cotas (#009646) */}
      {networkLayers.cotas &&
        DIMENSION_COTAS.map((cota) => {
          const p1 = cadToThreeTuple(cota.start_cad[0], cota.start_cad[1], 1.2);
          const p2 = cadToThreeTuple(cota.end_cad[0], cota.end_cad[1], 1.2);
          const mid: [number, number, number] = [
            (p1[0] + p2[0]) / 2,
            2.6,
            (p1[2] + p2[2]) / 2,
          ];
          return (
            <group key={cota.id}>
              <Line points={[p1, p2]} color="#009646" lineWidth={1.8} />
              <Billboard position={mid}>
                <Text
                  fontSize={4.2}
                  fontWeight={600}
                  color="#34D399"
                  outlineWidth={0.6}
                  outlineColor="#090D16"
                >
                  {`${cota.label}: ${cota.length_m} m`}
                </Text>
              </Billboard>
            </group>
          );
        })}

      {/* 3-Layer Logical View (Core y=26m / Distribution y=13m / Access y=1.5m) */}
      {threeLayerView && (
        <group name="three-layer-logical-view">
          {[
            { y: 26, label: 'CAPA 1: NÚCLEO (DOBLE ANILLO 100G)', color: '#005AFF' },
            { y: 13, label: 'CAPA 2: DISTRIBUCIÓN (DUAL-HOMING)', color: '#22C55E' },
            { y: 1.2, label: 'CAPA 3: ACCESO (ESTRELLA DESDE IDF)', color: '#F59E0B' },
          ].map((plane) => (
            <group key={plane.y}>
              <Billboard position={cadToThreeTuple(-75, -180, plane.y + 3)}>
                <Text
                  fontSize={6.5}
                  fontWeight={600}
                  color={plane.color}
                  outlineWidth={0.8}
                  outlineColor="#090D16"
                >
                  {plane.label}
                </Text>
              </Billboard>
            </group>
          ))}

          {/* Dual-homing uplinks */}
          {dualHomingLines.map((ln, idx) => (
            <Line
              key={`dh-${idx}`}
              points={ln.pts}
              color={ln.color}
              lineWidth={2.5}
              dashed
              dashSize={3}
              gapSize={2}
            />
          ))}

          {/* Illustrative Access Star on R1_T & R2_T */}
          {accessStarSpokes.map((sp, idx) => (
            <group key={`star-${idx}`}>
              <Line
                points={[sp.center, sp.end]}
                color="#F59E0B"
                lineWidth={1.8}
              />
              <mesh position={sp.end}>
                <sphereGeometry args={[1.4, 8, 8]} />
                <meshBasicMaterial color="#FBBF24" />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}
