import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getDeviceById } from '../../data/devices';
import { buildDevicePathTrace } from '../../lib/pathTrace';
import { useAppStore } from '../../store/useAppStore';

export function PathTrace3DLayer() {
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);
  const pulseRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  const trace = useMemo(() => {
    if (!selectedDeviceId) return null;
    const dev = getDeviceById(selectedDeviceId);
    if (!dev) return null;
    return buildDevicePathTrace(dev);
  }, [selectedDeviceId]);

  const vectors = useMemo(() => {
    if (!trace) return [];
    return trace.path3D.map((p) => new THREE.Vector3(p[0], p[1] + 0.25, p[2]));
  }, [trace]);

  const lineTuples = useMemo(
    () => vectors.map((v) => [v.x, v.y, v.z] as [number, number, number]),
    [vectors],
  );

  useFrame(({ invalidate }, delta) => {
    if (!pulseRef.current || vectors.length < 2) return;
    tRef.current = (tRef.current + delta * 0.35) % 1;
    const totalSegs = vectors.length - 1;
    const scaled = tRef.current * totalSegs;
    const idx = Math.min(totalSegs - 1, Math.floor(scaled));
    const localT = scaled - idx;
    pulseRef.current.position.lerpVectors(vectors[idx], vectors[idx + 1], localT);
    invalidate();
  });

  if (!trace || lineTuples.length < 2) return null;

  return (
    <group name="network-path-trace-3d">
      <Line points={lineTuples} color="#FDE047" lineWidth={4.5} />
      <mesh ref={pulseRef} position={lineTuples[0]}>
        <sphereGeometry args={[1.4, 14, 14]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FDE047"
          emissiveIntensity={1.4}
        />
      </mesh>
    </group>
  );
}
