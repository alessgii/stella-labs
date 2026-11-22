import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Billboard, Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  AGL_BRIGHTNESS_STEPS,
  AGL_CIRCUITS,
  sampleCircuitLampPoints,
  type AglCircuit,
} from '../../data/agl';
import { cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

function CircuitLamps({
  circuit,
  intensityFactor,
  failedLampIndex,
}: {
  circuit: AglCircuit;
  intensityFactor: number;
  failedLampIndex: number | null;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => sampleCircuitLampPoints(circuit), [circuit]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    points.forEach((pt, idx) => {
      const isFailed = failedLampIndex === idx;
      dummy.position.set(pt[0], isFailed ? -5 : 0.35, -pt[1]);
      const s = circuit.type === 'apron-flood' ? 1.8 : 1.05;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points, failedLampIndex, circuit.type]);

  const powerLoopPts = useMemo(
    () => circuit.powerLoop_cad.map((p) => cadToThreeTuple(p[0], p[1], 0.14)),
    [circuit],
  );

  const failedPt =
    failedLampIndex !== null && points[failedLampIndex]
      ? points[failedLampIndex]
      : null;

  return (
    <group name={`agl-circuit-${circuit.id}`}>
      {/* Series power loop cable (yellow thin line, explicitly distinct from optical fiber) */}
      <Line
        points={powerLoopPts}
        color="#EAB308"
        lineWidth={1.2}
        dashed
        dashSize={3}
        gapSize={2}
      />

      <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial
          color={circuit.color}
          emissive={circuit.color}
          emissiveIntensity={0.4 + intensityFactor * 1.8}
        />
      </instancedMesh>

      {failedPt && (
        <group position={cadToThreeTuple(failedPt[0], failedPt[1], 1.5)}>
          <mesh>
            <OctahedronMarker />
          </mesh>
          <Billboard position={[0, 5.5, 0]}>
            <Text
              fontSize={3.8}
              fontWeight={600}
              color="#FCA5A5"
              outlineWidth={0.6}
              outlineColor="#450A0A"
            >
              FALLA LÁMPARA TWY-L-07
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

function OctahedronMarker() {
  return (
    <>
      <octahedronGeometry args={[2.2, 0]} />
      <meshStandardMaterial
        color="#EF4444"
        emissive="#EF4444"
        emissiveIntensity={1.3}
      />
    </>
  );
}

export function AglLayer() {
  const language = useAppStore((s) => s.language);
  const aglBrightnessStep = useAppStore((s) => s.aglBrightnessStep);
  const activeAglCircuits = useAppStore((s) => s.activeAglCircuits);
  const showSchematicRunway = useAppStore((s) => s.showSchematicRunway);
  const aglFailedLampSimulated = useAppStore((s) => s.aglFailedLampSimulated);
  const aglCommandTick = useAppStore((s) => s.aglCommandTick);
  const lastAglCommandCircuitId = useAppStore((s) => s.lastAglCommandCircuitId);

  const pulseRef = useRef<THREE.Mesh>(null);
  const animProgressRef = useRef<number>(2); // 0..1 command N3->Vault, 1..2 status Vault->N3

  const stepSpec =
    AGL_BRIGHTNESS_STEPS.find((s) => s.step === aglBrightnessStep) ??
    AGL_BRIGHTNESS_STEPS[2];

  const activeList = useMemo(
    () =>
      AGL_CIRCUITS.filter((c) => {
        if (c.isSchematicRunway && !showSchematicRunway) return false;
        return activeAglCircuits.includes(c.id);
      }),
    [activeAglCircuits, showSchematicRunway],
  );

  const commandCircuit = useMemo(
    () =>
      AGL_CIRCUITS.find((c) => c.id === lastAglCommandCircuitId) ??
      AGL_CIRCUITS[0],
    [lastAglCommandCircuitId],
  );

  const fiberVectors = useMemo(
    () =>
      commandCircuit.fiberPath_cad.map(
        (p) => new THREE.Vector3(p[0], 1.2, -p[1]),
      ),
    [commandCircuit],
  );

  useEffect(() => {
    if (aglCommandTick > 0) {
      animProgressRef.current = 0;
      if (pulseRef.current) pulseRef.current.visible = true;
    }
  }, [aglCommandTick]);

  useFrame(({ invalidate }, delta) => {
    if (!pulseRef.current || animProgressRef.current >= 2 || fiberVectors.length < 2) {
      if (pulseRef.current) pulseRef.current.visible = false;
      return;
    }
    pulseRef.current.visible = true;
    animProgressRef.current = Math.min(2, animProgressRef.current + delta * 1.15);
    const phase = animProgressRef.current;
    const forward = phase <= 1;
    const t = forward ? phase : 2 - phase;
    const totalSegs = fiberVectors.length - 1;
    const scaled = t * totalSegs;
    const idx = Math.min(totalSegs - 1, Math.floor(scaled));
    const localT = scaled - idx;

    pulseRef.current.position.lerpVectors(
      fiberVectors[idx],
      fiberVectors[idx + 1],
      localT,
    );
    const mat = pulseRef.current.material as THREE.MeshStandardMaterial;
    mat.color.set(forward ? '#38BDF8' : '#22C55E');
    mat.emissive.set(forward ? '#38BDF8' : '#22C55E');
    invalidate();
  });

  return (
    <group name="airside-agl-layer">
      {activeList.map((circuit) => (
        <CircuitLamps
          key={circuit.id}
          circuit={circuit}
          intensityFactor={stepSpec.intensityFactor}
          failedLampIndex={
            aglFailedLampSimulated && circuit.id === 'AGL-TWY-L-CL' ? 6 : null
          }
        />
      ))}

      {/* Power cable label */}
      <Billboard position={cadToThreeTuple(320, -45, 2.8)}>
        <Text
          fontSize={3.2}
          fontWeight={500}
          color="#FDE047"
          outlineWidth={0.5}
          outlineColor="#090D16"
        >
          {language === 'es'
            ? 'Lazo serie potencia CCR (2.8–6.6 A · no es fibra)'
            : 'CCR series power loop (2.8–6.6 A · not fiber)'}
        </Text>
      </Billboard>

      {showSchematicRunway && (
        <Billboard position={cadToThreeTuple(340, -478, 3.5)}>
          <Text
            fontSize={4.2}
            fontWeight={600}
            color="#F8FAFC"
            outlineWidth={0.6}
            outlineColor="#090D16"
          >
            {language === 'es'
              ? 'PISTA ESQUEMÁTICA (FUERA DEL PLANO CAD)'
              : 'SCHEMATIC RUNWAY (OUTSIDE CAD PLAN)'}
          </Text>
        </Billboard>
      )}

      {/* Command (N3 -> Vault) & Status Return (Vault -> N3) Optical Pulse */}
      <mesh
        ref={pulseRef}
        visible={false}
        position={cadToThreeTuple(505.0, -386.67, 1.5)}
      >
        <sphereGeometry args={[2.8, 14, 14]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#38BDF8"
          emissiveIntensity={1.6}
        />
      </mesh>
    </group>
  );
}
