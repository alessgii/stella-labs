import { useMemo } from 'react';
import { CircleDot, Luggage, Server, Sun } from 'lucide-react';
import {
  ALL_TERMINAL_DEVICES,
  type TerminalIdfId,
} from '../data/devices';
import { getSubsystemById, type SubsystemId } from '../data/subsystems';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore, type DaliSceneMode } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

const TERMINAL_SUBSYSTEM_ORDER: SubsystemId[] = [
  'fids',
  'cupps',
  'cctv',
  'wifi_das_cell',
  'pa_voip',
  'lighting_dali',
  'access_xray',
  'bhs',
  'pbb_400hz_pca',
];

const BUILDING_IDFS: Record<string, readonly TerminalIdfId[]> = {
  departures: ['R1_T', 'R2_T', 'R3_T'],
  pier: ['R4_T', 'R5_T'],
  arrivals: ['R6_T'],
};

export function BuildingSubsystemBar() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const activeBuildingSubsystems = useAppStore((s) => s.activeBuildingSubsystems);
  const show90mCircles = useAppStore((s) => s.show90mCircles);
  const selectedIdfId = useAppStore((s) => s.selectedIdfId);
  const daliScene = useAppStore((s) => s.daliScene);

  const toggleBuildingSubsystem = useAppStore((s) => s.toggleBuildingSubsystem);
  const clearBuildingSubsystems = useAppStore((s) => s.clearBuildingSubsystems);
  const setShow90mCircles = useAppStore((s) => s.setShow90mCircles);
  const selectIdf = useAppStore((s) => s.selectIdf);
  const setDaliScene = useAppStore((s) => s.setDaliScene);
  const jumpToFiberForDevice = useAppStore((s) => s.jumpToFiberForDevice);

  const isTerminal =
    focusedZoneId === 'departures' ||
    focusedZoneId === 'pier' ||
    focusedZoneId === 'arrivals';

  const buildingDevices = useMemo(
    () => ALL_TERMINAL_DEVICES.filter((d) => d.buildingId === focusedZoneId),
    [focusedZoneId],
  );

  const counts = useMemo(() => {
    const map = new Map<SubsystemId, number>();
    for (const d of buildingDevices) {
      map.set(d.subsystemId, (map.get(d.subsystemId) ?? 0) + 1);
    }
    return map;
  }, [buildingDevices]);

  if (!isTerminal) return null;

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';
  const idfList = (focusedZoneId && BUILDING_IDFS[focusedZoneId]) || [];

  const daliDevice = buildingDevices.find((d) => d.subsystemId === 'lighting_dali');
  const bhsDevice = buildingDevices.find((d) => d.subsystemId === 'bhs');

  // In Passenger Lens, show a compact DALI lighting & BHS control bar below SearchBox/on right
  if (!isNetwork) {
    return (
      <MobileBottomSheet
        ariaLabel={t.depths.daliTitle}
        desktopWidthClass="sm:w-72"
        desktopPositionClass="sm:top-29 sm:right-4 sm:bottom-auto"
        peekTitle={t.depths.daliTitle}
        peekSubtitle={t.depths.daliScenes[daliScene]}
        defaultExpandedMobile={false}
      >
        <div className="text-[12px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>{t.depths.daliTitle}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {(['day', 'night', 'cleaning', 'emergency'] as DaliSceneMode[]).map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setDaliScene(sc)}
              className={`rounded-full px-2 py-1 text-[11px] font-medium border cursor-pointer ${
                daliScene === sc
                  ? 'bg-[var(--color-obsidian)] text-[var(--color-paper)] border-[var(--color-obsidian)]'
                  : 'border-[var(--color-hairline)] text-[var(--color-graphite)] hover:bg-[var(--color-ash)]'
              }`}
            >
              {t.depths.daliScenes[sc]}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--color-graphite)] mb-2">
          {t.depths.daliNote}
        </p>
        <div className="flex flex-col gap-1">
          {daliDevice && (
            <button
              type="button"
              onClick={() => jumpToFiberForDevice(daliDevice.id)}
              className="w-full rounded-full border border-[var(--color-hairline)] bg-[var(--color-ash)] px-3 py-1 text-[11px] font-medium hover:bg-neutral-200 cursor-pointer"
            >
              {t.depths.daliTraceBtn} ({daliDevice.id})
            </button>
          )}
          {bhsDevice && (
            <button
              type="button"
              onClick={() => jumpToFiberForDevice(bhsDevice.id)}
              className="w-full inline-flex items-center justify-center gap-1 rounded-full bg-[var(--color-obsidian)] text-[var(--color-paper)] px-3 py-1 text-[11px] font-medium cursor-pointer"
            >
              <Luggage className="h-3 w-3" />
              <span>
                {t.depths.bhsTraceBtn} ({bhsDevice.id})
              </span>
            </button>
          )}
        </div>
        </div>
      </MobileBottomSheet>
    );
  }

  return (
    <MobileBottomSheet
      ariaLabel={t.networkInterior.subsystemsToggle}
      dark
      desktopWidthClass="sm:w-96"
      desktopPositionClass="sm:top-29 sm:left-4 sm:right-auto sm:bottom-auto"
      peekTitle={t.networkInterior.subsystemsToggle}
      peekSubtitle={idfList.join(' · ')}
      defaultExpandedMobile={false}
    >
      <div className="text-[12px]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-semibold text-[13px]">
          {t.networkInterior.subsystemsToggle}
        </span>
        <button
          type="button"
          onClick={clearBuildingSubsystems}
          className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-slate-300 hover:bg-white/10 cursor-pointer"
        >
          {t.networkInterior.onlyBackbone}
        </button>
      </div>

      {/* Subsystem chips */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {TERMINAL_SUBSYSTEM_ORDER.filter((id) => (counts.get(id) ?? 0) > 0).map(
          (id) => {
            const sub = getSubsystemById(id);
            const active = activeBuildingSubsystems.includes(id);
            const count = counts.get(id) ?? 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleBuildingSubsystem(id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors cursor-pointer ${
                  active
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'border-white/12 text-slate-400 hover:bg-white/8'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span>{id.toUpperCase()}</span>
                <span className="opacity-70 tabular-nums">({count})</span>
              </button>
            );
          },
        )}
      </div>

      {/* DALI Scene selector in Network Lens */}
      <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-white/10">
        <span className="text-[11px] text-slate-400">DALI:</span>
        <div className="flex gap-1">
          {(['day', 'night', 'cleaning', 'emergency'] as DaliSceneMode[]).map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setDaliScene(sc)}
              className={`rounded-full px-2 py-0.5 text-[10px] border cursor-pointer ${
                daliScene === sc
                  ? 'bg-amber-400 border-amber-400 text-slate-950 font-semibold'
                  : 'border-white/15 text-slate-300'
              }`}
            >
              {t.depths.daliScenes[sc].split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 90m Circle Toggle + IDF Quick Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShow90mCircles(!show90mCircles)}
          aria-pressed={show90mCircles}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
            show90mCircles
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
              : 'border-white/15 text-slate-400 hover:bg-white/10'
          }`}
        >
          <CircleDot className="h-3 w-3" />
          <span>{t.networkInterior.radius90m}</span>
        </button>

        <div className="flex items-center gap-1">
          {idfList.map((idf) => (
            <button
              key={idf}
              type="button"
              onClick={() => selectIdf(selectedIdfId === idf ? null : idf, true)}
              aria-pressed={selectedIdfId === idf}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border cursor-pointer ${
                selectedIdfId === idf
                  ? 'bg-sky-500 border-sky-500 text-slate-950'
                  : 'border-white/15 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Server className="h-3 w-3" />
              <span>{idf}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-400">
        {t.networkInterior.dualDuctNote}
      </div>
      </div>
    </MobileBottomSheet>
  );
}
