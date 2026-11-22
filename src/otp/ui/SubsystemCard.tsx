import { X } from 'lucide-react';
import { getSubsystemById } from '../data/subsystems';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function SubsystemCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const selectedSubsystemId = useAppStore((s) => s.selectedSubsystemId);
  const setSelectedSubsystemId = useAppStore((s) => s.setSelectedSubsystemId);

  if (!selectedSubsystemId) return null;

  const sub = getSubsystemById(selectedSubsystemId);
  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  const mediaLabel =
    sub.endpointMedia === 'cobre-poe'
      ? t.subsystems.mediaCopper
      : sub.endpointMedia === 'fibra'
        ? t.subsystems.mediaFiber
        : t.subsystems.mediaMixed;

  return (
    <aside
      aria-label={sub.name[language]}
      className={`fixed top-30 left-4 z-30 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100vh-19rem)] overflow-y-auto rounded-[6px] border p-4 transition-colors ${
        isNetwork
          ? 'bg-slate-950/95 border-white/15 text-slate-100 backdrop-blur-sm'
          : 'bg-[var(--color-paper)]/98 border-[var(--color-hairline)] text-[var(--color-obsidian)] backdrop-blur-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: sub.color }}
          />
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              sub.domain === 'OT'
                ? 'bg-orange-500/15 text-orange-600'
                : 'bg-indigo-500/15 text-indigo-600'
            }`}
          >
            {sub.domain === 'OT' ? t.subsystems.otDomain : t.subsystems.itDomain}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
              isNetwork
                ? 'border-white/15 text-slate-300'
                : 'border-[var(--color-hairline)] text-[var(--color-graphite)]'
            }`}
          >
            {t.subsystems.criticality[sub.criticality]}
          </span>
          {sub.planExtension && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isNetwork ? 'bg-white/10 text-slate-300' : 'bg-[var(--color-ash)] text-[var(--color-graphite)]'
              }`}
            >
              {t.subsystems.planExtensionBadge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSelectedSubsystemId(null)}
          aria-label="Cerrar ficha"
          className={`rounded-full p-1 transition-colors cursor-pointer ${
            isNetwork ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-[var(--color-ash)] text-[var(--color-graphite)]'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-[18px] font-semibold tracking-[-0.01em] mb-1">
        {sub.name[language]}
      </h3>
      <p
        className={`text-[14px] leading-relaxed mb-3 ${
          isNetwork ? 'text-slate-300' : 'text-[var(--color-graphite)]'
        }`}
      >
        {sub.summary[language]}
      </p>

      {/* Core Metrics Grid */}
      <div
        className={`grid grid-cols-2 gap-2 rounded-[6px] border p-2.5 mb-3 text-[12px] ${
          isNetwork ? 'border-white/10 bg-white/5' : 'border-[var(--color-hairline)] bg-[var(--color-ash)]/50'
        }`}
      >
        <div>
          <div className="opacity-65">{t.subsystems.vrf}</div>
          <div className="font-semibold">{sub.vrf}</div>
        </div>
        <div>
          <div className="opacity-65">{t.subsystems.rings}</div>
          <div className="font-semibold">
            {t.subsystems.ringLabel} {sub.ring.primary} → {t.subsystems.ringLabel} {sub.ring.backup}
          </div>
        </div>
        <div>
          <div className="opacity-65">{t.subsystems.sla}</div>
          <div className="font-semibold tabular-nums">{sub.slaPct}%</div>
        </div>
        <div>
          <div className="opacity-65">{t.subsystems.lastMile}</div>
          <div className="font-medium">{mediaLabel}</div>
        </div>
      </div>

      {/* Why Fiber */}
      <div className="mb-3">
        <h4 className="text-[13px] font-semibold mb-1">{t.subsystems.whyFiber}</h4>
        <p
          className={`text-[13px] leading-relaxed ${
            isNetwork ? 'text-slate-300' : 'text-[var(--color-graphite)]'
          }`}
        >
          {sub.whyFiber[language]}
        </p>
      </div>

      {/* How it works */}
      <div className="mb-3">
        <h4 className="text-[13px] font-semibold mb-1.5">{t.subsystems.howItWorks}</h4>
        <ol className="space-y-1.5 text-[13px]">
          {sub.howItWorks.map((step, idx) => (
            <li key={idx} className="flex gap-2">
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  isNetwork
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
                }`}
              >
                {idx + 1}
              </span>
              <span className={isNetwork ? 'text-slate-300' : 'text-[var(--color-graphite)]'}>
                {step[language]}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Reference Assumptions */}
      <div
        className={`rounded-[6px] border p-2.5 text-[12px] ${
          isNetwork ? 'border-white/10 text-slate-400' : 'border-[var(--color-hairline)] text-[var(--color-graphite)]'
        }`}
      >
        <div className="font-medium mb-0.5">{t.subsystems.assumptions}</div>
        {sub.assumptions.bitrateMbpsPerDevice !== undefined && (
          <div>~{sub.assumptions.bitrateMbpsPerDevice} Mbps / dispositivo</div>
        )}
        {sub.assumptions.deviceCountHint && <div>{sub.assumptions.deviceCountHint}</div>}
        <div className="mt-1 opacity-75">{t.subsystems.referenceValuesNote}</div>
      </div>
    </aside>
  );
}
