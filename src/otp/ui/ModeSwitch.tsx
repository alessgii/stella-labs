import { Compass, Network } from 'lucide-react';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function ModeSwitch() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const language = useAppStore((s) => s.language);
  const t = language === 'es' ? es : en;

  const isNetwork = mode === 'network';

  return (
    <div
      role="tablist"
      aria-label="Modo de visualización"
      className={`inline-flex items-center shrink-0 rounded-full p-0.5 border transition-colors ${
        isNetwork
          ? 'bg-slate-900 border-white/15'
          : 'bg-[var(--color-ash)] border-[var(--color-hairline)]'
      }`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'passenger'}
        onClick={() => setMode('passenger')}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3.5 py-1.5 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${
          mode === 'passenger'
            ? 'bg-[var(--color-obsidian)] text-[var(--color-paper)]'
            : isNetwork
              ? 'text-slate-300 hover:bg-white/10'
              : 'text-[var(--color-obsidian)] hover:bg-[var(--color-whisper)]'
        }`}
      >
        <Compass className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
        <span>{t.modes.passenger}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={mode === 'network'}
        onClick={() => setMode('network')}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3.5 py-1.5 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${
          mode === 'network'
            ? 'bg-sky-500 text-slate-950'
            : 'text-[var(--color-obsidian)] hover:bg-[var(--color-whisper)]'
        }`}
      >
        <Network className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
        <span>{t.modes.network}</span>
      </button>
    </div>
  );
}
