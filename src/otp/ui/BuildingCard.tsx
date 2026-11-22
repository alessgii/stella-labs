import { ArrowRight, X } from 'lucide-react';
import { NAVIGABLE_ZONES } from '../data/lodZones';
import { getSubsystemById } from '../data/subsystems';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function BuildingCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);
  const selectZone = useAppStore((s) => s.selectZone);
  const enterZone = useAppStore((s) => s.enterZone);
  const setSelectedSubsystemId = useAppStore((s) => s.setSelectedSubsystemId);

  if (!selectedZoneId) return null;

  const zone = NAVIGABLE_ZONES[selectedZoneId];
  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  return (
    <aside
      aria-label={zone.name[language]}
      className={`fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-20 w-full sm:w-96 max-h-[55vh] sm:max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-t-[14px] sm:rounded-[6px] border p-4 transition-colors ${
        isNetwork
          ? 'bg-slate-950/95 border-white/15 text-slate-100 backdrop-blur-sm'
          : 'bg-[var(--color-paper)]/95 border-[var(--color-hairline)] text-[var(--color-obsidian)] backdrop-blur-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                zone.dominantDomain === 'OT'
                  ? 'bg-orange-500/15 text-orange-600'
                  : 'bg-indigo-500/15 text-indigo-600'
              }`}
            >
              {zone.dominantDomain === 'OT' ? t.subsystems.otDomain : t.subsystems.itDomain}
            </span>
            <span
              className={`text-[12px] ${
                isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
              }`}
            >
              {zone.kind === 'building' ? t.lod.buildingKind : t.lod.exteriorKind}
            </span>
            {zone.coreNodeId && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isNetwork ? 'bg-sky-500/20 text-sky-300' : 'bg-[var(--color-ash)] text-black'
                }`}
              >
                {t.lod.coreNode}: {zone.coreNodeId}
              </span>
            )}
          </div>
          <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
            {zone.name[language]}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => selectZone(null)}
          aria-label="Cerrar"
          className={`rounded-full p-1 transition-colors cursor-pointer ${
            isNetwork ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-[var(--color-ash)] text-[var(--color-graphite)]'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p
        className={`text-[14px] leading-relaxed mb-3 ${
          isNetwork ? 'text-slate-300' : 'text-[var(--color-graphite)]'
        }`}
      >
        {zone.role[language]}
      </p>

      <div className="mb-4">
        <div
          className={`text-[12px] font-medium mb-1.5 ${
            isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
          }`}
        >
          {t.lod.subsystemsPresent}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {zone.keySubsystems.map((subId) => {
            const sub = getSubsystemById(subId);
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubsystemId(sub.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium border transition-colors cursor-pointer ${
                  isNetwork
                    ? 'border-white/15 text-slate-200 hover:bg-white/10'
                    : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span>{sub.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => enterZone(zone.id)}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-[14px] font-medium transition-colors cursor-pointer ${
          isNetwork
            ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
            : 'bg-[var(--color-obsidian)] text-[var(--color-paper)] hover:bg-neutral-800'
        }`}
      >
        <span>{t.lod.enter}</span>
        <ArrowRight className="h-4 w-4 stroke-[1.75]" />
      </button>
    </aside>
  );
}
