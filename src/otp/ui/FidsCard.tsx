import { Cable, Monitor, X } from 'lucide-react';
import { DEMO_FIDS_FLIGHTS, getDeviceById } from '../data/devices';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function FidsCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);
  const selectDevice = useAppStore((s) => s.selectDevice);
  const jumpToFiberForDevice = useAppStore((s) => s.jumpToFiberForDevice);

  if (mode !== 'passenger' || !selectedDeviceId) return null;

  const device = getDeviceById(selectedDeviceId);
  if (!device || device.subsystemId !== 'fids') return null;

  const t = language === 'es' ? es : en;

  return (
    <aside
      aria-label={device.name[language]}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-30 w-[calc(100vw-2rem)] sm:w-96 rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-paper)]/98 p-4 text-[var(--color-obsidian)] backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-violet-600 stroke-[1.75]" />
          <span className="font-semibold text-[15px]">{device.name[language]}</span>
          <span className="rounded-full bg-[var(--color-ash)] px-2 py-0.5 text-[11px] font-medium">
            {device.floor}
          </span>
        </div>
        <button
          type="button"
          onClick={() => selectDevice(null)}
          aria-label="Cerrar pantalla"
          className="rounded-full p-1 text-[var(--color-graphite)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Live Demo Flight Table Preview */}
      <div className="rounded-[6px] bg-[#090D16] text-slate-100 p-2.5 mb-3 text-[11px]">
        <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5 font-semibold text-sky-400">
          <span>{t.passenger.fidsTitle}</span>
          <span className="text-[10px] font-normal text-slate-400">IDF {device.idfId}</span>
        </div>
        <div className="space-y-1">
          {DEMO_FIDS_FLIGHTS.map((row) => (
            <div key={row.flight} className="grid grid-cols-[38px_52px_1fr_30px_auto] gap-1 items-center">
              <span className="tabular-nums text-slate-300">{row.time}</span>
              <span className="font-semibold text-sky-300">{row.flight}</span>
              <span className="truncate">{row.destination}</span>
              <span className="text-center rounded bg-[#FFF212] text-slate-900 font-semibold px-1">
                {row.gate}
              </span>
              <span
                className={
                  row.lastCall ? 'text-amber-400 font-semibold' : 'text-emerald-400'
                }
              >
                {language === 'es' ? row.statusEs : row.statusEn}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          {t.passenger.fidsFlightsNote}
        </div>
      </div>

      {/* Bridge Button to Network Lens */}
      <button
        type="button"
        onClick={() => jumpToFiberForDevice(device.id)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-obsidian)] px-5 py-2 text-[14px] font-medium text-[var(--color-paper)] hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <Cable className="h-4 w-4 stroke-[1.75]" />
        <span>{t.lod.viewFiberBridge}</span>
      </button>
    </aside>
  );
}
