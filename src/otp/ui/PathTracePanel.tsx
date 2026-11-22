import { useMemo } from 'react';
import { Route, ShieldAlert, X } from 'lucide-react';
import { getDeviceById } from '../data/devices';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { evaluateLastMile } from '../lib/lastMile';
import { buildDevicePathTrace } from '../lib/pathTrace';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

export function PathTracePanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);
  const selectDevice = useAppStore((s) => s.selectDevice);

  const trace = useMemo(() => {
    if (!selectedDeviceId) return null;
    const dev = getDeviceById(selectedDeviceId);
    if (!dev) return null;
    return {
      trace: buildDevicePathTrace(dev),
      lastMile: evaluateLastMile(dev),
    };
  }, [selectedDeviceId]);

  if (mode !== 'network' || !trace) return null;

  const t = language === 'es' ? es : en;
  const { trace: pathData, lastMile } = trace;

  const title = `${pathData.device.name[language]} (${pathData.device.floor})`;

  return (
    <MobileBottomSheet
      ariaLabel={t.networkInterior.traceTitle}
      dark
      zIndexClass="z-30"
      desktopWidthClass="sm:w-[490px]"
      desktopPositionClass="sm:bottom-4 sm:right-4"
      mobileMaxHeightClass="max-h-[65vh]"
      defaultExpandedMobile
      peekTitle={title}
      peekSubtitle={`${t.networkInterior.traceTitle} · ${pathData.totalDistance_m} m`}
      peekAction={
        <button
          type="button"
          onClick={() => selectDevice(null)}
          aria-label="Cerrar rastreo"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      }
    >
      <div className="text-[12px]">
      <div className="hidden sm:flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
            <Route className="h-3.5 w-3.5" />
            <span>{t.networkInterior.traceTitle}</span>
          </div>
          <h3 className="text-[16px] font-semibold">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => selectDevice(null)}
          aria-label="Cerrar rastreo"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Last-mile 90m rule verdict */}
      <div
        className={`rounded-[6px] border p-2 mb-3 ${
          lastMile.media === 'fibra'
            ? 'bg-red-500/15 border-red-400/40 text-red-200'
            : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
        }`}
      >
        <div className="font-semibold">
          {lastMile.media === 'fibra'
            ? t.networkInterior.fiberMedium
            : t.networkInterior.copperMedium}{' '}
          · {lastMile.orthogonalDistance_m} m
        </div>
        <div className="text-[11px] opacity-90">
          {lastMile.exceeds90m
            ? language === 'es'
              ? 'Supera 90 m por escalerilla ortogonal → requiere enlace de fibra y convertidor de medios.'
              : 'Exceeds 90 m orthogonal tray distance → requires optical fiber + media converter.'
            : lastMile.highEmiOrAtex
              ? language === 'es'
                ? 'Alta interferencia electromagnética (EMI) o equipo crítico → enlace de fibra con convertidor de medios.'
                : 'High EMI / critical endpoint → optical fiber link with media converter.'
              : language === 'es'
                ? 'Dentro de ≤ 90 m por escalerilla ortogonal → enlace estándar cobre Cat6A + PoE desde el IDF.'
                : 'Within ≤ 90 m orthogonal tray reach → standard Cat6A + PoE copper from IDF.'}
        </div>
      </div>

      {/* Hop Table: mobile cards + desktop table */}
      <div className="mb-3">
        <div className="font-semibold mb-1.5 text-[12px]">
          {t.networkInterior.hopTable}
        </div>

        {/* Mobile stacked hop cards (no horizontal scroll) */}
        <div className="sm:hidden space-y-1.5">
          {pathData.hops.map((hop) => (
            <div
              key={hop.step}
              className="rounded-[6px] border border-white/10 bg-white/5 p-2.5 text-[11px] space-y-1.5"
            >
              <div className="font-semibold text-slate-100 leading-snug">
                {hop.from} → {hop.to}
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
                <div>
                  <span className="text-slate-400">{t.networkInterior.medium}: </span>
                  <span className="font-medium text-slate-200">
                    {hop.medium === 'fibra-os2'
                      ? t.networkInterior.fiberMedium
                      : t.networkInterior.copperMedium}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">{t.networkInterior.distance}: </span>
                  <span className="font-medium tabular-nums text-slate-200">
                    {hop.distance_m} m
                  </span>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">VRF: </span>
                  <span className="font-medium text-sky-300">
                    {hop.vrf} · {hop.ringLabel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">{t.networkInterior.latency}: </span>
                  <span className="font-medium tabular-nums text-slate-200">
                    {hop.propagationLatency_us} µs
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-[6px] border border-white/10">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-1.5 py-1">{t.networkInterior.hop}</th>
                <th className="px-1.5 py-1">{t.networkInterior.medium}</th>
                <th className="px-1.5 py-1">{t.networkInterior.distance}</th>
                <th className="px-1.5 py-1">VRF / {t.subsystems.ringLabel}</th>
                <th className="px-1.5 py-1">{t.networkInterior.latency}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pathData.hops.map((hop) => (
                <tr key={hop.step}>
                  <td className="px-1.5 py-1 font-medium">
                    {hop.from} → {hop.to}
                  </td>
                  <td className="px-1.5 py-1 whitespace-nowrap">
                    {hop.medium === 'fibra-os2'
                      ? t.networkInterior.fiberMedium
                      : t.networkInterior.copperMedium}
                  </td>
                  <td className="px-1.5 py-1 tabular-nums whitespace-nowrap">
                    {hop.distance_m} m
                  </td>
                  <td className="px-1.5 py-1 whitespace-nowrap">
                    {hop.vrf} · {hop.ringLabel}
                  </td>
                  <td className="px-1.5 py-1 tabular-nums whitespace-nowrap">
                    {hop.propagationLatency_us} µs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-300">
          <span>
            Total: <strong>{pathData.totalDistance_m} m</strong>
          </span>
          <span>
            Latencia prop.: <strong>{pathData.totalPropagationLatency_us} µs</strong>
          </span>
        </div>
      </div>

      {/* Backup Path */}
      <div className="rounded-[6px] border border-white/10 bg-white/5 p-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-1 font-semibold text-sky-300 mb-0.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>{t.networkInterior.backupPath}</span>
        </div>
        <div>{pathData.backupPathSummary[language]}</div>
      </div>
      </div>
    </MobileBottomSheet>
  );
}
