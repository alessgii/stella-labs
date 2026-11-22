import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { NAVIGABLE_ZONES } from '../data/lodZones';
import { getTenantById } from '../data/tenants';
import { CAMPUS_CENTER_THREE, cadToThree } from '../lib/coords';
import { useAppStore } from '../store/useAppStore';

const DEFAULT_TARGET = new THREE.Vector3(
  CAMPUS_CENTER_THREE.x - 10,
  0,
  CAMPUS_CENTER_THREE.z + 10,
);
const ISO_OFFSET_PASSENGER = new THREE.Vector3(-360, 360, 360);
const ISO_OFFSET_NETWORK = new THREE.Vector3(-320, 440, 400);
const CAMPUS_ORTHO_ZOOM = 1.08;

export function CameraRig() {
  const mode = useAppStore((s) => s.mode);
  const cameraProjection = useAppStore((s) => s.cameraProjection);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const tenantCampusTraceActive = useAppStore((s) => s.tenantCampusTraceActive);
  const cameraResetTick = useAppStore((s) => s.cameraResetTick);
  const cameraFocusCad = useAppStore((s) => s.cameraFocusCad);
  const cameraFocusTick = useAppStore((s) => s.cameraFocusTick);

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { invalidate, camera } = useThree();

  const desiredPos = useRef(
    new THREE.Vector3().copy(DEFAULT_TARGET).add(ISO_OFFSET_PASSENGER),
  );
  const desiredTarget = useRef(new THREE.Vector3().copy(DEFAULT_TARGET));
  const desiredZoom = useRef(CAMPUS_ORTHO_ZOOM);
  const transitioning = useRef(false);
  const prevMode = useRef(mode);
  const prevResetTick = useRef(cameraResetTick);
  const prevFocusTick = useRef(cameraFocusTick);

  // Fly-to POI or specific CAD point
  useEffect(() => {
    if (prevFocusTick.current === cameraFocusTick || !cameraFocusCad) return;
    prevFocusTick.current = cameraFocusTick;
    const targetVec = cadToThree(cameraFocusCad[0], cameraFocusCad[1], 2);
    const offset = new THREE.Vector3(-120, 130, 120);
    desiredTarget.current.copy(targetVec);
    desiredPos.current.copy(targetVec).add(offset);
    desiredZoom.current = 2.8;
    transitioning.current = true;
    invalidate();
  }, [cameraFocusTick, cameraFocusCad, invalidate]);

  // Trigger fly-to on LOD enter/exit (and on mount if deep-linked to a tenant)
  const didMountRef = useRef(false);
  useEffect(() => {
    const isInitialDeepLink = !didMountRef.current && focusedTenantId !== null;
    didMountRef.current = true;
    if (!isInitialDeepLink && prevResetTick.current === cameraResetTick) return;
    prevResetTick.current = cameraResetTick;

    const tenant = focusedTenantId ? getTenantById(focusedTenantId) : undefined;
    if (tenant && !tenantCampusTraceActive) {
      const targetVec = cadToThree(
        tenant.center_cad[0],
        tenant.center_cad[1],
        tenant.floor === 'F1' ? 6 : 0,
      );
      const offset = new THREE.Vector3(-28, 34, 30);
      desiredTarget.current.copy(targetVec);
      desiredPos.current.copy(targetVec).add(offset);
      desiredZoom.current = 5.8;
      transitioning.current = true;
      invalidate();
    } else if (focusedZoneId) {
      const zone = NAVIGABLE_ZONES[focusedZoneId];
      const targetVec = cadToThree(zone.center_cad[0], zone.center_cad[1], 2);
      const offset = new THREE.Vector3(
        zone.perspectiveOffset[0],
        zone.perspectiveOffset[1],
        zone.perspectiveOffset[2],
      );
      desiredTarget.current.copy(targetVec);
      desiredPos.current.copy(targetVec).add(offset);
      desiredZoom.current = zone.orthoZoom;
      transitioning.current = true;
      invalidate();
    } else {
      const offset = mode === 'network' ? ISO_OFFSET_NETWORK : ISO_OFFSET_PASSENGER;
      desiredTarget.current.copy(DEFAULT_TARGET);
      desiredPos.current.copy(DEFAULT_TARGET).add(offset);
      desiredZoom.current = CAMPUS_ORTHO_ZOOM;
      transitioning.current = true;
      invalidate();
    }
  }, [cameraResetTick, focusedZoneId, focusedTenantId, mode, invalidate]);

  // Mode switch camera animation ONLY at Campus level; inside a building, camera stays put
  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;

    if (focusedZoneId !== null) {
      // Keep exact camera, building, and floor across lens switch
      invalidate();
      return;
    }

    const offset = mode === 'network' ? ISO_OFFSET_NETWORK : ISO_OFFSET_PASSENGER;
    desiredTarget.current.set(CAMPUS_CENTER_THREE.x, 0, CAMPUS_CENTER_THREE.z);
    desiredPos.current.copy(desiredTarget.current).add(offset);
    desiredZoom.current = CAMPUS_ORTHO_ZOOM;
    transitioning.current = true;
    invalidate();
  }, [mode, focusedZoneId, invalidate]);

  // Keep camera aligned on projection switch
  useEffect(() => {
    invalidate();
  }, [cameraProjection, camera, invalidate]);

  useFrame(({ camera: activeCam }, delta) => {
    if (!transitioning.current || !controlsRef.current) return;
    const t = 1 - Math.exp(-delta * 4.2);

    activeCam.position.lerp(desiredPos.current, t);
    controlsRef.current.target.lerp(desiredTarget.current, t);

    let zoomDone = true;
    if (activeCam instanceof THREE.OrthographicCamera) {
      activeCam.zoom = THREE.MathUtils.lerp(activeCam.zoom, desiredZoom.current, t);
      activeCam.updateProjectionMatrix();
      zoomDone = Math.abs(activeCam.zoom - desiredZoom.current) < 0.02;
    }

    controlsRef.current.update();
    invalidate();

    if (
      activeCam.position.distanceTo(desiredPos.current) < 0.8 &&
      controlsRef.current.target.distanceTo(desiredTarget.current) < 0.8 &&
      zoomDone
    ) {
      activeCam.position.copy(desiredPos.current);
      controlsRef.current.target.copy(desiredTarget.current);
      if (activeCam instanceof THREE.OrthographicCamera) {
        activeCam.zoom = desiredZoom.current;
        activeCam.updateProjectionMatrix();
      }
      controlsRef.current.update();
      transitioning.current = false;
    }
  });

  const initialPos: [number, number, number] = [
    DEFAULT_TARGET.x + ISO_OFFSET_PASSENGER.x,
    DEFAULT_TARGET.y + ISO_OFFSET_PASSENGER.y,
    DEFAULT_TARGET.z + ISO_OFFSET_PASSENGER.z,
  ];

  return (
    <>
      {cameraProjection === 'ortho' ? (
        <OrthographicCamera
          makeDefault
          position={initialPos}
          zoom={CAMPUS_ORTHO_ZOOM}
          near={-2000}
          far={4000}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          position={initialPos}
          fov={42}
          near={1}
          far={5000}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z]}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2 - 0.06}
        minPolarAngle={0.12}
        minZoom={0.5}
        maxZoom={14}
        minDistance={30}
        maxDistance={1400}
        onChange={() => invalidate()}
      />
    </>
  );
}
