import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { SUBSYSTEMS } from '../data/subsystems';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function SubsystemCatalogPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const itOtLens = useAppStore((s) => s.itOtLens);
  const setItOtLens = useAppStore((s) => s.setItOtLens);
  const selectedSubsystemId = useAppStore((s) => s.selectedSubsystemId);
  const setSelectedSubsystemId = useAppStore((s) => s.setSelectedSubsystemId);

  const [domainFilter, setDomainFilter] = useState<'ALL' | 'IT' | 'OT'>('ALL');

  if (!open) return null;

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  const items = SUBSYSTEMS.filter((s) =>
    domainFilter === 'ALL' ? true : s.domain === domainFilter,
  );

  return (
    <aside
      aria-label={t.subsystems.catalogTitle}
      className={`fixed top-30 right-4 z-20 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-9rem)] flex flex-col rounded-[6px] border transition-colors ${
        isNetwork
          ? 'bg-slate-950/95 border-white/15 text-slate-100 backdrop-blur-sm'
          : 'bg-[var(--color-paper)]/98 border-[var(--color-hairline)] text-[var(--color-obsidian)] backdrop-blur-sm'
      }`}
    >
      <div className="p-3.5 border-b border-current/10">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">
              {t.subsystems.catalogTitle}
            </h2>
            <p
              className={`text-[12px] ${
                isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
              }`}
            >
              {t.subsystems.catalogSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar catálogo"
            className={`rounded-full p-1 cursor-pointer ${
              isNetwork ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-[var(--color-ash)] text-[var(--color-graphite)]'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter pills + IT/OT Lens Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
          <div className="flex items-center gap-1">
            {(['ALL', 'OT', 'IT'] as const).map((f) => {
              const active = domainFilter === f;
              const label =
                f === 'ALL'
                  ? t.subsystems.allDomains
                  : f === 'OT'
                    ? t.subsystems.otDomain
                    : t.subsystems.itDomain;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDomainFilter(f)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium border transition-colors cursor-pointer ${
                    active
                      ? isNetwork
                        ? 'bg-sky-500 border-sky-500 text-slate-950'
                        : 'bg-[var(--color-obsidian)] border-[var(--color-obsidian)] text-[var(--color-paper)]'
                      : isNetwork
                        ? 'border-white/15 text-slate-300 hover:bg-white/10'
                        : 'border-[var(--color-hairline)] text-[var(--color-graphite)] hover:bg-[var(--color-ash)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setItOtLens(!itOtLens)}
            aria-pressed={itOtLens}
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium border transition-colors cursor-pointer ${
              itOtLens
                ? 'bg-orange-500 border-orange-500 text-white'
                : isNetwork
                  ? 'border-white/15 text-slate-300 hover:bg-white/10'
                  : 'border-[var(--color-hairline)] text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
            }`}
          >
            {t.controls.itOtLens}
          </button>
        </div>
      </div>

      {/* Scrollable subsystem list */}
      <div className="overflow-y-auto p-2 space-y-1">
        {items.map((sub) => {
          const selected = selectedSubsystemId === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubsystemId(sub.id)}
              className={`w-full flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-2 text-left transition-colors cursor-pointer ${
                selected
                  ? isNetwork
                    ? 'bg-sky-500/20 text-white'
                    : 'bg-[var(--color-ash)] text-black'
                  : isNetwork
                    ? 'hover:bg-white/8 text-slate-200'
                    : 'hover:bg-[var(--color-whisper)] text-[var(--color-obsidian)]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {sub.name[language]}
                  </div>
                  <div
                    className={`text-[11px] flex items-center gap-1.5 ${
                      isNetwork ? 'text-slate-400' : 'text-[var(--color-graphite)]'
                    }`}
                  >
                    <span
                      className={
                        sub.domain === 'OT'
                          ? 'font-semibold text-orange-500'
                          : 'font-semibold text-indigo-500'
                      }
                    >
                      {sub.domain}
                    </span>
                    <span>·</span>
                    <span>{sub.vrf}</span>
                    <span>·</span>
                    <span>
                      {t.subsystems.ringLabel} {sub.ring.primary}→{sub.ring.backup}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 opacity-45 shrink-0" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
