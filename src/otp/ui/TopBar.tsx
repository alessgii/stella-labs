import { Box, Bug, Cpu, Eye, Gauge, PlayCircle, SplitSquareHorizontal } from 'lucide-react';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore, type RenderQuality } from '../store/useAppStore';
import { LanguageToggle } from './LanguageToggle';
import { ModeSwitch } from './ModeSwitch';

const NEXT_QUALITY: Record<RenderQuality, RenderQuality> = {
  high: 'medium',
  medium: 'low',
  low: 'high',
};

export function TopBar({
  catalogOpen,
  onToggleCatalog,
}: {
  catalogOpen: boolean;
  onToggleCatalog: () => void;
}) {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const cameraProjection = useAppStore((s) => s.cameraProjection);
  const setCameraProjection = useAppStore((s) => s.setCameraProjection);
  const debugMode = useAppStore((s) => s.debugMode);
  const setDebugMode = useAppStore((s) => s.setDebugMode);
  const xrayOpacity = useAppStore((s) => s.xrayOpacity);
  const setXrayOpacity = useAppStore((s) => s.setXrayOpacity);
  const itOtLens = useAppStore((s) => s.itOtLens);
  const setItOtLens = useAppStore((s) => s.setItOtLens);
  const quality = useAppStore((s) => s.quality);
  const setQuality = useAppStore((s) => s.setQuality);
  const tourActive = useAppStore((s) => s.tourActive);
  const startTour = useAppStore((s) => s.startTour);
  const stopTour = useAppStore((s) => s.stopTour);

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  const qualityLabel =
    quality === 'high'
      ? t.controls.qualityHigh
      : quality === 'medium'
        ? t.controls.qualityMedium
        : t.controls.qualityLow;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 h-16 px-2.5 sm:px-4 md:px-6 flex items-center justify-between gap-2 border-b overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-colors ${
        isNetwork
          ? 'bg-slate-950/90 border-white/10 text-slate-100 backdrop-blur-sm'
          : 'bg-[var(--color-paper)]/95 border-[var(--color-hairline)] text-[var(--color-obsidian)] backdrop-blur-sm'
      }`}
    >
      {/* Left wordmark */}
      <div className="hidden sm:flex items-baseline gap-2.5 min-w-0 shrink">
        <span className="text-[15px] font-semibold tracking-[-0.02em] truncate">
          {t.appTitle}
        </span>
        <span
          className={`hidden 2xl:inline text-[13px] font-medium whitespace-nowrap ${
            isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
          }`}
        >
          {t.appSubtitle}
        </span>
      </div>

      {/* Center Dual Lens Switch */}
      <div className="flex items-center shrink-0">
        <ModeSwitch />
      </div>

      {/* Right utility controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isNetwork && (
          <label
            className="hidden xl:flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/15 px-3 py-1 text-[13px] font-medium text-slate-200"
            title={t.controls.xray}
          >
            <Eye className="h-3.5 w-3.5 stroke-[1.75] text-sky-400 shrink-0" />
            <span>{t.controls.xray}</span>
            <input
              type="range"
              min={0.08}
              max={0.85}
              step={0.05}
              value={xrayOpacity}
              onChange={(e) => setXrayOpacity(Number(e.target.value))}
              aria-label={t.controls.xray}
              className="w-14 accent-sky-400 cursor-pointer"
            />
          </label>
        )}

        <button
          type="button"
          onClick={() => (tourActive ? stopTour() : startTour())}
          aria-pressed={tourActive}
          aria-label={t.networkDock.startTour}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border transition-colors cursor-pointer ${
            tourActive
              ? 'bg-sky-500 text-slate-950 border-sky-500'
              : isNetwork
                ? 'border-white/15 text-slate-200 hover:bg-white/10'
                : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <PlayCircle className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
          <span className="hidden lg:inline">{t.networkDock.startTour}</span>
        </button>

        <button
          type="button"
          onClick={() => setItOtLens(!itOtLens)}
          aria-pressed={itOtLens}
          aria-label={t.controls.itOtLens}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border transition-colors cursor-pointer ${
            itOtLens
              ? 'bg-orange-500 text-white border-orange-500'
              : isNetwork
                ? 'border-white/15 text-slate-200 hover:bg-white/10'
                : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <SplitSquareHorizontal className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
          <span className="hidden lg:inline">{t.controls.itOtLens}</span>
        </button>

        <button
          type="button"
          onClick={onToggleCatalog}
          aria-pressed={catalogOpen}
          aria-label={t.controls.subsystems}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border transition-colors cursor-pointer ${
            catalogOpen
              ? isNetwork
                ? 'bg-sky-500 text-slate-950 border-sky-500'
                : 'bg-[var(--color-obsidian)] text-[var(--color-paper)] border-[var(--color-obsidian)]'
              : isNetwork
                ? 'border-white/15 text-slate-200 hover:bg-white/10'
                : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <Cpu className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
          <span className="hidden md:inline">{t.controls.subsystems}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setCameraProjection(cameraProjection === 'ortho' ? 'perspective' : 'ortho')
          }
          aria-label={
            cameraProjection === 'ortho' ? t.controls.perspective : t.controls.ortho
          }
          className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-2.5 py-1.5 text-[13px] font-medium border transition-colors cursor-pointer ${
            isNetwork
              ? 'border-white/15 text-slate-200 hover:bg-white/10'
              : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <Box className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
          <span className="hidden 2xl:inline">
            {cameraProjection === 'ortho' ? t.controls.ortho : t.controls.perspective}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setQuality(NEXT_QUALITY[quality])}
          aria-label={`${t.controls.quality}: ${qualityLabel}`}
          title={`${t.controls.quality}: ${qualityLabel}`}
          className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-full px-2.5 py-1.5 text-[12px] font-medium border transition-colors cursor-pointer ${
            isNetwork
              ? 'border-white/15 text-slate-300 hover:bg-white/10'
              : 'border-[var(--color-hairline)] text-[var(--color-graphite)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <Gauge className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
          <span className="hidden xl:inline">{qualityLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => setDebugMode(!debugMode)}
          aria-pressed={debugMode}
          aria-label={t.controls.debug}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-2.5 py-1.5 text-[13px] font-medium border transition-colors cursor-pointer ${
            debugMode
              ? 'bg-emerald-600 text-white border-emerald-600'
              : isNetwork
                ? 'border-white/15 text-slate-300 hover:bg-white/10'
                : 'border-[var(--color-hairline)] text-[var(--color-graphite)] bg-[var(--color-paper)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <Bug className="h-3.5 w-3.5 stroke-[1.75] shrink-0" />
        </button>

        <LanguageToggle />
      </div>
    </header>
  );
}
