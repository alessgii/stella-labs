import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  Package,
  Play,
  RotateCcw,
  Thermometer,
  X,
} from 'lucide-react';
import {
  calculateXrayLinkUtilization,
  CARGO_SSEI_FAULTS,
  COLD_CHAIN_STEPS,
} from '../data/coldChain';
import { useAppStore } from '../store/useAppStore';

export function ColdChainPanel() {
  const language = useAppStore((s) => s.language);
  const activeUseCaseModal = useAppStore((s) => s.activeUseCaseModal);
  const setActiveUseCaseModal = useAppStore((s) => s.setActiveUseCaseModal);

  const [tab, setTab] = useState<'package' | 'xray' | 'faults'>('package');
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [tempC, setTempC] = useState(4.5);

  // X-Ray bandwidth calculator state (demo)
  const [scansPerHour, setScansPerHour] = useState(120);
  const [imageSizeMb, setImageSizeMb] = useState(45);
  const [linkSpeed, setLinkSpeed] = useState<1 | 10>(1);

  useEffect(() => {
    if (!running) return;
    if (activeStep >= COLD_CHAIN_STEPS.length) {
      setRunning(false);
      return;
    }
    const id = window.setTimeout(() => setActiveStep((s) => s + 1), 850);
    return () => window.clearTimeout(id);
  }, [running, activeStep]);

  if (activeUseCaseModal !== 'cold-chain') return null;

  const isExcursion = tempC > 8.0;
  const xray = calculateXrayLinkUtilization(scansPerHour, imageSizeMb, linkSpeed);

  return (
    <div
      role="dialog"
      aria-label={language === 'es' ? 'As World Cargo: Paquete y Cadena de Frío' : 'As World Cargo: Package & Cold Chain'}
      className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-30 w-full sm:w-[440px] max-h-[75vh] sm:max-h-[calc(100vh-8rem)] overflow-y-auto rounded-t-[14px] sm:rounded-[6px] border border-cyan-500/35 bg-slate-950/96 p-4 text-slate-100 backdrop-blur-md shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
            <Package className="h-3.5 w-3.5" />
            <span>VRF-CARGO / VRF-EXT · As World Cargo (Demo)</span>
          </div>
          <h3 className="text-[16px] font-semibold text-white">
            {language === 'es'
              ? 'Paquete de Punta a Punta y Cadena de Frío'
              : 'End-to-End Package & Cold Chain'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveUseCaseModal(null)}
          aria-label="Cerrar carga"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-[6px] border border-white/10 bg-white/5 p-1 mb-3 text-[11px] font-medium">
        {(
          [
            { id: 'package', label: language === 'es' ? 'Paquete (6)' : 'Package (6)' },
            { id: 'xray', label: language === 'es' ? 'Rayos X (10G)' : 'X-Ray (10G)' },
            { id: 'faults', label: language === 'es' ? 'Fallas (4)' : 'Faults (4)' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded px-2 py-1 cursor-pointer ${
              tab === t.id ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'package' && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveStep(1);
                setRunning(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 px-3.5 py-1.5 text-[12px] font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{language === 'es' ? 'Seguir envío farma' : 'Track pharma shipment'}</span>
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
          </div>

          {/* Cold-chain temperature slider */}
          <div
            className={`rounded-[6px] border p-2.5 text-[11px] ${
              isExcursion
                ? 'border-rose-500/50 bg-rose-950/45'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="inline-flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                <span>{language === 'es' ? 'Temperatura Cámara Fría' : 'Cold Room Temp'}</span>
              </span>
              <span className={isExcursion ? 'text-rose-400' : 'text-emerald-300'}>
                {tempC.toFixed(1)} °C {isExcursion ? '· ALERTA (> 8 °C)' : '· OK (2–8 °C)'}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={14}
              step={0.5}
              value={tempC}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTempC(v);
                if (v > 8 && activeStep < 5) setActiveStep(5);
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            {isExcursion && (
              <div className="mt-1 text-[10px] text-rose-200">
                {language === 'es'
                  ? 'Excursión térmica detectada en 65 ms (demo): alarma enviada a Despacho y notificación externa por VRF-EXT (N1/N5).'
                  : 'Thermal excursion detected in 65 ms (demo): alert sent to Dispatch and external carrier via VRF-EXT (N1/N5).'}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {COLD_CHAIN_STEPS.map((s, idx) => {
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
                      ? 'border-cyan-400 bg-cyan-500/15'
                      : done
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[12px] font-semibold">
                    <span>{s.title[language]}</span>
                    <span className="text-[10px] font-mono text-cyan-300">
                      {s.vrf} · {s.networkTime_ms} ms
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{s.detail[language]}</div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{s.route[language]}</span>
                    <span>{s.bandwidthHint}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'xray' && (
        <div className="space-y-3 text-[11px]">
          <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Calculator className="h-3.5 w-3.5" />
              <span>
                {language === 'es'
                  ? 'Calculadora enlace Rayos X (valores demo)'
                  : 'X-Ray Link Calculator (demo values)'}
              </span>
            </div>

            <label className="block">
              <div className="flex justify-between mb-0.5">
                <span>{language === 'es' ? 'Paletas / hora' : 'Scans / hour'}</span>
                <span className="font-semibold">{scansPerHour}</span>
              </div>
              <input
                type="range"
                min={20}
                max={400}
                step={20}
                value={scansPerHour}
                onChange={(e) => setScansPerHour(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="block">
              <div className="flex justify-between mb-0.5">
                <span>{language === 'es' ? 'Tamaño imagen (MB)' : 'Image size (MB)'}</span>
                <span className="font-semibold">{imageSizeMb} MB</span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={imageSizeMb}
                onChange={(e) => setImageSizeMb(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between pt-1">
              <span>{language === 'es' ? 'Enlace al IDF / N4' : 'Uplink to IDF / N4'}</span>
              <div className="flex gap-1">
                {([1, 10] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setLinkSpeed(spd)}
                    className={`rounded-full px-2.5 py-0.5 font-semibold cursor-pointer ${
                      linkSpeed === spd
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {spd}G
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-white/15 bg-white/5 p-2.5 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">
                {language === 'es' ? 'Tráfico pico estimado' : 'Estimated peak rate'}:
              </span>
              <span className="font-semibold text-white">{xray.mbps} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">
                {language === 'es' ? 'Utilización del enlace' : 'Link utilization'}:
              </span>
              <span
                className={`font-semibold ${
                  xray.status === 'red'
                    ? 'text-rose-400'
                    : xray.status === 'amber'
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                {xray.utilizationPct} % ({xray.status.toUpperCase()})
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              {language === 'es'
                ? 'Las troncales internas van por fibra óptica 10G por distancia, ruido de motores/montacargas y ráfagas de rayos X; sensores y cámaras cercanas usan cobre PoE hasta 90 m.'
                : 'Internal trunks use 10G optical fiber due to distance, forklift/motor EMI, and X-ray bursts; nearby sensors/cameras use PoE copper up to 90 m.'}
            </p>
          </div>
        </div>
      )}

      {tab === 'faults' && (
        <div className="space-y-1.5 text-[11px]">
          {CARGO_SSEI_FAULTS.map((f) => (
            <div
              key={f.id}
              className="rounded-[6px] border border-white/10 bg-white/5 p-2.5"
            >
              <div className="flex items-center justify-between gap-2 font-semibold mb-1">
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle
                    className={`h-3.5 w-3.5 ${
                      f.severity === 'red'
                        ? 'text-rose-400'
                        : f.severity === 'amber'
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                    }`}
                  />
                  <span>{f.question[language]}</span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {f.recovery[language]}
                </span>
              </div>
              <p className="text-slate-300">{f.impact[language]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
