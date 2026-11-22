import { useAppStore } from '../store/useAppStore';

export function CompassRose() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const isNetwork = mode === 'network';

  // Aligned with Southwest -> Northeast isometric view:
  // North = upper-left (-45 deg), East = upper-right (+45 deg)
  return (
    <div
      aria-label={language === 'es' ? 'Brújula del mapa' : 'Map compass'}
      className={`fixed left-44 bottom-4 z-10 hidden sm:flex h-14 w-14 items-center justify-center rounded-full border text-[10px] font-semibold select-none ${
        isNetwork
          ? 'bg-slate-950/85 border-white/15 text-slate-300'
          : 'bg-[var(--color-paper)]/95 border-[var(--color-hairline)] text-[var(--color-obsidian)]'
      }`}
    >
      <div className="relative h-10 w-10 -rotate-45">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-red-600 font-bold">
          N
        </span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2">E</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-60">
          S
        </span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 opacity-60">
          {language === 'es' ? 'O' : 'W'}
        </span>
        <div className="absolute inset-3 rounded-full border border-current opacity-20" />
      </div>
    </div>
  );
}
