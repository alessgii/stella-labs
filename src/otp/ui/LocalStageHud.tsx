import { Compass, Eye, EyeOff, Footprints, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

type ViewKey = 'iso' | 'entrance' | 'top' | 'ceiling' | 'walk';

const VIEW_LABELS: Record<ViewKey, { es: string; en: string }> = {
  iso: { es: 'Isométrica', en: 'Isometric' },
  entrance: { es: 'Desde la entrada', en: 'Entrance (1.6 m)' },
  top: { es: 'Planta cenital', en: 'Top-down' },
  ceiling: { es: 'Techo / infra', en: 'Ceiling / infra' },
  walk: { es: 'Caminar', en: 'Walk' },
};

export function LocalStageHud() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const localCeilingVisible = useAppStore((s) => s.localCeilingVisible);
  const localCameraView = useAppStore((s) => s.localCameraView);
  const activeLocalSubsystem = useAppStore((s) => s.activeLocalSubsystem);
  const ghostLocalFurniture = useAppStore((s) => s.ghostLocalFurniture);
  const toggleLocalCeiling = useAppStore((s) => s.toggleLocalCeiling);
  const setLocalCameraView = useAppStore((s) => s.setLocalCameraView);
  const setActiveLocalSubsystem = useAppStore((s) => s.setActiveLocalSubsystem);
  const toggleGhostLocalFurniture = useAppStore((s) => s.toggleGhostLocalFurniture);
  const exitTenant = useAppStore((s) => s.exitTenant);

  if (!focusedTenantId) return null;

  const isNetwork = mode === 'network';
  const presetKeys: ViewKey[] = ['iso', 'entrance', 'top', 'ceiling', 'walk'];

  return (
    <>
      {/* Top-left LocalStage controls: Exit first, then 4 presets + Walk + Ceiling */}
      <div className="fixed top-[116px] left-3 right-3 sm:right-auto sm:left-4 z-20 flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
        <button
          type="button"
          onClick={exitTenant}
          className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
            isNetwork
              ? 'border-white/20 bg-slate-900/95 text-white hover:bg-slate-800'
              : 'border-[var(--color-obsidian)] bg-[var(--color-obsidian)] text-[var(--color-paper)] hover:bg-neutral-800'
          }`}
        >
          <LogOut className="h-3.5 w-3.5 stroke-[1.75]" />
          <span>{language === 'es' ? 'Salir del local' : 'Exit store'}</span>
        </button>

        <div
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border p-1 ${
            isNetwork
              ? 'border-white/15 bg-slate-950/90'
              : 'border-[var(--color-hairline)] bg-[var(--color-paper)]/95'
          }`}
        >
          {presetKeys.map((key) => {
            const active = localCameraView === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'ceiling' && !localCeilingVisible) {
                    toggleLocalCeiling();
                  }
                  setLocalCameraView(key);
                }}
                className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                  active
                    ? isNetwork
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-[var(--color-obsidian)] text-[var(--color-paper)]'
                    : isNetwork
                      ? 'text-slate-300 hover:bg-white/10'
                      : 'text-[var(--color-graphite)] hover:bg-[var(--color-ash)]'
                }`}
              >
                {key === 'walk' && <Footprints className="h-3.5 w-3.5 stroke-[1.75]" />}
                <span>{VIEW_LABELS[key][language]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleLocalCeiling}
          className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
            isNetwork
              ? 'border-white/15 bg-slate-950/90 text-slate-100 hover:bg-slate-900'
              : 'border-[var(--color-hairline)] bg-[var(--color-paper)]/95 text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
          }`}
        >
          {localCeilingVisible ? (
            <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 stroke-[1.75]" />
          )}
          <span>
            {language === 'es'
              ? `Techo: ${localCeilingVisible ? 'Visible' : 'Oculto'}`
              : `Ceiling: ${localCeilingVisible ? 'On' : 'Off'}`}
          </span>
        </button>
      </div>

      {/* Walk mode hint pill */}
      {localCameraView === 'walk' && (
        <div className="fixed top-[168px] left-4 z-20 rounded-full bg-black/80 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
          {language === 'es'
            ? 'Modo Caminar (1.6 m) · WASD o flechas para moverte · Arrastra para mirar · Esc para salir'
            : 'Walk Mode (1.6 m) · WASD / Arrows to move · Drag to look · Esc to exit'}
        </div>
      )}

      {/* Network Lens subsystem & ghost furniture chips */}
      {isNetwork && (
        <div className="fixed top-[168px] left-3 right-3 sm:right-auto sm:left-4 z-20 flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          {(
            [
              { id: 'pos', label: 'POS', dot: '#10B981' },
              { id: 'wifi', label: 'Wi-Fi', dot: '#38BDF8' },
              { id: 'cctv', label: 'CCTV', dot: '#F43F5E' },
              { id: 'signage', label: language === 'es' ? 'Pantallas' : 'Signage', dot: '#A855F7' },
              { id: 'uplink', label: 'Uplink', dot: '#0EA5E9' },
              { id: 'all', label: language === 'es' ? 'Todos' : 'All', dot: '#94A3B8' },
            ] as const
          ).map((chip) => {
            const active = activeLocalSubsystem === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveLocalSubsystem(chip.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-sky-400/60 bg-sky-500/20 text-white'
                    : 'border-white/15 bg-slate-950/85 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chip.dot }}
                />
                <span>{chip.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={toggleGhostLocalFurniture}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              ghostLocalFurniture
                ? 'border-white/20 bg-white/10 text-slate-100'
                : 'border-white/15 bg-slate-950/85 text-slate-400'
            }`}
          >
            {language === 'es'
              ? `Muebles fantasma: ${ghostLocalFurniture ? 'ON' : 'OFF'}`
              : `Ghost furniture: ${ghostLocalFurniture ? 'ON' : 'OFF'}`}
          </button>
        </div>
      )}

      {/* Bottom-left scale bar & mini compass (hidden on xs so it never collides with bottom sheet) */}
      <div
        className={`hidden sm:flex fixed bottom-4 left-4 z-20 items-center gap-3 rounded-[6px] border px-3 py-2 text-[12px] ${
          isNetwork
            ? 'border-white/15 bg-slate-950/90 text-slate-200'
            : 'border-[var(--color-hairline)] bg-[var(--color-paper)]/95 text-[var(--color-obsidian)]'
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <span>2 m</span>
          </div>
          <div
            className={`h-1.5 w-14 border-x border-b ${
              isNetwork ? 'border-slate-300' : 'border-[var(--color-obsidian)]'
            }`}
          />
        </div>

        <div
          className={`flex items-center gap-1 pl-2 border-l text-[11px] font-semibold ${
            isNetwork ? 'border-white/15 text-slate-200' : 'border-[var(--color-hairline)] text-[var(--color-obsidian)]'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-rose-500" />
          <span>N</span>
        </div>
      </div>
    </>
  );
}
