import { useMemo } from 'react';
import { Server, X } from 'lucide-react';
import { ALL_TERMINAL_DEVICES } from '../data/devices';
import { DISTRIBUTION_RACKS } from '../data/racks';
import { getSubsystemById } from '../data/subsystems';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { calculateIdfSizing, type UplinkSpeedGbps } from '../lib/idfSizing';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

const UPLINK_OPTIONS: UplinkSpeedGbps[] = [1, 10, 100];

export function IdfSizingPanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const selectedIdfId = useAppStore((s) => s.selectedIdfId);
  const idfUplinkSpeeds = useAppStore((s) => s.idfUplinkSpeeds);
  const selectIdf = useAppStore((s) => s.selectIdf);
  const setIdfUplinkSpeed = useAppStore((s) => s.setIdfUplinkSpeed);

  const uplinkSpeed = selectedIdfId ? idfUplinkSpeeds[selectedIdfId] : 1;

  const sizing = useMemo(() => {
    if (!selectedIdfId) return null;
    return calculateIdfSizing(selectedIdfId, ALL_TERMINAL_DEVICES, uplinkSpeed);
  }, [selectedIdfId, uplinkSpeed]);

  if (mode !== 'network' || !selectedIdfId || !sizing) return null;

  const rack = DISTRIBUTION_RACKS.find((r) => r.id === selectedIdfId);
  const t = language === 'es' ? es : en;

  const statusColor =
    sizing.status === 'red'
      ? 'bg-red-500/20 text-red-300 border-red-500/40'
      : sizing.status === 'yellow'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const barColor =
    sizing.status === 'red'
      ? 'bg-red-500'
      : sizing.status === 'yellow'
        ? 'bg-amber-400'
        : 'bg-emerald-400';

  const title = `${selectedIdfId} — ${language === 'es' ? rack?.label : rack?.labelEn}`;

  return (
    <MobileBottomSheet
      ariaLabel={t.networkInterior.idfTitle}
      dark
      desktopWidthClass="sm:w-96"
      desktopPositionClass="sm:bottom-4 sm:right-4"
      mobileMaxHeightClass="max-h-[62vh]"
      defaultExpandedMobile
      peekTitle={title}
      peekSubtitle={`${t.networkInterior.idfTitle} · ${sizing.utilizationPct}%`}
      peekAction={
        <button
          type="button"
          onClick={() => selectIdf(null)}
          aria-label="Cerrar panel IDF"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      }
    >
      <div className="text-[13px]">
      <div className="hidden sm:flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-medium">
            <Server className="h-3.5 w-3.5" />
            <span>{t.networkInterior.idfTitle}</span>
          </div>
          <h3 className="text-[16px] font-semibold">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => selectIdf(null)}
          aria-label="Cerrar panel IDF"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Copper vs Fiber summary */}
      <div className="grid grid-cols-3 gap-2 rounded-[6px] bg-white/5 border border-white/10 p-2 mb-3 text-[12px]">
        <div>
          <div className="text-slate-400">{t.networkInterior.devicesConnected}</div>
          <div className="font-semibold tabular-nums">{sizing.totalDevices}</div>
        </div>
        <div>
          <div className="text-slate-400">Cat6A ≤90m</div>
          <div className="font-semibold text-emerald-300 tabular-nums">{sizing.copperDevices}</div>
        </div>
        <div>
          <div className="text-slate-400">Fibra &gt;90m</div>
          <div className="font-semibold text-red-300 tabular-nums">{sizing.fiberDevices}</div>
        </div>
      </div>

      {/* Uplink selector + utilization gauge */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 mb-1.5 text-[12px]">
          <span className="text-slate-300">{t.networkInterior.uplinkCapacity}:</span>
          <div className="flex items-center gap-1">
            {UPLINK_OPTIONS.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setIdfUplinkSpeed(selectedIdfId, spd)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border cursor-pointer ${
                  uplinkSpeed === spd
                    ? 'bg-sky-500 border-sky-500 text-slate-950'
                    : 'border-white/15 text-slate-300 hover:bg-white/10'
                }`}
              >
                {spd}G
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[12px] mb-1">
          <span>
            {sizing.totalBandwidthMbps} Mbps / {uplinkSpeed * 1000} Mbps
          </span>
          <span className="font-semibold tabular-nums">{sizing.utilizationPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all ${barColor}`}
            style={{ width: `${Math.min(100, sizing.utilizationPct)}%` }}
          />
        </div>
      </div>

      {/* Traffic light recommendation */}
      <div className={`rounded-[6px] border p-2 mb-3 text-[12px] ${statusColor}`}>
        {sizing.recommendation[language]}
      </div>

      {/* Subsystem breakdown */}
      <div className="max-h-36 overflow-y-auto space-y-1 text-[11px]">
        {sizing.breakdown.map((row) => {
          const sub = getSubsystemById(row.subsystemId);
          return (
            <div
              key={row.subsystemId}
              className="flex items-center justify-between rounded px-2 py-1 bg-white/5"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="truncate font-medium">
                  {row.subsystemId.toUpperCase()} ({row.deviceCount})
                </span>
              </div>
              <span className="tabular-nums text-slate-300">
                {row.subtotalMbps} Mbps
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </MobileBottomSheet>
  );
}
