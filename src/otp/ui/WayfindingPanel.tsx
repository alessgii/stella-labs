import { useMemo } from 'react';
import { Accessibility, ArrowRight, Footprints, X } from 'lucide-react';
import { POIS } from '../data/poi';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { findWalkRoute } from '../lib/pathfinding';
import { useAppStore } from '../store/useAppStore';

export function WayfindingPanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const routeOriginId = useAppStore((s) => s.routeOriginId);
  const routeTargetId = useAppStore((s) => s.routeTargetId);
  const accessibleRoute = useAppStore((s) => s.accessibleRoute);
  const setRouteOriginId = useAppStore((s) => s.setRouteOriginId);
  const setAccessibleRoute = useAppStore((s) => s.setAccessibleRoute);
  const clearRoute = useAppStore((s) => s.clearRoute);

  const originPoi = POIS.find((p) => p.id === routeOriginId);
  const targetPoi = POIS.find((p) => p.id === routeTargetId);

  const route = useMemo(() => {
    if (!originPoi?.walkNodeId || !targetPoi?.walkNodeId) return null;
    return findWalkRoute(originPoi.walkNodeId, targetPoi.walkNodeId, accessibleRoute);
  }, [originPoi, targetPoi, accessibleRoute]);

  if (mode !== 'passenger' || !routeTargetId || !targetPoi) return null;

  const t = language === 'es' ? es : en;
  const originOptions = POIS.filter((p) => p.walkNodeId && (p.priority ?? 2) <= 2);

  const mins = Math.max(1, Math.round(route?.totalDuration_s ? route.totalDuration_s / 60 : 0));
  const meters = Math.round(route?.totalDistance_m ?? 0);

  return (
    <aside
      aria-label={t.passenger.routeTitle}
      className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-auto sm:top-58 sm:left-4 z-20 w-full sm:w-88 max-h-[38vh] sm:max-h-[calc(100vh-27.5rem)] flex flex-col rounded-t-[14px] sm:rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-paper)]/98 p-3.5 text-[var(--color-obsidian)] backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[14px] font-semibold">
          <Footprints className="h-4 w-4 stroke-[1.75]" />
          <span>{t.passenger.routeTitle}</span>
        </div>
        <button
          type="button"
          onClick={clearRoute}
          aria-label={t.passenger.clearRoute}
          className="rounded-full p-1 text-[var(--color-graphite)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Origin & Destination */}
      <div className="space-y-1.5 text-[12px] mb-2.5">
        <label className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[var(--color-graphite)]">
            {t.passenger.origin}
          </span>
          <select
            value={routeOriginId}
            onChange={(e) => setRouteOriginId(e.target.value)}
            className="w-full rounded-[4px] border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2 py-1 text-[12px]"
          >
            {originOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name[language]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[var(--color-graphite)]">
            {t.passenger.destination}
          </span>
          <span className="font-medium truncate">{targetPoi.name[language]}</span>
        </div>
      </div>

      {/* Accessible option + summary metrics */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--color-hairline)]">
        <button
          type="button"
          onClick={() => setAccessibleRoute(!accessibleRoute)}
          aria-pressed={accessibleRoute}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium border transition-colors cursor-pointer ${
            accessibleRoute
              ? 'bg-[var(--color-obsidian)] text-[var(--color-paper)] border-[var(--color-obsidian)]'
              : 'border-[var(--color-hairline)] text-[var(--color-graphite)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <Accessibility className="h-3.5 w-3.5" />
          <span>{t.passenger.accessible}</span>
        </button>

        {route?.found && (
          <div className="text-[13px] font-semibold tabular-nums whitespace-nowrap">
            {meters} {t.passenger.meters} · ~{mins} {t.passenger.minutes}
          </div>
        )}
      </div>

      {/* Steps */}
      <ol className="overflow-y-auto space-y-1.5 pr-1 text-[12px]">
        {route?.steps.map((step, idx) => (
          <li key={`${step.fromNodeId}-${step.toNodeId}-${idx}`} className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-ash)] text-[10px] font-semibold">
              {idx + 1}
            </span>
            <span className="text-[var(--color-obsidian)] leading-snug">
              {step.instruction[language]}
            </span>
            <ArrowRight className="ml-auto h-3 w-3 shrink-0 opacity-30 mt-1" />
          </li>
        ))}
      </ol>
    </aside>
  );
}
