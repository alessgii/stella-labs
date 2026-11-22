import { NetworkScene } from '../modes/network/NetworkScene';
import { PassengerScene } from '../modes/passenger/PassengerScene';
import { useAppStore } from '../store/useAppStore';
import { CampusBuildings } from './Building';
import { CameraRig } from './CameraRig';
import { DebugOverlay } from './DebugOverlay';
import { Floors } from './Floors';
import { Ground } from './Ground';
import { LocalStage } from './LocalStage';

export function Campus() {
  const mode = useAppStore((s) => s.mode);
  const quality = useAppStore((s) => s.quality);
  const debugMode = useAppStore((s) => s.debugMode);
  const aglNightMode = useAppStore((s) => s.aglNightMode);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const tenantCampusTraceActive = useAppStore((s) => s.tenantCampusTraceActive);

  const isNetwork = mode === 'network';
  const isDark = isNetwork || aglNightMode;
  const inLocalStage = focusedTenantId !== null && !tenantCampusTraceActive;

  return (
    <>
      {!inLocalStage && (
        <>
          <color attach="background" args={[isDark ? '#090D16' : '#FFFFFF']} />

          <ambientLight intensity={isDark ? 0.5 : 0.88} />
          <directionalLight
            position={[120, 380, 320]}
            intensity={isNetwork ? 0.65 : 1.05}
            castShadow={!isNetwork && quality !== 'low'}
            shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
            shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
            shadow-camera-left={-450}
            shadow-camera-right={450}
            shadow-camera-top={450}
            shadow-camera-bottom={-450}
            shadow-camera-near={50}
            shadow-camera-far={1200}
            shadow-bias={-0.0005}
          />
          <directionalLight
            position={[-200, 180, -200]}
            intensity={isNetwork ? 0.25 : 0.35}
          />

          <CameraRig />
        </>
      )}

      <group name="airport-campus" visible={!inLocalStage}>
        <Ground />
        <Floors />
        <CampusBuildings />
        {isNetwork ? <NetworkScene /> : <PassengerScene />}
        {debugMode && <DebugOverlay />}
      </group>

      {inLocalStage && <LocalStage tenantId={focusedTenantId} />}
    </>
  );
}
