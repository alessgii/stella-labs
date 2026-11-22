import { useEffect, useState } from 'react';
import { Activity, BatteryCharging, ShieldCheck, X, Zap } from 'lucide-react';
import {
  AGL_SECONDARY_SWITCH_REF,
  GENERATOR_START_DELAY_S,
  simulateBlackoutAtMinute,
} from '../data/powerScenarios';
import { useAppStore } from '../store/useAppStore';

export function PowerPanel() {
  const language = useAppStore((s) => s.language);
  const activeUseCaseModal = useAppStore((s) => s.activeUseCaseModal);
  const setActiveUseCaseModal = useAppStore((s) => s.setActiveUseCaseModal);

  const [tab, setTab] = useState<'blackout' | 'fiber'>('blackout');
  const [gridCut, setGridCut] = useState(false);
  const [genStarts, setGenStarts] = useState(true);
  const [transferTimer, setTransferTimer] = useState(0);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [gooseTripMs, setGooseTripMs] = useState<number | null>(null);

  useEffect(() => {
    if (!gridCut || !genStarts) {
      setTransferTimer(0);
      return;
    }
    if (transferTimer >= GENERATOR_START_DELAY_S) return;
    const id = window.setTimeout(() => setTransferTimer((t) => t + 1), 350);
    return () => window.clearTimeout(id);
  }, [gridCut, genStarts, transferTimer]);

  if (activeUseCaseModal !== 'power') return null;

  const genRunning = gridCut && genStarts && transferTimer >= GENERATOR_START_DELAY_S;
  const statuses = simulateBlackoutAtMinute(
    genStarts ? (genRunning ? 1 : 0.1) : elapsedMin,
    genRunning,
    gridCut,
  );

  return (
    <div
      role="dialog"
      aria-label={language === 'es' ? 'Panel Energía y Subestación' : 'Power & Substation Panel'}
      className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-30 w-full sm:w-[440px] max-h-[75vh] sm:max-h-[calc(100vh-8rem)] overflow-y-auto rounded-t-[14px] sm:rounded-[6px] border border-amber-500/35 bg-slate-950/96 p-4 text-slate-100 backdrop-blur-md shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            <span>VRF-PWR · {language === 'es' ? 'Subestación Eléctrica' : 'Electrical Substation'} (Demo)</span>
          </div>
          <h3 className="text-[16px] font-semibold text-white">
            {language === 'es'
              ? 'Apagón, Autonomía y Protecciones'
              : 'Blackout, Autonomy & Protection'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveUseCaseModal(null)}
          aria-label="Cerrar panel de energía"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-[6px] border border-white/10 bg-white/5 p-1 mb-3 text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setTab('blackout')}
          className={`rounded px-2 py-1 cursor-pointer ${
            tab === 'blackout' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300'
          }`}
        >
          {language === 'es' ? 'Energía y Apagón' : 'Power & Blackout'}
        </button>
        <button
          type="button"
          onClick={() => setTab('fiber')}
          className={`rounded px-2 py-1 cursor-pointer ${
            tab === 'fiber' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300'
          }`}
        >
          {language === 'es' ? 'Por qué fibra / IEC 61850' : 'Why Fiber / IEC 61850'}
        </button>
      </div>

      {tab === 'blackout' ? (
        <div className="space-y-3">
          {/* Power chain diagram */}
          <div className="rounded-[6px] border border-white/10 bg-white/5 p-2 text-[10px]">
            <div className="font-semibold text-slate-200 mb-1">
              {language === 'es' ? 'Cadena de alimentación' : 'Power feed chain'}
            </div>
            <div className="flex flex-wrap items-center gap-1 text-slate-300">
              <span className={`px-1.5 py-0.5 rounded ${gridCut ? 'bg-rose-500/20 text-rose-300 line-through' : 'bg-emerald-500/20 text-emerald-300'}`}>
                Red 20 kV
              </span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10">Celdas MT</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10">Trafo</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10">BT / ATS</span>
              <span>→</span>
              <span className={`px-1.5 py-0.5 rounded ${genRunning ? 'bg-amber-500/25 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>
                {genRunning ? 'Generadores G1/G2' : 'UPS + Baterías'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGridCut((v) => !v);
                setTransferTimer(0);
                setElapsedMin(0);
              }}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer ${
                gridCut
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              {gridCut
                ? language === 'es'
                  ? 'Restaurar suministro externo'
                  : 'Restore grid power'
                : language === 'es'
                  ? 'Cortar suministro externo'
                  : 'Cut external grid'}
            </button>

            <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!genStarts}
                onChange={(e) => {
                  setGenStarts(!e.target.checked);
                  setElapsedMin(0);
                }}
                className="accent-amber-500"
              />
              <span>
                {language === 'es' ? 'El generador no arranca' : 'Generator fails to start'}
              </span>
            </label>
          </div>

          {gridCut && genStarts && !genRunning && (
            <div className="rounded border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-[11px] text-amber-200">
              {language === 'es'
                ? `ATS transfiriendo a generadores (${transferTimer}/${GENERATOR_START_DELAY_S} s demo) · UPS sosteniendo cargas críticas.`
                : `ATS starting generators (${transferTimer}/${GENERATOR_START_DELAY_S} s demo) · UPS holding critical loads.`}
            </div>
          )}

          {gridCut && !genStarts && (
            <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5">
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span>
                  {language === 'es'
                    ? 'Cuenta regresiva UPS y descarga de cargas'
                    : 'UPS countdown & load shedding'}
                </span>
                <span className="text-amber-300">{elapsedMin} min</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={elapsedMin}
                onChange={(e) => setElapsedMin(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}

          {/* Autonomy map */}
          <div className="space-y-1 text-[11px]">
            {statuses.map((st) => (
              <div
                key={st.id}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 ${
                  st.alive
                    ? 'border-white/10 bg-white/5'
                    : 'border-rose-500/35 bg-rose-950/35 opacity-60'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-100">{st.label[language]}</div>
                  <div className="text-[10px] text-slate-400">
                    UPS {st.upsMinutes} min (demo) · Prioridad {st.priorityTier}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    st.supply === 'grid'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : st.supply === 'generator'
                        ? 'bg-amber-500/20 text-amber-300'
                        : st.supply === 'ups'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-rose-500/25 text-rose-300'
                  }`}
                >
                  {st.supply === 'grid'
                    ? 'Red'
                    : st.supply === 'generator'
                      ? 'Generador'
                      : st.supply === 'ups'
                        ? 'UPS'
                        : 'Desconectado'}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[6px] border border-sky-500/30 bg-sky-950/35 p-2.5 text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-sky-300">
              <BatteryCharging className="h-3.5 w-3.5" />
              <span>
                {language === 'es'
                  ? 'La fibra pasiva no necesita energía'
                  : 'Passive fiber needs no power'}
              </span>
            </div>
            <p>
              {language === 'es'
                ? 'Lo que cae sin energía son los switches y transceptores activos. Por eso la autonomía de los nodos N1–N6 es una decisión clave de diseño.'
                : 'Only active switches and transceivers fail without power; hence core node UPS autonomy is a key design decision.'}
            </p>
            <p className="text-amber-300">{AGL_SECONDARY_SWITCH_REF[language]}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 text-[11px] text-slate-300">
          <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {language === 'es'
                  ? 'Aislamiento dieléctrico y seguridad'
                  : 'Dielectric isolation & safety'}
              </span>
            </div>
            <p>
              {language === 'es'
                ? 'La fibra óptica no conduce corriente ni crea lazos de tierra ni transporta sobretensiones en salas de 20 kV con alto ruido electromagnético.'
                : 'Optical fiber is non-conductive, eliminating ground loops and surge propagation inside high-EMI 20 kV switchgear rooms.'}
            </p>
          </div>

          <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5">
            <div className="font-semibold text-sky-300 mb-1">
              IEC 61850 / GOOSE & SCADA
            </div>
            <p>
              {language === 'es'
                ? 'Los relevadores intercambian disparos GOOSE en milisegundos por fibra local; protocolos PRP/HSR ofrecen recuperación sin tiempo de conmutación (referencia de norma).'
                : 'Protection relays exchange GOOSE trips in milliseconds over local fiber; PRP/HSR provide zero-recovery-time redundancy (standard reference).'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setGooseTripMs(3.2)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>
              {language === 'es'
                ? 'Simular cortocircuito en alimentador'
                : 'Simulate feeder short-circuit'}
            </span>
          </button>

          {gooseTripMs !== null && (
            <div className="rounded-[6px] border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-emerald-200">
              {language === 'es'
                ? `Mensaje GOOSE por fibra local: disparo de interruptor en ${gooseTripMs} ms (tiempo de demostración) y registro enviado al SCADA eléctrico en VRF-PWR.`
                : `Local fiber GOOSE trip: breaker opened in ${gooseTripMs} ms (demo) and event logged to electrical SCADA on VRF-PWR.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
