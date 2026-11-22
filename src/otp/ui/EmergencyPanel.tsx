import { useEffect, useState } from 'react';
import { AlertOctagon, Play, RotateCcw, ShieldAlert, Siren, X } from 'lucide-react';
import {
  computeTowerSseiHops,
  EMERGENCY_STEPS,
  type EmergencyFaultMode,
} from '../data/emergencySequence';
import { useAppStore } from '../store/useAppStore';

export function EmergencyPanel() {
  const language = useAppStore((s) => s.language);
  const activeUseCaseModal = useAppStore((s) => s.activeUseCaseModal);
  const setActiveUseCaseModal = useAppStore((s) => s.setActiveUseCaseModal);

  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [affectsTerminal, setAffectsTerminal] = useState(true);
  const [faultMode, setFaultMode] = useState<EmergencyFaultMode>('none');

  const visibleSteps = EMERGENCY_STEPS.filter(
    (s) => affectsTerminal || !s.terminalOnly,
  );

  useEffect(() => {
    if (!running) return;
    if (activeStep >= visibleSteps.length) {
      setRunning(false);
      return;
    }
    const id = window.setTimeout(() => {
      setActiveStep((s) => s + 1);
    }, 900);
    return () => window.clearTimeout(id);
  }, [running, activeStep, visibleSteps.length]);

  if (activeUseCaseModal !== 'emergency') return null;

  const hops = computeTowerSseiHops(faultMode);
  const totalNetMs = visibleSteps
    .slice(0, activeStep)
    .reduce((acc, s) => acc + s.networkTime_ms, 0);

  return (
    <div
      role="dialog"
      aria-label={language === 'es' ? 'Emergencia Integrada' : 'Integrated Emergency'}
      className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-30 w-full sm:w-[440px] max-h-[75vh] sm:max-h-[calc(100vh-8rem)] overflow-y-auto rounded-t-[14px] sm:rounded-[6px] border border-rose-500/35 bg-slate-950/96 p-4 text-slate-100 backdrop-blur-md shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
            <Siren className="h-3.5 w-3.5" />
            <span>VRF-EMG · {language === 'es' ? 'Caso de Uso SSEI' : 'SSEI Use Case'} (Demo)</span>
          </div>
          <h3 className="text-[16px] font-semibold text-white">
            {language === 'es'
              ? 'Emergencia Integrada (Taxiway L)'
              : 'Integrated Emergency (Taxiway L)'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveUseCaseModal(null)}
          aria-label="Cerrar emergencia"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            setActiveStep(1);
            setRunning(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-500 cursor-pointer"
        >
          <Play className="h-3.5 w-3.5" />
          <span>
            {language === 'es' ? 'Declarar emergencia' : 'Declare emergency'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setActiveStep(0);
          }}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{language === 'es' ? 'Reiniciar' : 'Reset'}</span>
        </button>

        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={affectsTerminal}
            onChange={(e) => setAffectsTerminal(e.target.checked)}
            className="accent-rose-500"
          />
          <span>{language === 'es' ? 'Afecta a terminal' : 'Affects terminal'}</span>
        </label>
      </div>

      {/* Fault injection during emergency */}
      <div className="mb-3 rounded-[6px] border border-white/10 bg-white/5 p-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 mb-1.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>
            {language === 'es'
              ? 'Inyectar falla durante la emergencia'
              : 'Inject fault during emergency'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          {(
            [
              { id: 'none', label: language === 'es' ? 'Red sana' : 'Healthy' },
              { id: 'single-cut', label: language === 'es' ? 'Corte Airside' : 'Airside cut' },
              { id: 'dual-cut', label: language === 'es' ? 'Doble corte (RF)' : 'Dual cut (RF)' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setFaultMode(m.id)}
              className={`rounded px-2 py-1 font-medium cursor-pointer ${
                faultMode === m.id
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-1 text-[10px] text-slate-300">
          {hops.map((h, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate">
                {i + 1}. {h.from} → {h.to}
              </span>
              <span className="shrink-0 text-sky-300">
                {h.medium} ({h.distance_m} m)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated sequence timeline */}
      <div className="space-y-1.5 mb-3">
        {visibleSteps.map((s, idx) => {
          const done = idx < activeStep;
          const current = idx + 1 === activeStep;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setRunning(false);
                setActiveStep(idx + 1);
              }}
              className={`w-full text-left rounded-[6px] border p-2 transition-colors cursor-pointer ${
                current
                  ? 'border-rose-400 bg-rose-500/20'
                  : done
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[12px] font-semibold">
                <span>{s.title[language]}</span>
                <span className="text-[10px] font-mono text-sky-300">
                  {s.vrf} · {s.networkTime_ms} ms
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">{s.detail[language]}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>{s.routeLabel[language]}</span>
                <span>
                  {language === 'es' ? 'Respuesta física (demo):' : 'Physical (demo):'} {s.physicalTime_s} s
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Honest technical summary */}
      <div className="rounded-[6px] border border-sky-500/30 bg-sky-950/35 p-2.5 text-[11px] text-slate-200 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-sky-300">
          <AlertOctagon className="h-3.5 w-3.5" />
          <span>
            {language === 'es'
              ? `Red: ~${totalNetMs.toFixed(1)} ms vs. respuesta física`
              : `Network: ~${totalNetMs.toFixed(1)} ms vs. physical response`}
          </span>
        </div>
        <p className="text-[10px] text-slate-300 leading-relaxed">
          {language === 'es'
            ? 'La red óptica aporta milisegundos; lo que domina el tiempo total es la respuesta física (portones y salida de vehículos). Como referencia, la normativa internacional de salvamento fija objetivos de 2 a 3 minutos (verificar con la norma vigente): el rol de la fibra y su respaldo es garantizar que la alarma nunca falle.'
            : 'Optical fiber adds only milliseconds; physical response (doors and truck dispatch) dominates total time. As a reference, international ARFF standards target 2–3 minutes (verify against current regulation): fiber redundancy guarantees the alarm never fails.'}
        </p>
      </div>
    </div>
  );
}
