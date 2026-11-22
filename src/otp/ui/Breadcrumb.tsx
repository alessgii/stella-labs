import { useEffect } from 'react';
import { ChevronRight, Layers, Store } from 'lucide-react';
import { FLOORS } from '../data/floors';
import { NAVIGABLE_ZONES, NAVIGABLE_ZONE_LIST, resolveNavigableZoneId } from '../data/lodZones';
import { TENANTS } from '../data/tenants';
import { getRoomsForBuilding } from '../data/previews';
import { getInspectableSpace } from '../lib/inspectableSpace';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function Breadcrumb() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const floorView = useAppStore((s) => s.floorView);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);

  const exitToCampus = useAppStore((s) => s.exitToCampus);
  const enterZone = useAppStore((s) => s.enterZone);
  const enterTenant = useAppStore((s) => s.enterTenant);
  const exitTenant = useAppStore((s) => s.exitTenant);
  const setFloorView = useAppStore((s) => s.setFloorView);
  const selectDevice = useAppStore((s) => s.selectDevice);
  const goUpLod = useAppStore((s) => s.goUpLod);

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';
  const focusedZone = focusedZoneId ? NAVIGABLE_ZONES[focusedZoneId] : null;
  const focusedTenant = focusedTenantId ? getInspectableSpace(focusedTenantId) : null;
  const zoneTenants = focusedZone
    ? focusedZone.id === 'ssei' || focusedZone.id === 'cargo'
      ? getRoomsForBuilding(focusedZone.id).map((r) => ({ id: r.id, name: r.shortLabel }))
      : TENANTS.filter((tn) => resolveNavigableZoneId(tn.building) === focusedZone.id)
    : [];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        goUpLod();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goUpLod]);

  const floorLabel =
    floorView === 'BOTH' ? t.floors.BOTH : FLOORS[floorView].label[language];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`fixed top-16 inset-x-0 z-20 h-11 px-4 md:px-6 flex items-center justify-between gap-3 border-b text-[13px] transition-colors ${
        isNetwork
          ? 'bg-slate-950/85 border-white/10 text-slate-200 backdrop-blur-sm'
          : 'bg-[var(--color-paper)]/90 border-[var(--color-hairline)] text-[var(--color-obsidian)] backdrop-blur-sm'
      }`}
    >
      {/* Left: Persistent LOD Breadcrumb (horizontally scrollable on mobile) */}
      <ol className="flex items-center gap-1 whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0 flex-1 py-0.5">
        <li>
          <button
            type="button"
            onClick={exitToCampus}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer ${
              !focusedZone
                ? isNetwork
                  ? 'bg-white/15 text-white'
                  : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
                : isNetwork
                  ? 'text-slate-300 hover:bg-white/10'
                  : 'text-[var(--color-graphite)] hover:bg-[var(--color-whisper)]'
            }`}
          >
            <Layers className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>{t.lod.campus}</span>
          </button>
        </li>

        {focusedZone && (
          <>
            <ChevronRight className="h-3.5 w-3.5 opacity-45 shrink-0" />
            <li>
              <button
                type="button"
                onClick={() => {
                  if (focusedTenantId) {
                    exitTenant();
                    return;
                  }
                  selectDevice(null);
                  if (focusedZone.hasFloors) {
                    setFloorView('BOTH');
                  }
                }}
                className={`rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  !focusedTenantId &&
                  !selectedDeviceId &&
                  (!focusedZone.hasFloors || floorView === 'BOTH')
                    ? isNetwork
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
                    : isNetwork
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-[var(--color-obsidian)] hover:bg-[var(--color-whisper)]'
                }`}
              >
                {focusedZone.name[language]}
              </button>
            </li>
          </>
        )}

        {focusedZone && focusedZone.hasFloors && (
          <>
            <ChevronRight className="h-3.5 w-3.5 opacity-45 shrink-0" />
            <li>
              <button
                type="button"
                onClick={() => {
                  if (focusedTenantId) {
                    exitTenant();
                    return;
                  }
                  selectDevice(null);
                }}
                className={`rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  !focusedTenantId && !selectedDeviceId
                    ? isNetwork
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
                    : isNetwork
                      ? 'text-slate-300 hover:bg-white/10'
                      : 'text-[var(--color-graphite)] hover:bg-[var(--color-whisper)]'
                }`}
              >
                {floorLabel}
              </button>
            </li>
          </>
        )}

        {focusedTenant && (
          <>
            <ChevronRight className="h-3.5 w-3.5 opacity-45 shrink-0" />
            <li>
              <button
                type="button"
                onClick={() => selectDevice(null)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  !selectedDeviceId
                    ? isNetwork
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
                    : isNetwork
                      ? 'text-slate-300 hover:bg-white/10'
                      : 'text-[var(--color-graphite)] hover:bg-[var(--color-whisper)]'
                }`}
              >
                <Store className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>{focusedTenant.name[language]}</span>
              </button>
            </li>
          </>
        )}

        {selectedDeviceId && (
          <>
            <ChevronRight className="h-3.5 w-3.5 opacity-45 shrink-0" />
            <li
              className={`rounded-full px-2.5 py-1 font-medium ${
                isNetwork ? 'bg-amber-500/20 text-amber-300' : 'bg-black text-white'
              }`}
            >
              {selectedDeviceId}
            </li>
          </>
        )}
      </ol>

      {/* Right: Quick zone pills at Campus level, quick tenant pills in Building, or Esc / Exit hint */}
      {!focusedZone ? (
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto min-w-0 py-0.5">
          {NAVIGABLE_ZONE_LIST.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => enterZone(zone.id)}
              className={`whitespace-nowrap shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-medium border transition-colors cursor-pointer ${
                isNetwork
                  ? 'border-white/12 text-slate-300 hover:bg-white/10'
                  : 'border-[var(--color-hairline)] text-[var(--color-graphite)] hover:text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
              }`}
            >
              {zone.name[language]}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          {!focusedTenant && zoneTenants.length > 0 && (
            <div className="hidden xl:flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0 max-w-[440px] py-0.5">
              {zoneTenants.slice(0, 3).map((tn) => (
                <button
                  key={tn.id}
                  type="button"
                  onClick={() => enterTenant(tn.id)}
                  className={`whitespace-nowrap shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-medium border transition-colors cursor-pointer ${
                    isNetwork
                      ? 'border-white/12 text-slate-300 hover:bg-white/10'
                      : 'border-[var(--color-hairline)] text-[var(--color-graphite)] hover:text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
                  }`}
                >
                  {tn.name[language]}
                </button>
              ))}
            </div>
          )}
          <span
            className={`hidden sm:inline whitespace-nowrap text-[12px] ${
              isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
            }`}
          >
            {t.lod.stepUpHint}
          </span>
          <button
            type="button"
            onClick={exitToCampus}
            className={`rounded-full px-3 py-1 text-[12px] font-medium border transition-colors cursor-pointer ${
              isNetwork
                ? 'border-white/15 text-slate-200 hover:bg-white/10'
                : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
            }`}
          >
            {t.lod.exitToCampus}
          </button>
        </div>
      )}
    </nav>
  );
}
