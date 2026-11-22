import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Edges,
  Html,
  Line,
  OrbitControls,
  PerspectiveCamera,
  Text,
} from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { getTenantTemplateSpec, type LocalSubsystemId, type TemplateObjectSpec } from '../data/templates';
import { getInspectableSpace } from '../lib/inspectableSpace';
import { useAppStore } from '../store/useAppStore';

const SUBSYSTEM_COLORS: Record<LocalSubsystemId, string> = {
  pos: '#10B981',
  wifi: '#38BDF8',
  cctv: '#F43F5E',
  signage: '#A855F7',
  office: '#FBBF24',
  power: '#64748B',
  uplink: '#0EA5E9',
};

interface LocalStageProps {
  tenantId: string;
}

function InstancedTiles({
  width,
  depth,
  colors,
}: {
  width: number;
  depth: number;
  colors: [string, string];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cols = Math.round(width / 0.5);
  const rows = Math.round(depth / 0.5);
  const count = cols * rows;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const c1 = new THREE.Color(colors[0]);
    const c2 = new THREE.Color(colors[1]);
    let idx = 0;
    for (let ix = 0; ix < cols; ix++) {
      for (let iz = 0; iz < rows; iz++) {
        dummy.position.set(
          -width / 2 + 0.25 + ix * 0.5,
          0,
          -depth / 2 + 0.25 + iz * 0.5,
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
        mesh.setColorAt(idx, (ix + iz) % 2 === 0 ? c1 : c2);
        idx++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cols, rows, width, depth, colors]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow>
      <boxGeometry args={[0.485, 0.02, 0.485]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

function InstancedProducts({
  products,
}: {
  products: ReturnType<typeof getTenantTemplateSpec>['products'];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || products.length === 0) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    products.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      dummy.scale.set(p.size[0], p.size[1], p.size[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(p.color);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [products]);

  if (products.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, products.length]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} />
    </instancedMesh>
  );
}

function InstancedCeilingLights({
  lights,
}: {
  lights: [number, number, number][];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || lights.length === 0) return;
    const dummy = new THREE.Object3D();
    lights.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [lights]);

  if (lights.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, lights.length]}>
      <boxGeometry args={[0.6, 0.04, 0.6]} />
      <meshStandardMaterial
        color="#FFFFFF"
        emissive="#F8FAFC"
        emissiveIntensity={0.65}
        roughness={0.2}
      />
    </instancedMesh>
  );
}

function TemplateObjectMesh({
  obj,
  ghostFurniture,
  hotspotIndex,
  isSelected,
  isHovered,
  onHover,
  onSelect,
  language,
  isNetwork,
}: {
  obj: TemplateObjectSpec;
  ghostFurniture: boolean;
  hotspotIndex: number | null;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  language: 'es' | 'en';
  isNetwork: boolean;
}) {
  const isGhostable =
    ghostFurniture &&
    (obj.category === 'furniture' || obj.category === 'fixture');
  const opacity = isGhostable ? 0.22 : (obj.opacity ?? 1);
  const transparent = opacity < 1;

  return (
    <group position={obj.position}>
      <mesh
        castShadow={!transparent}
        receiveShadow
        onClick={(e) => {
          if (!obj.isHotspot || e.delta > 5) return;
          e.stopPropagation();
          onSelect(obj.id);
        }}
        onPointerOver={(e) => {
          if (!obj.isHotspot) return;
          e.stopPropagation();
          onHover(obj.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!obj.isHotspot) return;
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        {obj.shape === 'cylinder' ? (
          <cylinderGeometry
            args={[obj.size[0] / 2, obj.size[0] / 2, obj.size[1], 16]}
          />
        ) : obj.shape === 'dome' ? (
          <sphereGeometry args={[obj.size[0] / 2, 14, 10]} />
        ) : (
          <boxGeometry args={obj.size} />
        )}
        <meshStandardMaterial
          color={obj.color}
          transparent={transparent}
          opacity={opacity}
          roughness={obj.category === 'tech' || obj.category === 'network' ? 0.35 : 0.65}
          metalness={obj.category === 'network' ? 0.25 : 0.05}
        />
        {(isSelected || isHovered) && (
          <Edges
            scale={1.06}
            threshold={15}
            color={isSelected ? '#F59E0B' : '#0EA5E9'}
          />
        )}
      </mesh>

      {/* Fixed screen-space numbered HTML pin (12px font, max 12 hotspots) */}
      {obj.isHotspot && hotspotIndex !== null && hotspotIndex <= 12 && (
        <Html
          position={[0, obj.size[1] / 2 + 0.18, 0]}
          center
          zIndexRange={[10, 0]}
        >
          <div className="relative flex flex-col items-center pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(obj.id);
              }}
              onMouseEnter={() => onHover(obj.id)}
              onMouseLeave={() => onHover(null)}
              className={`h-5 w-5 rounded-full text-[11px] font-semibold leading-none flex items-center justify-center border shadow-sm transition-transform cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-white scale-110'
                  : isHovered
                    ? 'bg-sky-500 text-white border-white scale-110'
                    : isNetwork
                      ? 'bg-slate-900/90 text-slate-100 border-white/40'
                      : 'bg-black/85 text-white border-white/80'
              }`}
            >
              {hotspotIndex}
            </button>
            {(isHovered || isSelected) && (
              <div
                className={`mt-1 whitespace-nowrap rounded px-2 py-0.5 text-[12px] font-medium shadow-sm pointer-events-none ${
                  isNetwork
                    ? 'bg-slate-950/90 text-slate-100 border border-white/15'
                    : 'bg-black/85 text-white'
                }`}
              >
                {obj.label[language]}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function LocalStage({ tenantId }: LocalStageProps) {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const localCeilingVisible = useAppStore((s) => s.localCeilingVisible);
  const localCameraView = useAppStore((s) => s.localCameraView);
  const localCameraTick = useAppStore((s) => s.localCameraTick);
  const selectedLocalObjectId = useAppStore((s) => s.selectedLocalObjectId);
  const selectLocalObject = useAppStore((s) => s.selectLocalObject);
  const activeLocalSubsystem = useAppStore((s) => s.activeLocalSubsystem);
  const ghostLocalFurniture = useAppStore((s) => s.ghostLocalFurniture);
  const hoveredLogicalHop = useAppStore((s) => s.hoveredLogicalHop);
  const tenantIsolationTestTick = useAppStore((s) => s.tenantIsolationTestTick);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const space = getInspectableSpace(tenantId);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();

  const northWallMat = useRef<THREE.MeshStandardMaterial>(null);
  const southWallMat = useRef<THREE.MeshStandardMaterial>(null);
  const westWallMat = useRef<THREE.MeshStandardMaterial>(null);
  const eastWallMat = useRef<THREE.MeshStandardMaterial>(null);

  const spec = useMemo(
    () => space?.spec ?? getTenantTemplateSpec('tienda', 'estandar'),
    [space],
  );

  const hotspotIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let n = 1;
    for (const o of spec.objects) {
      if (o.isHotspot) {
        map.set(o.id, n++);
      }
    }
    return map;
  }, [spec]);

  const { width_m: W, depth_m: D, height_m: H, doorwayWidth_m: DW } = spec;
  const pierW = (W - DW) / 2;
  const isNetwork = mode === 'network';
  const isWalk = localCameraView === 'walk';
  const usesFiber = space?.usesFiber ?? false;
  const ledRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  // Camera transition state for presets & hotspot inspection
  const desiredCamPos = useRef(new THREE.Vector3(6.2, 5.0, 7.0));
  const desiredTarget = useRef(new THREE.Vector3(0, 1.1, 0));
  const camTransitioning = useRef(false);

  // First-person walk state
  const walkPos = useRef(new THREE.Vector3(0, 1.6, 2.4));
  const walkYaw = useRef(0);
  const walkPitch = useRef(-0.08);
  const keysPressed = useRef<Set<string>>(new Set());
  const draggingWalk = useRef(false);
  const lastPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Trigger camera preset or selected hotspot focus
  useEffect(() => {
    if (localCameraView === 'walk') {
      walkPos.current.set(0, 1.6, 2.4);
      walkYaw.current = 0;
      walkPitch.current = -0.06;
      camera.position.copy(walkPos.current);
      camTransitioning.current = false;
      return;
    }

    if (selectedLocalObjectId) {
      const obj = spec.objects.find((o) => o.id === selectedLocalObjectId);
      if (obj) {
        const [ox, oy, oz] = obj.position;
        desiredTarget.current.set(ox, oy, oz);
        const dirX = ox >= 0 ? -2.2 : 2.2;
        const dirZ = oz >= 0 ? 2.4 : 2.8;
        desiredCamPos.current.set(
          THREE.MathUtils.clamp(ox + dirX, -W / 2 - 2, W / 2 + 2),
          THREE.MathUtils.clamp(oy + 1.2, 1.0, 4.8),
          THREE.MathUtils.clamp(oz + dirZ, -D / 2 - 2, D / 2 + 3),
        );
        camTransitioning.current = true;
        return;
      }
    }

    if (localCameraView === 'iso') {
      desiredCamPos.current.set(6.2, 5.0, 7.0);
      desiredTarget.current.set(0, 1.1, 0);
    } else if (localCameraView === 'entrance') {
      desiredCamPos.current.set(0, 1.6, 3.6);
      desiredTarget.current.set(0, 1.35, -0.8);
    } else if (localCameraView === 'top') {
      desiredCamPos.current.set(0, 10.2, 0.05);
      desiredTarget.current.set(0, 0, 0);
    } else if (localCameraView === 'ceiling') {
      desiredCamPos.current.set(3.8, 2.2, 4.2);
      desiredTarget.current.set(0, 2.85, 0);
    }
    camTransitioning.current = true;
  }, [localCameraView, localCameraTick, selectedLocalObjectId, spec, W, D, camera]);

  // Keyboard & drag listeners for Walk mode
  useEffect(() => {
    if (!isWalk) return;
    const dom = gl.domElement;

    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    const onPointerDown = (e: PointerEvent) => {
      draggingWalk.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingWalk.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      walkYaw.current -= dx * 0.004;
      walkPitch.current = THREE.MathUtils.clamp(
        walkPitch.current - dy * 0.004,
        -0.75,
        0.75,
      );
    };
    const onPointerUp = () => {
      draggingWalk.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      keysPressed.current.clear();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isWalk, gl]);

  // Collision helper for Walk mode
  const collides = (nx: number, nz: number) => {
    const pad = 0.35;
    if (Math.abs(nx) > W / 2 - pad || Math.abs(nz) > D / 2 - pad) return true;
    for (const o of spec.objects) {
      if (o.category !== 'furniture' && o.category !== 'structure') continue;
      if (o.position[1] > 1.8) continue;
      const hw = o.size[0] / 2 + 0.22;
      const hd = o.size[2] / 2 + 0.22;
      if (
        Math.abs(nx - o.position[0]) < hw &&
        Math.abs(nz - o.position[2]) < hd
      ) {
        return true;
      }
    }
    return false;
  };

  useFrame((_, delta) => {
    // 1. Walk mode movement
    if (isWalk) {
      const speed = 2.6 * Math.min(delta, 0.05);
      const forwardX = -Math.sin(walkYaw.current);
      const forwardZ = -Math.cos(walkYaw.current);
      const rightX = Math.cos(walkYaw.current);
      const rightZ = -Math.sin(walkYaw.current);

      let moveX = 0;
      let moveZ = 0;
      const keys = keysPressed.current;
      if (keys.has('w') || keys.has('arrowup')) {
        moveX += forwardX * speed;
        moveZ += forwardZ * speed;
      }
      if (keys.has('s') || keys.has('arrowdown')) {
        moveX -= forwardX * speed;
        moveZ -= forwardZ * speed;
      }
      if (keys.has('a') || keys.has('arrowleft')) {
        moveX -= rightX * speed;
        moveZ -= rightZ * speed;
      }
      if (keys.has('d') || keys.has('arrowright')) {
        moveX += rightX * speed;
        moveZ += rightZ * speed;
      }

      if (moveX !== 0 && !collides(walkPos.current.x + moveX, walkPos.current.z)) {
        walkPos.current.x += moveX;
      }
      if (moveZ !== 0 && !collides(walkPos.current.x, walkPos.current.z + moveZ)) {
        walkPos.current.z += moveZ;
      }

      camera.position.copy(walkPos.current);
      const lookX = walkPos.current.x + forwardX * 2;
      const lookY = walkPos.current.y + Math.sin(walkPitch.current) * 2;
      const lookZ = walkPos.current.z + forwardZ * 2;
      camera.lookAt(lookX, lookY, lookZ);
    } else if (camTransitioning.current && controlsRef.current) {
      const t = Math.min(1, delta * 6);
      camera.position.lerp(desiredCamPos.current, t);
      controlsRef.current.target.lerp(desiredTarget.current, t);
      controlsRef.current.update();
      if (
        camera.position.distanceTo(desiredCamPos.current) < 0.03 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.03
      ) {
        camTransitioning.current = false;
      }
    }

    // 2. Dollhouse wall cutaway
    const cx = camera.position.x;
    const cz = camera.position.z;

    if (northWallMat.current) {
      const cut = !isWalk && cz < -D / 2 + 0.6;
      northWallMat.current.opacity = cut ? 0.12 : 1;
      northWallMat.current.depthWrite = !cut;
    }
    if (southWallMat.current) {
      const cut = !isWalk && cz > D / 2 - 0.6;
      southWallMat.current.opacity = cut ? 0.14 : 1;
      southWallMat.current.depthWrite = !cut;
    }
    if (westWallMat.current) {
      const cut = !isWalk && cx < -W / 2 + 0.6;
      westWallMat.current.opacity = cut ? 0.12 : 1;
      westWallMat.current.depthWrite = !cut;
    }
    if (eastWallMat.current) {
      const cut = !isWalk && cx > W / 2 - 0.6;
      eastWallMat.current.opacity = cut ? 0.12 : 1;
      eastWallMat.current.depthWrite = !cut;
    }

    // 3. Animate 8 switch port LEDs in Network Lens
    if (isNetwork) {
      const t = performance.now() * 0.004;
      ledRefs.current.forEach((mat, i) => {
        if (!mat) return;
        const blink = Math.sin(t * (1.8 + i * 0.4) + i * 1.7) > 0;
        if (tenantIsolationTestTick > 0 && i === 0) {
          mat.color.set(blink ? '#EF4444' : '#FCA5A5');
        } else if (i < 6) {
          mat.color.set(blink ? '#10B981' : '#34D399');
        } else {
          mat.color.set('#334155');
        }
      });
    }
  });

  if (!space) return null;

  const wallColor = isNetwork ? '#1E293B' : '#F1F5F9';

  return (
    <group name="local-stage">
      <color attach="background" args={[isNetwork ? '#090D16' : '#F8FAFC']} />

      <PerspectiveCamera
        makeDefault
        fov={isWalk ? 60 : 44}
        near={0.05}
        far={80}
        position={[Math.max(6.2, W * 0.65), Math.max(5.0, H * 1.4), Math.max(7.0, D * 0.92)]}
      />

      {!isWalk && (
        <OrbitControls
          ref={controlsRef}
          target={[0, 1.1, 0]}
          minDistance={2}
          maxDistance={18}
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI / 2 - 0.04}
          enableDamping
          dampingFactor={0.08}
          onStart={() => {
            camTransitioning.current = false;
          }}
        />
      )}

      {/* Dedicated room studio lighting */}
      <hemisphereLight args={['#FFFFFF', '#CBD5E1', isNetwork ? 0.55 : 0.85]} />
      <directionalLight
        position={[6, 10, 7]}
        intensity={isNetwork ? 0.75 : 1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />
      <ContactShadows
        position={[0, 0.004, 0]}
        opacity={isNetwork ? 0.2 : 0.32}
        scale={14}
        blur={1.8}
        far={4}
      />

      {/* Tiled floor */}
      <InstancedTiles
        width={W}
        depth={D}
        colors={isNetwork ? ['#0F172A', '#1E293B'] : spec.tileColors}
      />

      {/* Perimeter walls with dollhouse cutaway */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W, H, 0.14]} />
        <meshStandardMaterial ref={northWallMat} color={wallColor} transparent opacity={1} roughness={0.8} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.14, H, D]} />
        <meshStandardMaterial ref={westWallMat} color={wallColor} transparent opacity={1} roughness={0.8} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.14, H, D]} />
        <meshStandardMaterial ref={eastWallMat} color={wallColor} transparent opacity={1} roughness={0.8} />
      </mesh>
      <mesh position={[-W / 2 + pierW / 2, H / 2, D / 2]} receiveShadow>
        <boxGeometry args={[pierW, H, 0.14]} />
        <meshStandardMaterial ref={southWallMat} color={wallColor} transparent opacity={1} roughness={0.8} />
      </mesh>
      <mesh position={[W / 2 - pierW / 2, H / 2, D / 2]} receiveShadow>
        <boxGeometry args={[pierW, H, 0.14]} />
        <meshStandardMaterial color={wallColor} transparent opacity={0.18} roughness={0.8} />
      </mesh>
      <mesh position={[0, H - 0.35, D / 2]}>
        <boxGeometry args={[DW, 0.7, 0.14]} />
        <meshStandardMaterial color={wallColor} transparent opacity={0.35} roughness={0.7} />
      </mesh>

      {/* Small architectural fascia sign above entrance */}
      <Text
        position={[0, 2.75, D / 2 + 0.08]}
        fontSize={0.16}
        fontWeight={600}
        color={isNetwork ? '#E2E8F0' : '#FFFFFF'}
        maxWidth={2.4}
        anchorX="center"
        anchorY="middle"
      >
        {space.name[language]}
      </Text>

      {/* Explicit template objects + selectable hotspots */}
      {spec.objects.map((obj) => {
        const isCeilingFixture = obj.position[1] >= 2.85;
        if (!localCeilingVisible && isCeilingFixture) return null;
        return (
          <TemplateObjectMesh
            key={obj.id}
            obj={obj}
            ghostFurniture={isNetwork && ghostLocalFurniture}
            hotspotIndex={hotspotIndexMap.get(obj.id) ?? null}
            isSelected={selectedLocalObjectId === obj.id}
            isHovered={hoveredId === obj.id}
            onHover={setHoveredId}
            onSelect={(id) => selectLocalObject(id)}
            language={language}
            isNetwork={isNetwork}
          />
        );
      })}

      {/* Instanced products */}
      {!isNetwork && <InstancedProducts products={spec.products} />}

      {/* Ceiling light grid & overhead cable tray */}
      {localCeilingVisible && (
        <group>
          <InstancedCeilingLights lights={spec.ceilingLights} />
          {spec.cableTray.map((seg, i) => (
            <Line
              key={`tray-${i}`}
              points={seg}
              color={isNetwork ? (hoveredLogicalHop === 'switch' ? '#F59E0B' : '#38BDF8') : '#64748B'}
              lineWidth={isNetwork ? 4 : 2.2}
            />
          ))}
        </group>
      )}

      {/* Visible vertical conduits color-coded by subsystem */}
      {spec.conduits.map((c) => {
        const highlighted =
          !isNetwork ||
          activeLocalSubsystem === 'all' ||
          c.subsystem === activeLocalSubsystem ||
          hoveredLogicalHop === 'endpoint';
        const color = isNetwork
          ? c.subsystem === 'uplink' && usesFiber
            ? '#F59E0B'
            : SUBSYSTEM_COLORS[c.subsystem]
          : '#475569';
        return (
          <Line
            key={c.id}
            points={c.points}
            color={color}
            lineWidth={isNetwork && highlighted ? 3.2 : 1.5}
            transparent={!highlighted}
            opacity={highlighted ? 1 : 0.22}
          />
        );
      })}

      {/* Network Lens: 8 animated switch port LEDs, optional Media Converter, and service exit arrow */}
      {isNetwork && (() => {
        const rackObj = spec.objects.find((o) => o.id.endsWith('-rack'));
        const demarcObj = spec.objects.find((o) => o.id.endsWith('-demarc'));
        const rx = rackObj?.position[0] ?? 2.6;
        const ry = rackObj?.position[1] ?? 1.45;
        const rz = rackObj?.position[2] ?? -2.74;
        const dx = demarcObj?.position[0] ?? 3.5;
        const dy = demarcObj?.position[1] ?? 1.2;
        const dz = demarcObj?.position[2] ?? -2.86;
        const exitZ = -D / 2 - 0.75;
        return (
          <group>
            {/* 8 switch port LEDs on 6U mini-rack */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh
                key={`led-${i}`}
                position={[rx - 0.22 + i * 0.06, ry + 0.11, rz + 0.23]}
              >
                <boxGeometry args={[0.032, 0.032, 0.02]} />
                <meshBasicMaterial
                  ref={(el) => {
                    ledRefs.current[i] = el;
                  }}
                  color={i < 6 ? '#10B981' : '#334155'}
                />
              </mesh>
            ))}

            {/* Media converter next to demarc when OS2 fiber is used */}
            {usesFiber && (
              <mesh position={[dx - 0.34, dy, dz]}>
                <boxGeometry args={[0.18, 0.24, 0.12]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.35} />
              </mesh>
            )}

            {/* Service cable exiting back wall toward IDF */}
            <Line
              points={[
                [rx, ry, dz],
                [dx, dy, dz],
                [dx, dy, exitZ],
              ]}
              color={
                hoveredLogicalHop === 'idf'
                  ? '#34D399'
                  : usesFiber
                    ? '#F59E0B'
                    : '#0EA5E9'
              }
              lineWidth={3.8}
            />
            <Html position={[dx, dy + 0.32, exitZ]} center zIndexRange={[10, 0]}>
              <div className="whitespace-nowrap rounded-full border border-white/20 bg-slate-950/92 px-2.5 py-1 text-[12px] font-medium text-slate-100 shadow-sm pointer-events-none">
                → IDF {space.idf} · {space.trayDistance_m} m ·{' '}
                {usesFiber
                  ? language === 'es'
                    ? 'Fibra OS2'
                    : 'OS2 Fiber'
                  : language === 'es'
                    ? 'Cat6A (cobre)'
                    : 'Cat6A (copper)'}
              </div>
            </Html>
          </group>
        );
      })()}
    </group>
  );
}
