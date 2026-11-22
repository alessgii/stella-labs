import { Billboard, Text } from '@react-three/drei';
import { FAILURE_SCENARIOS } from '../../data/failures';
import { FIBER_CABLES } from '../../data/fiber';
import { CORE_NODES, TOWER_FEEDS } from '../../data/nodes';
import { DISTRIBUTION_RACKS } from '../../data/racks';
import { cadToThreeTuple } from '../../lib/coords';
import { pointInsideAnyBuilding } from '../../lib/geometry';
import { useAppStore } from '../../store/useAppStore';

export function NodesLayer() {
  const itOtLens = useAppStore((s) => s.itOtLens);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const networkLayers = useAppStore((s) => s.networkLayers);
  const threeLayerView = useAppStore((s) => s.threeLayerView);
  const activeFailureId = useAppStore((s) => s.activeFailureId);
  const selectIdf = useAppStore((s) => s.selectIdf);
  const setInspectedElement = useAppStore((s) => s.setInspectedElement);

  const activeScenario = FAILURE_SCENARIOS.find((f) => f.id === activeFailureId);

  return (
    <group name="network-nodes-layer">
      {/* 6 Core Nodes N1-N6 */}
      {networkLayers.coreNodes &&
        CORE_NODES.map((node) => {
          const disabled = activeScenario?.disabledNodeId === node.id;
          const yElev = threeLayerView
            ? 26.0
            : node.id === 'N3'
              ? 16.0
              : 3.2;
          const pos = cadToThreeTuple(node.pos_cad[0], node.pos_cad[1], yElev);

          return (
            <group
              key={node.id}
              position={pos}
              onClick={(e) => {
                e.stopPropagation();
                setInspectedElement({ kind: 'node', id: node.id });
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <mesh>
                <cylinderGeometry args={[3.2, 3.6, 3.8, 20]} />
                <meshStandardMaterial
                  color={disabled ? '#7F1D1D' : '#F8FAFC'}
                  emissive={disabled ? '#EF4444' : '#38BDF8'}
                  emissiveIntensity={disabled ? 1.2 : 0.85}
                  roughness={0.25}
                />
              </mesh>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -yElev + 0.35, 0]}
              >
                <ringGeometry args={[5.5, 7.5, 24]} />
                <meshBasicMaterial
                  color={disabled ? '#EF4444' : '#38BDF8'}
                  transparent
                  opacity={0.6}
                />
              </mesh>
              {networkLayers.labels && (
                <Billboard position={[0, 7.5, 0]}>
                  <Text
                    fontSize={7}
                    fontWeight={600}
                    color={disabled ? '#FCA5A5' : '#F8FAFC'}
                    outlineWidth={1.0}
                    outlineColor="#090D16"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {disabled ? `${node.id} (CAÍDO)` : node.id}
                  </Text>
                </Billboard>
              )}
            </group>
          );
        })}

      {/* 2 Tower Duct Feeds */}
      {networkLayers.coreNodes &&
        TOWER_FEEDS.map((tf) => (
          <mesh
            key={tf.id}
            position={cadToThreeTuple(tf.pos_cad[0], tf.pos_cad[1], 1.2)}
          >
            <cylinderGeometry args={[1.6, 1.6, 2.4, 16]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive="#F59E0B"
              emissiveIntensity={0.7}
            />
          </mesh>
        ))}

      {/* 22 Distribution Racks R* */}
      {networkLayers.racks &&
        DISTRIBUTION_RACKS.map((rack) => {
          if (focusedZoneId === 'pier' && rack.ring !== 'DISTRIB_TERMINAL') {
            return null;
          }
          const isFocusedTerminalIdf =
            (focusedZoneId === 'departures' &&
              ['R1_T', 'R2_T', 'R3_T'].includes(rack.id)) ||
            (focusedZoneId === 'pier' && ['R4_T', 'R5_T'].includes(rack.id)) ||
            (focusedZoneId === 'arrivals' && rack.id === 'R6_T');
          if (isFocusedTerminalIdf && !threeLayerView) return null;

          const disabled = activeScenario?.disabledNodeId === rack.id;
          const indoor = pointInsideAnyBuilding([rack.x_cad, rack.y_cad]) !== null;
          const ringColor = disabled
            ? '#EF4444'
            : itOtLens
              ? rack.ring === 'DISTRIB_TERMINAL'
                ? '#6366F1'
                : '#F97316'
              : FIBER_CABLES[rack.ring].color;
          const yPos = threeLayerView ? 13.0 : indoor ? 2.2 : 1.25;
          const pos = cadToThreeTuple(rack.x_cad, rack.y_cad, yPos);

          return (
            <group
              key={rack.id}
              position={pos}
              onClick={(e) => {
                e.stopPropagation();
                if (rack.ring === 'DISTRIB_TERMINAL') {
                  selectIdf(rack.id as 'R1_T');
                } else {
                  setInspectedElement({ kind: 'rack', id: rack.id });
                }
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <mesh>
                <boxGeometry args={indoor ? [2.2, 2.4, 1.8] : [3.0, 2.5, 2.0]} />
                <meshStandardMaterial
                  color={indoor ? '#1E293B' : '#334155'}
                  emissive={ringColor}
                  emissiveIntensity={disabled ? 1.1 : 0.45}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0, 1.7, 0]}>
                <sphereGeometry args={[1.0, 12, 12]} />
                <meshStandardMaterial
                  color={ringColor}
                  emissive={ringColor}
                  emissiveIntensity={0.9}
                />
              </mesh>
              {networkLayers.labels && (
                <Billboard position={[0, 5.2, 0]}>
                  <Text
                    fontSize={4.8}
                    fontWeight={500}
                    color={ringColor}
                    outlineWidth={0.75}
                    outlineColor="#090D16"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {disabled ? `${rack.id} (FALLA)` : rack.id}
                  </Text>
                </Billboard>
              )}
            </group>
          );
        })}
    </group>
  );
}
