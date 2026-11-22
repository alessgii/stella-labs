import { useMemo } from 'react';
import { Billboard, Line, Text } from '@react-three/drei';
import { BUILDINGS, CONTROL_TOWER, TECH_ROOMS, rectToPolygon } from '../data/buildings';
import { FIBER_CABLES } from '../data/fiber';
import { CORE_NODES, TOWER_FEEDS } from '../data/nodes';
import { DISTRIBUTION_RACKS } from '../data/racks';
import { cadToThreeTuple } from '../lib/coords';

/**
 * Renders 3D axes, 100m coordinate grid, wireframe CAD polygons,
 * core nodes N1-N6, and distribution racks R* when ?debug=1.
 */
export function DebugOverlay() {
  const gridLines = useMemo(() => {
    const lines: {
      points: [[number, number, number], [number, number, number]];
      label?: string;
      pos?: [number, number, number];
    }[] = [];
    for (let x = -100; x <= 700; x += 100) {
      lines.push({
        points: [cadToThreeTuple(x, -550, 0.2), cadToThreeTuple(x, 200, 0.2)],
        label: `X=${x}`,
        pos: cadToThreeTuple(x, 205, 0.5),
      });
    }
    for (let y = -500; y <= 200; y += 100) {
      lines.push({
        points: [cadToThreeTuple(-100, y, 0.2), cadToThreeTuple(700, y, 0.2)],
        label: `Y=${y}`,
        pos: cadToThreeTuple(-115, y, 0.5),
      });
    }
    return lines;
  }, []);

  const buildingWireframes = useMemo(() => {
    const polys = BUILDINGS.map((b) => ({
      id: b.id,
      pts: [...b.outer, b.outer[0]].map(([x, y]) => cadToThreeTuple(x, y, 0.35)),
    }));
    for (const room of TECH_ROOMS) {
      const p = rectToPolygon(room.outer);
      polys.push({
        id: room.id,
        pts: [...p, p[0]].map(([x, y]) => cadToThreeTuple(x, y, 0.45)),
      });
    }
    return polys;
  }, []);

  const fiberWireframes = useMemo(() => {
    return Object.values(FIBER_CABLES).map((c) => {
      const pts = c.closed ? [...c.points_cad, c.points_cad[0]] : c.points_cad;
      return {
        id: c.id,
        color: c.color,
        pts: pts.map(([x, y]) => cadToThreeTuple(x, y, 0.6)),
      };
    });
  }, []);

  return (
    <group name="debug-overlay">
      {/* World Axes at CAD Origin (0,0) */}
      <axesHelper args={[80]} position={[0, 0.5, 0]} />
      <Text position={[88, 2, 0]} fontSize={7} color="#EF4444" outlineWidth={0.5} outlineColor="#FFFFFF">
        +X (E)
      </Text>
      <Text position={[0, 2, -88]} fontSize={7} color="#3B82F6" outlineWidth={0.5} outlineColor="#FFFFFF">
        +Y_cad (N)
      </Text>

      {/* 100m CAD Grid */}
      {gridLines.map((gl, idx) => (
        <group key={`grid-${idx}`}>
          <Line points={gl.points} color="#10B981" lineWidth={0.8} transparent opacity={0.35} />
          {gl.label && gl.pos && (
            <Text
              position={gl.pos}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={6}
              color="#059669"
            >
              {gl.label}
            </Text>
          )}
        </group>
      ))}

      {/* CAD Building Wireframes */}
      {buildingWireframes.map((wf) => (
        <Line key={`wf-${wf.id}`} points={wf.pts} color="#059669" lineWidth={1.6} />
      ))}

      {/* Tower CAD verification circle */}
      <mesh
        position={cadToThreeTuple(CONTROL_TOWER.center_cad[0], CONTROL_TOWER.center_cad[1], 0.4)}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[CONTROL_TOWER.outerRadius - 0.5, CONTROL_TOWER.outerRadius, 32]} />
        <meshBasicMaterial color="#059669" />
      </mesh>

      {/* Fiber CAD Centerlines */}
      {fiberWireframes.map((fw) => (
        <Line key={`fw-${fw.id}`} points={fw.pts} color={fw.color} lineWidth={2.2} />
      ))}

      {/* Core Nodes N1-N6 */}
      {CORE_NODES.map((n) => {
        const pos = cadToThreeTuple(n.pos_cad[0], n.pos_cad[1], 3.5);
        return (
          <group key={n.id} position={pos}>
            <mesh>
              <sphereGeometry args={[4.5, 16, 16]} />
              <meshBasicMaterial color="#22C55E" />
            </mesh>
            <Billboard position={[0, 10, 0]}>
              <Text
                fontSize={7.5}
                fontWeight={600}
                color="#065F46"
                outlineWidth={1.1}
                outlineColor="#ECFDF5"
                anchorX="center"
                anchorY="middle"
              >
                {n.id}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Tower Feeds */}
      {TOWER_FEEDS.map((tf) => (
        <mesh key={tf.id} position={cadToThreeTuple(tf.pos_cad[0], tf.pos_cad[1], 2.0)}>
          <boxGeometry args={[3.0, 3.0, 3.0]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      ))}

      {/* Distribution Racks R* */}
      {DISTRIBUTION_RACKS.map((r) => (
        <group key={r.id} position={cadToThreeTuple(r.x_cad, r.y_cad, 2.2)}>
          <mesh>
            <boxGeometry args={[3.5, 3.5, 3.5]} />
            <meshBasicMaterial color="#0284C7" />
          </mesh>
          <Billboard position={[0, 7.5, 0]}>
            <Text
              fontSize={5.5}
              fontWeight={500}
              color="#0369A1"
              outlineWidth={0.8}
              outlineColor="#F0F9FF"
              anchorX="center"
              anchorY="middle"
            >
              {r.id}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
}
