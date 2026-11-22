import { useMemo } from 'react';
import { Billboard, Line, Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { FIBER_CABLES } from '../../data/fiber';
import { cadToThreeTuple, threeToCad } from '../../lib/coords';
import { analyzePerimeterIntrusion } from '../../lib/dasFiber';
import { useAppStore } from '../../store/useAppStore';

export function DasPerimeterLayer() {
  const dasIntrusionCad = useAppStore((s) => s.dasIntrusionCad);
  const dasEventType = useAppStore((s) => s.dasEventType);
  const triggerDasIntrusion = useAppStore((s) => s.triggerDasIntrusion);

  const fenceSegments = useMemo(() => {
    const pts = FIBER_CABLES.DISTRIB_PERIMETRO.points_cad;
    const segs: { mid: [number, number, number]; len: number; angleY: number }[] = [];
    for (let i = 0; i < pts.length - 1; i += 1) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      const angleY = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
      segs.push({
        mid: cadToThreeTuple(mx, my, 1.0),
        len,
        angleY,
      });
    }
    return segs;
  }, []);

  const analysis = useMemo(() => {
    if (!dasIntrusionCad) return null;
    return analyzePerimeterIntrusion(dasIntrusionCad, dasEventType);
  }, [dasIntrusionCad, dasEventType]);

  const handleFenceClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const cad = threeToCad(e.point.x, e.point.z);
    triggerDasIntrusion(cad);
  };

  return (
    <group name="das-perimeter-layer">
      {/* Clickable perimeter fence hit-strips along DISTRIB_PERIMETRO */}
      {fenceSegments.map((seg, idx) => (
        <mesh
          key={`fence-hit-${idx}`}
          position={seg.mid}
          rotation={[0, -seg.angleY, 0]}
          onClick={handleFenceClick}
          onPointerOver={() => {
            document.body.style.cursor = 'crosshair';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <boxGeometry args={[seg.len, 2.5, 8.0]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {/* Active Intrusion Marker + Oriented CCTV Slew Line */}
      {analysis && (
        <group>
          <group
            position={cadToThreeTuple(
              analysis.snappedPoint_cad[0],
              analysis.snappedPoint_cad[1],
              0.5,
            )}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[8, 12, 32]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[18, 21, 32]} />
              <meshBasicMaterial color="#F97316" transparent opacity={0.7} />
            </mesh>
            <Billboard position={[0, 14, 0]}>
              <Text
                fontSize={6.5}
                fontWeight={600}
                color="#FCA5A5"
                outlineWidth={0.9}
                outlineColor="#450A0A"
              >
                {`INTRUSIÓN DAS: ${analysis.arcDistance_m} m`}
              </Text>
            </Billboard>
          </group>

          {/* Oriented CCTV line of sight from nearest perimeter rack */}
          <Line
            points={[
              cadToThreeTuple(
                analysis.nearestCctvPos_cad[0],
                analysis.nearestCctvPos_cad[1],
                4.0,
              ),
              cadToThreeTuple(
                analysis.snappedPoint_cad[0],
                analysis.snappedPoint_cad[1],
                1.5,
              ),
            ]}
            color="#FDE047"
            lineWidth={3}
            dashed
            dashSize={4}
            gapSize={2}
          />
          <Billboard
            position={cadToThreeTuple(
              analysis.nearestCctvPos_cad[0],
              analysis.nearestCctvPos_cad[1],
              12.0,
            )}
          >
            <Text
              fontSize={5.5}
              fontWeight={600}
              color="#FDE047"
              outlineWidth={0.8}
              outlineColor="#090D16"
            >
              {`CCTV-${analysis.nearestCctvRackId} ORIENTADA`}
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}
