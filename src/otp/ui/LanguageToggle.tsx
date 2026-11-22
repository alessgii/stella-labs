import { useAppStore } from '../store/useAppStore';

export function LanguageToggle() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const mode = useAppStore((s) => s.mode);
  const isNetwork = mode === 'network';

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
      className={`inline-flex items-center whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border transition-colors cursor-pointer ${
        isNetwork
          ? 'border-white/15 text-slate-200 hover:bg-white/10'
          : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
      }`}
    >
      {language === 'es' ? 'ES / EN' : 'EN / ES'}
    </button>
  );
}
