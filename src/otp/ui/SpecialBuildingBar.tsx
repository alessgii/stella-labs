import { Lock, Play } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function SpecialBuildingBar() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const activeBuildingSystemFilter = useAppStore((s) => s.activeBuildingSystemFilter);
  const setActiveBuildingSystemFilter = useAppStore((s) => s.setActiveBuildingSystemFilter);
  const setActiveUseCaseModal = useAppStore((s) => s.setActiveUseCaseModal);

  if ((focusedZoneId !== 'ssei' && focusedZoneId !== 'cargo') || focusedTenantId !== null) {
    return null;
  }

  const isNetwork = mode === 'network';
  const chips =
    focusedZoneId === 'ssei'
      ? [
          { id: null, label: language === 'es' ? 'Todas las salas' : 'All rooms' },
          { id: 'alarmas', label: language === 'es' ? 'Emergencia / Alarmas' : 'Emergency' },
          { id: 'energia', label: language === 'es' ? 'Energía / Subestación' : 'Power / Substation' },
          { id: 'scada', label: 'SCADA / IEC 61850' },
          { id: 'nucleo-n6', label: language === 'es' ? 'Núcleo N6' : 'Core N6' },
        ]
      : [
          { id: null, label: language === 'es' ? 'Todas las salas' : 'All rooms' },
          { id: 'rayos-x', label: language === 'es' ? 'Rayos X' : 'X-Ray' },
          { id: 'cadena-frio', label: language === 'es' ? 'Cadena de frío' : 'Cold chain' },
          { id: 'aduana', label: language === 'es' ? 'Aduana / Ext.' : 'Customs / Ext.' },
          { id: 'nucleo-n4', label: language === 'es' ? 'Núcleo N4' : 'Core N4' },
        ];

  return (
    <div className="fixed top-[116px] left-3 right-3 sm:right-auto sm:left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
      {!isNetwork && (
        <div className="pointer-events-auto self-start inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-50/95 px-3 py-1 text-[11px] font-medium text-amber-900 shadow-sm">
          <Lock className="h-3 w-3" />
          <span>
            {focusedZoneId === 'ssei'
              ? language === 'es'
                ? 'Servicio de emergencias 24 h (demo) · Vista informativa, acceso restringido'
                : '24/7 Airport Emergency Services (demo) · Informative view, restricted access'
              : language === 'es'
                ? 'Carga Aérea (demo) · Ventanilla pública; resto acceso restringido'
                : 'Air Cargo (demo) · Public pickup counter; rest restricted'}
          </span>
        </div>
      )}

      <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => {
          const active = activeBuildingSystemFilter === c.id;
          return (
            <button
              key={c.id ?? 'all'}
              type="button"
              onClick={() => setActiveBuildingSystemFilter(c.id)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                active
                  ? isNetwork
                    ? 'bg-sky-500 text-slate-950 border-sky-400'
                    : 'bg-[var(--color-obsidian)] text-[var(--color-paper)] border-[var(--color-obsidian)]'
                  : isNetwork
                    ? 'bg-slate-950/90 text-slate-200 border-white/15 hover:bg-slate-900'
                    : 'bg-[var(--color-paper)]/95 text-[var(--color-obsidian)] border-[var(--color-hairline)] hover:bg-[var(--color-ash)]'
              }`}
            >
              {c.label}
            </button>
          );
        })}
        {focusedZoneId === 'ssei' ? (
          <>
            <button
              type="button"
              onClick={() => setActiveUseCaseModal('emergency')}
              className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-500 cursor-pointer"
            >
              <Play className="h-3 w-3" />
              <span>{language === 'es' ? 'Emergencia' : 'Emergency'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveUseCaseModal('power')}
              className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              <Play className="h-3 w-3" />
              <span>{language === 'es' ? 'Energía / Apagón' : 'Power / Blackout'}</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setActiveUseCaseModal('cold-chain')}
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-cyan-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
          >
            <Play className="h-3 w-3" />
            <span>{language === 'es' ? 'Paquete Cadena de Frío' : 'Cold-Chain Package'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
