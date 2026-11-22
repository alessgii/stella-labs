import { Cable, Cpu, Route, X } from 'lucide-react';
import { getInspectableSpace } from '../lib/inspectableSpace';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

export function LocalHotspotPanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const selectedLocalObjectId = useAppStore((s) => s.selectedLocalObjectId);
  const selectLocalObject = useAppStore((s) => s.selectLocalObject);
  const setMode = useAppStore((s) => s.setMode);

  if (!focusedTenantId || !selectedLocalObjectId) return null;

  const space = getInspectableSpace(focusedTenantId);
  if (!space) return null;

  const spec = space.spec;
  const hotspots = spec.objects.filter((o) => o.isHotspot);
  const selected = hotspots.find((o) => o.id === selectedLocalObjectId) ?? hotspots[0];
  if (!selected) return null;

  const isNetwork = mode === 'network';
  const usesFiber = space.usesFiber;
  const rackPrefix = space.id.toUpperCase().slice(0, 6);
  const portLabel = selected.switchPort
    ? `${rackPrefix}-SW1-P0${selected.switchPort}`
    : language === 'es'
      ? `Demarcación → ${space.idf}`
      : `Demarc → ${space.idf}`;

  return (
    <MobileBottomSheet
      ariaLabel={selected.label[language]}
      dark={isNetwork}
      desktopWidthClass="sm:w-[370px]"
      peekTitle={`#${hotspots.findIndex((h) => h.id === selected.id) + 1} ${selected.label[language]}`}
      peekSubtitle={`${portLabel} · VLAN ${space.vlanId}`}
      defaultExpandedMobile={false}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              isNetwork
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
            }`}
          >
            <Cpu className="h-3 w-3" />
            <span>
              #{hotspots.findIndex((h) => h.id === selected.id) + 1} · {selected.subsystem?.toUpperCase() ?? 'LAN'}
            </span>
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              isNetwork
                ? 'bg-white/10 text-slate-300'
                : 'bg-[var(--color-whisper)] text-[var(--color-graphite)]'
            }`}
          >
            Demo
          </span>
        </div>

        <button
          type="button"
          onClick={() => selectLocalObject(null)}
          aria-label="Cerrar ficha"
          className={`rounded-full p-1 cursor-pointer ${
            isNetwork
              ? 'text-slate-400 hover:bg-white/10 hover:text-white'
              : 'text-[var(--color-graphite)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1">
        {selected.label[language]}
      </h3>

      {selected.functionDesc && (
        <p
          className={`text-[12px] leading-relaxed mb-3 ${
            isNetwork ? 'text-slate-300' : 'text-[var(--color-graphite)]'
          }`}
        >
          {selected.functionDesc[language]}
        </p>
      )}

      {/* Technical ficha */}
      <div
        className={`rounded-[6px] border p-2.5 text-[12px] space-y-1 mb-3 ${
          isNetwork
            ? 'border-white/10 bg-white/5'
            : 'border-[var(--color-hairline)] bg-[var(--color-ash)]'
        }`}
      >
        <div className="flex justify-between gap-2">
          <span className={isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'}>
            {language === 'es' ? 'Puerto switch' : 'Switch port'}:
          </span>
          <span className="font-mono font-medium">{portLabel}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className={isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'}>
            VLAN / VRF:
          </span>
          <span className="font-medium">
            VLAN {space.vlanId} · {space.vrf}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className={isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'}>
            {language === 'es' ? 'Cable y longitud' : 'Cable & length'}:
          </span>
          <span className="font-medium">
            {selected.cableLength_m
              ? `${selected.cableType ?? 'Cat6A'} · ${selected.cableLength_m} m`
              : usesFiber
                ? `Fibra OS2 → ${space.idf} (${space.trayDistance_m} m)`
                : `Cat6A → ${space.idf} (${space.trayDistance_m} m)`}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className={isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'}>
            {language === 'es' ? 'Consumo PoE (demo)' : 'PoE draw (demo)'}:
          </span>
          <span className="font-medium">
            {selected.poeWatts && selected.poeWatts > 0
              ? `${selected.poeWatts} W (802.3af/at)`
              : language === 'es'
                ? '0 W (alimentación AC)'
                : '0 W (AC powered)'}
          </span>
        </div>
      </div>

      {/* Trace route CTA */}
      <button
        type="button"
        onClick={() => setMode('network')}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer mb-3 ${
          isNetwork
            ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
            : 'bg-[var(--color-obsidian)] text-[var(--color-paper)] hover:bg-neutral-800'
        }`}
      >
        <Route className="h-4 w-4 stroke-[1.75]" />
        <span>{language === 'es' ? 'Rastrear ruta completa' : 'Trace full route'}</span>
      </button>

      {/* Numbered equipment list */}
      <div>
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${
            isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
          }`}
        >
          <Cable className="h-3.5 w-3.5" />
          <span>{language === 'es' ? `Equipos del local (${hotspots.length})` : `Store equipment (${hotspots.length})`}</span>
        </div>
        <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
          {hotspots.map((item, idx) => {
            const active = item.id === selected.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLocalObject(item.id)}
                className={`w-full flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] transition-colors cursor-pointer ${
                  active
                    ? isNetwork
                      ? 'bg-amber-500/20 text-amber-200 font-medium'
                      : 'bg-[var(--color-obsidian)] text-[var(--color-paper)] font-medium'
                    : isNetwork
                      ? 'hover:bg-white/10 text-slate-300'
                      : 'hover:bg-[var(--color-ash)] text-[var(--color-obsidian)]'
                }`}
              >
                <span
                  className={`h-4 w-4 shrink-0 rounded-full text-[10px] font-semibold flex items-center justify-center ${
                    active
                      ? isNetwork
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-white text-black'
                      : isNetwork
                        ? 'bg-white/15 text-slate-200'
                        : 'bg-black/10 text-black'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate">{item.label[language]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MobileBottomSheet>
  );
}
