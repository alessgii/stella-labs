import { useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { runDebugChecks } from '../lib/geometry';
import { useAppStore } from '../store/useAppStore';

export function DebugPanel() {
  const debugMode = useAppStore((s) => s.debugMode);
  const language = useAppStore((s) => s.language);
  const mode = useAppStore((s) => s.mode);
  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  const summary = useMemo(() => runDebugChecks(), []);

  if (!debugMode) return null;

  return (
    <aside
      aria-label={t.debug.title}
      className={`fixed top-30 left-4 z-20 w-80 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-[6px] border p-3 text-[13px] ${
        isNetwork
          ? 'bg-slate-950/95 border-white/15 text-slate-100'
          : 'bg-[var(--color-paper)]/95 border-[var(--color-hairline)] text-[var(--color-obsidian)]'
      }`}
    >
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-current/10">
        <span className="font-semibold tracking-[-0.01em]">{t.debug.title}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${
            summary.allPassed
              ? 'bg-emerald-500/15 text-emerald-600'
              : 'bg-red-500/15 text-red-600'
          }`}
        >
          {summary.allPassed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {summary.allPassed ? t.debug.passed : t.debug.failed}
        </span>
      </div>

      {/* 1. Core nodes */}
      <div className="mb-3">
        <div className="font-medium text-[12px] uppercase tracking-wide opacity-70 mb-1">
          {t.debug.coreNodes}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {summary.coreNodes.map((c) => (
            <div
              key={c.nodeId}
              className={`flex items-center justify-between rounded px-2 py-1 text-[12px] ${
                c.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/15 text-red-600'
              }`}
            >
              <span className="font-medium">{c.nodeId}</span>
              <span>{c.passed ? t.debug.passed : t.debug.failed}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Fiber lengths */}
      <div className="mb-3">
        <div className="font-medium text-[12px] uppercase tracking-wide opacity-70 mb-1">
          {t.debug.fiberLengths}
        </div>
        <div className="space-y-1">
          {summary.fiberLengths.map((f) => (
            <div
              key={f.cableId}
              className={`flex items-center justify-between rounded px-2 py-1 text-[12px] ${
                f.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/15 text-red-600'
              }`}
            >
              <span className="truncate mr-2 font-medium">
                {f.cableId.replace('NUCLEO_', '').replace('DISTRIB_', 'D_')}
              </span>
              <span className="tabular-nums whitespace-nowrap">
                {f.calculated_m.toFixed(2)}m ({f.diffPercent.toFixed(3)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Distribution racks */}
      <div>
        <div className="font-medium text-[12px] uppercase tracking-wide opacity-70 mb-1">
          {t.debug.racks}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {summary.racks.map((r) => (
            <div
              key={r.rackId}
              className={`flex items-center justify-between rounded px-2 py-0.5 text-[11px] ${
                r.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/15 text-red-600'
              }`}
            >
              <span className="font-medium">{r.rackId}</span>
              <span className="opacity-80">
                {r.zoneType === 'indoor' ? r.buildingId : t.debug.exterior}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
