import { Eye, Layers } from 'lucide-react';
import type { FloorViewMode } from '../data/floors';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

const FLOOR_OPTIONS: FloorViewMode[] = ['F1', 'GF', 'BOTH'];

export function FloorSelector() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const ghostOtherFloor = useAppStore((s) => s.ghostOtherFloor);
  const setFloorView = useAppStore((s) => s.setFloorView);
  const setExplodedOffset = useAppStore((s) => s.setExplodedOffset);
  const setGhostOtherFloor = useAppStore((s) => s.setGhostOtherFloor);

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  return (
    <div
      aria-label="Selector de pisos"
      className={`fixed ${isNetwork ? 'top-[116px]' : 'top-[206px]'} right-3 sm:top-auto sm:right-auto sm:left-4 sm:bottom-4 z-20 flex flex-row sm:flex-col gap-1 sm:gap-2 rounded-full sm:rounded-[6px] border p-1 sm:p-2.5 text-[12px] sm:text-[13px] transition-colors ${
        isNetwork
          ? 'bg-slate-950/90 border-white/15 text-slate-100 backdrop-blur-sm'
          : 'bg-[var(--color-paper)]/95 border-[var(--color-hairline)] text-[var(--color-obsidian)] backdrop-blur-sm'
      }`}
    >
      <div className="hidden sm:flex items-center gap-1.5 text-[12px] font-medium opacity-75">
        <Layers className="h-3.5 w-3.5 stroke-[1.75]" />
        <span>{language === 'es' ? 'Niveles' : 'Floors'}</span>
      </div>

      <div className="flex flex-row sm:flex-col gap-1">
        {FLOOR_OPTIONS.map((opt) => {
          const active = floorView === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setFloorView(opt)}
              aria-pressed={active}
              className={`rounded-full px-2.5 sm:px-3 py-1 text-left text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer ${
                active
                  ? isNetwork
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-[var(--color-obsidian)] text-[var(--color-paper)]'
                  : isNetwork
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
              }`}
            >
              {t.floors[opt]}
            </button>
          );
        })}
      </div>

      {floorView === 'BOTH' && (
        <label className="hidden sm:flex flex-col gap-1 pt-1 border-t border-current/10 text-[12px]">
          <span className="opacity-75">
            {t.floors.exploded} (+{explodedOffset} m)
          </span>
          <input
            type="range"
            min={0}
            max={24}
            step={2}
            value={explodedOffset}
            onChange={(e) => setExplodedOffset(Number(e.target.value))}
            aria-label={t.floors.exploded}
            className="w-32 accent-black cursor-pointer"
          />
        </label>
      )}

      {floorView !== 'BOTH' && !isNetwork && (
        <button
          type="button"
          onClick={() => setGhostOtherFloor(!ghostOtherFloor)}
          aria-pressed={ghostOtherFloor}
          className="hidden sm:flex items-center gap-1.5 pt-1 border-t border-current/10 text-[12px] font-medium text-[var(--color-graphite)] hover:text-[var(--color-obsidian)] cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
          <span>
            {t.floors.ghost}: {ghostOtherFloor ? 'ON' : 'OFF'}
          </span>
        </button>
      )}
    </div>
  );
}
