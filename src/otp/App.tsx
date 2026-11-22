import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { en } from './i18n/en';
import { es } from './i18n/es';
import { Campus } from './scene/Campus';
import { useAppStore } from './store/useAppStore';
import { Breadcrumb } from './ui/Breadcrumb';
import { BuildingCard } from './ui/BuildingCard';
import { BuildingSubsystemBar } from './ui/BuildingSubsystemBar';
import { CompassRose } from './ui/CompassRose';
import { DasPerimeterPanel } from './ui/DasPerimeterPanel';
import { DebugPanel } from './ui/DebugPanel';
import { EmergencyPanel } from './ui/EmergencyPanel';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { FidsCard } from './ui/FidsCard';
import { IdfSizingPanel } from './ui/IdfSizingPanel';
import { InfoCard } from './ui/InfoCard';
import { Legend } from './ui/Legend';
import { LocalHotspotPanel } from './ui/LocalHotspotPanel';
import { LocalStageHud } from './ui/LocalStageHud';
import { NetworkControlDock } from './ui/NetworkControlDock';
import { NetworkInspectorCard } from './ui/NetworkInspectorCard';
import { PathTracePanel } from './ui/PathTracePanel';
import { PowerPanel } from './ui/PowerPanel';
import { ColdChainPanel } from './ui/ColdChainPanel';
import { RoomPreviewCard } from './ui/RoomPreviewCard';
import { SearchBox } from './ui/SearchBox';
import { SpecialBuildingBar } from './ui/SpecialBuildingBar';
import { SubsystemCard } from './ui/SubsystemCard';
import { SubsystemCatalogPanel } from './ui/SubsystemCatalogPanel';
import { TenantCard } from './ui/TenantCard';
import { TenantNetworkPanel } from './ui/TenantNetworkPanel';
import { TopBar } from './ui/TopBar';
import { TourBar } from './ui/TourBar';
import { TowerAglPanel } from './ui/TowerAglPanel';
import { WayfindingPanel } from './ui/WayfindingPanel';

function LoadingFallback() {
  const language = useAppStore((s) => s.language);
  const mode = useAppStore((s) => s.mode);
  const t = language === 'es' ? es : en;

  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center text-[14px] font-medium ${
        mode === 'network' ? 'bg-[#090D16] text-slate-200' : 'bg-white text-black'
      }`}
    >
      {t.loading}
    </div>
  );
}

export function App() {
  const mode = useAppStore((s) => s.mode);
  const quality = useAppStore((s) => s.quality);
  const aglNightMode = useAppStore((s) => s.aglNightMode);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const tenantCampusTraceActive = useAppStore((s) => s.tenantCampusTraceActive);
  const setTenantCampusTraceActive = useAppStore((s) => s.setTenantCampusTraceActive);
  const language = useAppStore((s) => s.language);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const isNetwork = mode === 'network';
  const isDark = isNetwork || aglNightMode;
  const inLocalStage = focusedTenantId !== null && !tenantCampusTraceActive;

  const dpr: [number, number] = useMemo(() => {
    if (quality === 'low') return [1, 1];
    if (quality === 'medium') return [1, 1.25];
    return [1, 1.5];
  }, [quality]);

  return (
    <ErrorBoundary>
      <div
        className={`relative h-screen w-screen overflow-hidden select-none transition-colors duration-500 ${
          isDark ? 'bg-[#090D16]' : 'bg-[var(--color-paper)]'
        }`}
      >
        <TopBar
          catalogOpen={catalogOpen}
          onToggleCatalog={() => setCatalogOpen((prev) => !prev)}
        />
        <Breadcrumb />

        {/* LocalStage UI (when inside a tenant) */}
        {inLocalStage && (
          <>
            <LocalStageHud />
            <LocalHotspotPanel />
            <TenantCard />
            <TenantNetworkPanel />
          </>
        )}

        {/* Campus trace return banner when "Ver en el campus" is active */}
        {tenantCampusTraceActive && (
          <div className="fixed top-[118px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-full border border-sky-400/40 bg-slate-950/92 px-4 py-1.5 text-[13px] text-slate-100 backdrop-blur-md shadow-lg">
            <span>
              {language === 'es'
                ? 'Mostrando solo el recorrido del local en el campus'
                : 'Showing only this tenant route on campus'}
            </span>
            <button
              type="button"
              onClick={() => setTenantCampusTraceActive(false)}
              className="rounded-full bg-sky-500 px-3 py-0.5 text-[12px] font-semibold text-slate-950 hover:bg-sky-400 cursor-pointer"
            >
              {language === 'es' ? 'Volver al local (Esc)' : 'Back to store (Esc)'}
            </button>
          </div>
        )}

        {/* Campus UI (hidden when LocalStage or CampusTrace is active) */}
        {!inLocalStage && !tenantCampusTraceActive && (
          <>
            <SearchBox />
            <WayfindingPanel />
            <InfoCard />
            <FidsCard />
            <Legend />

            <NetworkControlDock />
            <NetworkInspectorCard />
            <BuildingSubsystemBar />
            <IdfSizingPanel />
            <PathTracePanel />
            <TowerAglPanel />
            <DasPerimeterPanel />

            <CompassRose />
            <BuildingCard />
            <SpecialBuildingBar />
            <RoomPreviewCard />
            <SubsystemCard />
            <DebugPanel />
          </>
        )}

        <TourBar />
        <SubsystemCatalogPanel
          open={catalogOpen}
          onClose={() => setCatalogOpen(false)}
        />
        <EmergencyPanel />
        <PowerPanel />
        <ColdChainPanel />

        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            shadows={!isDark && quality !== 'low'}
            dpr={dpr}
            frameloop={inLocalStage ? 'always' : 'demand'}
            gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
            className="h-full w-full"
          >
            <Campus />
          </Canvas>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
